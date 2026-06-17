import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import cookieParser from "cookie-parser";
import request from "supertest";
import * as argon2 from "argon2";

const ADMIN_EMAIL = "admin@portfolio.dev";
const ADMIN_PASSWORD = "supersecret123";

function postPayload(overrides: Record<string, unknown> = {}) {
  return {
    tags: ["nuxt", "nestjs"],
    content: {
      pt: {
        title: "Meu Primeiro Artigo",
        summary: "Resumo PT",
        body: Array.from({ length: 400 }, () => "palavra").join(" "), // ~2 min
      },
      en: { title: "My First Article", summary: "Summary EN", body: "# Body EN" },
    },
    ...overrides,
  };
}

describe("Posts (e2e)", () => {
  let mongo: MongoMemoryServer;
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    const users = moduleRef.get(UsersService);
    await users.create({ email: ADMIN_EMAIL, passwordHash: await argon2.hash(ADMIN_PASSWORD) });

    const login = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);
    accessToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app?.close();
    await mongo?.stop();
  });

  const server = () => app.getHttpServer();
  const auth = () => `Bearer ${accessToken}`;

  it("starts with an empty public list", async () => {
    await request(server()).get("/posts").expect(200).expect([]);
  });

  it("rejects unauthenticated create (401)", async () => {
    await request(server()).post("/admin/posts").send(postPayload()).expect(401);
  });

  it("validates the payload (400 on missing content)", async () => {
    await request(server())
      .post("/admin/posts")
      .set("Authorization", auth())
      .send({ tags: ["nuxt"] })
      .expect(400);
  });

  it("creates a draft with slug + readingTime, hidden from the public", async () => {
    const created = await request(server())
      .post("/admin/posts")
      .set("Authorization", auth())
      .send(postPayload())
      .expect(201);

    expect(created.body.slug).toBe("meu-primeiro-artigo");
    expect(created.body.status).toBe("draft");
    expect(created.body.readingTime).toBe(2); // 400 words / 200 wpm
    expect(created.body.publishedAt).toBeUndefined();

    await request(server()).get("/posts").expect(200).expect([]);
    await request(server()).get("/posts/meu-primeiro-artigo").expect(404);

    const adminList = await request(server())
      .get("/admin/posts")
      .set("Authorization", auth())
      .expect(200);
    expect(adminList.body).toHaveLength(1);
  });

  it("publishes the post, stamping publishedAt and exposing it publicly", async () => {
    const adminList = await request(server())
      .get("/admin/posts")
      .set("Authorization", auth())
      .expect(200);
    const id = adminList.body[0].id;

    const updated = await request(server())
      .patch(`/admin/posts/${id}`)
      .set("Authorization", auth())
      .send({ status: "published" })
      .expect(200);
    expect(updated.body.publishedAt).toBeTruthy();

    const publicList = await request(server()).get("/posts").expect(200);
    expect(publicList.body).toHaveLength(1);

    const detail = await request(server()).get("/posts/meu-primeiro-artigo").expect(200);
    expect(detail.body.content.en.title).toBe("My First Article");
    expect(detail.body.id).toBeTruthy();
    expect(detail.body._id).toBeUndefined();
  });

  it("deduplicates slugs when titles collide", async () => {
    const created = await request(server())
      .post("/admin/posts")
      .set("Authorization", auth())
      .send(postPayload())
      .expect(201);
    expect(created.body.slug).toBe("meu-primeiro-artigo-2");
  });

  it("deletes a post (admin)", async () => {
    const adminList = await request(server())
      .get("/admin/posts")
      .set("Authorization", auth())
      .expect(200);
    const id = adminList.body[0].id;

    await request(server())
      .delete(`/admin/posts/${id}`)
      .set("Authorization", auth())
      .expect(204);

    await request(server())
      .get(`/admin/posts/${id}`)
      .set("Authorization", auth())
      .expect(404);
  });
});
