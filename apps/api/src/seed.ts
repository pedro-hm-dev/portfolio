import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { AppModule } from "./app.module";
import { UsersService } from "./users/users.service";

/**
 * Seeds (or updates) the single admin user from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Idempotent: re-running resets the admin password to the env value.
 * Run with: `pnpm --filter api seed`
 */
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["error"] });
  try {
    const config = app.get(ConfigService);
    const users = app.get(UsersService);

    const email = config.getOrThrow<string>("ADMIN_EMAIL");
    const password = config.getOrThrow<string>("ADMIN_PASSWORD");
    const passwordHash = await argon2.hash(password);

    const existing = await users.findByEmail(email);
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = "admin";
      await existing.save();
      console.log(`✓ Admin atualizado: ${email}`);
    } else {
      await users.create({ email, passwordHash });
      console.log(`✓ Admin criado: ${email}`);
    }
  } finally {
    await app.close();
  }
}

void seed().catch((err) => {
  console.error("Seed falhou:", err);
  process.exit(1);
});
