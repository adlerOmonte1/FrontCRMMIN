export type TipoDetalleRequerimiento = 'insumos' | 'herramientas';

export const TIPOS_DETALLE_REQUERIMIENTO: { valor: TipoDetalleRequerimiento; etiqueta: string }[] = [
  { valor: 'insumos', etiqueta: 'Insumos' },
  { valor: 'herramientas', etiqueta: 'Herramientas' },
];

/**
 * Espejo de api.DetalleRequerimientos (GestionMinera/api/models.py). Línea
 * de un Requerimiento. Ver la nota de nomenclatura en requerimiento.ts —
 * mismo criterio acá (singular en TypeScript, recurso HTTP en el nombre
 * original del backend).
 */
export interface DetalleRequerimiento {
  id: number;
  requerimiento: number;
  nombre: string;
  cantidad: string;
  tipo: TipoDetalleRequerimiento;
}
