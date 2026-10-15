# CPF e CNPJ de clientes

O campo lógico `Client.document` usa `@map("cpf")` e mantém o índice único
`clients_cpf_key`. A coluna PostgreSQL continua sendo `clients.cpf`. O nome,
os IDs, documentos existentes e vínculos com motos não são migrados ou reescritos.
Não há `documentType`: o formato identifica CPF ou CNPJ.

Uma comparação entre o schema anterior e o atual com `prisma migrate diff`
retornou uma migração vazia. Para publicar, gere o Prisma Client e publique a
aplicação juntos; não é necessário criar uma migration SQL para esta mudança.
`pnpm build` aplica outras migrations pendentes antes de gerar o cliente e
compilar. Para somente validar a compilação, use `pnpm build:ci`.
Nunca remova a coluna `cpf` para criar `document`.

Cadastro e edição mostram “CPF ou CNPJ”. Os documentos são validados por dígitos
verificadores, armazenados sem máscara e com letras maiúsculas. CNPJ numérico e
alfanumérico são aceitos. A implementação segue o cálculo oficial (ASCII menos
48 e módulo 11):
https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj

Busca BDC e acompanhamento público aceitam documentos com ou sem máscara.
Planilhas aceitam cabeçalhos CPF, CNPJ, CPF/CNPJ, CPF OU CNPJ ou DOCUMENTO.
Letras são preservadas. Linhas com documento informado inválido são ignoradas;
linhas sem documento continuam usando `TEMP-<CHASSI>`.

Um `TEMP-...` já existente pode permanecer inalterado na edição ou ser substituído
por CPF/CNPJ válido. Não pode ser criado pelo formulário nem transferido para
outro cliente. Esse código permanece armazenado com seu hífen original.

REST continua aceitando o campo legado `cpf` nas mutações e importações quando
`document` não for informado. O modelo e as consultas usam `document`.
