import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AiService } from "./ai.service";
import { TranslateDto } from "./dto/translate.dto";
import { MetaDescriptionDto } from "./dto/meta-description.dto";

// Admin-only: these endpoints spend the configured Anthropic API key.
@ApiTags("ai-admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@Controller("admin/ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post("translate")
  @ApiOperation({ summary: "Traduz conteúdo PT→EN, preservando Markdown (admin)" })
  translate(@Body() dto: TranslateDto) {
    return this.ai.translate(dto);
  }

  @Post("meta-description")
  @ApiOperation({ summary: "Gera uma meta-description SEO para o idioma dado (admin)" })
  metaDescription(@Body() dto: MetaDescriptionDto) {
    return this.ai.generateMetaDescription(dto);
  }
}
