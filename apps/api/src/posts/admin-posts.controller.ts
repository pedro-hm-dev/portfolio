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
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@ApiTags("posts-admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@Controller("admin/posts")
export class AdminPostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @ApiOperation({ summary: "Lista todos os posts, incluindo rascunhos (admin)" })
  list() {
    return this.posts.listAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalhe de um post por id (admin)" })
  byId(@Param("id") id: string) {
    return this.posts.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Cria um post (admin)" })
  create(@Body() dto: CreatePostDto) {
    return this.posts.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza um post (admin)" })
  update(@Param("id") id: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove um post (admin)" })
  remove(@Param("id") id: string) {
    return this.posts.remove(id);
  }
}
