# Auge — console operacional

A direção escolhida é um console sóbrio para quem consulta clientes, confere
chegadas e atualiza o estoque repetidamente. O vermelho Auge identifica a ação
principal; superfícies neutras, tipografia e bordas organizam a informação.

## Inspiração aplicada

[UX Pilot: Enterprise UX](https://uxpilot.ai/blogs/enterprise-ux-design) recomenda
um sistema compartilhado, interfaces por papel, hierarquia e ajuda contextual.
[FuseLab: Enterprise UX Design Guide](https://fuselabcreative.com/enterprise-ux-design-guide-2026-best-practices/)
enfatiza densidade legível, termos consistentes, recuperação de erros e decisões
documentadas. Aqui, essas ideias orientam os padrões abaixo. Não são resultados
de pesquisa com os usuários da concessionária; o fluxo existente orientou a
implementação e ainda deve ser validado com operadores reais.

## Padrões do produto

| Padrão | Implementação | Motivo |
| --- | --- | --- |
| Application shell | Sidebar por área e papel, topbar, localização e skip link | Manter orientação entre módulos |
| Page template | `Page` + `PageHeader` com uma ação principal e secundárias discretas | Dar previsibilidade à navegação |
| Data workspace | `DataWorkspace`, contagem, filtros, tabela e paginação | Concentrar consulta e ação em uma superfície |
| Overview to detail | `FilterViews` com contagens e seleção por status | Passar da visão geral ao conjunto de trabalho |
| Compound cells | BDC agrupa nome/CPF/faturamento, vendedor/cidade e modelo/chassi | Preservar dados sem esconder colunas por breakpoint |
| Explicit filter state | Chips removíveis em BDC/estoque e URL como fonte dos filtros | Tornar o recorte visível e compartilhável |
| Adjustable density | Confortável ou compacta, por listagem | Adaptar a leitura sem alterar filtros ou paginação |
| Contextual guidance | `FormWorkspace` com orientação lateral e footer de ações sticky | Apoiar cadastro e edição sem depender de documentação externa |
| Actionable empty state | `EmptyState` diferencia iniciar cadastro e limpar filtros | Dar um próximo passo quando não há resultados |
| Decision to action | Dashboard liga atrasos ao estoque e chegadas ao BDC | Aproximar indicadores da rotina operacional |

## Regras visuais e de interação

- Fundo base-200, superfícies base-100 e bordas base-300, em ambos os temas.
- H1 de 24px; texto operacional de 13–14px; dados secundários de 11–12px.
- Raio de 8–12px para controles e superfícies. Sem sombras decorativas no login.
- Cor de status acompanha um rótulo; cor sozinha não transmite significado.
- Cabeçalhos de tabela fixos dentro da rolagem e ações acessíveis por teclado.
- Desktop usa tabelas; mobile usa cartões e o menu lateral fecha ao navegar.
- A densidade é uma preferência de apresentação em memória, reiniciada quando
  a listagem desmonta. Não armazena filtros nem dados de clientes.
- Não se adicionam seleções em massa, exportações ou atalhos que não tenham uma
  operação real implementada. O atalho de menu existente é documentado na topbar.
- O cadastro continua com react-hook-form/Zod, Server Actions e autorização
  por operação. Reconstrução visual não modifica papéis nem regras de negócio.

## Critérios de revisão

Conferir BDC e estoque com nomes longos, zero resultados, múltiplas motos por
cliente, paginação e filtros removidos individualmente. Conferir mobile,
teclado, temas claro/escuro, contraste e mensagens de validação. As contagens
gerais representam o conjunto completo; a contagem no workspace representa
o resultado dos filtros. Não apresentar uma como se fosse a outra.

Build e lint dos arquivos alterados verificam a integração do código. Testes
de mutação cobrem o backend; não comprovam usabilidade. A aprovação final do
fluxo exige observação de usuários reais, e os fluxos de escrita ainda precisam
de teste E2E em dados de teste.
