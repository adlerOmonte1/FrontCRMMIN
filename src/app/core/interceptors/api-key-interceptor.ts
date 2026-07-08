import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '@environments/environment';

/**
 * Agrega el header X-Api-Key a toda petición saliente hacia la API.
 *
 * Es el equivalente, del lado del cliente, de APIKeyAuthentication en el
 * backend (GestionMinera/api/authentication.py): el backend exige ese header
 * en cada request bajo /api/, así que este interceptor es lo único que
 * habilita que cualquier llamada HTTP de la app funcione.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const requestConApiKey = req.clone({
    setHeaders: { 'X-Api-Key': environment.apiKey },
  });

  return next(requestConApiKey);
};
