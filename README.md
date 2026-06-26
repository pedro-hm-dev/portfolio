# Portfolio — Full-Stack (Nuxt + NestJS)

> Vitrine pública bilíngue (PT/EN) com CMS próprio, autenticação completa, coleta de dados LGPD e um tour interativo crítico.

## O que é

Projeto **híbrido**: vitrine bonita na frente, CMS de verdade por trás. Projetos e Posts publicados num painel protegido aparecem na vitrine pública em dois idiomas. O objetivo é provar, num artefato só, **design/front moderno** e **engenharia full-stack** completa — auth, API REST, banco de dados, testes, SEO, IA e deploy.

**Destaque único:** um tour interativo que guia o visitante pelo site e, no final, revela de forma transparente (e ligeiramente irônica) todos os dados técnicos e comportamentais coletados — com um formulário de consentimento LGPD e um dashboard público de visitantes.

## Stack

| Camada | Tecnologias |
| ------ | ----------- |
| **Front** (`apps/web`) | Nuxt 4 · Vue 3 · Tailwind 4 · Nuxt UI · Pinia · @nuxtjs/i18n · @nuxtjs/mdc · nuxt-og-image |
| **Back** (`apps/api`) | NestJS · MongoDB + Mongoose · JWT (access+refresh) · argon2 · Swagger · Anthropic SDK |
| **Compartilhado** (`packages/types`) | Tipos de domínio TypeScript usados por front e back |
| **Infra** | pnpm workspaces · Docker Compose (dev) · Vercel + Render + Mongo Atlas (prod) |

## Arquitetura

```
portfolio/
├─ apps/
│  ├─ web/        # Nuxt 4 — vitrine pública + painel admin (SPA)
│  └─ api/        # NestJS — CMS bilíngue, auth, IA, contato, visitantes
├─ packages/
│  └─ types/      # interfaces de domínio compartilhadas
└─ docker-compose.yml  # MongoDB local
```

## Funcionalidades

**Vitrine pública**
- Home, Projetos (lista + detalhe), Blog, Sobre, Contato
- Bilíngue PT/EN com `hreflang`, sitemap por locale e canonical correto
- Dark / light mode; transições de página; animações de entrada nos cards

**Tour interativo + LGPD**
- Botão flutuante "Tour" (ou `?tour=1` na URL) navega pelo site em 4 etapas
- Ao final, revela transparentemente todos os dados coletados: user agent, idioma, fuso, resolução, tema, referrer, páginas visitadas, tempo no site e localização aproximada (IP)
- Formulário de consentimento explícito (LGPD) com flag `isPublic`
- Dashboard público de visitantes que autorizaram exibição

**Painel admin** (`/admin`, SPA autenticado)
- Login com JWT access (15 min) + refresh rotation (7 dias, httpOnly cookie)
- CRUD completo de Projetos e Posts em markdown com preview ao vivo
- Tradução PT→EN e geração de meta-description por IA (Claude)
- Inbox de mensagens de contato com marcação de lidas
- Dashboard de visitantes com dados técnicos e comportamentais expandíveis

**API** (`http://localhost:3001`)
- Documentação Swagger em `/docs`
- SEO: OG dinâmico, JSON-LD (Person, CreativeWork, BlogPosting), og-image gerado

## Rodando localmente

Pré-requisitos: **Node ≥ 22**, **pnpm 11**, **Docker**.

```bash
# 1. instalar dependências
pnpm install

# 2. variáveis de ambiente da API
cp apps/api/.env.example apps/api/.env   # preencha os segredos

# 3. banco + apps em paralelo
pnpm db:up && pnpm dev
```

| Serviço | URL |
| ------- | --- |
| Front (Nuxt) | http://localhost:3000 |
| API (NestJS) | http://localhost:3001 |
| Swagger | http://localhost:3001/docs |

```bash
pnpm --filter api seed   # cria o admin inicial (rode uma vez)
pnpm test                # 41 testes (unitários + e2e)
pnpm typecheck           # checagem de tipos em todos os pacotes
```

## Deploy

### Vercel (web)

1. Importe o repositório no Vercel
2. **Root Directory**: deixe como raiz do repositório (usa `vercel.json` da raiz)
3. Configure as variáveis de ambiente:
   - `API_BASE` → URL do serviço Render (ex: `https://portfolio-api.onrender.com`)
   - `SITE_URL` → URL do domínio Vercel (ex: `https://pedro-maciel.vercel.app`)

### Render (API)

1. Conecte o repositório no Render
2. O `render.yaml` na raiz configura o serviço automaticamente
3. Preencha as variáveis marcadas com `sync: false` no dashboard:
   - `MONGO_URI` → connection string do Atlas
   - `WEB_ORIGIN` → URL do Vercel (CORS)
   - `ADMIN_EMAIL` e `ADMIN_PASSWORD` → credenciais do seed
   - `ANTHROPIC_API_KEY` → chave da Anthropic (funcionalidades de IA)
4. Após o primeiro deploy, rode o seed pelo Shell do Render:
   ```bash
   node dist/seed
   ```

### MongoDB Atlas

1. Crie um cluster gratuito (M0) em [cloud.mongodb.com](https://cloud.mongodb.com)
2. Crie um usuário de banco e libere o IP `0.0.0.0/0` (ou os IPs do Render)
3. Copie a connection string para `MONGO_URI`

## Testes

```bash
pnpm test   # roda todos (41 testes: unitários + e2e com mongodb-memory-server)
```

Cobertos: AuthService, AiService, ContactService, VisitorService, endpoints de projetos/posts/auth (e2e).

## Roadmap

- [ ] RAG / chat que responde perguntas do recrutador sobre os projetos
- [ ] Playwright E2E: fluxo caminho-ouro login → publicar → ver na vitrine
- [ ] Editor WYSIWYG (Tiptap) no corpo dos posts
