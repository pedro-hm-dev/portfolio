import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import * as argon2 from "argon2";
import type { JwtPayload, PublicUser } from "@portfolio/types";
import { UsersService } from "../users/users.service";
import { UserDocument } from "../users/schemas/user.schema";

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Validates credentials; returns the user document or null (never throws on bad creds). */
  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.users.findByEmail(email);
    if (!user) return null;
    const ok = await argon2.verify(user.passwordHash, password);
    return ok ? user : null;
  }

  async login(email: string, password: string): Promise<IssuedTokens> {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException("Credenciais inválidas");
    return this.issueAndPersist(user);
  }

  /** Rotates tokens: verifies the presented refresh token against the stored hash, then re-issues. */
  async refresh(userId: string, presentedToken: string): Promise<IssuedTokens> {
    const user = await this.users.findById(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();
    const matches = await argon2.verify(user.refreshTokenHash, presentedToken);
    if (!matches) throw new UnauthorizedException();
    return this.issueAndPersist(user);
  }

  async logout(userId: string): Promise<void> {
    await this.users.setRefreshTokenHash(userId, null);
  }

  private async issueAndPersist(user: UserDocument): Promise<IssuedTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get<string>("JWT_ACCESS_TTL", "15m"),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.config.get<string>("JWT_REFRESH_TTL", "7d"),
      // Unique id per token so rotation always yields a distinct token (and the
      // previous refresh token stops matching the stored hash).
      jwtid: randomUUID(),
    });

    await this.users.setRefreshTokenHash(user.id, await argon2.hash(refreshToken));
    return { accessToken, refreshToken, user: UsersService.toPublic(user) };
  }
}
