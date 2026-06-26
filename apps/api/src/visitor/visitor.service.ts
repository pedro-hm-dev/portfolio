import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Visitor, VisitorDocument } from "./schemas/visitor.schema";
import { CreateVisitorDto } from "./dto/create-visitor.dto";

const PUBLIC_FIELDS = "id name company role interests createdAt";

@Injectable()
export class VisitorService {
  constructor(
    @InjectModel(Visitor.name)
    private readonly model: Model<VisitorDocument>,
  ) {}

  create(dto: CreateVisitorDto): Promise<VisitorDocument> {
    return this.model.create({ ...dto, consentDate: new Date() });
  }

  listPublic(): Promise<VisitorDocument[]> {
    return this.model
      .find({ isPublic: true })
      .select(PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  listAll(): Promise<VisitorDocument[]> {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  count(): Promise<number> {
    return this.model.countDocuments().exec();
  }
}
