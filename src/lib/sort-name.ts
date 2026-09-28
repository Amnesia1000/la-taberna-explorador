/** Nombre normalizado para orden alfabético: minúsculas, sin tildes
 *  y sin signos de puntuación en los extremos ("¡BASTA!" -> "basta"). */
export function normalizeSortName(name: string): string {
  return (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
}
