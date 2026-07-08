/**
 * Compara un término de búsqueda (case-insensitive, sin trim raro) contra
 * varios campos de un registro. El backend no soporta filtrado por query
 * params (ver docs/01-arquitectura-frontend.md § Manejo de datos), así que
 * toda búsqueda en este proyecto es sobre los datos ya traídos al cliente.
 */
export function coincideTexto(termino: string, ...valores: Array<string | number | null | undefined>): boolean {
  const normalizado = termino.trim().toLowerCase();
  if (!normalizado) {
    return true;
  }
  return valores.some((valor) => valor !== null && valor !== undefined && String(valor).toLowerCase().includes(normalizado));
}
