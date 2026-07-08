# Guía de Despliegue — Solo Servicios Gratuitos

> Ver también: [Arquitectura del frontend](01-arquitectura-frontend.md) · [Flujo del código](02-flujo-codigo-frontend.md) · [Guía del patrón de módulo](03-guia-nuevo-modulo.md)

Este sistema tiene **tres piezas** que desplegar por separado, en dos repositorios distintos:

| Pieza | Repositorio | Qué es |
|---|---|---|
| Frontend | `erp-minero` (este repo) | Angular — build estático (HTML/CSS/JS), sin servidor propio |
| Backend | `GestionMinera` | API REST Django + DRF — necesita un proceso Python corriendo |
| Base de datos | — | Hoy MySQL local (`CRMMIN`) en desarrollo |

Ninguna de las tres piezas está lista para producción tal cual está hoy (`DEBUG=True`, `SECRET_KEY` y `API_KEY` hardcodeados, sin `gunicorn`, sin manejo de estáticos) — la documentación del propio backend ya lo advierte. Esta guía cubre **qué cambiar y dónde alojarlo**, usando únicamente planes gratuitos.

## Índice

1. [Panorama general](#1-panorama-general)
2. [Comparativa de servicios gratuitos](#2-comparativa-de-servicios-gratuitos)
3. [Ruta recomendada](#3-ruta-recomendada)
4. [Preparar el backend para producción](#4-preparar-el-backend-para-producción)
5. [Paso a paso: base de datos en Supabase](#5-paso-a-paso-base-de-datos-en-supabase)
6. [Paso a paso: backend en Render](#6-paso-a-paso-backend-en-render)
7. [Preparar el frontend para producción](#7-preparar-el-frontend-para-producción)
8. [Paso a paso: frontend en Vercel](#8-paso-a-paso-frontend-en-vercel)
9. [Checklist post-despliegue](#9-checklist-post-despliegue)
10. [Rutas alternativas](#10-rutas-alternativas)
11. [Advertencia de seguridad: la API Key en un SPA público](#11-advertencia-de-seguridad-la-api-key-en-un-spa-público)
12. [Límites de los planes gratuitos, en criollo](#12-límites-de-los-planes-gratuitos-en-criollo)

---

## 1. Panorama general

```mermaid
flowchart LR
    U["Encargado (navegador)"] --> V["Frontend estático<br/>Vercel"]
    V -- "HTTP + X-Api-Key" --> R["Backend Django<br/>Render (gunicorn)"]
    R --> S[("PostgreSQL<br/>Supabase")]
```

El frontend (build estático) y el backend (proceso Python) se despliegan en servicios distintos porque son cosas distintas: uno son archivos que cualquier CDN puede servir, el otro necesita un intérprete de Python corriendo 24/7 (o casi). La base de datos va aparte porque ni Vercel ni Render ofrecen MySQL/Postgres gratis *de forma permanente* alojado junto al backend (ver [§10](#10-rutas-alternativas)).

## 2. Comparativa de servicios gratuitos

### Frontend (archivos estáticos)

| Servicio | Plan gratuito | Notas |
|---|---|---|
| **Vercel** ✅ recomendado | Proyectos ilimitados, ~100 GB transferencia/mes | Deploy automático desde GitHub, HTTPS y subdominio `*.vercel.app` gratis, preview por cada PR |
| Netlify | 100 GB transferencia/mes, 300 min de build/mes | Prácticamente equivalente a Vercel |
| Cloudflare Pages | Transferencia ilimitada, 500 builds/mes | El más generoso en ancho de banda |
| GitHub Pages | Ilimitado en repos públicos | Sin redirecciones server-side fáciles; hay que ajustar el ruteo de una SPA a mano |
| Firebase Hosting | 10 GB almacenados, 360 MB/día de transferencia | Conviene solo si ya usan otros productos de Firebase |

### Backend (proceso Python/Django)

| Servicio | Plan gratuito | Notas |
|---|---|---|
| **Render** ✅ recomendado | 750 hs/mes, se "duerme" tras ~15 min sin tráfico | El primer request después de dormir tarda 30–60 s en responder (cold start) — normal, no es un error |
| Railway | Créditos de prueba (no gratis indefinido) | Bueno para probar, pero eventualmente pide tarjeta/plan pago |
| Fly.io | Algunas VMs pequeñas gratis | Requiere tarjeta para verificar cuenta y usar su CLI (`flyctl`) + Dockerfile propio — más trabajo de setup |
| PythonAnywhere | 1 app web gratis, no se duerme | Dominio gratis tipo `usuario.pythonanywhere.com`; dominio propio con HTTPS no es gratis |
| Koyeb | 1 servicio gratis | Similar a Render, comunidad más chica |

### Base de datos

| Servicio | Motor | Plan gratuito | Notas |
|---|---|---|---|
| **Supabase** ✅ recomendado | PostgreSQL | 500 MB, se pausa tras ~1 semana sin uso (se reactiva sola al recibir tráfico) | Requiere migrar el backend de MySQL a Postgres — ver [§4](#4-preparar-el-backend-para-producción) |
| Neon | PostgreSQL | 512 MB–3 GB según uso, serverless | Alternativa directa a Supabase, misma migración necesaria |
| Render (Postgres) | PostgreSQL | Gratis solo por 30 días, después hay que recrearla o pagar | Cómodo por estar en la misma plataforma que el backend, pero **no es gratis a largo plazo** |
| Aiven | MySQL / Postgres | Solo trial por tiempo limitado | Ya no tiene plan gratis permanente |
| db4free.net | MySQL | Gratis, sin migrar nada | Pensado para pruebas/aprendizaje: sin garantía de uptime ni backups — **no usar con datos reales** |
| Oracle Cloud "Always Free" | MySQL (autohospedado) | VM gratis *para siempre*, vos instalás MySQL | La única opción realmente gratis a largo plazo sin migrar de motor, a cambio de mantener vos el servidor (parches, backups, seguridad) |

> **PlanetScale** solía tener un plan MySQL gratis; ya no lo ofrece (pasó a ser 100% pago). Si ves guías viejas que lo recomiendan, están desactualizadas.

## 3. Ruta recomendada

**Supabase (Postgres) + Render (backend) + Vercel (frontend)** — es la combinación con menos partes móviles y sin fecha de vencimiento en ninguna pieza. El único costo real es migrar el backend de MySQL a PostgreSQL, que con Django es un cambio chico (el ORM abstrae casi todo).

Si preferís no tocar el backend en absoluto, mirá la opción "quedarme en MySQL" en [§10](#10-rutas-alternativas) — es más laboriosa de mantener a cambio de no migrar de motor de base de datos.

## 4. Preparar el backend para producción

Esto se hace en el repositorio **`GestionMinera`** (no en este). Resumen de lo que falta, tal como ya lo dice la propia documentación del backend: `SECRET_KEY` y `API_KEY` hardcodeados, `DEBUG=True`, sin servidor de producción, sin manejo de estáticos.

**1. Agregar a `requirements.txt`** (y sacar `mysqlclient` si ya no van a usar MySQL):

```
gunicorn
psycopg2-binary
django-environ
whitenoise
```

**2. Reescribir la parte relevante de `requerimientos/settings.py`** para leer todo desde variables de entorno:

```python
import environ

env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(BASE_DIR / '.env')  # solo se usa en desarrollo local; en Render las variables se configuran en el dashboard

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

DATABASES = {
    'default': env.db('DATABASE_URL'),
}

API_KEY = env('API_KEY')

CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://127.0.0.1:5500',
    'http://localhost:5173',
    'http://localhost:4200',
])
```

**3. Agregar WhiteNoise** para que Django sirva el CSS/JS del panel `/admin/` sin necesitar otro servicio (con `DEBUG=False`, Django deja de servir estáticos por su cuenta):

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ...el resto igual que ya está...
]

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}
```

**4. Crear un `.env.example`** (documentar, sin valores reales) para que quede claro qué variables espera el proyecto:

```
SECRET_KEY=
DEBUG=False
ALLOWED_HOSTS=tu-backend.onrender.com
DATABASE_URL=postgres://usuario:password@host:5432/nombre_db
API_KEY=
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

`db.sqlite3` (el archivo suelto en la raíz) se puede borrar — es un artefacto sin uso, según la propia documentación del backend.

## 5. Paso a paso: base de datos en Supabase

1. Crear cuenta en [supabase.com](https://supabase.com) (gratis, con GitHub).
2. **New Project** → elegir nombre, contraseña de base de datos (guardarla) y región (la más cercana a donde esté el backend).
3. Esperar a que aprovisione (~2 minutos).
4. Ir a **Project Settings → Database → Connection string** y copiar la de tipo **URI**. Se ve así:
   ```
   postgresql://postgres:[TU-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Guardar esa URL — es el valor de `DATABASE_URL` que va a usar Render en el paso siguiente.

No hace falta crear tablas a mano: `python manage.py migrate` (que corre solo en el build de Render) las crea todas a partir de la única migración existente del backend (`0001_initial.py`).

## 6. Paso a paso: backend en Render

1. Crear cuenta en [render.com](https://render.com) (gratis, con GitHub) y darle acceso al repositorio `GestionMinera`.
2. **New → Web Service** → elegir el repo.
3. Configuración del servicio:
   - **Runtime**: Python 3
   - **Build Command**:
     ```
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - **Start Command**:
     ```
     gunicorn requerimientos.wsgi:application
     ```
   - **Instance Type**: Free
4. En **Environment**, agregar las variables (mismos nombres que el `.env.example` del paso anterior):
   | Variable | Valor |
   |---|---|
   | `SECRET_KEY` | una clave nueva y larga (generarla, no reusar la del repo) |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | el dominio que Render te asigna, p. ej. `gestionminera.onrender.com` |
   | `DATABASE_URL` | la cadena de conexión de Supabase del paso 5 |
   | `API_KEY` | una clave nueva para producción (no reusar `crm-minera-2024`) |
   | `CORS_ALLOWED_ORIGINS` | el dominio que te va a dar Vercel, p. ej. `https://erp-minero.vercel.app` (lo sabrás recién después del paso 8 — se puede volver a editar esta variable en cualquier momento) |
5. **Create Web Service**. Render clona el repo, instala dependencias, corre migraciones y levanta `gunicorn`. La primera vez tarda unos minutos.
6. Al terminar, Render te da una URL tipo `https://gestionminera.onrender.com`. Probarla con:
   ```bash
   curl -H "X-Api-Key: TU_API_KEY_DE_PRODUCCION" https://gestionminera.onrender.com/api/empleados/
   ```
   Debería responder `200 OK` con la lista paginada (vacía si la base recién se creó).

## 7. Preparar el frontend para producción

Esto sí es en **este repositorio**. Dos cosas: completar `environment.prod.ts` y decirle al hosting cómo rutear una SPA.

**1. Inyectar `apiUrl`/`apiKey` en el build en vez de commitearlos hardcodeados.** Crear `scripts/set-env.js`:

```js
const fs = require('fs');

const contenido = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}',
  apiKey: '${process.env.API_KEY}',
};
`;

fs.writeFileSync('src/environments/environment.prod.ts', contenido);
console.log('environment.prod.ts generado a partir de variables de entorno.');
```

Y en `package.json`:

```json
"scripts": {
  "build:prod": "node scripts/set-env.js && ng build"
}
```

Esto reemplaza el placeholder que ya tiene `environment.prod.ts` (`REEMPLAZAR-CON-DOMINIO-DE-PRODUCCION`) con el valor real en cada build, sin que la API Key real quede commiteada en el repositorio — ver la advertencia de [§11](#11-advertencia-de-seguridad-la-api-key-en-un-spa-público) sobre qué tan "secreta" es igual esa clave una vez compilada.

**2. Rutear la SPA.** El Router de Angular maneja rutas como `/empleados` o `/vehiculos/3/editar` del lado del cliente — si alguien entra directo a esa URL o recarga la página, el hosting tiene que servirle siempre `index.html` (no un 404) para que Angular tome el control y resuelva la ruta. Crear `vercel.json` en la raíz del repo:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 8. Paso a paso: frontend en Vercel

1. Crear cuenta en [vercel.com](https://vercel.com) (gratis, con GitHub) y darle acceso al repositorio `erp-minero`.
2. **Add New → Project** → elegir el repo.
3. Configuración del proyecto:
   - **Framework Preset**: Other (para no depender de que Vercel adivine bien la estructura nueva de Angular)
   - **Build Command**: `npm run build:prod`
   - **Output Directory**: `dist/erp-minero/browser`
4. En **Environment Variables**, agregar:
   | Variable | Valor |
   |---|---|
   | `API_URL` | `https://gestionminera.onrender.com/api` (la URL de Render del paso 6, con `/api` al final) |
   | `API_KEY` | la misma clave de producción que configuraste en Render |
5. **Deploy**. Vercel instala dependencias, corre `set-env.js` + `ng build`, y publica `dist/erp-minero/browser`.
6. Al terminar te da una URL tipo `https://erp-minero.vercel.app`. **Copiala y volvé al paso 6 del backend** para completar/actualizar `CORS_ALLOWED_ORIGINS` en Render con este dominio real — sin esto, el navegador bloquea todas las peticiones con error de CORS (no es un error de la API, es el navegador negándose a mandar la petición).

## 9. Checklist post-despliegue

- [ ] `https://tu-backend.onrender.com/api/empleados/` responde `200` con el header `X-Api-Key` correcto, y `401` sin él.
- [ ] `CORS_ALLOWED_ORIGINS` en Render incluye el dominio final de Vercel (con `https://`, sin `/` final).
- [ ] La app en Vercel carga, y el listado de Empleados trae datos reales (no se queda en "Cargando…" ni muestra el mensaje de error de conexión).
- [ ] Recargar la página estando en una ruta interna (p. ej. `/vehiculos`) no da 404 — confirma que `vercel.json` está funcionando.
- [ ] `/admin/` del backend carga con estilos (confirma que WhiteNoise está sirviendo los estáticos).
- [ ] `DEBUG=False` en Render (probar una URL que no existe en la API y verificar que NO se muestra una página de error de Django con detalles internos).
- [ ] La `API_KEY` y el `SECRET_KEY` de producción son **distintos** a los que están hardcodeados en el repositorio del backend.

## 10. Rutas alternativas

**Quedarse en MySQL en vez de migrar a Postgres:** cambia el paso 4 y 5 — en `requirements.txt` mantener `mysqlclient` en vez de `psycopg2-binary`, y como base de datos gratis usar Oracle Cloud "Always Free" (una VM gratis para siempre donde instalás MySQL vos mismo) o, para una demo sin datos reales, `db4free.net`. Es más trabajo de mantenimiento (vos sos responsable de backups y actualizaciones del servidor) a cambio de no tocar una sola línea de `settings.py` relacionada al motor de base de datos.

**Netlify en vez de Vercel:** mismo build command, pero el archivo de rewrites se llama `public/_redirects` (o `dist/erp-minero/browser/_redirects` si se genera post-build) con el contenido:
```
/*  /index.html  200
```

**Fly.io en vez de Render:** requiere un `Dockerfile` propio para el backend en vez de un build command declarativo — más control, más setup inicial. Recomendable solo si ya conocen Docker.

**Todo junto en Railway:** Railway puede alojar backend + Postgres + a veces hasta el frontend en un solo proyecto, pero desde que sacó el plan gratis permanente (ahora es "créditos de prueba" y después de pago) dejó de ser una opción 100% gratuita a largo plazo — sirve para prototipar rápido, no como destino final gratis.

## 11. Advertencia de seguridad: la API Key en un SPA público

Esto ya lo dice la documentación del backend, pero vale repetirlo en el contexto de un despliegue real: **`environment.prod.ts` termina compilado dentro del JavaScript que se manda al navegador de cualquier visitante.** Inyectar la API Key vía variables de entorno de build (§7) evita que quede en el *historial de git*, pero no la esconde de alguien que abra las herramientas de desarrollador del navegador — ahí va a estar en texto plano, en cualquier request a `/api/...` o directamente en el bundle.

En la práctica, esto significa que **todo el que pueda ver la app también puede leer la API Key y pegarle directo a la API** con acceso completo de lectura/escritura, sin pasar por el frontend. Es una limitación de diseño del backend (una única clave compartida, sin autenticación por usuario — ver la documentación de `GestionMinera`), no algo que este frontend pueda arreglar por su cuenta. Para un uso real con datos sensibles (DNIs, sueldos, etc.), el paso siguiente natural sería que el backend sume autenticación por usuario (tokens JWT o sesión), no que el frontend siga escondiendo mejor una clave que, por construcción, no puede quedar oculta en una SPA.

Mientras tanto, mitigaciones razonables para una primera puesta en producción:
- Restringir el acceso de red al backend si es posible (allowlist de IPs), si el uso real es desde una oficina con IP fija.
- Rotar la `API_KEY` de producción periódicamente.
- No poner en esta primera versión ningún dato que no se pueda permitir que se filtre.

## 12. Límites de los planes gratuitos, en criollo

- **Render (backend) se "duerme"**: tras ~15 minutos sin tráfico, el proceso se apaga. El próximo request lo despierta, pero esa primera respuesta tarda 30–60 segundos — el usuario va a ver la pantalla de "Cargando…" bastante más de lo normal. No es un bug del frontend.
- **Supabase se pausa tras inactividad prolongada** (alrededor de una semana sin ninguna consulta) — se reactiva sola apenas el backend vuelve a consultarla, pero esa primera consulta también puede tardar más de lo normal.
- **Ninguno de estos planes gratis tiene SLA ni soporte** — están bien para un proyecto en marcha, una demo o un primer piloto, no para algo que no se pueda permitir estar caído ocasionalmente.
- **El almacenamiento de la base es chico** (cientos de MB): de sobra para los volúmenes de este sistema (empleados, vehículos, tickets de una operación real), pero vale tenerlo en el radar si el proyecto crece mucho.
