# Dados de homologação

Execute `pnpm db:seed:workflows` para criar 35 clientes, 72 motos e 3 operadores fictícios. Reexecutar preserva os registros existentes, inclusive chegadas confirmadas, PINs rotacionados e operadores revogados. As previsões novas usam a data atual de São Paulo; os registros existentes mantêm suas datas originais.

Os registros têm nomes `[TESTE]`, chassis `TESTAUGE...` e IDs reservados. Colisões com outros registros interrompem a transação. O seed não cria usuários de acesso ao sistema nem executa o cron global.

O diretório local `test-artifacts/workflows/`, ignorado pelo Git, contém:

- `manual.md`: PINs e roteiro com os identificadores exatos.
- `pins.json`: PINs gerados, necessários para reapresentar credenciais em reexecuções. Não publique esse arquivo.
- `qr-catalog.html`: catálogo imprimível, sem PINs; cada QR contém somente o chassi. Inclui uma moto inexistente para testar consulta sem resultado.

## Fluxos

1. Entre em `/check-in` com `teste.recebimento` e o PIN do guia local.
2. Consulte `TESTAUGE000000002` manualmente e confirme a chegada.
3. Leia o QR de `TESTAUGE000000003`, confira o resultado e confirme.
4. Consulte novamente: não deve haver outro recebimento nem mudança no primeiro horário.
5. Teste as motos sem previsão, atrasadas, futuras, já recebidas e com status legado descritas no guia.
6. Confira BDC, estoque, filtros, paginação e os três status de emplacamento. Há clientes com várias motos e um sem moto.
7. Em `/squad/check-in`, teste rotação do PIN, revogação e exclusão de um operador de teste. `teste.excluir` tem um recebimento associado à moto `TESTAUGE000000012`; excluir o operador deve preservar o histórico.
8. Login com `teste.revogado` deve falhar. Tentativas incorretas repetidas devem bloquear temporariamente um operador de teste.

A câmera requer permissão e contexto seguro (localhost ou HTTPS). Use outra tela ou imprima o catálogo. Para conferir a virada diária, previsões de hoje vencem à meia-noite de São Paulo. O cron real altera todas as motos vencidas do banco, não apenas as de teste.

## Limpeza completa de homologação

`pnpm exec tsx tools/clean-workflow-data.ts --confirm-homologation` apaga clientes, motos, recebimentos, operadores e sessões de check-in. Preserva usuários, configurações e chamados. Use somente quando a limpeza desse banco estiver autorizada. Depois execute o seed novamente.
