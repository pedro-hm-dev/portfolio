# Progresso — Portfólio Full-Stack

> Último checkpoint: 2026-06-16

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

## ▶️ Próximo passo (retomar AQUI)

**Módulo de auth no Nest** — fundação de todo CRUD protegido. Escopo já decidido:
- `User` schema (Mongoose) + hash **argon2**
- `POST /auth/login` → accessToken no corpo + **refresh token em cookie httpOnly**
- `POST /auth/refresh` (com rotation) + `POST /auth/logout`
- Passport JWT strategy + `JwtAuthGuard` + `RolesGuard` (`@Roles('admin')`)
- Script de **seed** do admin (lê `ADMIN_EMAIL`/`ADMIN_PASSWORD` do `.env`)
- Testes: unit do `AuthService` (hash + token) e e2e login/refresh com `mongodb-memory-server`

## 🔜 Fila depois do auth (ordem MVP do PRD)

1. CRUD de **Projetos** (público publicados + admin) → vitrine consumindo
2. CRUD de **Blog/Posts** (markdown bilíngue) → render com mdc + preview no painel
3. i18n de conteúdo + `hreflang`
4. Módulo **IA** (Claude: traduzir PT→EN, gerar meta-description)
5. SEO (JSON-LD, sitemap, OG images) + polish visual/animações
6. Testes (componentes Nuxt + 1 E2E Playwright caminho-ouro) + CI verde
7. Deploy (Vercel + Render + Atlas)

## ⚠️ Notas de ambiente

- Bash tool mata processos node que sobem servidor (exit 144) → verificar por build/teste, não probe HTTP ao vivo. Rodar dev server é com o usuário (`! pnpm dev`).
- Docker resolvido (usuário entrou no grupo).
- Branding/nome do projeto ainda em aberto (dir provisório `portfolio`).
