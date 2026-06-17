import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PostsService } from "./posts.service";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @ApiOperation({ summary: "Lista posts publicados (público)" })
  list() {
    return this.posts.listPublished();
  }

  @Get(":slug")
  @ApiOperation({ summary: "Detalhe de um post publicado por slug (público)" })
  bySlug(@Param("slug") slug: string) {
    return this.posts.findPublishedBySlug(slug);
  }
}
