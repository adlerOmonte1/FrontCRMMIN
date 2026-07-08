/**
 * Espejo de api.Reporte (GestionMinera/api/models.py). `fecha` usa
 * `auto_now=True`: el backend la reescribe en cada actualización, no solo
 * al crear. Si este reporte alguna vez se edita, pierde su fecha original.
 */
export interface Reporte {
  id: number;
  encargado: number;
  fecha: string;
  descripcion: string;
}
