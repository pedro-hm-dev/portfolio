import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import type { Locale, MetaDescriptionRequest } from "@portfolio/types";

export class MetaDescriptionDto implements MetaDescriptionRequest {
  @ApiProperty({ example: "Meu Projeto" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: "Conteúdo em Markdown", example: "# Olá\n\nTexto do corpo." })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiProperty({ enum: ["pt", "en"], example: "pt" })
  @IsIn(["pt", "en"])
  locale!: Locale;
}
