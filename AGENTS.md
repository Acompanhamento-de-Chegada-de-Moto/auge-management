# AGENTS.md — Auge Management System

> Este arquivo contém instruções e contexto específicos para agentes de IA que trabalham neste projeto. Leia antes de fazer qualquer alteração.

---

## Visão Geral

Sistema de gerenciamento de concessionária de motocicletas. Módulos atuais:

- **BDC** (Business Development Center) — cadastro e acompanhamento de clientes e status de emplacamento de veículos.
- **Logística** — controle de motocicletas em estoque e em trânsito.
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
      page.tsx              # Dashboard com tabela BDC (dados reais)
      actions.ts            # Server Actions: getClients, deleteClient, searchChassis
      cliente/
        novo/
          page.tsx          # Cadastro de cliente (2 steps)
          actions.ts        # Server Action: createClient
        editar/
          page.tsx          # Edição de cliente (form direto, sem stepper)
          actions.ts        # Server Action: updateClient
          _components/
            editar-cliente-content.tsx
    logistica/
      page.tsx              # Controle de motocicletas (tabela real)
      actions.ts            # Server Actions: getMotorcycles, deleteMotorcycle
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
  logistica/                # Componentes de domínio Logística
    motorcycle-table.tsx    # Tabela de motos
    motorcycle-form.tsx     # Form de cadastro de moto
    motorcycle-edit-form.tsx # Form de edição de moto (chassi editável)
  layout/                   # Navbar, Header
  shadcn-studio/table/      # Tabela customizada
  ui/                       # shadcn/ui components (NEVER edit directly)

lib/
  data/                     # DAL — Data Access Layer
    client.ts               # CRUD Client (Prisma)
    motorcycle.ts          # CRUD Motorcycle (Prisma)
  bdc-data.ts               # Helpers: getStatusChegada(), mapRegistrationStatusLabel(), getSituacaoColor()
  db.ts                     # Prisma client
  auth.ts                   # Better Auth server config
  auth-client.ts            # Better Auth client

validators/
  customer-schema.ts        # Zod schema do formulário BDC
  motorcycle-schema.ts      # Zod schema do formulário Logística
  login-schema.ts
  create-user-schema.ts

prisma/
  schema.prisma             # Schema do banco (User, Session, Account, Verification, Client, Motorcycle)

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

O projeto segue a arquitetura recomendada pelo Next.js: **Server Actions** na camada de UI + **DAL** (Data Access Layer) isolada.

```
Página (Server Component)
  ↓ chama
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
| `/bdc`, `/bdc/**`, `/logistica`, `/logistica/**` | Login | `requireAuth` via `app/(app)/layout.tsx` |
| `/configuracoes` | ADMIN | `requireAuth` (layout) + `requireUser` (página) |

### Guards (`app/data/require-user.ts`)

- **`requireAuth()`** — cache, verifica sessão ativa (qualquer role). Se não logado → `redirect("/sign-in")`.
- **`requireUser()`** — chama `requireAuth()` internamente e depois exige `role === "ADMIN"`. Se não for admin → `redirect("/bdc")`.

---

## Schema Prisma

```prisma
enum UserRole { USER, ADMIN }
enum RegistrationStatus { PENDING, IN_PROGRESS, COMPLETED }

model User { ... }           // better-auth
model Session { ... }        // better-auth
model Account { ... }        // better-auth
model Verification { ... }   // better-auth

model Client {
  id          String    @id @default(uuid())
  name        String
  sellerName  String
  city        String
  billingDate DateTime?
  motorcycles Motorcycle[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Motorcycle {
  id                     String @id @default(uuid())
  chassis                String @unique
  model                  String
  arrivalDate            DateTime?
  registrationStatus     RegistrationStatus @default(PENDING)
  registrationStatusDate DateTime?
  clientId               String?
  client                 Client? @relation(fields: [clientId], references: [id], onDelete: SetNull)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
```

**Regras importantes:**
- Um `Client` pode ter 0 ou N `motorcycles`.
- Uma `Motorcycle` pode existir sem `clientId` (estoque/logística).
- `arrivalDate` é opcional — moto cadastrada sem data = "Em Trânsito".

---

## Regras de Negócio — BDC

### Cadastro de Cliente (`/bdc/cliente/novo`)
**Fluxo em 2 steps:**
1. **Step 1 — Consulta de Chassi**: Digita chassi, clica "Consultar". Sistema busca no banco (`lib/data/motorcycle.ts`).
   - **Encontrada**: preenche Modelo, marca `motoChegou` se tiver `arrivalDate`, avança Step 2.
   - **Não encontrada**: avança Step 2 com chassi preenchido, resto manual.
2. **Step 2 — Dados do Cliente**: Campos disponíveis:
   - Cliente, Vendedor, Cidade, Modelo, Chassi (readonly)
   - **Data de Faturamento** (DatePicker shadcn)
   - **Chegada na Loja**: Switch "Moto chegou?" + DatePicker (desabilitado se switch = OFF)
   - **Status de Emplacamento**: Select (Pendente / Em Emplacamento / Emplacado)
     - Se diferente de "Pendente": aparece DatePicker para data do emplacamento
   - Ações: "Voltar" (limpa tudo, volta Step 1) ou "Salvar" (cria Client + Motorcycle no banco)

### Edição de Cliente (`/bdc/cliente/editar?id={id}`)
- **Sem stepper**. Formulário do Step 2 é exibido direto com dados preenchidos do banco.
- Sidebar de resumo sempre visível.
- Apenas botão "Salvar" (sem "Voltar").
- Breadcrumb: Home > BDC > Editar Cliente

### Tabela BDC (`/bdc`)
Colunas: Cliente | Vendedor | Cidade | Modelo | Chassi | Data Faturamento | Status Chegada | Situação | Ações

- **Uma linha por moto** (cliente pode ter várias motos).
- **Data Faturamento**: vinda do `Client.billingDate`.
- **Status Chegada**: calculado via `dayjs` comparando `motorcycle.arrivalDate` com hoje:
  - `<= hoje` → badge verde "Chegou"
  - `> hoje` ou `null` → badge vermelho "Não Chegou"
- **Situação**: `motorcycle.registrationStatus` mapeado para labels:
  - `PENDING` → "Pendente" (amarelo)
  - `IN_PROGRESS` → "Em Emplacamento" (azul)
  - `COMPLETED` → "Emplacado" (verde)
- Botão editar redireciona para `/bdc/cliente/editar?id={clientId}`

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
  | `MOTO CHEGOU NA MATRIZ (SIM / NÃO)` | `Motorcycle.arrivalDate` ("SIM" = hoje, "NÃO" = null) |
  | `STATUS ATUALIZADO` | Ignorado (não altera status) |

- **Regras de importação**:
  - **Chassi já existe**: atualiza `arrivalDate` apenas se campo = "SIM" e for null
  - **Chassi não existe**: cria nova moto com `registrationStatus = PENDING`
  - **Cliente já existe** (nome + vendedor): vincula moto ao cliente existente
  - **Cliente não existe**: cria cliente + moto vinculada
  - **Campos obrigatórios**: chassi, cliente, vendedor (linhas sem esses campos são puladas)
  - **Permissão**: qualquer usuário logado pode importar
  - **Retorno**: resumo com `{success, created, updated, skipped}`

- **DAL functions**:
  - `getClientByNameAndSeller(name, sellerName)` — busca cliente por nome + vendedor (case-insensitive)
  - `linkMotorcycleToClient(chassis, clientId)` — vincula moto existente a cliente

---

## Regras de Negócio — Logística

### Listagem (`/logistica`)
Tabela: Modelo | Chassi | Data Chegada | Status | Ações

- **Data Chegada**: exibe `—` se `arrivalDate` é `null` (moto em trânsito, sem previsão).
- **Status**:
  - `arrivalDate <= hoje` → badge verde "Chegou"
  - `arrivalDate > hoje` → badge âmbar "Em Trânsito"
  - `arrivalDate = null` → badge âmbar "Em Trânsito"
- Ações: editar (`/logistica/motocicleta/editar?id={id}`), excluir.

### Cadastro (`/logistica/motocicleta/novo`)
- Form simples (sem stepper): Chassi, Modelo, Data de Chegada (opcional).
- Data de chegada vazia = moto cadastrada "Em Trânsito".
- Salva no banco via DAL + redirect `/logistica`.

### Edição (`/logistica/motocicleta/editar?id={id}`)
- Form: Chassi (editável!), Modelo, Data de Chegada.
- **Chassi editável**: verifica duplicata no banco antes de salvar (não pode repetir em outra moto).
- Atualiza via DAL + redirect `/logistica`.

---

## SidebarResumo — Status do Chassi

Regra do badge no sidebar (cadastro/edição de cliente):

| Condição | Badge | Texto |
|----------|-------|-------|
| Moto não encontrada no banco | 🔴 vermelho | **Não Encontrado** |
| Moto encontrada + `arrivalDate = null` | 🟡 âmbar | **Sem Previsão** |
| Moto encontrada + `arrivalDate > hoje` | 🟢 verde | **Na Logística** |
| Moto encontrada + `arrivalDate <= hoje` | 🔵 azul | **Chegou** |

---

## Schema dos Formulários (Zod)

### BDC — `validators/customer-schema.ts`
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

### Logística — `validators/motorcycle-schema.ts`
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
- Passa `arrivalDate` para o sidebar via `onSearchResult`

### `SidebarResumo`
- Sidebar colapsável (desktop) / acima do form (mobile)
- Mostra status do chassi com base em `arrivalDate` (ver regra acima)
- Dados reativos via `form.watch()`

### `MotorcycleTable`
- Tabela de motos do módulo Logística
- Dados vindos do banco via Server Action
- Status de chegada calculado com `dayjs`

### `MotorcycleForm` / `MotorcycleEditForm`
- Formulários de cadastro/edição de motocicleta
- Campos: Chassi, Modelo, Data de Chegada (DatePicker shadcn)
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
- Páginas definem apenas o `%s` (ex: `"BDC"`, `"Novo Cliente"`, `"Logística"`)

| Página | Título na aba |
|--------|--------------|
| `/` | `Acompanhamento Chegada de Moto` (default) |
| `/bdc` | `BDC \| Acompanhamento Chegada de Moto` |
| `/bdc/cliente/novo` | `Novo Cliente \| ...` |
| `/bdc/cliente/editar` | `Editar Cliente \| ...` |
| `/logistica` | `Logística \| ...` |
| `/logistica/motocicleta/novo` | `Nova Motocicleta \| ...` |
| `/logistica/motocicleta/editar` | `Editar Motocicleta \| ...` |
| `/configuracoes` | `Configurações \| ...` |
| `/sign-in` | `Entrar \| ...` |

---

## Estilo de Commits

Use prefixos convencionais:
- `feat(bdc):` — nova funcionalidade no BDC
- `feat(logistica):` — nova funcionalidade na Logística
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

# Rodar migrations
pnpm exec prisma migrate dev --name <nome>

# Gerar Prisma client
pnpm exec prisma generate

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
4. **DAL**: nunca coloque lógica de auth em `lib/data/*.ts`. Auth fica nas Server Actions.
5. **Modo edição**: nunca adicione stepper. O formulário deve ser direto.
6. **Sidebar**: em modo edição, sempre visível. Em criação, aparece apenas no Step 2.
7. **Não commite** sem pedir confirmação do usuário (exceto se ele pedir explicitamente).
8. **Teste o build** (`pnpm build`) após alterações significativas.
9. **Formate com Biome** antes de commits.
10. **Chassi editável**: na Logística, o chassi pode ser alterado na edição. Sempre verificar duplicata no banco.
11. **Importação de planilha**: usar `xlsx` (SheetJS) para parse no client-side. Colunas obrigatórias: CLIENTE, CHASSI, VENDEDOR. Campo "MOTO CHEGOU" = "SIM" → `arrivalDate = hoje`.

---

## Roadmap / Tarefas Pendentes (conhecidas)

- [x] Conectar formulário BDC ao backend (Prisma model + Server Actions)
- [x] Adicionar tabela/modelo de Logística (motos em trânsito)
- [x] Implementar busca real de chassi no banco
- [x] Importação de planilha Excel no BDC
- [ ] Upload de documentos no formulário
- [ ] Filtros e paginação na tabela BDC
- [ ] Filtros e paginação na tabela Logística
- [ ] Toast/notificação após salvar (em vez de redirect silencioso)
- [ ] Responsividade mobile da sidebar (drawer)
- [ ] Testes E2E com Playwright

---

*Última atualização: 2026-05-21 — adicionada importação de planilha Excel no BDC.*
