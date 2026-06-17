import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import type { UserRole } from "@portfolio/types";

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: String, required: true, enum: ["admin"], default: "admin" })
  role!: UserRole;

  /** argon2 hash of the currently valid refresh token (null = logged out). */
  @Prop({ type: String, default: null })
  refreshTokenHash!: string | null;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
