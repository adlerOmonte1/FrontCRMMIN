/**
 * Espejo de api.Mantenimiento (GestionMinera/api/models.py). `maquina` y
 * `volquete` (nombre de campo para el Vehiculo referenciado) son ambos
 * opcionales — misma regla "uno u otro" sin validar en el backend que en
 * DetalleInventario (ver detalle-inventario.ts).
 */
export interface Mantenimiento {
  id: number;
  encargado: number;
  maquina: number | null;
  volquete: number | null;
  fecha: string;
  descripcion: string;
  costo: string | null;
}
