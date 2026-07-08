/** Espejo de api.Conductor (GestionMinera/api/models.py). `empleado` es el id del Empleado (FK). */
export interface Conductor {
  id: number;
  empleado: number;
  licencia: string;
  tipoLic: string;
}
