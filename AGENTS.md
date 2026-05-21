# AGENTS.md — Auge Management System

> Este arquivo contém instruções e contexto específicos para agentes de IA que trabalham neste projeto. Leia antes de fazer qualquer alteração.

---

## Visão Geral

Sistema de gerenciamento de concessionária de motocicletas. Módulo principal atual: **BDC** (Business Development Center) — cadastro e acompanhamento de clientes e status de emplacamento de veículos.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| React | 19.2.4 com React Compiler |
| Lang | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) |
| UI | shadcn/ui — estilo **radix-nova** |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Auth | better-auth + Prisma adapter |
| DB | PostgreSQL (local via Docker) |
| ORM | Prisma 7.8.0 |
| Dates | date-fns (formulários) + dayjs (tabela/cálculos) |
| Icons | lucide-react |
| Lint/Format | Biome 2.2.0 |
| Package Manager | pnpm |

---

## Estrutura de Diretórios

```
app/
  (app)/                    # Rotas autenticadas (com Navbar)
    bdc/
      page.tsx              # Dashboard com tabela BDC
      cliente/
        novo/
          page.tsx          # Cadastro de cliente (2 steps)
        editar/
          page.tsx          # Edição de cliente (form direto, sem stepper)
    logistics/
      page.tsx              # Placeholder
  (auth)/                   # Rotas públicas (login/registro)
    sign-in/
    sign-up/
  api/auth/[...all]/        # Better Auth API routes
  data/require-user.ts      # Guard server-side (requer ADMIN)

components/
  bdc/                      # Componentes de domínio BDC
    chassis-step.tsx
    customer-data-step.tsx
    customer-form.tsx
    sidebar-resumo.tsx
  layout/                   # Navbar, Header
  shadcn-studio/table/      # Tabela customizada
  ui/                       # shadcn/ui components (NEVER edit directly)

lib/
  bdc-data.ts               # Mock data + helper getStatusChegada()
  db.ts                     # Prisma client
  auth.ts                   # Better Auth server config
  auth-client.ts            # Better Auth client

validators/
  customer-schema.ts        # Zod schema do formulário BDC
  login-schema.ts

prisma/
  schema.prisma             # Schema do banco

```

---

## Convenções de Código

### shadcn/ui
- **Estilo**: `radix-nova` (definido em `components.json`)
- **Nunca edite** componentes em `components/ui/` diretamente. Se precisar customizar, use `cn()` com overrides ou crie um wrapper.
- Para adicionar novos componentes: `npx shadcn add <componente>`
- Componentes existentes: Badge, Breadcrumb, Button, Calendar, Card, Dialog, DropdownMenu, Form, Input, Label, Popover, Select, Switch, Table

### Tailwind CSS v4
- Usa sintaxe nova: `@import "tailwindcss"` (não `@tailwind` directives)
- Variáveis CSS em `:root` e `.dark`
- Cores em `oklch()`
- Custom variant: `@custom-variant dark (&:is(.dark *))`
- Arquivo principal: `app/globals.css`

### Formatação
- Usar **Biome** para lint/format: `pnpm biome format --write .`
- Indent: 2 espaços
- Organize imports habilitado no VS Code

### TypeScript
- Strict mode ativado
- Path alias: `@/` mapeia para `./`
- Tipos Zod exportados de `validators/`

---

## Regras de Negócio — BDC

### Cadastro de Cliente (`/bdc/cliente/novo`)
**Fluxo em 2 steps:**
1. **Step 1 — Consulta de Chassi**: Digita chassi, clica "Consultar". Sistema verifica em mock de logística (`lib/bdc-data.ts`).
   - **Encontrado**: preenche Modelo e Cidade automaticamente, seta `motoChegou = true`, avança para Step 2.
   - **Não encontrado**: avança para Step 2 com chassi preenchido (readonly), resto manual.
2. **Step 2 — Dados do Cliente**: Campos disponíveis:
   - Cliente, Vendedor, Cidade, Modelo, Chassi (readonly)
   - **Data de Faturamento** (DatePicker shadcn)
   - **Chegada na Loja**: Switch "Moto chegou?" + DatePicker (desabilitado se switch = OFF)
   - **Status de Emplacamento**: Select (Pendente / Em Emplacamento / Emplacado)
     - Se diferente de "Pendente": aparece DatePicker para data do emplacamento
   - Ações: "Voltar" (limpa tudo, volta Step 1) ou "Salvar" (console.log + redirect `/bdc`)

### Edição de Cliente (`/bdc/cliente/editar?id={id}`)
- **Sem stepper**. Formulário do Step 2 é exibido direto com dados preenchidos.
- Sidebar de resumo sempre visível.
- Apenas botão "Salvar" (sem "Voltar").
- Breadcrumb: Home > BDC > Editar Cliente

### Tabela BDC (`/bdc`)
Colunas: Cliente | Vendedor | Cidade | Modelo | Chassi | Data Faturamento | Status Chegada | Situação | Ações

- **Data Faturamento**: data em que o veículo foi faturado na concessionária.
- **Status Chegada**: calculado via Day.js comparando `dataChegada` com hoje:
  - `<= hoje` → badge verde "Chegou"
  - `> hoje` → badge vermelho "Não Chegou"
- **Situação**: status de emplacamento (Pendente / Em Emplacamento / Emplacado)
  - Pendente: 🟡 amarelo
  - Em Emplacamento: 🔵 azul
  - Emplacado: 🟢 verde
- Botão editar (lápis) redireciona para `/bdc/cliente/editar?id={id}`

---

## Schema do Formulário (Zod)

Arquivo: `validators/customer-schema.ts`

```typescript
chassi: string (min 1)
cliente: string (min 1)
vendedor: string (min 1)
cidade: string (min 1)
modelo: string (min 1)
dataFaturamento: Date (optional)
motoChegou: boolean
dataChegada: Date (optional)
statusRegistro: enum ["Pendente", "Em Emplacamento", "Emplacado"]
dataEmplacamento: Date (optional)
```

**Refinement**: se `statusRegistro !== "Pendente"`, `dataEmplacamento` é obrigatória.

---

## Componentes Customizados Principais

### `CustomerForm`
- Props: `initialData?: Partial<CustomerFormData>`, `mode?: "create" | "edit"`
- Modo create: mostra stepper 1→2, Step 1 = ChassisStep, Step 2 = CustomerDataStep
- Modo edit: oculta stepper, mostra Step 2 direto com `initialData` preenchido
- Gerencia estado do sidebar via `form.watch()`

### `ChassisStep`
- Consulta chassi em mock (`motosMock` array local)
- Simula delay de 800ms
- Chama `onSearchResult(found, data)` que avança para Step 2

### `CustomerDataStep`
- Props: `form`, `onBack?` (opcional — omitido em modo edição)
- DatePickers via shadcn Calendar + Popover
- Select de status com renderização condicional do date picker de emplacamento
- Switch "moto chegou" com disabled no date picker de chegada

### `SidebarResumo`
- Sidebar colapsável (desktop) / acima do form (mobile)
- Mostra: status do chassi (Na Logística / Não Encontrado), Chassi, Modelo, Cidade, Cliente, Vendedor, Chegou na Loja, Status Emplacamento
- Dados reativos via `form.watch()`

---

## Mock Data

Arquivo: `lib/bdc-data.ts`
- Array `bdcItems` com 10 registros
- Campos: `id`, `cliente`, `vendedor`, `cidade`, `modelo`, `chassi`, `dataFaturamento`, `dataChegada`, `situacao`
- Helper `getStatusChegada(dataChegada)` usa dayjs

**Nota**: O projeto ainda não tem backend real para BDC. O formulário faz `console.log()` e redireciona. O mock serve para UI/UX e testes.

---

## Autenticação

- Usa **better-auth** com Prisma adapter
- Login: email + senha
- Campo extra no User: `role` (enum USER / ADMIN)
- Guard server-side: `requireUser()` em `app/data/require-user.ts` — exige `ADMIN`
- Rota API: `app/api/auth/[...all]/route.ts`

---

## Estilo de Commits

Use prefixos convencionais:
- `feat(bdc):` — nova funcionalidade
- `fix(bdc):` — correção de bug
- `refactor:` — refatoração sem mudança de comportamento
- `chore:` — tarefas de build/dependências

Exemplo: `feat(bdc): add customer registration dialog with 2-step form`

---

## Ambiente de Desenvolvimento

### Pré-requisitos
- Node.js 20+
- pnpm
- Docker (para PostgreSQL)

### Comandos
```bash
# Instalar dependências
pnpm install

# Iniciar DB
pnpm docker:up    # ou docker-compose up -d

# Rodar migrations
pnpm db:migrate

# Dev server
pnpm dev          # localhost:3000

# Build
pnpm build

# Lint
pnpm lint         # biome check

# Format
pnpm format       # biome format --write
```

### Variáveis de Ambiente
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — chave secreta do auth
- `BETTER_AUTH_URL` — URL base do app

---

## Notas para Agentes

1. **Sempre use shadcn/ui** para novos componentes de UI. Não crie do zero.
2. **Sempre valide formulários com Zod** + react-hook-form. Não use estado local descontrolado.
3. **Datas**: use `date-fns` para formatação e `dayjs` para cálculos/comparações.
4. **Tabela BDC**: antes de adicionar colunas, verifique se o mock data (`lib/bdc-data.ts`) tem o campo.
5. **Modo edição**: nunca adicione stepper. O formulário deve ser direto.
6. **Sidebar**: em modo edição, sempre visível. Em criação, aparece apenas no Step 2.
7. **Não commite** sem pedir confirmação do usuário (exceto se ele pedir explicitamente).
8. **Teste o build** (`pnpm build`) após alterações significativas.
9. **Formate com Biome** antes de commits.

---

## Roadmap / Tarefas Pendentes (conhecidas)

- [ ] Conectar formulário BDC ao backend (Prisma model + API routes)
- [ ] Adicionar tabela/modelo de Logística (motos em trânsito)
- [ ] Implementar busca real de chassi no banco
- [ ] Upload de documentos no formulário
- [ ] Filtros e paginação na tabela BDC
- [ ] Toast/notificação após salvar (em vez de console.log)
- [ ] Responsividade mobile da sidebar (drawer)
- [ ] Testes E2E com Playwright

---

*Última atualização: 2026-05-20*
