/**
 * Espejo de api.Empleado en el backend (GestionMinera/api/models.py).
 * `id` lo asigna siempre el servidor: para creación se usa
 * `Omit<Empleado, 'id'>` (ver EmpleadoService.create).
 */
export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  edad: number;
  especialidad: string;
}
