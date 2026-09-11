# Auge Management System

Sistema de gerenciamento para concessionária de motocicletas. Controle de clientes e emplacamento de veículos (**BDC**), estoque de motocicletas, gestão de usuários, tickets de suporte e uma página pública de acompanhamento de chegada de motos.

## Módulos

| Módulo | Rota | Descrição |
|--------|------|-----------|
| **BDC** | `/bdc` | Cadastro e acompanhamento de clientes, status de emplacamento, importação de planilha Excel, consulta de chassi no banco |
| **Estoque** | `/estoque` | Controle de motocicletas em estoque e em trânsito (previsão de chegada, atrasos) |
| **Configurações** | `/configuracoes` | Gestão de usuários (acesso ADMIN), aparência e contato |
| **Suporte** | `/support` | Tickets de atendimento e mensagens |
| **Acompanhamento (público)** | `/` | Página pública para o cliente consultar a chegada da moto pelo CPF ou chassi |

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (radix-nova) |
| Formulários | react-hook-form + Zod |
| Autenticação | better-auth + Prisma adapter |
| Banco de dados | PostgreSQL (local via Docker) |
| ORM | Prisma 7 |
| Datas | date-fns + dayjs |
| Excel | xlsx (SheetJS) |
| Lint/Format | Biome |
| Package Manager | pnpm |

## Pré-requisitos

- Node.js 20+
- pnpm
- Docker (para rodar o PostgreSQL local)

## Como rodar

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Subir o banco de dados (PostgreSQL via Docker)

```bash
docker-compose up -d
```

O container expõe a porta `5432` com as seguintes credenciais padrão:

- Usuário: `postgres`
- Senha: `docker`
- Banco: `auge-postgres`

### 3. Configurar o ambiente

Copie as variáveis necessárias para um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:docker@localhost:5432/auge-postgres"

# Autenticação (better-auth)
BETTER_AUTH_SECRET="gerar-secret-aleatorio"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Primeiro ADMIN (criado pelo seed)
ADMIN_NAME="Administrador"
ADMIN_EMAIL="admin@exemplo.com"
ADMIN_PASSWORD="senha-forte-do-admin"

# Cloudinary (upload de avatar — opcional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

> **Dica:** gere o `BETTER_AUTH_SECRET` com `openssl rand -base64 32`.

### 4. Aplicar as migrations do banco

```bash
pnpm exec prisma migrate dev
```

### 5. Criar o primeiro usuário ADMIN

O cadastro público está **bloqueado** (`disableSignUp`). O primeiro admin é criado pelo seed (idempotente — reexecutar não duplica):

```bash
pnpm db:seed
```

Depois disso, novos usuários são criados pelo ADMIN em `/configuracoes`.

### 6. Rodar em desenvolvimento

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts úteis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Dev server (`next dev`) |
| `pnpm build` | `prisma generate` + `next build` |
| `pnpm build:ci` | Alternativa no Windows/WSL que contorna erro EPERM |
| `pnpm start` | Server de produção (`next start`) |
| `pnpm lint` | Verificação com Biome (`biome check`) |
| `pnpm typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `pnpm format` | Formatação com Biome (`biome format --write`) |
| `pnpm db:seed` | Seed do banco (instala o primeiro ADMIN) |

O `pnpm install` já roda `prisma generate` automaticamente (`postinstall`).

## Notas para Windows/WSL

No Windows, alguns comandos do Prisma podem falhar com erro de permissão (`EPERM`). Em caso de erro, use o WSL ou o script alternativo:

```bash
# Exemplo com WSL bash
wsl bash -c "cd /caminho/para/auge-management && npx prisma migrate dev --name <nome>"
```

## Estrutura do projeto

Detalhes da arquitetura, convenções de código e regras de negócio estão em [`AGENTS.md`](AGENTS.md).