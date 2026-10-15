export async function searchMotorcycleByChassis<T>(
  chassis: string,
): Promise<T | null> {
  const response = await fetch(
    `/api/v1/bdc/motorcycle-search?chassis=${encodeURIComponent(chassis)}`,
    { credentials: "same-origin", cache: "no-store" },
  );
  if (!response.ok) throw new Error("Não foi possível consultar o chassi.");
  return (await response.json()) as T | null;
}
