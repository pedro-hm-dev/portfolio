import { describe, it, expect, vi } from "vitest";
import { InternalServerErrorException } from "@nestjs/common";
import type Anthropic from "@anthropic-ai/sdk";
import { ConfigService } from "@nestjs/config";
import { AiService } from "./ai.service";

/** ConfigService stub: returns the given model, else the caller's fallback. */
function configStub(model?: string): ConfigService {
  return { get: (_key: string, fallback?: string) => model ?? fallback } as unknown as ConfigService;
}

/** Anthropic stub whose messages.create resolves to a single text block. */
function clientWithText(text: string) {
  const create = vi.fn().mockResolvedValue({ content: [{ type: "text", text }] });
  return { client: { messages: { create } } as unknown as Anthropic, create };
}

describe("AiService", () => {
  it("translates PT→EN, parsing the JSON the model returns and using the configured model", async () => {
    const { client, create } = clientWithText(
      JSON.stringify({ title: "My Project", summary: "A summary", body: "# Hello" }),
    );
    const service = new AiService(client, configStub("claude-haiku-4-5"));

    const out = await service.translate({
      title: "Meu Projeto",
      summary: "Um resumo",
      body: "# Olá",
    });

    expect(out).toEqual({ title: "My Project", summary: "A summary", body: "# Hello" });
    expect(create.mock.calls[0][0].model).toBe("claude-haiku-4-5");
  });

  it("extracts the JSON even when the model wraps it in a code fence and prose", async () => {
    const { client } = clientWithText(
      'Sure!\n```json\n{"title":"T","summary":"S","body":"B"}\n```',
    );
    const service = new AiService(client, configStub());

    const out = await service.translate({ title: "t", summary: "s", body: "b" });

    expect(out).toEqual({ title: "T", summary: "S", body: "B" });
  });

  it("throws a 500 when the translation output is not parseable JSON", async () => {
    const { client } = clientWithText("not json at all");
    const service = new AiService(client, configStub());

    await expect(
      service.translate({ title: "t", summary: "s", body: "b" }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it("generates a trimmed, quote-stripped meta description with a small token budget", async () => {
    const { client, create } = clientWithText('  "A great portfolio project about X."  ');
    const service = new AiService(client, configStub());

    const out = await service.generateMetaDescription({ title: "X", body: "...", locale: "en" });

    expect(out.metaDescription).toBe("A great portfolio project about X.");
    expect(create.mock.calls[0][0].max_tokens).toBe(256);
  });

  it("caps the meta description length", async () => {
    const { client } = clientWithText("x".repeat(300));
    const service = new AiService(client, configStub());

    const out = await service.generateMetaDescription({ title: "X", body: "...", locale: "pt" });

    expect(out.metaDescription.length).toBeLessThanOrEqual(160);
  });

  it("maps provider errors to a 500", async () => {
    const create = vi.fn().mockRejectedValue(new Error("network down"));
    const service = new AiService(
      { messages: { create } } as unknown as Anthropic,
      configStub(),
    );

    await expect(
      service.generateMetaDescription({ title: "X", body: "...", locale: "en" }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
