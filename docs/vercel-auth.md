# Autenticação nos previews da Vercel

O Better Auth usa uma baseURL dinâmica no ambiente `preview`: aceita somente os hosts de `VERCEL_URL` (deployment) e `VERCEL_BRANCH_URL` (alias da branch), com HTTPS. A URL da requisição determina o endereço de autenticação, mantendo o login no domínio acessado. Esses hosts também são reconhecidos pelo Better Auth como origens confiáveis.

No painel da Vercel:

1. Habilite **Enable access to System Environment Variables** nas configurações de variáveis do projeto.
2. Configure `BETTER_AUTH_SECRET` e `DATABASE_URL` no ambiente **Preview**, com os valores de homologação. Mantenha o segredo estável entre deployments desse ambiente.
3. `BETTER_AUTH_URL` pode ficar restrita a **Production** (domínio definitivo) e **Development** (`http://localhost:3000`). No Preview ela é ignorada por esta configuração.
4. Faça um novo deployment depois de alterar variáveis. Teste login, navegação autenticada e logout pela URL desse deployment ou pelo alias da branch.

O `vercel.json` define `pnpm build` como **Build Command** de Production e
Preview. `pnpm build:preview` também está disponível como alias. Esse fluxo aplica migrations versionadas,
gera o Prisma Client e compila a aplicação. O banco de Preview deve ser
independente do banco de Production, inclusive em `DIRECT_URL`, quando definida.
`pnpm build:ci` é destinado à validação sem migrations, não ao deploy.

O cliente de autenticação permanece na origem atual e o formulário usa o callback relativo `/bdc`. Cookies continuam restritos ao host; entrar em um alias não autentica automaticamente outro domínio de preview.

Em produção, `BETTER_AUTH_URL` tem prioridade. Quando ausente na Vercel, usa `VERCEL_PROJECT_PRODUCTION_URL`, depois `VERCEL_URL`. Fora da Vercel, permanece a resolução padrão do Better Auth.

Domínios personalizados de preview precisam ser adicionados explicitamente à configuração; não há wildcard global para outros projetos Vercel. Esta configuração cobre o login por e-mail e senha atual. Provedores OAuth futuros também precisarão de configuração dos seus próprios callbacks.

Referências: [Better Auth: URL dinâmica](https://better-auth.com/docs/guides/dynamic-base-url) e [variáveis de sistema da Vercel](https://vercel.com/docs/environment-variables/system-environment-variables).
