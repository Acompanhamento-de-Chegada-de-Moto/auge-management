const CONSENT_COOKIE_NAME = "cookie_consent";
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type CookieConsentValue = "accepted" | "rejected" | null;

export function getCookieConsent(): CookieConsentValue {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE_NAME}=([^;]*)`),
  );
  if (!match) return null;
  const value = match[1];
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

export function setCookieConsent(value: "accepted" | "rejected"): void {
  // biome-ignore lint/suspicious/noDocumentCookie: cookie consent management
  document.cookie = `${CONSENT_COOKIE_NAME}=${value};path=/;max-age=${CONSENT_COOKIE_MAX_AGE};SameSite=Lax`;
}
