import { Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type Anthropic from "@anthropic-ai/sdk";
import type {
  Locale,
  MetaDescriptionRequest,
  MetaDescriptionResponse,
  TranslateRequest,
  TranslateResponse,
} from "@portfolio/types";

/** DI token for the Anthropic client (swappable with a stub in tests). */
export const ANTHROPIC_CLIENT = Symbol("ANTHROPIC_CLIENT");

const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Brazilian Portuguese",
  en: "English",
};

const TRANSLATE_SYSTEM = [
  "You are a professional translator for a software developer's portfolio website.",
  "Translate the given Brazilian Portuguese content into natural, fluent English.",
  "Preserve Markdown formatting exactly (headings, lists, code blocks, links).",
  "Do not translate code, identifiers, URLs, or anything inside code fences.",
  'Return ONLY a JSON object with the keys "title", "summary", and "body" — no commentary,',
  "no explanation, and no Markdown fence around the JSON.",
].join(" ");

function metaSystem(language: string): string {
  return [
    "You write concise, compelling SEO meta descriptions.",
    `Given a title and body, write a single meta description in ${language}`,
    "of at most 155 characters that summarizes the content and entices clicks.",
    "Return ONLY the description text — no quotes, no labels, no commentary.",
  ].join(" ");
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model: string;

  constructor(
    @Inject(ANTHROPIC_CLIENT) private readonly anthropic: Anthropic,
    config: ConfigService,
  ) {
    this.model = config.get<string>("ANTHROPIC_MODEL", "claude-haiku-4-5");
  }

  /** Translates portfolio content PT→EN, preserving Markdown. */
  async translate(input: TranslateRequest): Promise<TranslateResponse> {
    const text = await this.complete({
      system: TRANSLATE_SYSTEM,
      user: JSON.stringify({ title: input.title, summary: input.summary, body: input.body }),
      maxTokens: 4096,
    });
    const parsed = this.parseJson(text);
    return {
      title: String(parsed.title ?? ""),
      summary: String(parsed.summary ?? ""),
      body: String(parsed.body ?? ""),
    };
  }

  /** Generates a single SEO meta description for the given locale. */
  async generateMetaDescription(
    input: MetaDescriptionRequest,
  ): Promise<MetaDescriptionResponse> {
    const language = LOCALE_NAMES[input.locale] ?? LOCALE_NAMES.en;
    const text = await this.complete({
      system: metaSystem(language),
      user: JSON.stringify({ title: input.title, body: input.body }),
      maxTokens: 256,
    });
    // Strip surrounding quotes the model sometimes adds and keep it meta-length.
    const metaDescription = text.trim().replace(/^["']|["']$/g, "").slice(0, 160);
    return { metaDescription };
  }

  private async complete(opts: {
    system: string;
    user: string;
    maxTokens: number;
  }): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: opts.maxTokens,
        system: opts.system,
        messages: [{ role: "user", content: opts.user }],
      });
      return message.content.map((block) => (block.type === "text" ? block.text : "")).join("");
    } catch (err) {
      this.logger.error(`Anthropic request failed: ${(err as Error).message}`);
      throw new InternalServerErrorException("AI provider request failed");
    }
  }

  private parseJson(text: string): Record<string, unknown> {
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      // The model may wrap the JSON in prose or a ```json fence — grab the first {...} span.
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]) as Record<string, unknown>;
        } catch {
          /* fall through to the error below */
        }
      }
      throw new InternalServerErrorException("AI returned malformed translation output");
    }
  }
}
