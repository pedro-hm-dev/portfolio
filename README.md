# Portfolio — Full-Stack (Nuxt + NestJS)

> Vitrine pública bilíngue (PT/EN) alimentada por um mini-CMS funcional com painel
> administrativo autenticado. Monorepo full-stack pensado para candidaturas no Brasil
> e no exterior.

<!-- badges: CI / license aqui -->

## ✨ O que é

Projeto **híbrido**: a vitrine bonita na frente, um CMS de verdade por trás. Eu publico
**Projetos** e **Posts** num painel protegido e eles aparecem na vitrine pública, nos dois
idiomas. O objetivo é provar, num artefato só, tanto **design/front moderno** quanto
**engenharia full-stack** (auth, API, banco, testes, CI, deploy).

## 🧱 Stack

| Camada | Tecnologias |
| ------ | ----------- |
| **Front** (`apps/web`) | Nuxt 4 · Vue 3 · Tailwind 4 · Nuxt UI · Pinia · @nuxtjs/i18n · @nuxtjs/mdc · nuxt-og-image |
| **Back** (`apps/api`) | NestJS · MongoDB + Mongoose · JWT (access+refresh) · argon2 · Swagger · Anthropic SDK |
| **Compartilhado** (`packages/types`) | Tipos de domínio TypeScript usados por front e back |
| **Infra** | pnpm workspaces · Docker Compose (dev) · Vercel + Render + Mongo Atlas (prod) · GitHub Actions |

## 🏛️ Arquitetura

```
portfolio/
├─ apps/
│  ├─ web/        # Nuxt 4 — vitrine pública + painel admin
│  └─ api/        # NestJS — CMS bilíngue, auth, IA
├─ packages/
│  └─ types/      # interfaces de domínio compartilhadas (Project, Post, Auth…)
└─ docker-compose.yml  # MongoDB local
```

## 🚀 Rodando localmente

Pré-requisitos: **Node ≥ 22**, **pnpm 11**, **Docker** (com seu usuário no grupo `docker`).

```bash
# 1. instalar dependências
pnpm install

# 2. configurar variáveis de ambiente da API
cp apps/api/.env.example apps/api/.env    # ajuste os segredos

# 3. subir o banco + os dois apps (deixe este comando rodando)
pnpm db:up && pnpm dev
```

> O `pnpm dev` sobe **web e API em paralelo** e mantém ambos rodando. A API só passa a
> responder depois que o MongoDB está no ar — por isso o `pnpm db:up` vem antes.
> Os endpoints (e o `/docs`) só existem enquanto este processo estiver ativo.

Tudo no ar, acesse:

| Serviço | URL |
| ------- | --- |
| 🌐 Front (Nuxt) | http://localhost:3000 |
| ⚙️ API (NestJS) | http://localhost:3001 |
| 📖 Swagger / docs da API | http://localhost:3001/docs |
| 🍃 MongoDB | `localhost:27017` |

### Comandos úteis

```bash
pnpm dev:web        # só o front (:3000)
pnpm dev:api        # só a API (:3001)
pnpm db:up          # sobe o MongoDB (Docker)
pnpm db:down        # derruba o MongoDB
pnpm --filter api seed   # cria o usuário admin inicial (após os módulos de auth)
pnpm test           # roda os testes de todos os pacotes
```

## 🌐 Funcionalidades

- Vitrine responsiva: Home, Projetos (lista + detalhe), Blog, Sobre, Contato
- **Bilíngue PT/EN** de verdade (UI + conteúdo + `hreflang`)
- **Dark/light mode**
- Painel admin com **auth completa** (JWT access+refresh, argon2, roles)
- CRUD de Projetos e Posts em **markdown com preview ao vivo**
- **IA (Claude)**: traduzir rascunho PT→EN e gerar meta-description
- **SEO** completo: OG dinâmico, JSON-LD, sitemap, OG images geradas
- **API documentada** em `/docs` (Swagger)

## 🧪 Testes

- Unitários (services críticos do Nest) + e2e dos endpoints (mongodb-memory-server)
- Componentes Nuxt (Vitest + @vue/test-utils)
- 1 fluxo E2E caminho-ouro (Playwright): logar → publicar → ver na vitrine PT/EN

## 🗺️ Roadmap

- [ ] RAG / chat que responde perguntas do recrutador sobre os projetos
- [ ] Editor WYSIWYG (Tiptap) opcional no corpo dos posts
- [ ] ADRs formais em `docs/`

---

📄 PRD completo em [`docs/PRD.md`](docs/PRD.md).
