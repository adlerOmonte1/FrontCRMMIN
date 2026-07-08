/**
 * Clase de badge de Bootstrap para un valor de estado. `estado` es texto
 * libre en el backend (sin `choices`), así que cualquier valor fuera de los
 * conocidos cae en el badge neutro — esto es solo presentación, no valida
 * nada.
 */
export function claseBadgeEstado(estado: string): string {
  switch (estado.trim().toLowerCase()) {
    case 'pendiente':
      return 'text-bg-warning';
    case 'aprobado':
      return 'text-bg-info';
    case 'atendido':
      return 'text-bg-success';
    case 'rechazado':
      return 'text-bg-danger';
    default:
      return 'text-bg-secondary';
  }
}
