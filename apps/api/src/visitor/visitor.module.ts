import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Visitor, VisitorSchema } from "./schemas/visitor.schema";
import { VisitorService } from "./visitor.service";
import { VisitorController } from "./visitor.controller";
import { AdminVisitorController } from "./admin-visitor.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Visitor.name, schema: VisitorSchema }])],
  controllers: [VisitorController, AdminVisitorController],
  providers: [VisitorService],
})
export class VisitorModule {}
