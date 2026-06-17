import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import type { ContentStatus, ProjectLinks } from "@portfolio/types";
import { LocalizedProjectContentDto } from "./project-content.dto";

export class ProjectLinksDto implements ProjectLinks {
  @ApiPropertyOptional({ example: "https://github.com/user/repo" })
  @IsOptional()
  @IsUrl()
  repo?: string;

  @ApiPropertyOptional({ example: "https://demo.example.com" })
  @IsOptional()
  @IsUrl()
  demo?: string;
}

export class CreateProjectDto {
  @ApiPropertyOptional({ description: "Gerado a partir do título PT se omitido", example: "meu-projeto" })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ enum: ["draft", "published"], default: "draft" })
  @IsOptional()
  @IsIn(["draft", "published"])
  status?: ContentStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ type: [String], example: ["Nuxt", "NestJS", "MongoDB"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stack?: string[];

  @ApiPropertyOptional({ type: ProjectLinksDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectLinksDto)
  links?: ProjectLinksDto;

  @ApiPropertyOptional({ example: "https://cdn.example.com/cover.png" })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ type: LocalizedProjectContentDto })
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizedProjectContentDto)
  content!: LocalizedProjectContentDto;
}
