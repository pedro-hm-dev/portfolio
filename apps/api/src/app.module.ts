import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { HealthController } from "./health.controller";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProjectsModule } from "./projects/projects.module";
import { PostsModule } from "./posts/posts.module";
import { AiModule } from "./ai/ai.module";
import { ContactModule } from "./contact/contact.module";
import { VisitorModule } from "./visitor/visitor.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? "mongodb://root:root@localhost:27017/portfolio?authSource=admin",
    ),
    UsersModule,
    AuthModule,
    ProjectsModule,
    PostsModule,
    AiModule,
    ContactModule,
    VisitorModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
