import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import cookieParser from "cookie-parser";
import request from "supertest";
import * as argon2 from "argon2";

const ADMIN_EMAIL = "admin@portfolio.dev";
const ADMIN_PASSWORD = "supersecret123";

function projectPayload(overrides: Record<string, unknown> = {}) {
  return {
    stack: ["Nuxt", "NestJS"],
    content: {
      pt: { title: "Meu Projeto Incrível", summary: "Resumo PT", body: "# Corpo PT" },
      en: { title: "My Awesome Project", summary: "Summary EN", body: "# Body EN" },
    },
    ...overrides,
  };
}

describe("Projects (e2e)", () => {
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
    const res = await request(server()).get("/projects").expect(200);
    expect(res.body).toEqual([]);
  });

  it("rejects unauthenticated create (401)", async () => {
    await request(server()).post("/admin/projects").send(projectPayload()).expect(401);
  });

  it("validates the payload (400 on missing content)", async () => {
    await request(server())
      .post("/admin/projects")
      .set("Authorization", auth())
      .send({ stack: ["Nuxt"] })
      .expect(400);
  });

  it("creates a draft, auto-generates a slug, and hides it from the public", async () => {
    const created = await request(server())
      .post("/admin/projects")
      .set("Authorization", auth())
      .send(projectPayload())
      .expect(201);

    expect(created.body.slug).toBe("meu-projeto-incrivel");
    expect(created.body.status).toBe("draft");

    // Not visible publicly while draft.
    await request(server()).get("/projects").expect(200).expect([]);
    await request(server()).get("/projects/meu-projeto-incrivel").expect(404);

    // But visible in the admin listing.
    const adminList = await request(server())
      .get("/admin/projects")
      .set("Authorization", auth())
      .expect(200);
    expect(adminList.body).toHaveLength(1);
  });

  it("publishes the project so it appears publicly", async () => {
    const adminList = await request(server())
      .get("/admin/projects")
      .set("Authorization", auth())
      .expect(200);
    const id = adminList.body[0].id;

    await request(server())
      .patch(`/admin/projects/${id}`)
      .set("Authorization", auth())
      .send({ status: "published" })
      .expect(200);

    const publicList = await request(server()).get("/projects").expect(200);
    expect(publicList.body).toHaveLength(1);
    expect(publicList.body[0].slug).toBe("meu-projeto-incrivel");

    const detail = await request(server()).get("/projects/meu-projeto-incrivel").expect(200);
    expect(detail.body.content.en.title).toBe("My Awesome Project");
  });

  it("deduplicates slugs when titles collide", async () => {
    const created = await request(server())
      .post("/admin/projects")
      .set("Authorization", auth())
      .send(projectPayload())
      .expect(201);
    expect(created.body.slug).toBe("meu-projeto-incrivel-2");
  });

  it("deletes a project (admin)", async () => {
    const adminList = await request(server())
      .get("/admin/projects")
      .set("Authorization", auth())
      .expect(200);
    const id = adminList.body[0].id;

    await request(server())
      .delete(`/admin/projects/${id}`)
      .set("Authorization", auth())
      .expect(204);

    await request(server())
      .get(`/admin/projects/${id}`)
      .set("Authorization", auth())
      .expect(404);
  });
});
