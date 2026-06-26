import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ _id: false })
export class TechnicalData {
  @Prop({ type: String }) userAgent?: string;
  @Prop({ type: String }) language?: string;
  @Prop({ type: String }) timezone?: string;
  @Prop({ type: String }) screenResolution?: string;
  @Prop({ type: String }) referrer?: string;
  @Prop({ type: String }) colorScheme?: string;
}
const TechnicalDataSchema = SchemaFactory.createForClass(TechnicalData);

@Schema({ _id: false })
export class BehavioralData {
  @Prop({ type: [String], default: [] }) pagesVisited!: string[];
  @Prop({ type: [String], default: [] }) projectsViewed!: string[];
  @Prop({ type: [String], default: [] }) postsViewed!: string[];
  @Prop({ default: 0 }) timeOnSite!: number;
  @Prop({ default: false }) tourCompleted!: boolean;
}
const BehavioralDataSchema = SchemaFactory.createForClass(BehavioralData);

@Schema({ _id: false })
export class LocationData {
  @Prop({ type: String }) country?: string;
  @Prop({ type: String }) region?: string;
  @Prop({ type: String }) city?: string;
}
const LocationDataSchema = SchemaFactory.createForClass(LocationData);

@Schema({ timestamps: true })
export class Visitor {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ type: String, trim: true })
  company?: string;

  @Prop({ type: String, trim: true })
  role?: string;

  @Prop({ type: [String], default: [] })
  interests!: string[];

  @Prop({ default: false })
  isPublic!: boolean;

  @Prop({ required: true })
  consentVersion!: string;

  @Prop({ type: Date, required: true })
  consentDate!: Date;

  @Prop({ type: TechnicalDataSchema, default: {} })
  technicalData!: TechnicalData;

  @Prop({ type: BehavioralDataSchema, default: {} })
  behavioralData!: BehavioralData;

  @Prop({ type: LocationDataSchema, default: {} })
  locationData!: LocationData;
}

export type VisitorDocument = HydratedDocument<Visitor>;
export const VisitorSchema = SchemaFactory.createForClass(Visitor);

VisitorSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = String(obj._id);
    delete obj._id;
    return obj;
  },
});
