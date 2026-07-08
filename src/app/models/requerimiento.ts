/**
 * Espejo de api.Requerimientos (GestionMinera/api/models.py) — el backend
 * nombra la clase en plural; acá se prefiere el singular "Requerimiento"
 * para el tipo (más natural al referenciar un registro individual en
 * TypeScript), aunque el recurso HTTP sigue siendo `requerimientos` tal
 * cual lo expone la API.
 *
 * `fecha` usa `auto_now=True` (igual que Reporte.fecha). `estado` no tiene
 * `choices` en el backend — el frontend es responsable de estandarizar los
 * valores; ver ESTADOS_REQUERIMIENTO.
 */
export interface Requerimiento {
  id: number;
  encargado: number;
  fecha: string;
  estado: string;
}

export const ESTADOS_REQUERIMIENTO = ['pendiente', 'aprobado', 'rechazado'] as const;
