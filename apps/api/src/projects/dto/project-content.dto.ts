import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsObject, IsString, ValidateNested } from "class-validator";
import type { Localized, ProjectContent } from "@portfolio/types";

export class ProjectContentDto implements ProjectContent {
  @ApiProperty({ example: "Meu Projeto" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: "Resumo curto do projeto." })
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @ApiProperty({ example: "# Corpo em markdown\n\nDetalhes do projeto..." })
  @IsString()
  @IsNotEmpty()
  body!: string;
}

export class LocalizedProjectContentDto implements Localized<ProjectContentDto> {
  @ApiProperty({ type: ProjectContentDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ProjectContentDto)
  pt!: ProjectContentDto;

  @ApiProperty({ type: ProjectContentDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ProjectContentDto)
  en!: ProjectContentDto;
}
