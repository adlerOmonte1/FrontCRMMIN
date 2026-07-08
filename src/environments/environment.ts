export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api',
  // Clave compartida que exige el backend en el header X-Api-Key (ver
  // GestionMinera/requerimientos/settings.py -> API_KEY). Es la misma clave
  // de desarrollo que ya vive en texto plano en el repo del backend, no un
  // secreto real; en producción se reemplaza vía environment.prod.ts.
  apiKey: 'crm-minera-2024',
};
