type AuthEnvironment = {
  [key: string]: string | undefined;
  BETTER_AUTH_URL?: string;
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_BRANCH_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
};

export function getAuthBaseURL(env: AuthEnvironment = process.env) {
  if (env.VERCEL_ENV === "preview") {
    const allowedHosts = [
      ...new Set(
        [env.VERCEL_URL, env.VERCEL_BRANCH_URL].filter((host): host is string =>
          Boolean(host),
        ),
      ),
    ];
    if (!allowedHosts.length) {
      throw new Error(
        "Ative as System Environment Variables da Vercel para resolver a URL de autenticação do preview.",
      );
    }
    // Exact deployment and branch hosts; do not trust every *.vercel.app project.
    return { allowedHosts, protocol: "https" as const };
  }

  if (env.BETTER_AUTH_URL) return env.BETTER_AUTH_URL;
  if (env.VERCEL_ENV === "production") {
    const host = env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL;
    if (host) return `https://${host}`;
  }
  return undefined;
}
