import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskChassis(chassis: string): string {
  if (chassis.length <= 6) return chassis;
  return "*".repeat(chassis.length - 6) + chassis.slice(-6);
}

const SENSITIVE_FIELDS = new Set([
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "idToken",
  "secret",
  "apiKey",
]);

export function sanitizeForAudit(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForAudit(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.has(key)) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeForAudit(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
