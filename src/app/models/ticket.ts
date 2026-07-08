/**
 * Espejo de api.Ticket (GestionMinera/api/models.py). Entidad central del
 * sistema: un viaje de acarreo pesado en báscula.
 *
 * `fecha_emision` y `pesoNeto` son de solo lectura — el servidor los calcula
 * (`pesoNeto = pesoBruto - vehiculo.tara`) y los rechaza si vienen en el
 * body de un POST/PUT. Por eso el payload de creación es
 * `Omit<Ticket, 'id' | 'fecha_emision' | 'pesoNeto'>`.
 */
export interface Ticket {
  id: number;
  fecha_emision: string;
  conductor: number;
  vehiculo: number;
  encargado: number;
  material: number;
  descripcion: string | null;
  observaciones: string | null;
  pesoBruto: string;
  pesoNeto: string;
}
