/** Espejo de api.GastoViaje (GestionMinera/api/models.py). `fecha` es de solo lectura (auto_now_add). */
export interface GastoViaje {
  id: number;
  fecha: string;
  ticket: number;
  descripcion: string | null;
  consumo: string;
  monto: string;
}
