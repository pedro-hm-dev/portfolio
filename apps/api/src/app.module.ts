import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? "mongodb://root:root@localhost:27017/portfolio?authSource=admin",
    ),
    // Feature modules (auth, users, projects, posts, contact, ai) are added next.
  ],
  controllers: [HealthController],
})
export class AppModule {}
