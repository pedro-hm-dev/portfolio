import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ContactService } from "./contact.service";

class MarkReadDto {
  @IsBoolean()
  read!: boolean;
}

@ApiTags("contact-admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@Controller("admin/contact")
export class AdminContactController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  @ApiOperation({ summary: "Lista todas as mensagens de contato (admin)" })
  list() {
    return this.contact.listAll();
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Marca mensagem como lida/não lida (admin)" })
  markRead(@Param("id") id: string, @Body() dto: MarkReadDto) {
    return this.contact.markRead(id, dto.read);
  }
}
