# PRD — Portfólio Full-Stack (Nuxt + Nest)

> Status: ready-for-agent · Owner: Pedro Maciel · Última atualização: 2026-06-16

## Problem Statement

Como desenvolvedor que se candidata a vagas no Brasil e no exterior, eu não tenho um
artefato único que prove, ao mesmo tempo, minha capacidade de **design/front-end moderno**
e de **engenharia full-stack real** (auth, API, banco, testes, deploy, CI). Portfólios
puramente "vitrine" parecem template e não diferenciam; aplicações full-stack sem vitrine
não "vendem" o candidato. Recrutadores decidem nos primeiros 30 segundos e muitos não
rodam o projeto localmente.

## Solution

Um **projeto híbrido**: uma vitrine pública bonita e responsiva (PT/EN) que é **alimentada
por um mini-CMS funcional** com área administrativa autenticada. O backend NestJS tem
propósito real — eu publico Projetos e Posts no painel e eles aparecem na vitrine pública,
nos dois idiomas. Tudo num **monorepo** com um link só, README-vitrine, deploy ao vivo,
CI verde e API documentada — de modo que o recrutador entenda a engenharia sem precisar
subir nada.

## User Stories

### Visitante público (recrutador)
1. Como visitante, quero ver uma home com hero e projetos em destaque, para entender rapidamente quem é o dono do portfólio.
2. Como visitante, quero navegar pela lista de projetos com filtros por stack, para encontrar trabalhos relevantes à vaga.
3. Como visitante, quero abrir o detalhe de um projeto (descrição, stack, links, imagens), para avaliar profundidade técnica.
4. Como visitante, quero ler o blog com artigos técnicos, para avaliar a comunicação e o conhecimento do autor.
5. Como visitante, quero abrir um post com markdown renderizado e syntax highlight, para ler código formatado corretamente.
6. Como visitante, quero alternar entre PT e EN em qualquer página, para ler no meu idioma.
7. Como visitante, quero alternar entre tema claro e escuro, para conforto de leitura.
8. Como visitante, quero uma página "Sobre" com skills e experiência, para conhecer o perfil profissional.
9. Como visitante, quero enviar uma mensagem pelo formulário de contato, para iniciar uma conversa.
10. Como visitante, quero que o site carregue rápido e seja totalmente responsivo (mobile→desktop), para uma boa experiência em qualquer dispositivo.
11. Como visitante, quero que ao compartilhar um link no LinkedIn apareça um card bonito (OG image), para que o conteúdo se destaque.
12. Como visitante usando leitor de tela, quero navegação acessível, para usar o site sem barreiras.

### Administrador (dono do portfólio)
13. Como admin, quero fazer login com email/senha, para acessar a área protegida.
14. Como admin, quero permanecer logado via refresh token, para não relogar a cada expiração.
15. Como admin, quero criar/editar/excluir projetos, para manter o portfólio atualizado.
16. Como admin, quero criar/editar/excluir posts de blog, para publicar conteúdo recorrente.
17. Como admin, quero escrever conteúdo em markdown com preview ao vivo, para ver o resultado enquanto edito.
18. Como admin, quero editar cada projeto/post em PT e EN em abas separadas, para gerenciar o conteúdo bilíngue.
19. Como admin, quero marcar um item como rascunho/publicado, para controlar o que aparece na vitrine.
20. Como admin, quero clicar em "traduzir PT→EN" e receber um rascunho traduzido por IA, para reduzir o trabalho de duplicar conteúdo.
21. Como admin, quero clicar em "gerar meta-description" e receber uma sugestão por IA, para melhorar o SEO sem escrever à mão.
22. Como admin, quero fazer upload/associar imagens aos projetos, para ilustrar os trabalhos.
23. Como admin, quero ver as mensagens de contato recebidas, para respondê-las.
24. Como admin, quero que apenas usuários com papel de admin acessem o painel, para manter o controle de acesso.

### Desenvolvedor / avaliador técnico
25. Como avaliador, quero abrir o README e ver stack, arquitetura, decisões técnicas, GIFs e links de deploy, para entender o projeto em 30 segundos.
26. Como avaliador, quero acessar `/docs` (Swagger) da API, para explorar e testar os endpoints ao vivo.
27. Como avaliador, quero subir o ambiente local com um comando (`docker-compose up` + `pnpm dev`), para rodar o projeto sem fricção.
28. Como avaliador, quero ver a CI passando (lint + typecheck + testes) em cada PR, para confiar na disciplina de engenharia.
29. Como avaliador, quero ver tipos compartilhados entre front e back, para perceber maturidade arquitetural.

## Implementation Decisions

**Arquitetura geral**
- Monorepo com **pnpm workspaces**: `apps/web` (Nuxt), `apps/api` (Nest), `packages/types` (interfaces/DTOs compartilhados). Sem Nx/Turborepo no início.
- Tipos de domínio (Project, Post, ContactMessage, User, Auth payloads) vivem em `packages/types` e são consumidos pelos dois lados. Mongoose e os DTOs `class-validator` do Nest implementam essas interfaces (Mongoose não gera tipos).

**Front (`apps/web`)**
- Nuxt 4 + Tailwind 4 + Nuxt UI 4 (base acessível) + Pinia. Identidade visual própria por cima (paleta/tipografia, micro-animações, transições de página). Dark/light mode habilitado (`colorMode` ligado — diferente do boilerplate).
- i18n via `@nuxtjs/i18n` (PT/EN), com seletor de idioma e `hreflang`.
- Render de markdown via `@nuxtjs/mdc` com syntax highlight.
- SEO: `useSeoMeta` dinâmico, `@nuxtjs/sitemap`, robots, Open Graph + Twitter cards, JSON-LD (`Person` na home, `BlogPosting` nos posts) e OG images dinâmicas via `nuxt-og-image`.
- SSR (deploy Vercel) para SEO e performance.

**Back (`apps/api`)**
- NestJS + MongoDB + Mongoose. Documentos com conteúdo bilíngue embutido: `{ pt: {...}, en: {...} }` (sem tabela de tradução).
- Módulos: `auth`, `users`, `projects`, `posts`, `contact`, `ai`.
- **Auth completa**: login email/senha, hash com **argon2**, **JWT access + refresh token com rotation**, roles guard (`admin`). Seed de admin inicial via script.
- Validação com `class-validator`/`class-transformer` nos DTOs.
- **Swagger** via `@nestjs/swagger` em `/docs`, reaproveitando os DTOs decorados.
- **IA** (`ai` module): integração com a **API da Anthropic (Claude)** para duas ações: traduzir rascunho PT→EN e gerar meta-description. Modelo padrão **Haiku 4.5** para custo (Sonnet 4.6 opcional para tradução mais cuidadosa). Endpoints protegidos por auth de admin.

**API contracts (resumo)**
- `POST /auth/login` → `{ accessToken }` + refresh em cookie httpOnly; `POST /auth/refresh`; `POST /auth/logout`.
- `GET /projects` (público, publicados) e `GET /projects/:slug`; CRUD protegido em `/projects` (admin).
- `GET /posts` e `GET /posts/:slug` (público); CRUD protegido (admin).
- `POST /contact` (público) cria mensagem; `GET /contact` (admin) lista.
- `POST /ai/translate`, `POST /ai/meta-description` (admin).

**Schema (alto nível)**
- `User`: email, passwordHash, role.
- `Project`: slug, featured, status (draft/published), stack[], links{repo,demo}, images[], coverImage, `pt{title,summary,body}`, `en{title,summary,body}`, timestamps.
- `Post`: slug, status, tags[], coverImage, readingTime, `pt{title,summary,body(markdown)}`, `en{...}`, publishedAt, timestamps.
- `ContactMessage`: name, email, message, createdAt, read.

**Infra**
- `docker-compose.yml` no dev sobe MongoDB (e opcionalmente a API). Deploy: Nuxt na **Vercel**, Nest no **Render/Railway**, Mongo no **Atlas M0** (free tier).
- **CI**: GitHub Actions roda lint + typecheck + testes em cada PR; badge no README.

## Testing Decisions

- Bom teste = verifica **comportamento externo** (entrada→saída de endpoints, comportamento de componentes visíveis), não detalhes de implementação.
- **Back (Nest):** testes unitários nos services críticos (auth: hashing, emissão/rotação de token, regras de roles; regras de publicação de conteúdo). Testes e2e nos endpoints principais (auth login/refresh, CRUD de projects/posts, contact) usando **mongodb-memory-server** ou container de teste.
- **Front (Nuxt):** testes de componente com **Vitest + @vue/test-utils** nos componentes de maior valor (card de projeto, render de markdown, seletor de idioma/tema, form de contato com validação).
- **E2E (1 fluxo caminho-ouro):** **Playwright** — admin loga → cria projeto em PT e EN → publica → projeto aparece na vitrine pública nos dois idiomas. Vira GIF no README.
- Sem perseguir coverage por número; cobrir as camadas certas.

## Out of Scope

- RAG / chat sobre os projetos (fica no roadmap do README).
- Editor WYSIWYG/Tiptap (markdown + preview é suficiente; troca futura possível só no corpo).
- Multi-tenant / múltiplos autores com fluxo de convite (auth é completa, mas o uso real é single-admin via seed).
- Gestão elaborada de mensagens de contato (apenas listagem; sem inbox/threads).
- ADRs formais e CONTRIBUTING (opcionais no roadmap).
- Pagamentos, comentários no blog, newsletter.

## Further Notes

- Branding/nome do produto ainda em aberto — diretório provisório `portfolio`.
- Ordem de execução sugerida (MVP-first): scaffold do monorepo → API auth + CRUD de Projetos → vitrine consumindo → blog → i18n → IA/SEO/polish → testes/CI → deploy.
- O custo de conteúdo bilíngue é mitigado pela ação de tradução por IA (story 20).
- Cold start no free tier da API é aceitável para portfólio.
