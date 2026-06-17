import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@ApiTags("projects-admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@Controller("admin/projects")
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: "Lista todos os projetos, incluindo rascunhos (admin)" })
  list() {
    return this.projects.listAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalhe de um projeto por id (admin)" })
  byId(@Param("id") id: string) {
    return this.projects.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Cria um projeto (admin)" })
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza um projeto (admin)" })
  update(@Param("id") id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove um projeto (admin)" })
  remove(@Param("id") id: string) {
    return this.projects.remove(id);
  }
}
