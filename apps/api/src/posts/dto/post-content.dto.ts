import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsObject, IsString, ValidateNested } from "class-validator";
import type { Localized, PostContent } from "@portfolio/types";

export class PostContentDto implements PostContent {
  @ApiProperty({ example: "Meu Artigo" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: "Resumo curto do artigo." })
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @ApiProperty({ example: "# Conteúdo em markdown\n\nTexto do artigo..." })
  @IsString()
  @IsNotEmpty()
  body!: string;
}

export class LocalizedPostContentDto implements Localized<PostContentDto> {
  @ApiProperty({ type: PostContentDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PostContentDto)
  pt!: PostContentDto;

  @ApiProperty({ type: PostContentDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PostContentDto)
  en!: PostContentDto;
}
