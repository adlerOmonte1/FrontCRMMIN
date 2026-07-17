# Marco de trabajo para asistentes de IA

Este repositorio es el frontend Angular de ERP Minero. Antes de analizar o modificar código, lee [`docs/00-contexto-ia.md`](docs/00-contexto-ia.md). Es la fuente de contexto operativo: explica el dominio, la arquitectura, los contratos con la API, las reglas de negocio y el flujo de trabajo.

Reglas no negociables:

- Conserva el contrato del backend: los modelos de `src/app/models/` son su reflejo local. No inventes campos, endpoints ni filtros que la API no soporte.
- Mantén las dependencias `página -> servicio de entidad -> Api`. Los componentes no usan `HttpClient` ni construyen URLs.
- Usa el patrón ya establecido para cada módulo: modelo, servicio, listado, formulario, rutas y navegación cuando corresponda.
- Conserva `strict` TypeScript, componentes standalone, formularios reactivos, signals para estado local y Bootstrap en los templates.
- Para cambios funcionales, actualiza la documentación afectada y ejecuta al menos `npm run build`. Ejecuta `npm test` cuando se modifique lógica con pruebas o se agreguen pruebas.
- No modifiques ni reviertas cambios ajenos del árbol de trabajo. En particular, `src/app/shared/peso.ts` tenía cambios locales al iniciar este marco.

