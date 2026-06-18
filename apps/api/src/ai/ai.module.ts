import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
import { AiService, ANTHROPIC_CLIENT } from "./ai.service";
import { AiController } from "./ai.controller";

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    {
      provide: ANTHROPIC_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Anthropic({ apiKey: config.getOrThrow<string>("ANTHROPIC_API_KEY") }),
    },
  ],
})
export class AiModule {}
