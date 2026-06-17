import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import cookieParser from "cookie-parser";
import request from "supertest";
import * as argon2 from "argon2";

const ADMIN_EMAIL = "admin@portfolio.dev";
const ADMIN_PASSWORD = "supersecret123";

describe("Auth (e2e)", () => {
  let mongo: MongoMemoryServer;
  let app: INestApplication;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    // Env must be set before AppModule is imported (MongooseModule.forRoot reads it eagerly).
    process.env.MONGO_URI = mongo.getUri("portfolio");
    process.env.JWT_ACCESS_SECRET = "e2e-access-secret";
    process.env.JWT_REFRESH_SECRET = "e2e-refresh-secret";
    process.env.JWT_ACCESS_TTL = "15m";
    process.env.JWT_REFRESH_TTL = "7d";

    const { AppModule } = await import("../src/app.module");
    const { UsersService } = await import("../src/users/users.service");

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Seed an admin directly through the service.
    const users = moduleRef.get(UsersService);
    await users.create({ email: ADMIN_EMAIL, passwordHash: await argon2.hash(ADMIN_PASSWORD) });
  });

  afterAll(async () => {
    await app?.close();
    await mongo?.stop();
  });

  const server = () => app.getHttpServer();

  it("rejects login with wrong password (401)", async () => {
    await request(server())
      .post("/auth/login")
      .send({ email: ADMIN_EMAIL, password: "wrong-password" })
      .expect(401);
  });

  it("rejects malformed login payload (400)", async () => {
    await request(server())
      .post("/auth/login")
      .send({ email: "not-an-email", password: "x" })
      .expect(400);
  });

  it("logs in, sets an httpOnly refresh cookie, and rotates on refresh", async () => {
    const login = await request(server())
      .post("/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);

    expect(login.body.accessToken).toBeTypeOf("string");
    expect(login.body.user).toMatchObject({ email: ADMIN_EMAIL, role: "admin" });

    const setCookie = login.headers["set-cookie"] as unknown as string[];
    expect(setCookie.some((c) => /refresh_token=/.test(c) && /HttpOnly/i.test(c))).toBe(true);

    const cookie = setCookie.find((c) => c.startsWith("refresh_token="))!;

    // Refresh with the cookie -> new access token + a rotated refresh cookie.
    const refreshed = await request(server())
      .post("/auth/refresh")
      .set("Cookie", cookie)
      .expect(200);
    expect(refreshed.body.accessToken).toBeTypeOf("string");
    const rotated = (refreshed.headers["set-cookie"] as unknown as string[]).find((c) =>
      c.startsWith("refresh_token="),
    )!;
    expect(rotated).toBeTruthy();

    // The original (pre-rotation) refresh token is now invalid.
    await request(server()).post("/auth/refresh").set("Cookie", cookie).expect(401);
  });

  it("rejects refresh without a cookie (401)", async () => {
    await request(server()).post("/auth/refresh").expect(401);
  });

  it("logout requires a valid access token (401 without it)", async () => {
    await request(server()).post("/auth/logout").expect(401);
  });

  it("logout revokes the refresh token", async () => {
    const login = await request(server())
      .post("/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);
    const accessToken = login.body.accessToken as string;
    const cookie = (login.headers["set-cookie"] as unknown as string[]).find((c) =>
      c.startsWith("refresh_token="),
    )!;

    await request(server())
      .post("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(204);

    // After logout the refresh token no longer works.
    await request(server()).post("/auth/refresh").set("Cookie", cookie).expect(401);
  });
});
