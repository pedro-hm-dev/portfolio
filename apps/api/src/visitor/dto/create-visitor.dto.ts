import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import type {
  CreateVisitorRequest,
  VisitorBehavioralData,
  VisitorLocationData,
  VisitorTechnicalData,
} from "@portfolio/types";

export class TechnicalDataDto implements VisitorTechnicalData {
  @IsOptional() @IsString() userAgent?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() screenResolution?: string;
  @IsOptional() @IsString() referrer?: string;
  @IsOptional() @IsString() colorScheme?: string;
}

export class BehavioralDataDto implements VisitorBehavioralData {
  @IsArray() @IsString({ each: true }) pagesVisited!: string[];
  @IsArray() @IsString({ each: true }) projectsViewed!: string[];
  @IsArray() @IsString({ each: true }) postsViewed!: string[];
  @IsNumber() timeOnSite!: number;
  @IsBoolean() tourCompleted!: boolean;
}

export class LocationDataDto implements VisitorLocationData {
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() city?: string;
}

export class CreateVisitorDto implements CreateVisitorRequest {
  @ApiProperty({ example: "João Silva" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: "joao@empresa.com" })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: "Empresa ABC" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @ApiPropertyOptional({ example: "Engenheiro de Software Sênior" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;

  @ApiPropertyOptional({ type: [String], example: ["Nuxt", "NestJS"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ description: "Visitante autoriza exibição pública do perfil" })
  @IsBoolean()
  isPublic!: boolean;

  @ApiProperty({ example: "1.0" })
  @IsString()
  @IsNotEmpty()
  consentVersion!: string;

  @ApiProperty({ type: TechnicalDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => TechnicalDataDto)
  technicalData!: TechnicalDataDto;

  @ApiProperty({ type: BehavioralDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BehavioralDataDto)
  behavioralData!: BehavioralDataDto;

  @ApiProperty({ type: LocationDataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDataDto)
  locationData!: LocationDataDto;
}
