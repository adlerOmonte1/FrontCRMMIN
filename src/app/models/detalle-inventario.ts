/**
 * Espejo de api.DetalleInventario (GestionMinera/api/models.py). Línea de
 * detalle de un Inventario. `maquina` e `insumo` son ambos opcionales a
 * nivel de backend — la regla de negocio "uno u otro, no ambos" no la
 * valida el servidor, así que el formulario la refuerza acá (ver
 * detalle-inventario-form.ts).
 */
export interface DetalleInventario {
  id: number;
  inventario: number;
  maquina: number | null;
  insumo: number | null;
  cantidad: string;
  fecha_adquision: string;
  fecha_fin: string | null;
  ubicacion: string;
  descripcion: string;
  observacion: string;
  estado: string;
}
