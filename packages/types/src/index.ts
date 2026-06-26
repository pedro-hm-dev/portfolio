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

/* ---------- Contact ---------- */

export interface CreateContactRequest {
  name: string;
  email: string;
  message: string;
}

/* ---------- Visitor / LGPD ---------- */

export interface VisitorTechnicalData {
  userAgent?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
  referrer?: string;
  colorScheme?: string;
}

export interface VisitorBehavioralData {
  pagesVisited: string[];
  projectsViewed: string[];
  postsViewed: string[];
  timeOnSite: number;
  tourCompleted: boolean;
}

export interface VisitorLocationData {
  country?: string;
  region?: string;
  city?: string;
}

export interface CreateVisitorRequest {
  name: string;
  email: string;
  company?: string;
  role?: string;
  interests?: string[];
  isPublic: boolean;
  consentVersion: string;
  technicalData: VisitorTechnicalData;
  behavioralData: VisitorBehavioralData;
  locationData: VisitorLocationData;
}

export interface PublicVisitor {
  id: string;
  name: string;
  company?: string;
  role?: string;
  interests: string[];
  createdAt: string;
}

export interface Visitor extends PublicVisitor {
  email: string;
  isPublic: boolean;
  consentVersion: string;
  consentDate: string;
  technicalData: VisitorTechnicalData;
  behavioralData: VisitorBehavioralData;
  locationData: VisitorLocationData;
  updatedAt: string;
}
