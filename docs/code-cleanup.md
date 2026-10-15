# Revisão de duplicação e estados de navegação

A revisão cobriu rotas e componentes de `app/`, componentes compartilhados e
serviços/DAL de `lib/`. Código gerado do Prisma não foi refatorado manualmente.

## Consolidações

- Exclusão: clientes, motos, usuários e operadores usam `ConfirmDeleteDialog`.
  Ele centraliza bloqueio durante a requisição, confirmação, mensagens e o estado
  “Registro não encontrado” com atualização da lista. As Actions mantêm seus guards.
- Cópia: BDC e estoque usam `components/ui/copy-value-button.tsx`, com feedback
  de sucesso e tratamento de falha da área de transferência.
- Cache: mutações de BDC, estoque e check-in usam
  `lib/services/revalidate-motorcycle-pages.ts`. Tags seguem o transporte da
  requisição; BDC, estoque, dashboard e acompanhamento são invalidados juntos.
- Navegação: `RoutePending` usa skeleton, sem spinner ou texto de carregamento
  visível. O estado de carregamento permanece acessível por `aria-busy`.
- Páginas não encontradas: uma composição compartilhada atende o 404 global,
  clientes e estoque, com retorno para a lista adequada.

## Tratamento de recursos removidos

Exclusões de cliente, moto e usuário retornam contagem via `deleteMany`, evitando
exceção Prisma para registros já removidos. Contagem zero retorna 404 e atualiza
a listagem. Server Actions preservam `statusCode` para a interface tratar esse
caso. IDs inválidos e vínculos inexistentes na edição também usam `notFound()`.

## Mantido separado

Formulários de criação e edição continuam com fluxos próprios, assim como
validação/autorização por operação. Parsers de planilha com formatos e políticas
distintos não foram unificados apenas por semelhança visual. Indicadores em
botões de ações permanecem para mostrar que uma mutação está em andamento.
