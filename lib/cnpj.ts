export function stripCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function formatCNPJ(cnpj: string): string {
  const digits = stripCNPJ(cnpj);
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

export function validateCNPJ(cnpj: string): boolean {
  const digits = stripCNPJ(cnpj);

  if (digits.length !== 14) return false;

  if (/^(\d)\1{13}$/.test(digits)) return false;

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number.parseInt(digits[i], 10) * firstWeights[i];
  }
  let remainder = sum % 11;
  if (remainder < 2) {
    if (Number.parseInt(digits[12], 10) !== 0) return false;
  } else {
    const checkDigit = 11 - remainder;
    if (checkDigit !== Number.parseInt(digits[12], 10)) return false;
  }

  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += Number.parseInt(digits[i], 10) * secondWeights[i];
  }
  remainder = sum % 11;
  if (remainder < 2) {
    if (Number.parseInt(digits[13], 10) !== 0) return false;
  } else {
    const checkDigit = 11 - remainder;
    if (checkDigit !== Number.parseInt(digits[13], 10)) return false;
  }

  return true;
}
