import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { VisitorService } from "./visitor.service";
import { CreateVisitorDto } from "./dto/create-visitor.dto";

@ApiTags("visitor")
@Controller("visitor")
export class VisitorController {
  constructor(private readonly visitor: VisitorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Registra um visitante com consentimento LGPD" })
  create(@Body() dto: CreateVisitorDto) {
    return this.visitor.create(dto);
  }

  @Get("public")
  @ApiOperation({ summary: "Lista visitantes que autorizaram exibição pública" })
  listPublic() {
    return this.visitor.listPublic();
  }
}
