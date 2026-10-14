import { validateCPF } from "./cpf";

/** Remove only formatting. Invalid symbols must not silently become valid IDs. */
export function normalizeDocument(value: string): string {
  return value
    .trim()
    .replace(/[./\-\s]/g, "")
    .toUpperCase();
}

export function isLegacyDocument(value: string): boolean {
  return /^TEMP-[A-Z0-9]{1,40}$/.test(value);
}

/** Keep existing REST clients that still send `cpf` working during rollout. */
export function withDocumentAlias(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const input = value as Record<string, unknown>;
  return input.document === undefined && input.cpf !== undefined
    ? { ...input, document: input.cpf }
    : value;
}

export function validateCNPJ(value: string): boolean {
  const document = normalizeDocument(value);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(document)) return false;
  if (/^(\d)\1{13}$/.test(document)) return false;
  // Receita Federal: each character's ASCII code minus 48, modulo 11.
  const digit = (base: string) => {
    let weight = 2;
    let sum = 0;
    for (let i = base.length - 1; i >= 0; i--) {
      sum += (base.charCodeAt(i) - 48) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return (
    digit(document.slice(0, 12)) === Number(document[12]) &&
    digit(document.slice(0, 13)) === Number(document[13])
  );
}

export function validateDocument(value: string): boolean {
  const document = normalizeDocument(value);
  return /^\d{11}$/.test(document)
    ? validateCPF(document)
    : validateCNPJ(document);
}

export function formatDocument(value: string): string {
  if (isLegacyDocument(value)) return value;
  const document = normalizeDocument(value);
  if (/^\d{11}$/.test(document))
    return document.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  if (/^[A-Z0-9]{12}\d{2}$/.test(document))
    return document.replace(
      /^(.{2})(.{3})(.{3})(.{4})(.{2})$/,
      "$1.$2.$3/$4-$5",
    );
  return value;
}

export function maskDocumentIncremental(value: string): string {
  if (isLegacyDocument(value)) return value;
  const document = normalizeDocument(value)
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 14);
  const cnpj =
    document.length > 11 || /[A-Z]/.test(document) || value.includes("/");
  const groups = cnpj ? [2, 3, 3, 4, 2] : [3, 3, 3, 2];
  const separators = cnpj ? [".", ".", "/", "-"] : [".", ".", "-"];
  let result = "";
  let offset = 0;
  for (let i = 0; i < groups.length && offset < document.length; i++) {
    if (i) result += separators[i - 1];
    result += document.slice(offset, offset + groups[i]);
    offset += groups[i];
  }
  return result;
}
