import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import type { TranslateRequest } from "@portfolio/types";

export class TranslateDto implements TranslateRequest {
  @ApiProperty({ example: "Meu Projeto" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: "Um resumo curto do projeto." })
  @IsString()
  summary!: string;

  @ApiProperty({ description: "Conteúdo em Markdown", example: "# Olá\n\nTexto do corpo." })
  @IsString()
  @IsNotEmpty()
  body!: string;
}
