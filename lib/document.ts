import { formatCNPJ, validateCNPJ } from "@/lib/cnpj";
import { formatCPF, validateCPF } from "@/lib/cpf";

export function stripDocument(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateDocument(value: string): boolean {
  const digits = stripDocument(value);

  if (digits.length === 11) return validateCPF(digits);
  if (digits.length === 14) return validateCNPJ(digits);

  return false;
}

export function formatDocument(value: string): string {
  const digits = stripDocument(value);

  if (digits.length === 11) return formatCPF(value);
  if (digits.length === 14) return formatCNPJ(value);

  return value;
}

export function maskDocument(value: string): string {
  const digits = stripDocument(value).slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5")
    .slice(0, 18);
}
