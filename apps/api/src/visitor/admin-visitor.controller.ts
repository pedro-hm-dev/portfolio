import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { VisitorService } from "./visitor.service";

@ApiTags("visitor-admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@Controller("admin/visitors")
export class AdminVisitorController {
  constructor(private readonly visitor: VisitorService) {}

  @Get()
  @ApiOperation({ summary: "Lista todos os visitantes com dados completos (admin)" })
  list() {
    return this.visitor.listAll();
  }
}
