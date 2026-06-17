import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import type { ContentStatus } from "@portfolio/types";

@Schema({ _id: false })
export class ProjectContent {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  summary!: string;

  @Prop({ required: true })
  body!: string; // markdown
}
const ProjectContentSchema = SchemaFactory.createForClass(ProjectContent);

@Schema({ _id: false })
export class LocalizedProjectContent {
  @Prop({ type: ProjectContentSchema, required: true })
  pt!: ProjectContent;

  @Prop({ type: ProjectContentSchema, required: true })
  en!: ProjectContent;
}
const LocalizedProjectContentSchema = SchemaFactory.createForClass(LocalizedProjectContent);

@Schema({ _id: false })
export class ProjectLinks {
  @Prop({ type: String })
  repo?: string;

  @Prop({ type: String })
  demo?: string;
}
const ProjectLinksSchema = SchemaFactory.createForClass(ProjectLinks);

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug!: string;

  @Prop({ type: String, required: true, enum: ["draft", "published"], default: "draft", index: true })
  status!: ContentStatus;

  @Prop({ default: false })
  featured!: boolean;

  @Prop({ type: [String], default: [] })
  stack!: string[];

  @Prop({ type: ProjectLinksSchema, default: {} })
  links!: ProjectLinks;

  @Prop({ type: String })
  coverImage?: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: LocalizedProjectContentSchema, required: true })
  content!: LocalizedProjectContent;
}

export type ProjectDocument = HydratedDocument<Project>;
export const ProjectSchema = SchemaFactory.createForClass(Project);

// Expose `id` (string) and hide `_id`/`__v` so HTTP responses match the
// shared `Project` contract in @portfolio/types.
ProjectSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = String(obj._id);
    delete obj._id;
    return obj;
  },
});
