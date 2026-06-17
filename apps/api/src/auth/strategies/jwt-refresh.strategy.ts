import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Request } from "express";
import type { JwtPayload } from "@portfolio/types";
import { REFRESH_COOKIE } from "../auth.constants";
import type { AuthUser } from "./jwt.strategy";

/** Authenticated user plus the raw refresh token, for rotation hash checks. */
export interface RefreshUser extends AuthUser {
  refreshToken: string;
}

const fromCookie = (req: Request): string | null =>
  (req?.cookies?.[REFRESH_COOKIE] as string | undefined) ?? null;

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): RefreshUser {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      refreshToken: fromCookie(req) ?? "",
    };
  }
}
