# Arquitetura após a refatoração

## Análise do código existente

O projeto usa Next.js 16.2.6, React 19 com React Compiler, Prisma 7,
Better Auth, daisyUI e Tailwind 4. A refatoração utiliza recursos disponíveis
nessa versão; não altera versões de dependências nem o schema do banco.

Antes da mudança:

- As páginas já consultavam Prisma através da DAL, sem HTTP interno.
- Cada Route Handler repetia autenticação, parsing, validação, tratamento de
  erros e invalidação de cache. A interface usava REST para todas as mutações.
- Filtros e contadores usavam `unstable_cache`; Cache Components estava desativado.
- BDC lia `searchParams` antes de seu `Suspense`, atrasando a exibição do cabeçalho.
- As tabelas de BDC e estoque também controlavam URL e transições.
- As cinco páginas principais repetiam estrutura, títulos e ações.
- O `AGENTS.md` contém descrições legadas: o código atual usa campos como
  `chassi`, `sellersName`, `forecastArrival` e `forecastArrivalStatus`, rotas
  `/inventory` e `/squad`, e páginas de 10 registros. Esses comportamentos foram
  preservados; não foram substituídos pelo schema ou pelas rotas antigos do documento.

## Fluxos e responsabilidades

```text
Interface → Server Action → adaptador seguro → serviço → DAL → Prisma
REST      → Route Handler → adaptador seguro → mesmo serviço → DAL → Prisma
Página    → fachada de consulta com guard → DAL → DTO → container → tabela
```

Actions ficam em `_actions` de BDC, estoque, equipe e suporte. Elas são funções
pequenas que especificam o método, o escopo de rate limit e o papel necessário.
`lib/server/action-mutation.ts` resolve a sessão a cada chamada, aplica permissões
e limites e devolve resultados serializáveis. IDs e dados recebidos continuam
sendo considerados não confiáveis e são validados nos serviços.

`lib/services` compartilha a orquestração e a validação Zod entre Actions e REST.
As transações, verificações de duplicata e regras de vínculo existentes continuam
na DAL. A autorização de respostas a tickets usa a identidade da sessão e o dono
registrado no banco. Nenhum `userId` recebido do cliente substitui essa identidade.

A DAL mantém a responsabilidade de persistência e usa `server-only`. As fachadas
em `app/data` verificam acesso antes de consultar os registros. Autenticação de
página não substitui a autorização de uma Action ou de um endpoint REST.

REST continua disponível, com os códigos HTTP e formatos de resposta existentes.
Better Auth, upload multipart de avatar e consulta interativa de chassi continuam
usando Route Handlers. Consultas de listagem permanecem em Server Components,
controladas por parâmetros de URL.

## Cache e renderização

`next.config.ts` habilita `cacheComponents`. O layout autenticado verifica sessão
e cookies abaixo de `Suspense`; o layout raiz também tem um fallback para as
rotas públicas dinâmicas. BDC e estoque mantêm fronteiras específicas com skeletons.
Dashboard e suporte fazem seus guards dentro dos componentes assíncronos protegidos
por essas fronteiras. O build verifica a renderização parcial dessas rotas.

Somente filtros e contadores das listagens usam cache compartilhado:

| Dados | Revalidação | Expiração | Invalidação |
| --- | --- | --- | --- |
| Opções de filtro BDC/estoque | 300 s | 3000 s | Tags de filtros |
| Contadores BDC/estoque | 60 s | 600 s | Tags de contadores |

As funções usam `use cache`, `cacheLife` e `cacheTag`. Sessões, detalhes de clientes,
listagens com CPF e tickets individuais continuam sendo consultados por requisição.
Não coloque `headers()` ou `cookies()` dentro de uma função de cache compartilhado.

Mutações via Action usam `updateTag` para expirar imediatamente os dados que a
próxima renderização lerá. REST usa `revalidateTag(tag, { expire: 0 })`. Ambos
revalidam caminhos afetados. Criação de cliente também revalida o acompanhamento
público, inclusive quando vincula uma motocicleta já existente.

## Padrões da interface

- **Composição**: `Page` fornece largura e espaçamento; `PageHeader` recebe título,
  descrição, contexto, ícone e ações. Não depende de um módulo de negócio.
- **Container e apresentação**: `BdcPageClient` e `InventoryPageClient` controlam
  navegação e transições; as tabelas recebem dados e callbacks. A busca em digitação
  fica no container de estoque e acompanha mudanças de URL.
- **Controles compartilhados**: `FilterViews` e `ListPagination` padronizam seleção,
  estados desabilitados e navegação acessível com daisyUI e HTML nativo.
- **Inversão de dependência na UI**: `ConfirmDeleteDialog` recebe uma função de
  exclusão; não conhece endpoints REST nem qual entidade está sendo excluída.
- **Formulários**: suporte e edição de usuário usam react-hook-form com os mesmos
  schemas Zod do servidor, além dos formulários existentes de BDC e estoque.
- **Recuperação de erro**: o segmento autenticado oferece uma fronteira `error.tsx`
  com mensagem segura e botão para tentar novamente.

## Validação e limites

A limpeza removeu 15 módulos sem consumidores, 25 declarações antigas da DAL
e helpers, e o layout pass-through de equipe junto desses módulos. Foram
removidas as dependências diretas `@better-fetch/fetch`, `@teispace/next-themes`,
`bcryptjs` e `@types/bcryptjs`. A revisão considerou imports, reexports,
imports dinâmicos, entradas do App Router, seed, configurações e testes.
Os Route Handlers continuam disponíveis como entradas de compatibilidade.

`pnpm test` executa testes dos adaptadores reais, compilados em memória com
dependências injetadas. Os testes não acessam o banco. Cobrem sessão, papel,
rate limit, orçamento de payload, resultados HTTP, falhas internas, dono de ticket
e estratégias de invalidação. `pnpm typecheck` e `pnpm build` verificam tipos,
fronteiras cliente/servidor e prerenderização.

O projeto foi aberto no navegador integrado com `pnpm dev`. A página pública
carregou. `node tests/http-smoke.mjs` verifica páginas públicas, redirecionamentos
para login e rejeição de mutações anônimas e de outra origem no servidor local.
Fluxos autenticados de criação, edição, importação e exclusão ainda
precisam de uma rodada E2E com uma conta e dados de teste; os testes atuais não
substituem essa validação.

O lint global possui diagnósticos preexistentes em controles compartilhados,
hooks, CSS e outras páginas. A validação de lint da refatoração se limita aos
arquivos modificados. A aplicação ainda não tem uma suíte Playwright.

## Pontos para uma próxima revisão

- Revisar seleções das consultas públicas, especialmente `client: true`, para
  restringir todos os DTOs aos campos necessários ao acompanhamento.
- Corrigir os diagnósticos globais de acessibilidade e dependências de hooks.
- Em múltiplas instâncias, avaliar um cache handler compartilhado: o armazenamento
  padrão de `use cache` não constitui um cache distribuído entre servidores.

Esses itens são independentes das mudanças de transporte e cache feitas aqui.
