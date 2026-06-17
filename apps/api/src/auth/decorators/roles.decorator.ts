import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "@portfolio/types";

export const ROLES_KEY = "roles";

/** Restrict a route/controller to the given roles (used with RolesGuard). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
