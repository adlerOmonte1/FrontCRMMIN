# Guía: Cómo Agregar un Módulo Nuevo

> Ver también: [Arquitectura del frontend](01-arquitectura-frontend.md) · [Flujo del código](02-flujo-codigo-frontend.md)

`empleados` es el módulo de referencia. Esta guía es la receta para repetir exactamente ese patrón con cualquiera de las 14 entidades restantes del backend, sin tener que releer la arquitectura desde cero cada vez.

## Índice

1. [Los 5 pasos](#1-los-5-pasos)
2. [Ejemplo completo: módulo Vehículo](#2-ejemplo-completo-módulo-vehículo)
3. [Checklist antes de dar por terminado un módulo](#3-checklist-antes-de-dar-por-terminado-un-módulo)
4. [Tabla de referencia: los 15 recursos del backend](#4-tabla-de-referencia-los-15-recursos-del-backend)

---

## 1. Los 5 pasos

1. **Modelo** — crear `src/app/models/<entidad>.ts` con una interfaz que refleje **exactamente** los campos del backend (mismo nombre, mismo tipo). Ver el diccionario de datos del backend para cada entidad. Recordar: los campos `Decimal` del backend son `string` en TypeScript, no `number` (ver [Arquitectura § Manejo de datos](01-arquitectura-frontend.md#6-manejo-de-datos)).
2. **Servicio** — crear `src/app/services/<entidad>.service.ts`, copiando la forma de `empleado.service.ts`: inyectar `Api`, fijar `resource`, exponer `list/getById/create/update/remove`. No agregar lógica nueva acá — si hace falta algo distinto de un CRUD estándar, probablemente el backend tampoco lo soporta (ver limitaciones conocidas del backend antes de asumir que hay un endpoint especial).
3. **Páginas** — crear `src/app/pages/<módulo>/<entidad>-list/` y `.../​<entidad>-form/`, copiando `empleado-list` y `empleado-form` como plantilla y ajustando los campos del formulario a los de la nueva entidad.
4. **Rutas** — agregar las dos rutas nuevas en `app.routes.ts`, con `loadComponent` (lazy), igual que las de empleados.
5. **Navegación** (opcional, cuando haya más de un módulo visible a la vez) — agregar el link a la nueva sección en el shell de la app (`app.html`).

Ninguno de estos pasos toca `core/` (`Api`, `apiKeyInterceptor`): esa es la señal de que el diseño está funcionando. Si en algún momento un módulo nuevo "necesita" modificar `Api`, es una alerta para revisar el diseño antes de hacerlo.

## 2. Ejemplo completo: módulo Vehículo

Usando `Vehiculo` (`placa`, `marca`, `color`, `modelo`, `tara`) como ejemplo concreto de los 5 pasos:

**1. `models/vehiculo.ts`**

```ts
export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  color: string;
  modelo: string;
  tara: string; // Decimal del backend -> string, no number
}
```

**2. `services/vehiculo.service.ts`**

```ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '@core/services/api';
import { Vehiculo } from '@models/vehiculo';
import { PaginatedResponse } from '@models/pagination';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private readonly api = inject(Api);
  private readonly resource = 'vehiculos';

  list(page?: number): Observable<PaginatedResponse<Vehiculo>> {
    return this.api.list<Vehiculo>(this.resource, page);
  }
  getById(id: number): Observable<Vehiculo> {
    return this.api.getById<Vehiculo>(this.resource, id);
  }
  create(vehiculo: Omit<Vehiculo, 'id'>): Observable<Vehiculo> {
    return this.api.create<Vehiculo>(this.resource, vehiculo);
  }
  update(id: number, vehiculo: Omit<Vehiculo, 'id'>): Observable<Vehiculo> {
    return this.api.update<Vehiculo>(this.resource, id, vehiculo);
  }
  remove(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
```

Nótese que es prácticamente idéntico a `EmpleadoService` — cambia el nombre de la clase, el tipo, y el string de `resource`. Eso es intencional: es la señal de que `Api` está absorbiendo toda la complejidad real.

**3-4. Páginas y rutas:** mismo patrón que `empleado-list`/`empleado-form`, ajustando los `formControlName` del formulario a `placa`, `marca`, `color`, `modelo`, `tara`, y agregando en `app.routes.ts`:

```ts
{
  path: 'vehiculos',
  loadComponent: () => import('./pages/vehiculos/vehiculo-list/vehiculo-list').then(m => m.VehiculoList),
},
{
  path: 'vehiculos/nuevo',
  loadComponent: () => import('./pages/vehiculos/vehiculo-form/vehiculo-form').then(m => m.VehiculoForm),
},
```

## 3. Checklist antes de dar por terminado un módulo

- [ ] El modelo tiene los mismos campos, con los mismos nombres, que el backend (revisar `models.py` o el diccionario de datos, no solo el serializer).
- [ ] Los campos `Decimal` del backend están tipados como `string` en el modelo TypeScript.
- [ ] Si la entidad tiene una FK opcional en pares como `maquina`/`insumo` o `maquina`/`volquete`, el formulario refuerza en el cliente la regla de "uno u otro" que el backend no valida (ver la nota del backend sobre esto en su diccionario de datos).
- [ ] Si la entidad es una "cabecera" de un patrón cabecera-detalle (`Inventario`, `Requerimientos`), el flujo de creación guarda el `id` devuelto por el primer `POST` antes de crear los detalles.
- [ ] El servicio no depende de filtrado por query params del backend (no existe, ver [Arquitectura § Manejo de datos](01-arquitectura-frontend.md#6-manejo-de-datos)).
- [ ] Las rutas nuevas usan `loadComponent` (lazy), no importan el componente de forma directa/eager.

## 4. Tabla de referencia: los 15 recursos del backend

Para mantener consistencia, usar exactamente estos nombres de recurso (coinciden con `GestionMinera/requerimientos/urls.py`) al fijar `resource` en cada servicio:

| Entidad (modelo) | `resource` (URL) | Servicio sugerido | Estado |
|---|---|---|---|
| `Empleado` | `empleados` | `EmpleadoService` | ✅ Implementado (referencia) |
| `Conductor` | `conductores` | `ConductorService` | ⬜ Pendiente |
| `Vehiculo` | `vehiculos` | `VehiculoService` | ⬜ Pendiente |
| `Encargado` | `encargados` | `EncargadoService` | ⬜ Pendiente |
| `Material` | `materiales` | `MaterialService` | ⬜ Pendiente |
| `Ticket` | `tickets` | `TicketService` | ⬜ Pendiente (recordar: `pesoNeto` es de solo lectura, no enviarlo al crear) |
| `GastoViaje` | `gastos_viaje` | `GastoViajeService` | ⬜ Pendiente |
| `Inventario` | `inventario` | `InventarioService` | ⬜ Pendiente (cabecera) |
| `DetalleInventario` | `detalle_inventario` | `DetalleInventarioService` | ⬜ Pendiente (detalle) |
| `Maquina` | `maquinas` | `MaquinaService` | ⬜ Pendiente |
| `Insumo` | `insumos` | `InsumoService` | ⬜ Pendiente |
| `Mantenimiento` | `mantenimientos` | `MantenimientoService` | ⬜ Pendiente |
| `Reporte` | `reportes` | `ReporteService` | ⬜ Pendiente (`fecha` es `auto_now`, se reescribe en cada edición) |
| `Requerimientos` | `requerimientos` | `RequerimientoService` | ⬜ Pendiente (cabecera; `fecha` también es `auto_now`) |
| `DetalleRequerimientos` | `detalle_requerimientos` | `DetalleRequerimientoService` | ⬜ Pendiente (detalle) |
