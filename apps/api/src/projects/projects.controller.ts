import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";

@ApiTags("projects")
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: "Lista projetos publicados (público)" })
  list() {
    return this.projects.listPublished();
  }

  @Get(":slug")
  @ApiOperation({ summary: "Detalhe de um projeto publicado por slug (público)" })
  bySlug(@Param("slug") slug: string) {
    return this.projects.findPublishedBySlug(slug);
  }
}
