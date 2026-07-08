export const environment = {
  production: true,
  // Reemplazar por la URL real del backend en producción antes de desplegar.
  apiUrl: 'https://REEMPLAZAR-CON-DOMINIO-DE-PRODUCCION/api',
  // No commitear la API key real de producción: inyectarla en el pipeline de
  // build (variable de entorno del servidor de CI/CD) y sobrescribir este
  // valor en ese paso, nunca en el repositorio.
  apiKey: 'REEMPLAZAR-EN-EL-SERVIDOR-DE-BUILD',
};
