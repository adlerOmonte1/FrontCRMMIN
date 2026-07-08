/** Formato "YYYY-MM-DDTHH:mm" que espera un <input type="datetime-local">. */
function aInputDatetimeLocal(fecha: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

/** Convierte un ISO del backend a la forma que espera un <input type="datetime-local"> (para precargar un formulario de edición). */
export function isoAInputDatetimeLocal(iso: string): string {
  return aInputDatetimeLocal(new Date(iso));
}

/** "Ahora" listo para pegar en un <input type="datetime-local"> — el botón "Ahora" de los formularios usa esto. */
export function ahoraParaInputLocal(): string {
  return aInputDatetimeLocal(new Date());
}

/** Solo la parte de fecha (sin hora) de un datetime ISO del backend, para mostrar en listas/labels compactos. */
export function soloFecha(iso: string): string {
  return new Date(iso).toLocaleDateString();
}
