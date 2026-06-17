import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthUser } from "../strategies/jwt.strategy";

/** Injects the authenticated user (set by the JWT strategy) into a handler param. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest<{ user: AuthUser }>().user;
});
