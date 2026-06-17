import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { HealthController } from "./health.controller";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProjectsModule } from "./projects/projects.module";
import { PostsModule } from "./posts/posts.module";

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
    // Remaining feature modules (contact, ai) are added next.
  ],
  controllers: [HealthController],
})
export class AppModule {}
