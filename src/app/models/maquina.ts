/**
 * `marca` y `nro_serie` son obligatorios (`CharField` sin `blank=True`) en
 * api.Maquina del backend, pero en la práctica el usuario no siempre los
 * tiene a mano al registrar una máquina rápido. El formulario los trata
 * como opcionales y, si quedan vacíos, envía este placeholder en vez de un
 * string vacío (que el backend rechazaría con 400).
 */
export const MAQUINA_SIN_ESPECIFICAR = 'No especificado';

/** Espejo de api.Maquina (GestionMinera/api/models.py). */
export interface Maquina {
  id: number;
  marca: string;
  nro_serie: string;
  nombre: string;
}
