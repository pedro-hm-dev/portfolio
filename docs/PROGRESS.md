# Progresso — Portfólio Full-Stack

> Último checkpoint: 2026-06-18

## ✅ Concluído

- **Decisões de design** fechadas via entrevista (ver `PRD.md`): híbrido (vitrine + mini-CMS),
  domínio Projetos+Blog, bilíngue PT/EN, monorepo pnpm, MongoDB+Mongoose, auth completa,
  Nuxt UI + identidade visual, deploy Vercel/Render/Atlas, testes (pirâmide + 1 E2E),
  CI GitHub Actions, markdown+preview, SEO completo + OG images, IA (Claude) PT→EN + meta-description,
  Swagger, README vitrine.
- **PRD** escrito em `docs/PRD.md`.
- **Scaffold do monorepo** criado e instalado (`pnpm install` ok):
  - `packages/types` — tipos de domínio compartilhados (typecheck ✅)
  - `apps/api` — Nest + Mongoose + Swagger + config + health endpoint (`nest build` ✅)
  - `apps/web` — Nuxt 4 + Nuxt UI + i18n PT/EN + mdc + sitemap + og-image, dark/light,
    seletor de idioma (`nuxt prepare` ✅)
  - `docker-compose.yml` (Mongo dev), CI workflow, README, `.env.example`
- **Rodando localmente confirmado pelo usuário** (docker + `pnpm dev`): web :3000, api :3001, /docs.
- **Módulo de auth no Nest concluído** (2026-06-17) — typecheck ✅, build ✅, 13 testes ✅:
  - `users/` — `User` schema (email, passwordHash, role, refreshTokenHash) + `UsersService` + `UsersModule`
  - `auth/` — `AuthService` (argon2 hash/verify, JWT access + refresh **com rotation** e `jti` único, logout revoga hash)
  - `POST /auth/login` → `{ accessToken, user }` + refresh token em **cookie httpOnly** (path `/auth`, sameSite/secure por env)
  - `POST /auth/refresh` (rotation) com `JwtRefreshGuard` (lê cookie); `POST /auth/logout` com `JwtAuthGuard`
  - Strategies `jwt` + `jwt-refresh`; `RolesGuard` + `@Roles('admin')` + `@CurrentUser()`
  - `src/seed.ts` (idempotente, lê `ADMIN_EMAIL`/`ADMIN_PASSWORD`) — `pnpm --filter api seed`
  - Testes: `auth.service.spec.ts` (7 unit) + `test/auth.e2e-spec.ts` (6 e2e, `mongodb-memory-server` + supertest)
  - Setup de teste: **Vitest + unplugin-swc** (decorators/metadata); `@swc/core` liberado em `pnpm-workspace.yaml`
  - ⚠️ Pendência menor: `JWT_*` secrets ainda são `change-me` no `.env` — trocar antes de qualquer deploy.
- **CRUD de Projetos concluído** (2026-06-17) — typecheck ✅, build ✅, 20 testes ✅ (total):
  - `projects/schemas/project.schema.ts` — `Project` + sub-schemas `ProjectContent`/`LocalizedProjectContent`/`ProjectLinks` (conteúdo bilíngue embutido); slug e status indexados
  - DTOs (`create`/`update` via `PartialType`) com `class-validator` + Swagger; nested validado com `@IsObject`+`@ValidateNested`+`@Type`; `common/slugify.ts` (strip de acentos)
  - `ProjectsService` — listPublished (featured→recente), findPublishedBySlug, listAll (admin), findById, create/update/remove; **slug auto a partir do título PT**, dedupe (`-2`,`-3`...), trata duplicate key (11000)
  - `ProjectsController` (público): `GET /projects` (só published) + `GET /projects/:slug`
  - `AdminProjectsController` (`/admin/projects`, guarded `JwtAuthGuard`+`RolesGuard`+`@Roles('admin')`): list-all/byId/create/update/delete
  - `test/projects.e2e-spec.ts` (7 e2e): draft oculto no público, publish→aparece, dedupe de slug, 401 sem auth, 400 validação, delete

- **Vitrine (web) consumindo Projetos concluída** (2026-06-17) — typecheck (monorepo) ✅, `nuxt build` ✅:
  - `composables/useProjects.ts` — `useProjectsList()` + `useProject(slug)` via `useFetch` com `baseURL` do `runtimeConfig.public.apiBase`
  - `composables/useLocalizedContent.ts` — escolhe `content[locale]` (fallback PT)
  - `components/ProjectCard.vue` — card localizado (cover, título, resumo, badges de stack, marca featured)
  - `pages/index.vue` — hero + grid de destaques (featured, fallback p/ 3 primeiros) + skeletons
  - `pages/projects/index.vue` — lista + filtro por stack (derivado dos projetos) + estados loading/empty
  - `pages/projects/[slug].vue` — detalhe com `<MDC>` (markdown), links repo/demo, `createError` 404; SEO via `useSeoMeta`
  - `app.vue` — link "Projetos" no nav; i18n PT/EN com chaves `nav`/`home`/`projects`/`common`
  - **Contrato:** API agora devolve `id` (toJSON transform no `Project` schema esconde `_id`/`__v`) → casa com `@portfolio/types`
  - ⚠️ Verificação ao vivo (web↔api com dados reais) é com o usuário: `! pnpm dev` + seed (`pnpm --filter api seed`) e criar projeto publicado.

- **CRUD de Blog/Posts concluído** (2026-06-17) — typecheck (monorepo) ✅, builds ✅, **27 testes API ✅**:
  - **API** (`posts/`, espelha `projects/`): `Post` schema + sub-schemas + toJSON `id`; DTOs create/update; `PostsService` com slug auto/dedupe, **`readingTime` calculado** (`common/reading-time.ts`, 200 wpm, corpo PT) e **`publishedAt` carimbado ao publicar pela 1ª vez**
  - `PostsController` (`GET /posts`, `/posts/:slug` — só published) + `AdminPostsController` (`/admin/posts`, guarded admin)
  - `test/posts.e2e-spec.ts` (7 e2e): draft oculto, publish→publishedAt+visível, readingTime=2 (400 palavras), dedupe, 401/400, delete, resposta usa `id` (sem `_id`)
  - **Web**: `composables/usePosts.ts`; `components/PostCard.vue`; `pages/blog/index.vue` (lista) + `pages/blog/[slug].vue` (detalhe mdc + 404); link "Blog" no nav; i18n `nav.blog`/`blog.*` (inclui `readingTime` com interpolação)
  - ⚠️ Verificação ao vivo continua com o usuário (`! pnpm dev` + seed + publicar post).

- **i18n de conteúdo + `hreflang` concluído** (2026-06-18) — typecheck ✅, `nuxt build` ✅:
  - `nuxt.config.ts`: `i18n.baseUrl` (URLs absolutas p/ hreflang) + `sitemap.sources: ['/api/__sitemap__/urls']`
  - `app.vue`: `useLocaleHead({ dir, lang, seo })` + `useHead(...)` → injeta `<html lang/dir>`, canonical, hreflang alternates (pt-BR/en-US/x-default) e `og:locale` em **todas** as páginas
  - `server/api/__sitemap__/urls.ts`: busca `/projects` + `/posts` publicados da API e gera URLs com `_i18nTransform: true` (sitemap expande pra pt+en com alternates); `lastmod` = `updatedAt`
  - Build gera `sitemap_index.xml` (índice multi-locale) ✅
  - ⚠️ Verificação ao vivo com o usuário: `! pnpm dev` + seed + conferir `<link rel="alternate" hreflang>` no `<head>` e `/sitemap.xml` listando os slugs reais.

## ▶️ Próximo passo (retomar AQUI)

**Módulo IA (Claude)** — no `apps/api`:
- Endpoint admin para **traduzir PT→EN** (title/summary/body) — contrato já existe em `@portfolio/types` (`TranslateRequest`/`TranslateResponse`)
- Endpoint admin para **gerar meta-description** (`MetaDescriptionRequest`/`MetaDescriptionResponse`)
- Usar SDK `@anthropic-ai/sdk`; chave via env; guardar atrás de `JwtAuthGuard`+`@Roles('admin')`
- Testes (mock do client Anthropic) + Swagger

## 🔜 Fila depois (ordem MVP do PRD)

1. SEO restante (JSON-LD) + polish visual/animações (OG images já via `nuxt-og-image`)
2. Painel admin (login + CRUD de projetos/posts com preview de markdown)
3. Testes (componentes Nuxt + 1 E2E Playwright caminho-ouro) + CI verde
4. Deploy (Vercel + Render + Atlas)

## ⚠️ Notas de ambiente

- Bash tool mata processos node que sobem servidor (exit 144) → verificar por build/teste, não probe HTTP ao vivo. Rodar dev server é com o usuário (`! pnpm dev`).
- Docker resolvido (usuário entrou no grupo).
- Branding/nome do projeto ainda em aberto (dir provisório `portfolio`).
