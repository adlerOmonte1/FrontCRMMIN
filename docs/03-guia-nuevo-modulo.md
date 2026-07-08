# Guía: El Patrón de Módulo (y Cómo Replicarlo)

> Ver también: [Arquitectura del frontend](01-arquitectura-frontend.md) · [Flujo del código](02-flujo-codigo-frontend.md)

Los 15 recursos del backend ya están implementados en el frontend siguiendo exactamente el mismo patrón. Este documento describe esa receta — útil para modificar un módulo existente, entender por qué todos se ven iguales, o repetirla el día que el backend agregue una entidad nueva (`empleados` sigue siendo el ejemplo más simple para empezar a leer código; `tickets` y `detalles-inventario` son los más elaborados).

## Índice

1. [Los 5 pasos](#1-los-5-pasos)
2. [Ejemplo completo: módulo Vehículo](#2-ejemplo-completo-módulo-vehículo)
3. [Selects con FK y campos mutuamente excluyentes](#3-selects-con-fk-y-campos-mutuamente-excluyentes)
4. [Checklist antes de dar por terminado un módulo](#4-checklist-antes-de-dar-por-terminado-un-módulo)
5. [Tabla de referencia: los 15 recursos del backend](#5-tabla-de-referencia-los-15-recursos-del-backend)

---

## 1. Los 5 pasos

1. **Modelo** — `src/app/models/<entidad>.ts` con una interfaz que refleje **exactamente** los campos del backend (mismo nombre, mismo tipo). Ver el diccionario de datos del backend para cada entidad. Recordar: los campos `Decimal` del backend son `string` en TypeScript, no `number` (ver [Arquitectura § Manejo de datos](01-arquitectura-frontend.md#6-manejo-de-datos)). Si el backend tiene un campo `Choice`, exportar también el tipo unión y un array de opciones (ver `models/material.ts` → `TipoMaterial` / `TIPOS_MATERIAL`).
2. **Servicio** — `src/app/services/<entidad>.service.ts`, inyectando `Api` y exponiendo `list/listAll/getById/create/update/remove`. Si otra entidad va a referenciar esta por FK en un `<select>`, agregar también `listConLabel()` (ver [§3](#3-selects-con-fk-y-campos-mutuamente-excluyentes)). No agregar lógica nueva acá — si hace falta algo distinto de un CRUD estándar, probablemente el backend tampoco lo soporta.
3. **Páginas** — `src/app/pages/<módulo>/<entidad>-list/` y `.../<entidad>-form/`. El mismo `<entidad>-form` sirve para crear y editar (ver [§3](#3-selects-con-fk-y-campos-mutuamente-excluyentes)).
4. **Rutas** — tres por entidad en `app.routes.ts`, todas `loadComponent` (lazy): `recurso`, `recurso/nuevo`, `recurso/:id/editar` (esta última apunta al mismo `XForm` que `nuevo`).
5. **Navegación** — agregar el enlace en el grupo correspondiente de `core/nav-modulos.ts` (`NAV_MODULOS`), no en el HTML del shell directamente.

Ninguno de estos pasos toca `core/services/api.ts` ni `core/interceptors/api-key-interceptor.ts`: esa es la señal de que el diseño está funcionando. Si un módulo nuevo "necesita" modificar `Api`, es una alerta para revisar el diseño antes de hacerlo.

## 2. Ejemplo completo: módulo Vehículo

Usando `Vehiculo` (`placa`, `marca`, `color`, `modelo`, `tara`) como ejemplo concreto:

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
import { map } from 'rxjs/operators';

import { Api } from '@core/services/api';
import { Vehiculo } from '@models/vehiculo';
import { OpcionSelect } from '@models/opcion-select';
import { PaginatedResponse } from '@models/pagination';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private readonly api = inject(Api);
  private readonly resource = 'vehiculos';

  list(page?: number): Observable<PaginatedResponse<Vehiculo>> {
    return this.api.list<Vehiculo>(this.resource, page);
  }
  listAll(): Observable<Vehiculo[]> {
    return this.api.listAll<Vehiculo>(this.resource);
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

  /** Opciones para un <select> (usadas por Ticket/Mantenimiento al elegir un vehículo). */
  listConLabel(): Observable<OpcionSelect[]> {
    return this.listAll().pipe(
      map((vehiculos) => vehiculos.map((v) => ({ id: v.id, label: `${v.placa} — ${v.marca} ${v.modelo}` }))),
    );
  }
}
```

Nótese que es prácticamente idéntico a `EmpleadoService` — cambia el nombre de la clase, el tipo, el string de `resource` y cómo arma el `label`. Eso es intencional: es la señal de que `Api` está absorbiendo toda la complejidad real.

**3-4. Páginas y rutas:** mismo patrón que `empleado-list`/`empleado-form` (ver [Flujo del código](02-flujo-codigo-frontend.md) para el recorrido completo de `EmpleadoList`/`EmpleadoForm`), ajustando los `formControlName` a `placa`, `marca`, `color`, `modelo`, `tara`, y agregando en `app.routes.ts`:

```ts
{
  path: 'vehiculos',
  loadComponent: () => import('./pages/vehiculos/vehiculo-list/vehiculo-list').then(m => m.VehiculoList),
},
{
  path: 'vehiculos/nuevo',
  loadComponent: () => import('./pages/vehiculos/vehiculo-form/vehiculo-form').then(m => m.VehiculoForm),
},
{
  path: 'vehiculos/:id/editar',
  loadComponent: () => import('./pages/vehiculos/vehiculo-form/vehiculo-form').then(m => m.VehiculoForm),
},
```

## 3. Selects con FK y campos mutuamente excluyentes

Dos situaciones se repiten en varios módulos y vale la pena resolverlas siempre igual:

**Un formulario necesita elegir "un X" de otra entidad (FK):** inyectar el servicio de esa entidad y llamar a su `listConLabel()` en el constructor, guardando el resultado en un signal (`protected readonly empleados = signal<OpcionSelect[]>([])`). El `<select>` se recorre con `@for` sobre ese signal. El valor del `<select>` y el del `FormControl` correspondiente son siempre `string` (así funciona un `<select>` nativo del DOM); recién al armar el payload para el servicio se convierte con `Number(...)`. Ver `ConductorForm`/`TicketForm`.

**Un formulario tiene dos campos FK opcionales donde solo uno debe llenarse** (`DetalleInventario.maquina`/`.insumo`, `Mantenimiento.maquina`/`.volquete` — el backend no impone la exclusividad): agregar un signal aparte del `FormGroup` (`tipoItem`/`tipoObjetivo`) que controla cuál de los dos `<select>` se muestra, con un radio button por opción. Al guardar, mandar explícitamente `null` en el campo no elegido. Ver `DetalleInventarioForm`/`MantenimientoForm`.

**El mismo formulario sirve para crear y editar:** en el constructor, `const idEditando = route.snapshot.paramMap.get('id')`. Si no es `null`: llamar a `servicio.getById(Number(idEditando))`, convertir a `string` los campos FK antes de `formulario.patchValue(...)`, y en `guardar()` llamar a `servicio.update(id, payload)` en vez de `create(payload)`. Todo lo demás (validación, plantilla) es idéntico entre alta y edición — por eso es un solo componente, no dos.

## 4. Checklist antes de dar por terminado un módulo

- [ ] El modelo tiene los mismos campos, con los mismos nombres, que el backend (revisar `models.py` o el diccionario de datos, no solo el serializer).
- [ ] Los campos `Decimal` del backend están tipados como `string` en el modelo TypeScript.
- [ ] Si otra entidad va a referenciar esta por FK, el servicio tiene `listConLabel()`.
- [ ] Si la entidad tiene una FK opcional en pares como `maquina`/`insumo` o `maquina`/`volquete`, el formulario refuerza en el cliente la regla de "uno u otro" que el backend no valida.
- [ ] Si la entidad es una "cabecera" de un patrón cabecera-detalle (`Inventario`, `Requerimientos`), considerar si el flujo de creación debe llevar directo a agregar el primer detalle (como hace `RequerimientoForm`).
- [ ] El servicio no depende de filtrado por query params del backend (no existe).
- [ ] El formulario soporta edición (`:id/editar` apunta al mismo componente que `nuevo`) y la lista tiene su link "Editar".
- [ ] Las rutas nuevas usan `loadComponent` (lazy), no importan el componente de forma directa/eager.
- [ ] El enlace de navegación está en `core/nav-modulos.ts`, agrupado en el módulo de negocio correcto.

## 5. Tabla de referencia: los 15 recursos del backend

| Entidad (modelo) | `resource` (URL) | Servicio | Estado |
|---|---|---|---|
| `Empleado` | `empleados` | `EmpleadoService` | ✅ Implementado (referencia) |
| `Conductor` | `conductores` | `ConductorService` | ✅ Implementado |
| `Vehiculo` | `vehiculos` | `VehiculoService` | ✅ Implementado |
| `Encargado` | `encargados` | `EncargadoService` | ✅ Implementado |
| `Material` | `materiales` | `MaterialService` | ✅ Implementado |
| `Ticket` | `tickets` | `TicketService` | ✅ Implementado (`pesoNeto` es de solo lectura, no se envía al crear/editar) |
| `GastoViaje` | `gastos_viaje` | `GastoViajeService` | ✅ Implementado |
| `Inventario` | `inventario` | `InventarioService` | ✅ Implementado (cabecera) |
| `DetalleInventario` | `detalle_inventario` | `DetalleInventarioService` | ✅ Implementado (detalle; exclusividad máquina/insumo) |
| `Maquina` | `maquinas` | `MaquinaService` | ✅ Implementado |
| `Insumo` | `insumos` | `InsumoService` | ✅ Implementado |
| `Mantenimiento` | `mantenimientos` | `MantenimientoService` | ✅ Implementado (exclusividad máquina/volquete) |
| `Reporte` | `reportes` | `ReporteService` | ✅ Implementado (`fecha` es `auto_now`, se reescribe en cada edición) |
| `Requerimientos` | `requerimientos` | `RequerimientoService` | ✅ Implementado (cabecera; `fecha` también es `auto_now`) |
| `DetalleRequerimientos` | `detalle_requerimientos` | `DetalleRequerimientoService` | ✅ Implementado (detalle) |



