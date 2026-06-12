# AGENTS.md — Auge Management System

> Este arquivo contém instruções e contexto específicos para agentes de IA que trabalham neste projeto. Leia antes de fazer qualquer alteração.

---

## Visão Geral

Sistema de gerenciamento de concessionária de motocicletas. Módulos atuais:

- **BDC** (Business Development Center) — cadastro e acompanhamento de clientes e status de emplacamento de veículos.
- **Estoque** — controle de motocicletas em estoque e em trânsito.
- **Configurações** — gerenciamento de usuários (apenas ADMIN).

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
| Excel | xlsx (SheetJS) — parse de planilhas |

---

## Estrutura de Diretórios

```
app/
  (app)/                    # Rotas autenticadas (protegidas por requireAuth)
    bdc/
      _components/
        bdc-page-client.tsx # Client Component com fetch paginado via URL params
      page.tsx              # Server Component shell (metadata) + <BDCPageClient />
      actions.ts            # Server Actions: getClients, getClientsPaginated, getBDCFilterOptions, searchChassis, deleteClient
      cliente/
        novo/
          page.tsx          # Cadastro de cliente (2 steps)
          actions.ts        # Server Action: createClient
        editar/
          page.tsx          # Edição de cliente (fetch server-side, form direto)
          actions.ts        # Server Action: updateClient
    estoque/
      _components/
        estoque-page-client.tsx # Client Component com fetch paginado via URL params
      page.tsx              # Server Component shell (metadata) + <EstoquePageClient />
      actions.ts            # Server Actions: getMotorcycles, getMotorcyclesPaginated, getEstoqueFilterOptions, deleteMotorcycle
      motocicleta/
        novo/
          page.tsx          # Cadastro de motocicleta
          actions.ts        # Server Action: createMotorcycle
        editar/
          page.tsx          # Edição de motocicleta
          actions.ts        # Server Action: updateMotorcycle
    configuracoes/
      page.tsx              # Gerenciar usuários
      actions.ts            # Server Action: createUser
  (auth)/                   # Rotas públicas (sem proteção)
    sign-in/
    sign-up/
  api/auth/[...all]/        # Better Auth API routes
  data/require-user.ts      # Guards: requireAuth (qualquer logado) + requireUser (ADMIN)

components/
  bdc/                      # Componentes de domínio BDC
    chassis-step.tsx        # Step 1: consulta chassi no banco
    customer-data-step.tsx  # Step 2: dados do cliente
    customer-form.tsx       # Wrapper com stepper (create) ou direto (edit)
    sidebar-resumo.tsx      # Sidebar colapsável com status da moto
    spreadsheet-upload-dialog.tsx # Dialog de importação de planilha
  estoque/                # Componentes de domínio Estoque
    motorcycle-table.tsx    # Tabela de motos (presentation-only, recebe props)
    motorcycle-form.tsx     # Form de cadastro de moto
    motorcycle-edit-form.tsx # Form de edição de moto (chassi editável)
  layout/                   # Navbar, Header
  shadcn-studio/table/      # Tabela customizada (BDC)
  ui/                       # shadcn/ui components (NEVER edit directly)

lib/
  data/                     # DAL — Data Access Layer
    client.ts               # CRUD Client + getClientsPaginated + getBDCFilterOptions
    motorcycle.ts           # CRUD Motorcycle + getMotorcyclesPaginated + getEstoqueFilterOptions
  bdc-data.ts               # Helpers: getStatusChegada(), mapRegistrationStatusLabel(), getSituacaoColor()
  cpf.ts                    # CPF validation: validateCPF(), formatCPF(), stripCPF()
  db.ts                     # Prisma client
  auth.ts                   # Better Auth server config
  auth-client.ts            # Better Auth client

validators/
  customer-schema.ts        # Zod schema do formulário BDC
  motorcycle-schema.ts      # Zod schema do formulário Estoque
  login-schema.ts
  create-user-schema.ts

prisma/
  schema.prisma             # Schema do banco (User, Session, Account, Verification, Client, Motorcycle, Setting)
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

## Arquitetura — Server Actions + DAL

O projeto segue a arquitetura recomendada pelo Next.js: **Server Actions** na camada de UI + **DAL** (Data Access Layer) isolada. **Não usa TanStack React Query** — toda troca de dados é via Server Actions + `router.refresh()` / `router.push()`.

```
Página (Server Component shell)
  ↓ renderiza
Client Component (app/**/_components/*-page-client.tsx)
  → lê searchParams (useSearchParams)
  → chama Server Action via useEffect
Server Action (app/**/actions.ts)
  → valida auth (requireAuth/requireUser)
  → valida input (Zod)
  ↓ chama
DAL (lib/data/*.ts)
  → executa queries Prisma
```

**Regra**: `lib/data/*.ts` nunca faz auth. As Server Actions fazem auth + validação + chamam o DAL.

---

## Proteção de Rotas

| Rota | Acesso | Guard |
|------|--------|-------|
| `/` | Público | — |
| `/sign-in`, `/sign-up` | Público | — |
| `/bdc`, `/bdc/**`, `/estoque`, `/estoque/**` | Login | `requireAuth` via `app/(app)/layout.tsx` |
| `/configuracoes` | ADMIN | `requireAuth` (layout) + `requireUser` (página) |

### Guards (`app/data/require-user.ts`)

- **`requireAuth()`** — cache, verifica sessão ativa (qualquer role). Se não logado → `redirect("/sign-in")`.
- **`requireUser()`** — chama `requireAuth()` internamente e depois exige `role === "ADMIN"`. Se não for admin → `redirect("/bdc")`.

---

## Schema Prisma

```prisma
enum UserRole { USER, ADMIN }
enum RegistrationStatus { NO_PLATE, PLATING, PLATED }

model User { ... }           // better-auth
model Session { ... }        // better-auth
model Account { ... }        // better-auth
model Verification { ... }   // better-auth

model Client {
  id               String       @id @default(uuid())
  cpf              String       @unique
  name             String
  sellerName       String
  city             String
  billingDate      DateTime?
  deliveryForecast DateTime?
  motorcycles      Motorcycle[]
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@index([sellerName])
  @@index([city])
  @@index([createdAt])
}

model Motorcycle {
  id                     String @id @default(uuid())
  chassis                String @unique
  model                  String
  forecastDate            DateTime?
  registrationStatus     RegistrationStatus @default(NO_PLATE)
  registrationStatusDate DateTime?
  clientId               String?
  client                 Client? @relation(fields: [clientId], references: [id], onDelete: SetNull)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([createdAt])
  @@index([updatedAt])
}

model Setting { ... }      // chave-valor para configs do sistema
```

**Regras importantes:**
- Um `Client` pode ter 0 ou N `motorcycles`.
- Uma `Motorcycle` pode existir sem `clientId` (estoque).
- `forecastDate` opcional — moto cadastrada sem data = "Em Trânsito".

---

## Regras de Negócio — BDC

### CPF como Identificador Único
- **CPF** é obrigatório no cadastro de cliente (`cpf` no model `Client`, unique)
- Possui **validação completa** de formato e dígitos verificadores (`lib/cpf.ts:validateCPF()`)
- O input do CPF no formulário tem **formatação automática** (`XXX.XXX.XXX-XX`)
- O CPF aparece como coluna na tabela BDC

### Cadastro de Cliente (`/bdc/cliente/novo`)
**Fluxo em 2 steps:**
1. **Step 1 — Consulta de Chassi**: Digita chassi, clica "Consultar". Sistema busca no banco (`lib/data/motorcycle.ts`).
   - **Encontrada**: preenche Modelo, marca `motoChegou` se tiver `forecastDate`, avança Step 2.
   - **Não encontrada**: avança Step 2 com chassi preenchido, resto manual.
2. **Step 2 — Dados do Cliente**: Campos disponíveis:
   - Cliente, Vendedor, Cidade, Modelo, Chassi (readonly)
   - **Data de Faturamento** (DatePicker shadcn)
   - **Previsão de Chegada**: DatePicker (opcional)
   - **Status de Emplacamento**: Select (Pendente / Em Emplacamento / Emplacado)
     - Se diferente de "Pendente": aparece DatePicker para data do emplacamento
   - Ações: "Voltar" (limpa tudo, volta Step 1) ou "Salvar" (cria Client + Motorcycle no banco)

### Edição de Cliente (`/bdc/cliente/editar?id={id}`)
- **Sem stepper**. Formulário do Step 2 é exibido direto com dados preenchidos do banco.
- Sidebar de resumo sempre visível.
- Apenas botão "Salvar" (sem "Voltar").
- Breadcrumb: Home > BDC > Editar Cliente

### Tabela BDC (`/bdc`)
Colunas: Cliente | CPF | Vendedor | Cidade | Modelo | Chassi | Data Faturamento | Previsão Chegada | Situação | Ações

- **Paginação server-side**: 20 clientes/página. Filtros e página via URL params (`?page=2&sellerName=...`).
- **Client Component**: `BDCPageClient` lê `useSearchParams`, chama `getClientsPaginatedAction` + `getBDCFilterOptionsAction`, renderiza `<BDCTable>`.
- **BDCTable** é puramente apresentação (recebe rows flat-mapped, filterOptions e callbacks como props).
- **Navegação suave**: `useTransition` com `opacity-60` durante transições entre páginas/filtros.
- **Busca por CPF**: input no canto direito envia `?q=...` para o backend.

**Flat-mapping**: cada cliente com N motos vira N linhas. Cliente sem moto vira 1 linha com "—". O flat-map é feito no client component (`bdc-page-client.tsx`), não na tabela.

### Importação de Planilha (`/bdc` — botão "Importar Planilha")
- **Componente**: `components/bdc/spreadsheet-upload-dialog.tsx`
- **Server Action**: `importSpreadsheetAction(formData: FormData)` em `app/(app)/bdc/actions.ts`
- **Formatos aceitos**: `.xlsx`, `.xls`, `.ods`, `.csv`
- **Colunas da planilha**:
  | Coluna | Mapeamento |
  |--------|------------|
  | `CLIENTE` | `Client.name` |
  | `DATA DO FATURAMENTO` | `Client.billingDate` |
  | `MODELO` | `Motorcycle.model` |
  | `CHASSI` | `Motorcycle.chassis` |
  | `VENDEDOR` | `Client.sellerName` |
  | `CIDADE` | `Client.city` |
  | `MOTO CHEGOU NA MATRIZ (SIM / NÃO)` | `Motorcycle.forecastDate` ("SIM" = hoje, "NÃO" = null) |
  | `STATUS ATUALIZADO` | Ignorado (não altera status) |

- **Regras de importação**:
  - **Chassi já existe**: atualiza `forecastDate` apenas se campo = "SIM" e for null
  - **Chassi não existe**: cria nova moto com `registrationStatus = NO_PLATE`
  - **Cliente já existe** (nome + vendedor): vincula moto ao cliente existente
  - **Cliente não existe**: cria cliente + moto vinculada
  - **Campos obrigatórios**: chassi, cliente, vendedor (linhas sem esses campos são puladas)
  - **Permissão**: qualquer usuário logado pode importar
  - **Retorno**: resumo com `{success, created, updated, skipped}`

- **DAL functions**:
  - `getClientByNameAndSeller(name, sellerName)` — busca cliente por nome + vendedor (case-insensitive)
  - `linkMotorcycleToClient(chassis, clientId)` — vincula moto existente a cliente

---

## Regras de Negócio — Estoque

### Listagem (`/estoque`)
Tabela: Modelo | Chassi | Previsão de Chegada | Status | Ações

- **Paginação server-side**: 50 motos/página. Filtros via URL params (`?page=2&model=...&status=...&chassis=...`).
- **Client Component**: `EstoquePageClient` lê `useSearchParams`, chama `getMotorcyclesPaginatedAction` + `getEstoqueFilterOptionsAction`, renderiza `<MotorcycleTable>`.
- **MotorcycleTable** é puramente apresentação (recebe dados e callbacks como props).
- **Status** (calculado server-side no DAL via `getMotorcyclesPaginated`):
  - `forecastDate = null` ou `> hoje` → badge âmbar "Em Trânsito"
  - `forecastDate = hoje` → badge verde "Chegou"
  - `forecastDate < hoje` → badge vermelho "Atrasada"
- Ações: editar (`/estoque/motocicleta/editar?id={id}`), excluir.

### Cadastro (`/estoque/motocicleta/novo`)
- Form simples (sem stepper): Chassi, Modelo, Previsão de Chegada (opcional).
- Previsão de chegada vazia = moto cadastrada "Em Trânsito".
- Salva no banco via DAL + redirect `/estoque`.

### Edição (`/estoque/motocicleta/editar?id={id}`)
- Form: Chassi (editável!), Modelo, Previsão de Chegada.
- **Chassi editável**: verifica duplicata no banco antes de salvar (não pode repetir em outra moto).
- Atualiza via DAL + redirect `/estoque`.

---

## SidebarResumo — Status do Chassi

Regra do badge no sidebar (cadastro/edição de cliente):

| Condição | Badge | Texto |
|----------|-------|-------|
| Moto não encontrada no banco | 🔴 vermelho | **Não Encontrado** |
| Moto encontrada + `forecastDate = null` | 🟡 âmbar | **Sem Previsão** |
| Moto encontrada + `forecastDate > hoje` | 🟢 verde | **No Estoque** |
| Moto encontrada + `forecastDate <= hoje` | 🔵 azul | **Chegou** |

---

## Schema dos Formulários (Zod)

### BDC — `validators/customer-schema.ts`
```typescript
chassi: string (min 1)
cpf: string (validado: 11 dígitos + dígitos verificadores)
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

### Estoque — `validators/motorcycle-schema.ts`
```typescript
chassis: string (min 1)
model: string (min 1)
arrivalDate: Date (optional)
```

---

## Componentes Customizados Principais

### `CustomerForm`
- Props: `initialData?: Partial<CustomerFormData>`, `mode?: "create" | "edit"`, `action: (data) => Promise<unknown>`
- Modo create: stepper 1→2, Step 1 = ChassisStep (busca no banco), Step 2 = CustomerDataStep
- Modo edit: oculta stepper, mostra Step 2 direto com `initialData` preenchido
- Gerencia estado do sidebar via `form.watch()`

### `ChassisStep`
- Busca chassi no banco via `searchChassisAction()` (DAL `getMotorcycleByChassis`)
- Preenche modelo e data de chegada automaticamente se encontrada
- Passa `forecastDate` para o sidebar via `onSearchResult`

### `SidebarResumo`
- Sidebar colapsável (desktop) / acima do form (mobile)
- Mostra status do chassi com base em `forecastDate` (ver regra acima)
- Dados reativos via `form.watch()`

### `BDCTable`
- **Presentation-only** (não faz fetch, não gerencia estado interno)
- Props: `rows`, `totalRows`, `page`, `totalPages`, `filterOptions`, `filters`, `query`, `onFilterChange`, `onPageChange`, `onSearch`, `onClearSearch`
- Recebe rows já flat-mapped do `BDCPageClient`

### `MotorcycleTable`
- **Presentation-only** (não faz fetch, não gerencia estado interno)
- Props: `motorcycles`, `totalRows`, `page`, `totalPages`, `filterOptions`, `filters`, `chassisSearch`, `onFilterChange`, `onPageChange`, `onChassisSearchChange`
- Status calculado com `dayjs` (função local no componente)

### `MotorcycleForm` / `MotorcycleEditForm`
- Formulários de cadastro/edição de motocicleta
- Campos: Chassi, Modelo, Previsão de Chegada (DatePicker shadcn)
- Edit form permite alterar o chassi (com validação de duplicata)

---

## Autenticação

- Usa **better-auth** com Prisma adapter
- Login: email + senha
- Campo extra no User: `role` (enum USER / ADMIN)
- Guards server-side:
  - `requireAuth()` — exige login (qualquer role)
  - `requireUser()` — exige ADMIN
- Rota API: `app/api/auth/[...all]/route.ts`

---

## Títulos de Páginas (Metadata)

Todas as páginas exportam `metadata` com título dinâmico:
- Template no layout raiz: `%s | Acompanhamento Chegada de Moto`
- Páginas definem apenas o `%s` (ex: `"BDC"`, `"Novo Cliente"`, `"Estoque"`)

| Página | Título na aba |
|--------|--------------|
| `/` | `Acompanhamento Chegada de Moto` (default) |
| `/bdc` | `BDC \| Acompanhamento Chegada de Moto` |
| `/bdc/cliente/novo` | `Novo Cliente \| ...` |
| `/bdc/cliente/editar` | `Editar Cliente \| ...` |
| `/estoque` | `Estoque \| ...` |
| `/estoque/motocicleta/novo` | `Nova Motocicleta \| ...` |
| `/estoque/motocicleta/editar` | `Editar Motocicleta \| ...` |
| `/configuracoes` | `Configurações \| ...` |
| `/sign-in` | `Entrar \| ...` |

---

## Estilo de Commits

Use prefixos convencionais:
- `feat(bdc):` — nova funcionalidade no BDC
- `feat(estoque):` — nova funcionalidade no Estoque
- `fix(bdc):` — correção de bug
- `refactor:` — refatoração sem mudança de comportamento
- `chore:` — tarefas de build/dependências

Exemplo: `feat(bdc): connect customer form to backend via server actions`

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
docker-compose up -d

# Rodar migrations (use WSL bash se pnpm falhar com EPERM)
pnpm exec prisma migrate dev --name <nome>
# Alternativa via WSL:
# wsl bash -c "cd /home/adone/workspace/auge-management && npx prisma migrate dev --name <nome>"

# Gerar Prisma client
pnpm exec prisma generate

# Dev server
pnpm dev          # localhost:3000

# Build (CI = skipa prisma generate + migrate deploy)
pnpm build
pnpm build:ci     # alternativa que contorna EPERM no Windows/WSL

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
4. **DAL**: nunca coloque lógica de auth em `lib/data/*.ts`. Auth fica nas Server Actions.
5. **Modo edição**: nunca adicione stepper. O formulário deve ser direto.
6. **Sidebar**: em modo edição, sempre visível. Em criação, aparece apenas no Step 2.
7. **Não commite** sem pedir confirmação do usuário (exceto se ele pedir explicitamente).
8. **Teste o build** (`pnpm build`) após alterações significativas.
9. **Formate com Biome** antes de commits.
10. **Chassi editável**: no Estoque, o chassi pode ser alterado na edição. Sempre verificar duplicata no banco.
11. **Importação de planilha**: usar `xlsx` (SheetJS) para parse no client-side. Colunas obrigatórias: CLIENTE, CHASSI, VENDEDOR. Campo "MOTO CHEGOU" = "SIM" → `forecastDate = hoje`.
12. **TanStack React Query não é usado** — nunca importe `@tanstack/react-query`. Toda troca de dados é via Server Actions + `router.refresh()` / `router.push()`.
13. **Páginas de listagem (BDC/Estoque)**: Server Component shell (para metadata) renderiza Client Component em `_components/`. O Client Component lê `useSearchParams`, faz fetch via Server Action em `useEffect`, e gerencia navegação com `useTransition` + `router.push()` com URL params. Filtros e página são controlados por URL, não por estado local.
14. **Tabelas (BDCTable/MotorcycleTable)**: puramente apresentação. Props: dados, opções de filtro, filtros ativos, totalRows, page, totalPages, e callbacks (`onFilterChange`, `onPageChange`, etc.). Sem fetch, sem `useMemo` para filtro, sem estado de paginação.
15. **Client indexes**: `Client` tem `@@index([sellerName])`, `@@index([city])`, `@@index([createdAt])` para performance dos filtros server-side.
16. **EM CIMA DO ARQUIVO ATUAL 2025**: o schema Prisma tem `deliveryForecast` em `Client` e `forecastDate` em `Motorcycle`. Ambos são usados. `forecastDate` é a "previsão de chegada" da moto. `deliveryForecast` no Client é um campo legado não utilizado pelo frontend.

---

## Roadmap / Tarefas Pendentes (conhecidas)

- [x] Conectar formulário BDC ao backend (Prisma model + Server Actions)
- [x] Adicionar tabela/modelo de Estoque
- [x] Implementar busca real de chassi no banco
- [x] Importação de planilha Excel no BDC
- [x] CPF como identificador único do cliente (com validação de dígitos)
- [x] Substituir TanStack React Query por Server Components + router.refresh()
- [x] Server-side pagination com URL params (BDC 20/página, Estoque 50/página)
- [x] Filtros server-side com índices no banco
- [ ] Upload de documentos no formulário
- [ ] Toast/notificação após salvar (em vez de redirect silencioso)
- [ ] Responsividade mobile da sidebar (drawer)
- [ ] Testes E2E com Playwright

---

*Última atualização: 2026-06-12 — implementado server-side pagination com URL params (useSearchParams + useTransition), BDCTable/MotorcycleTable viram presentation-only, removido TanStack Query e hooks de paginação client-side, adicionados índices no Client.*
