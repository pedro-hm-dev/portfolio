import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import type { CreateContactRequest } from "@portfolio/types";

export class CreateContactDto implements CreateContactRequest {
  @ApiProperty({ example: "João Silva" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: "joao@empresa.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Olá! Vi seu portfólio e gostaria de conversar sobre uma oportunidade." })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;
}
