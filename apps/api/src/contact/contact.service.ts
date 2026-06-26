import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContactMessage, ContactMessageDocument } from "./schemas/contact-message.schema";
import { CreateContactDto } from "./dto/create-contact.dto";

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly model: Model<ContactMessageDocument>,
  ) {}

  create(dto: CreateContactDto): Promise<ContactMessageDocument> {
    return this.model.create(dto);
  }

  listAll(): Promise<ContactMessageDocument[]> {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async markRead(id: string, read: boolean): Promise<ContactMessageDocument> {
    const msg = await this.model.findByIdAndUpdate(id, { read }, { new: true }).exec();
    if (!msg) throw new NotFoundException("Mensagem não encontrada");
    return msg;
  }
}
