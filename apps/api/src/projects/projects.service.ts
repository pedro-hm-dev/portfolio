import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { slugify } from "../common/slugify";
import { Project, ProjectDocument } from "./schemas/project.schema";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
  ) {}

  /** Public listing: only published, featured first, then newest. */
  listPublished() {
    return this.projectModel
      .find({ status: "published" })
      .sort({ featured: -1, createdAt: -1 })
      .exec();
  }

  async findPublishedBySlug(slug: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findOne({ slug: slug.toLowerCase(), status: "published" })
      .exec();
    if (!project) throw new NotFoundException("Projeto não encontrado");
    return project;
  }

  /** Admin listing: everything, including drafts. */
  listAll() {
    return this.projectModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException("Projeto não encontrado");
    return project;
  }

  async create(dto: CreateProjectDto): Promise<ProjectDocument> {
    const slug = await this.resolveSlug(dto.slug, dto.content.pt.title);
    try {
      return await this.projectModel.create({ ...dto, slug });
    } catch (err) {
      throw this.translateDuplicate(err);
    }
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDocument> {
    const slug =
      dto.slug !== undefined ? await this.resolveSlug(dto.slug, undefined, id) : undefined;
    try {
      const updated = await this.projectModel
        .findByIdAndUpdate(id, { ...dto, ...(slug ? { slug } : {}) }, { new: true })
        .exec();
      if (!updated) throw new NotFoundException("Projeto não encontrado");
      return updated;
    } catch (err) {
      throw this.translateDuplicate(err);
    }
  }

  async remove(id: string): Promise<void> {
    const res = await this.projectModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException("Projeto não encontrado");
  }

  /** Builds a slug from an explicit value or the PT title, ensuring uniqueness. */
  private async resolveSlug(
    explicit: string | undefined,
    fallbackTitle: string | undefined,
    ignoreId?: string,
  ): Promise<string> {
    const base = slugify(explicit || fallbackTitle || "");
    if (!base) throw new ConflictException("Não foi possível gerar um slug");

    let candidate = base;
    let n = 1;
    // Append -2, -3, ... until unique (ignoring the doc being updated).
    while (await this.slugTaken(candidate, ignoreId)) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    return candidate;
  }

  private async slugTaken(slug: string, ignoreId?: string): Promise<boolean> {
    const existing = await this.projectModel.findOne({ slug }).select("_id").exec();
    return !!existing && existing.id !== ignoreId;
  }

  private translateDuplicate(err: unknown): unknown {
    if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
      return new ConflictException("Slug já existe");
    }
    return err;
  }
}
