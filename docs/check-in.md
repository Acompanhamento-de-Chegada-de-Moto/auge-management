# Recebimento de motocicletas

## Acesso

`/check-in` é público, mas a consulta e confirmação exigem autenticação. Quem já
tem conta usa a sessão Better Auth, sem cadastro adicional de operador. O botão
de login retorna diretamente ao check-in. Para quem só recebe motos, ADMINs
cadastram apenas o nome completo em `/squad/check-in` e entregam um PIN individual
de 8 dígitos gerado com `randomInt`. O acesso usa nome + PIN; identificações antigas
continuam aceitas. Nomes ambíguos não autorizam acesso: use nomes completos distintos.
O nome normalizado ocupa a identificação única existente, sem migration.
O PIN é exibido uma vez, armazenado com scrypt + sal e nunca incluído no QR.

Sessões de operador duram 30 dias a partir do login; o PIN continua válido até
renovação ou revogação. Sessões já abertas mantêm o vencimento anterior: entre
novamente para obter os 30 dias. Contas da plataforma mantêm a duração do Better Auth.
Cookies são HttpOnly, SameSite=Strict e Secure em produção,
restritos a `/check-in`. Tokens aleatórios de 256 bits são armazenados como SHA-256.
Após 5 falhas o operador fica bloqueado por 15 minutos. Há também limites persistentes
por identificação e IP. O proxy da hospedagem deve sobrescrever `x-forwarded-for`.
Revogar ou renovar o PIN encerra as sessões. Renovar também reativa o operador.
Cada consulta e confirmação resolve novamente o acesso. Confirmações com conta
validam e bloqueiam usuário/sessão na transação, rejeitando usuários banidos e
sessões encerradas; o recibo registra nome e ID do usuário em `actorLabel`.
ADMINs também podem excluir operadores mediante confirmação. A exclusão remove
as sessões e desvincula o operador dos recibos, preservando os recebimentos e
`actorLabel` (nome registrado na confirmação).

## Recebimento

O leitor usa `@zxing/browser`, carregado sob demanda, e aceita o chassi em texto puro
ou JSON com uma propriedade `chassi` textual, por exemplo
`{"chassi":"TESTAUGE000000003"}`. O chassi é normalizado para maiúsculas e validado
antes da consulta. Outros campos do JSON são ignorados. URLs, JSON malformado e
chassis inválidos são rejeitados; não há navegação automática. Digitação é alternativa.
A câmera exige permissão do navegador e HTTPS (localhost é exceção).
O leitor tenta cada imagem com as cores originais e invertidas para aceitar
etiquetas com QR branco sobre fundo preto. As duas fotos de etiqueta fornecidas
em 14/10/2026 foram decodificadas como `9C2KC2500TR102752` com espaços finais,
removidos pela validação. A prévia preenche um quadrado com recorte central;
o leitor analisa esse mesmo recorte, incluindo a tentativa com cores invertidas.
A câmera abre automaticamente após autenticação. As abas “Ler QR code” e
“Digitar chassi” alternam a entrada e desligam a câmera na digitação. A câmera
para ao consultar uma etiqueta e reabre ao receber a próxima moto no modo QR.

Consulta retorna somente identificação da moto, modelo, previsão, situação e horário
de recebimento. A confirmação é explícita. Uma transação valida e bloqueia operador/
sessão, atualiza condicionalmente a moto e cria um único recibo. Repetições preservam
o primeiro horário. Editar chassi/modelo/previsão não desfaz um recebimento.
Confirmações pelos formulários internos usam a mesma regra e registram o usuário.
Importações de previsão não confirmam chegada.

`forecastArrival` mantém a previsão; `arrivedAt` registra o instante real do servidor.
Registros históricos ARRIVED continuam recebidos, sem inventar horário retroativo.
O histórico do check-in é armazenado em `motorcycle_receipts`. Exclusão explícita
da motocicleta exclui também seu recibo.

## Atrasos e agendamento

Previsões são datas de calendário representadas pela parte UTC da data, conforme os
formatadores existentes. O dia atual é calculado em `America/Sao_Paulo`. Previsão de
10/10 vale até 10/10 23:59:59.999 local; em 11/10 00:00 fica atrasada se não recebida.
Sem previsão não gera atraso. Uma chegada tardia muda DELAYED para ARRIVED.

Configure `CRON_SECRET` no ambiente da aplicação e no agendador. Use um segredo
aleatório de pelo menos 32 bytes. O endpoint não aceita cookies ou PINs como credencial.

Agende a cada 5 minutos:

```http
POST /api/cron/motorcycles/mark-delayed
Authorization: Bearer <CRON_SECRET>
```

O agendador é externo ao processo Next.js. O endpoint retorna `{ updated, timeZone }`;
sem configuração retorna 503, sem credencial válida retorna 401. Repetições são seguras.
Ele persiste atrasos e invalida caches/listagens/acompanhamento. As consultas da DAL
aplicam a mesma regra imediatamente, mesmo antes do próximo cron; filtros, contadores
e badges concordam. O frontend não calcula atraso nem usa “Aguardando Confirmação”.

O comando `pnpm cron:arrivals` faz uma chamada única ao endpoint usando
`BETTER_AUTH_URL` e `CRON_SECRET` do ambiente. Configure sua execução a cada 5 minutos
no agendador da hospedagem. O repositório não instala tarefas recorrentes na máquina
do desenvolvedor nem presume uma plataforma de deploy. O comando exige HTTPS fora
do localhost, tem timeout e termina com erro se a chamada falhar.

## Instalação e validação

1. `pnpm exec prisma migrate deploy` aplica a migration aditiva.
2. `pnpm exec prisma generate` gera os modelos.
3. Reinicie o servidor, cadastre um operador e entregue seu PIN.
4. Configure o agendador conforme a hospedagem.

`pnpm test` cobre limite do dia, ausência de previsão, reagendamento, PINs/hash,
sessões expiradas/revogadas, payloads inválidos, exigência de sessão, repetição de
check-in, proteção do cron e preservação da chegada. Testes com dependências injetadas
não substituem a validação da câmera em Android/iOS ou concorrência em PostgreSQL.
