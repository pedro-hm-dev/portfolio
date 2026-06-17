import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import type { LoginResponse } from "@portfolio/types";
import { AuthService, IssuedTokens } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { REFRESH_COOKIE, REFRESH_COOKIE_PATH } from "./auth.constants";
import { durationToMs, refreshCookieOptions } from "./auth.cookie";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { AuthUser } from "./strategies/jwt.strategy";
import type { RefreshUser } from "./strategies/jwt-refresh.strategy";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email/password; sets refresh cookie, returns access token" })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const tokens = await this.auth.login(dto.email, dto.password);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: "Rotate tokens using the refresh cookie" })
  async refresh(
    @CurrentUser() user: RefreshUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const tokens = await this.auth.refresh(user.userId, user.refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke the refresh token and clear the cookie" })
  async logout(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(user.userId);
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  }

  private setRefreshCookie(res: Response, refreshToken: IssuedTokens["refreshToken"]): void {
    const maxAge = durationToMs(this.config.get<string>("JWT_REFRESH_TTL", "7d"));
    const isProd = this.config.get<string>("NODE_ENV") === "production";
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions(maxAge, isProd));
  }
}
