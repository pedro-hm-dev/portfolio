import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

const CONFIG: Record<string, string> = {
  JWT_ACCESS_SECRET: "test-access-secret",
  JWT_REFRESH_SECRET: "test-refresh-secret",
  JWT_ACCESS_TTL: "15m",
  JWT_REFRESH_TTL: "7d",
};

const configStub = {
  get: (key: string, fallback?: string) => CONFIG[key] ?? fallback,
  getOrThrow: (key: string) => {
    if (!CONFIG[key]) throw new Error(`missing ${key}`);
    return CONFIG[key];
  },
};

/** Minimal in-memory stand-in for a Mongoose UserDocument. */
function fakeUser(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: "u1",
    email: "admin@portfolio.dev",
    role: "admin" as const,
    passwordHash: "",
    refreshTokenHash: null as string | null,
    ...over,
  };
}

describe("AuthService", () => {
  let users: {
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    setRefreshTokenHash: ReturnType<typeof vi.fn>;
  };
  let service: AuthService;

  beforeEach(() => {
    users = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      setRefreshTokenHash: vi.fn().mockResolvedValue(undefined),
    };
    service = new AuthService(
      users as unknown as UsersService,
      new JwtService({}),
      configStub as never,
    );
  });

  it("issues an access token and persists a hashed refresh token on valid login", async () => {
    const passwordHash = await argon2.hash("supersecret");
    users.findByEmail.mockResolvedValue(fakeUser({ passwordHash }));

    const tokens = await service.login("admin@portfolio.dev", "supersecret");

    expect(tokens.accessToken).toBeTypeOf("string");
    expect(tokens.refreshToken).toBeTypeOf("string");
    expect(tokens.user).toEqual({ id: "u1", email: "admin@portfolio.dev", role: "admin" });

    // Stored refresh token is hashed (not the raw token), and verifies against the raw one.
    const storedHash = users.setRefreshTokenHash.mock.calls[0][1] as string;
    expect(storedHash).not.toEqual(tokens.refreshToken);
    await expect(argon2.verify(storedHash, tokens.refreshToken)).resolves.toBe(true);
  });

  it("rejects login with a wrong password", async () => {
    const passwordHash = await argon2.hash("supersecret");
    users.findByEmail.mockResolvedValue(fakeUser({ passwordHash }));

    await expect(service.login("admin@portfolio.dev", "wrong")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(users.setRefreshTokenHash).not.toHaveBeenCalled();
  });

  it("rejects login for an unknown email", async () => {
    users.findByEmail.mockResolvedValue(null);
    await expect(service.login("nobody@x.dev", "whatever")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("rotates the refresh token when a valid one is presented", async () => {
    // First login establishes a stored hash.
    const passwordHash = await argon2.hash("supersecret");
    users.findByEmail.mockResolvedValue(fakeUser({ passwordHash }));
    const first = await service.login("admin@portfolio.dev", "supersecret");
    const firstStoredHash = users.setRefreshTokenHash.mock.calls[0][1] as string;

    users.findById.mockResolvedValue(fakeUser({ refreshTokenHash: firstStoredHash }));
    const rotated = await service.refresh("u1", first.refreshToken);

    expect(rotated.accessToken).toBeTypeOf("string");
    const newStoredHash = users.setRefreshTokenHash.mock.calls[1][1] as string;
    expect(newStoredHash).not.toEqual(firstStoredHash);
    await expect(argon2.verify(newStoredHash, rotated.refreshToken)).resolves.toBe(true);
  });

  it("rejects refresh when the presented token does not match the stored hash", async () => {
    const storedHash = await argon2.hash("some-other-token");
    users.findById.mockResolvedValue(fakeUser({ refreshTokenHash: storedHash }));

    await expect(service.refresh("u1", "tampered-token")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("rejects refresh when the user has been logged out (no stored hash)", async () => {
    users.findById.mockResolvedValue(fakeUser({ refreshTokenHash: null }));
    await expect(service.refresh("u1", "any")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("clears the stored refresh hash on logout", async () => {
    await service.logout("u1");
    expect(users.setRefreshTokenHash).toHaveBeenCalledWith("u1", null);
  });
});
