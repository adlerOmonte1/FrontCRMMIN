/**
 * Espejo de api.Inventario (GestionMinera/api/models.py). Es la "cabecera"
 * del patrón cabecera-detalle: agrupa varias filas de DetalleInventario.
 * `fechaInventario` es de solo lectura (auto_now_add).
 */
export interface Inventario {
  id: number;
  encargado: number;
  fechaInventario: string;
  descripcion: string;
  lugar: string;
}
