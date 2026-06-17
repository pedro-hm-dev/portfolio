import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";
import type { LoginRequest } from "@portfolio/types";

export class LoginDto implements LoginRequest {
  @ApiProperty({ example: "admin@portfolio.dev" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "your-strong-password", minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
