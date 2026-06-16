/**
 * Shared domain types consumed by both the Nest API and the Nuxt web app.
 * Mongoose schemas and class-validator DTOs on the API side implement these.
 */

export type Locale = "pt" | "en";

export type ContentStatus = "draft" | "published";

export type UserRole = "admin";

/** A field that exists in both supported locales. */
export interface Localized<T> {
  pt: T;
  en: T;
}

export interface ProjectContent {
  title: string;
  summary: string;
  body: string; // markdown
}

export interface ProjectLinks {
  repo?: string;
  demo?: string;
}

export interface Project {
  id: string;
  slug: string;
  status: ContentStatus;
  featured: boolean;
  stack: string[];
  links: ProjectLinks;
  coverImage?: string;
  images: string[];
  content: Localized<ProjectContent>;
  createdAt: string;
  updatedAt: string;
}

export interface PostContent {
  title: string;
  summary: string;
  body: string; // markdown
}

export interface Post {
  id: string;
  slug: string;
  status: ContentStatus;
  tags: string[];
  coverImage?: string;
  readingTime: number;
  content: Localized<PostContent>;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
}

/* ---------- Auth payloads ---------- */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: PublicUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/* ---------- AI payloads ---------- */

export interface TranslateRequest {
  title: string;
  summary: string;
  body: string;
}

export interface TranslateResponse {
  title: string;
  summary: string;
  body: string;
}

export interface MetaDescriptionRequest {
  title: string;
  body: string;
  locale: Locale;
}

export interface MetaDescriptionResponse {
  metaDescription: string;
}
