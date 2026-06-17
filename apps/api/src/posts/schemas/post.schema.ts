import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import type { ContentStatus } from "@portfolio/types";

@Schema({ _id: false })
export class PostContent {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  summary!: string;

  @Prop({ required: true })
  body!: string; // markdown
}
const PostContentSchema = SchemaFactory.createForClass(PostContent);

@Schema({ _id: false })
export class LocalizedPostContent {
  @Prop({ type: PostContentSchema, required: true })
  pt!: PostContent;

  @Prop({ type: PostContentSchema, required: true })
  en!: PostContent;
}
const LocalizedPostContentSchema = SchemaFactory.createForClass(LocalizedPostContent);

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug!: string;

  @Prop({ type: String, required: true, enum: ["draft", "published"], default: "draft", index: true })
  status!: ContentStatus;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: String })
  coverImage?: string;

  @Prop({ default: 1 })
  readingTime!: number; // minutes

  @Prop({ type: LocalizedPostContentSchema, required: true })
  content!: LocalizedPostContent;

  @Prop({ type: Date })
  publishedAt?: Date;
}

export type PostDocument = HydratedDocument<Post>;
export const PostSchema = SchemaFactory.createForClass(Post);

// Expose `id` (string) and hide `_id`/`__v` so HTTP responses match the
// shared `Post` contract in @portfolio/types.
PostSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = String(obj._id);
    delete obj._id;
    return obj;
  },
});
