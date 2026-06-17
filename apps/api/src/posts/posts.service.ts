import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { slugify } from "../common/slugify";
import { readingTimeMinutes } from "../common/reading-time";
import { Post, PostDocument } from "./schemas/post.schema";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>) {}

  /** Public listing: only published, newest published first. */
  listPublished() {
    return this.postModel
      .find({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .exec();
  }

  async findPublishedBySlug(slug: string): Promise<PostDocument> {
    const post = await this.postModel
      .findOne({ slug: slug.toLowerCase(), status: "published" })
      .exec();
    if (!post) throw new NotFoundException("Post não encontrado");
    return post;
  }

  /** Admin listing: everything, including drafts. */
  listAll() {
    return this.postModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec();
    if (!post) throw new NotFoundException("Post não encontrado");
    return post;
  }

  async create(dto: CreatePostDto): Promise<PostDocument> {
    const slug = await this.resolveSlug(dto.slug, dto.content.pt.title);
    const readingTime = readingTimeMinutes(dto.content.pt.body);
    const publishedAt = dto.status === "published" ? new Date() : undefined;
    try {
      return await this.postModel.create({ ...dto, slug, readingTime, publishedAt });
    } catch (err) {
      throw this.translateDuplicate(err);
    }
  }

  async update(id: string, dto: UpdatePostDto): Promise<PostDocument> {
    const post = await this.findById(id);

    if (dto.slug !== undefined) post.slug = await this.resolveSlug(dto.slug, undefined, id);
    if (dto.tags !== undefined) post.tags = dto.tags;
    if (dto.coverImage !== undefined) post.coverImage = dto.coverImage;
    if (dto.content !== undefined) {
      post.content = dto.content;
      post.readingTime = readingTimeMinutes(dto.content.pt.body);
    }
    if (dto.status !== undefined) {
      // Stamp publishedAt the first time it goes live.
      if (dto.status === "published" && !post.publishedAt) post.publishedAt = new Date();
      post.status = dto.status;
    }

    try {
      return await post.save();
    } catch (err) {
      throw this.translateDuplicate(err);
    }
  }

  async remove(id: string): Promise<void> {
    const res = await this.postModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException("Post não encontrado");
  }

  private async resolveSlug(
    explicit: string | undefined,
    fallbackTitle: string | undefined,
    ignoreId?: string,
  ): Promise<string> {
    const base = slugify(explicit || fallbackTitle || "");
    if (!base) throw new ConflictException("Não foi possível gerar um slug");

    let candidate = base;
    let n = 1;
    while (await this.slugTaken(candidate, ignoreId)) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    return candidate;
  }

  private async slugTaken(slug: string, ignoreId?: string): Promise<boolean> {
    const existing = await this.postModel.findOne({ slug }).select("_id").exec();
    return !!existing && existing.id !== ignoreId;
  }

  private translateDuplicate(err: unknown): unknown {
    if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
      return new ConflictException("Slug já existe");
    }
    return err;
  }
}
