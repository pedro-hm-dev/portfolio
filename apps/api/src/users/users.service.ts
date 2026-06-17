import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import type { PublicUser } from "@portfolio/types";
import { User, UserDocument } from "./schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  create(data: { email: string; passwordHash: string }) {
    return this.userModel.create({ ...data, role: "admin" });
  }

  async setRefreshTokenHash(id: string, hash: string | null) {
    await this.userModel.updateOne({ _id: id }, { refreshTokenHash: hash }).exec();
  }

  static toPublic(user: UserDocument): PublicUser {
    return { id: user.id, email: user.email, role: user.role };
  }
}
