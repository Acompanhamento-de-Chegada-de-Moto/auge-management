export function stripCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function formatCPF(cpf: string): string {
  const digits = stripCPF(cpf);
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function maskCPFIncremental(value: string): string {
  const digits = stripCPF(value).slice(0, 11);
  return digits.replace(
    /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
    (_, a: string, b: string, c: string, d: string) => {
      let result = `${a}.${b}.${c}`;
      if (d) result += `-${d}`;
      return result;
    },
  );
}

export function validateCPF(cpf: string): boolean {
  const digits = stripCPF(cpf);

  if (digits.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(digits[i], 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number.parseInt(digits[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(digits[i], 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number.parseInt(digits[10], 10)) return false;

  return true;
}
