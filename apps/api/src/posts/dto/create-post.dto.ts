import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import type { ContentStatus } from "@portfolio/types";
import { LocalizedPostContentDto } from "./post-content.dto";

export class CreatePostDto {
  @ApiPropertyOptional({ description: "Gerado a partir do título PT se omitido", example: "meu-artigo" })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ enum: ["draft", "published"], default: "draft" })
  @IsOptional()
  @IsIn(["draft", "published"])
  status?: ContentStatus;

  @ApiPropertyOptional({ type: [String], example: ["nuxt", "nestjs"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: "https://cdn.example.com/cover.png" })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ type: LocalizedPostContentDto })
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizedPostContentDto)
  content!: LocalizedPostContentDto;
}
