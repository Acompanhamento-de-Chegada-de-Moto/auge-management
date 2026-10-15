# Build e deploy

O `vercel.json` define o Build Command da Vercel como `pnpm build`, inclusive
para Preview. Em outras hospedagens, configure esse mesmo comando de build.

O fluxo executa, em ordem:

1. `pnpm db:migrate:deploy`: aplica migrations versionadas pendentes.
2. `pnpm db:generate`: gera o Prisma Client do schema atual.
3. `next build`: compila a aplicação.

Uma falha interrompe a sequência e retorna erro para a hospedagem. A aplicação
nova só deve ser liberada se o build inteiro terminar com sucesso. Migrations
já aplicadas não são revertidas automaticamente se a compilação posterior falhar.

## Variáveis e ambientes

- `DATABASE_URL`: conexão usada pela aplicação.
- `DIRECT_URL`: opcional; quando definida, é usada pelo Prisma CLI nas migrations.
- `DATABASE_SSL_CA`: certificado CA em formato PEM para bancos cuja cadeia não é
  reconhecida pelo Node.js. No Supabase, baixe o **Server root certificate** em
  Database Settings e configure o conteúdo completo na Vercel, no ambiente
  correspondente. Aceita quebras de linha reais ou `\n`. Faça um novo deploy.
  A aplicação mantém a validação TLS ativa; `sslmode` na URL não substitui essa
  configuração. Esta variável configura o runtime, não o Prisma CLI.
- As demais variáveis de autenticação e serviços continuam necessárias.

Production e Preview precisam apontar para bancos independentes. Essa separação
vale também para `DIRECT_URL`. `pnpm build:preview` usa o mesmo fluxo com
migrations; não executa `db push`.

Antes do primeiro deploy automatizado, confira `pnpm db:migrate:status` com as
variáveis do ambiente de destino. Se o banco já existe sem histórico de migrations
compatível, alinhe o baseline antes de habilitar esse fluxo. O build não tenta
resolver divergências, marcar migrations como aplicadas ou resetar dados.

## Desenvolvimento e validação

- `pnpm install`: gera o cliente pelo `postinstall`.
- `pnpm dev`: gera o cliente e inicia o Next em desenvolvimento.
- `pnpm typecheck`: gera o cliente e verifica TypeScript.
- `pnpm build:ci`: gera o cliente e compila, sem aplicar migrations.
- `pnpm db:generate`: regenera o cliente manualmente quando necessário.

`generated/prisma/` é um artefato local ignorado pelo Git. Versione
`prisma/schema.prisma` e `prisma/migrations/`, sem editar os arquivos gerados.
O caminho dos imports continua `@/generated/prisma/client`.

O CLI Prisma e as dependências de build precisam estar instalados no ambiente
que executa o build. `pnpm start` só inicia a aplicação já compilada.

Referências:
- [Migrate em desenvolvimento e produção (Prisma 7)](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production)
- [Geração do Prisma Client (Prisma 7)](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client)
