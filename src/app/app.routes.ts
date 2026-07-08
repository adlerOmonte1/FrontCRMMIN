import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'empleados' },

  // Personal y flota
  {
    path: 'empleados',
    loadComponent: () =>
      import('./pages/empleados/empleado-list/empleado-list').then((m) => m.EmpleadoList),
  },
  {
    path: 'empleados/nuevo',
    loadComponent: () =>
      import('./pages/empleados/empleado-form/empleado-form').then((m) => m.EmpleadoForm),
  },
  {
    path: 'empleados/:id/editar',
    loadComponent: () =>
      import('./pages/empleados/empleado-form/empleado-form').then((m) => m.EmpleadoForm),
  },
  {
    path: 'conductores',
    loadComponent: () =>
      import('./pages/conductores/conductor-list/conductor-list').then((m) => m.ConductorList),
  },
  {
    path: 'conductores/nuevo',
    loadComponent: () =>
      import('./pages/conductores/conductor-form/conductor-form').then((m) => m.ConductorForm),
  },
  {
    path: 'conductores/:id/editar',
    loadComponent: () =>
      import('./pages/conductores/conductor-form/conductor-form').then((m) => m.ConductorForm),
  },
  {
    path: 'encargados',
    loadComponent: () =>
      import('./pages/encargados/encargado-list/encargado-list').then((m) => m.EncargadoList),
  },
  {
    path: 'encargados/nuevo',
    loadComponent: () =>
      import('./pages/encargados/encargado-form/encargado-form').then((m) => m.EncargadoForm),
  },
  {
    path: 'encargados/:id/editar',
    loadComponent: () =>
      import('./pages/encargados/encargado-form/encargado-form').then((m) => m.EncargadoForm),
  },
  {
    path: 'vehiculos',
    loadComponent: () =>
      import('./pages/vehiculos/vehiculo-list/vehiculo-list').then((m) => m.VehiculoList),
  },
  {
    path: 'vehiculos/nuevo',
    loadComponent: () =>
      import('./pages/vehiculos/vehiculo-form/vehiculo-form').then((m) => m.VehiculoForm),
  },
  {
    path: 'vehiculos/:id/editar',
    loadComponent: () =>
      import('./pages/vehiculos/vehiculo-form/vehiculo-form').then((m) => m.VehiculoForm),
  },

  // Pesaje y transporte
  {
    path: 'materiales',
    loadComponent: () =>
      import('./pages/materiales/material-list/material-list').then((m) => m.MaterialList),
  },
  {
    path: 'materiales/nuevo',
    loadComponent: () =>
      import('./pages/materiales/material-form/material-form').then((m) => m.MaterialForm),
  },
  {
    path: 'materiales/:id/editar',
    loadComponent: () =>
      import('./pages/materiales/material-form/material-form').then((m) => m.MaterialForm),
  },
  {
    path: 'tickets',
    loadComponent: () => import('./pages/tickets/ticket-list/ticket-list').then((m) => m.TicketList),
  },
  {
    path: 'tickets/nuevo',
    loadComponent: () => import('./pages/tickets/ticket-form/ticket-form').then((m) => m.TicketForm),
  },
  {
    path: 'tickets/:id/editar',
    loadComponent: () => import('./pages/tickets/ticket-form/ticket-form').then((m) => m.TicketForm),
  },
  {
    path: 'gastos-viaje',
    loadComponent: () =>
      import('./pages/gastos-viaje/gasto-viaje-list/gasto-viaje-list').then((m) => m.GastoViajeList),
  },
  {
    path: 'gastos-viaje/nuevo',
    loadComponent: () =>
      import('./pages/gastos-viaje/gasto-viaje-form/gasto-viaje-form').then((m) => m.GastoViajeForm),
  },
  {
    path: 'gastos-viaje/:id/editar',
    loadComponent: () =>
      import('./pages/gastos-viaje/gasto-viaje-form/gasto-viaje-form').then((m) => m.GastoViajeForm),
  },

  // Inventario
  {
    path: 'inventarios',
    loadComponent: () =>
      import('./pages/inventarios/inventario-list/inventario-list').then((m) => m.InventarioList),
  },
  {
    path: 'inventarios/nuevo',
    loadComponent: () =>
      import('./pages/inventarios/inventario-form/inventario-form').then((m) => m.InventarioForm),
  },
  {
    path: 'inventarios/:id/editar',
    loadComponent: () =>
      import('./pages/inventarios/inventario-form/inventario-form').then((m) => m.InventarioForm),
  },
  {
    path: 'inventarios/:idInventario/detalles',
    loadComponent: () =>
      import('./pages/detalles-inventario/detalle-inventario-list/detalle-inventario-list').then(
        (m) => m.DetalleInventarioList,
      ),
  },
  {
    path: 'inventarios/:idInventario/detalles/nuevo',
    loadComponent: () =>
      import('./pages/detalles-inventario/detalle-inventario-form/detalle-inventario-form').then(
        (m) => m.DetalleInventarioForm,
      ),
  },
  {
    path: 'inventarios/:idInventario/detalles/:id/editar',
    loadComponent: () =>
      import('./pages/detalles-inventario/detalle-inventario-form/detalle-inventario-form').then(
        (m) => m.DetalleInventarioForm,
      ),
  },
  {
    path: 'maquinas',
    loadComponent: () => import('./pages/maquinas/maquina-list/maquina-list').then((m) => m.MaquinaList),
  },
  {
    path: 'maquinas/nuevo',
    loadComponent: () => import('./pages/maquinas/maquina-form/maquina-form').then((m) => m.MaquinaForm),
  },
  {
    path: 'maquinas/:id/editar',
    loadComponent: () => import('./pages/maquinas/maquina-form/maquina-form').then((m) => m.MaquinaForm),
  },
  {
    path: 'insumos',
    loadComponent: () => import('./pages/insumos/insumo-list/insumo-list').then((m) => m.InsumoList),
  },
  {
    path: 'insumos/nuevo',
    loadComponent: () => import('./pages/insumos/insumo-form/insumo-form').then((m) => m.InsumoForm),
  },
  {
    path: 'insumos/:id/editar',
    loadComponent: () => import('./pages/insumos/insumo-form/insumo-form').then((m) => m.InsumoForm),
  },

  // Mantenimiento
  {
    path: 'mantenimientos',
    loadComponent: () =>
      import('./pages/mantenimientos/mantenimiento-list/mantenimiento-list').then(
        (m) => m.MantenimientoList,
      ),
  },
  {
    path: 'mantenimientos/nuevo',
    loadComponent: () =>
      import('./pages/mantenimientos/mantenimiento-form/mantenimiento-form').then(
        (m) => m.MantenimientoForm,
      ),
  },
  {
    path: 'mantenimientos/:id/editar',
    loadComponent: () =>
      import('./pages/mantenimientos/mantenimiento-form/mantenimiento-form').then(
        (m) => m.MantenimientoForm,
      ),
  },

  // Reportes
  {
    path: 'reportes',
    loadComponent: () => import('./pages/reportes/reporte-list/reporte-list').then((m) => m.ReporteList),
  },
  {
    path: 'reportes/nuevo',
    loadComponent: () => import('./pages/reportes/reporte-form/reporte-form').then((m) => m.ReporteForm),
  },
  {
    path: 'reportes/:id/editar',
    loadComponent: () => import('./pages/reportes/reporte-form/reporte-form').then((m) => m.ReporteForm),
  },

  // Requerimientos
  {
    path: 'requerimientos',
    loadComponent: () =>
      import('./pages/requerimientos/requerimiento-list/requerimiento-list').then(
        (m) => m.RequerimientoList,
      ),
  },
  {
    path: 'requerimientos/nuevo',
    loadComponent: () =>
      import('./pages/requerimientos/requerimiento-form/requerimiento-form').then(
        (m) => m.RequerimientoForm,
      ),
  },
  {
    path: 'requerimientos/:id/editar',
    loadComponent: () =>
      import('./pages/requerimientos/requerimiento-form/requerimiento-form').then(
        (m) => m.RequerimientoForm,
      ),
  },
  {
    path: 'requerimientos/:idRequerimiento/items',
    loadComponent: () =>
      import('./pages/detalles-requerimiento/detalle-requerimiento-list/detalle-requerimiento-list').then(
        (m) => m.DetalleRequerimientoList,
      ),
  },
  {
    path: 'requerimientos/:idRequerimiento/items/nuevo',
    loadComponent: () =>
      import('./pages/detalles-requerimiento/detalle-requerimiento-form/detalle-requerimiento-form').then(
        (m) => m.DetalleRequerimientoForm,
      ),
  },
  {
    path: 'requerimientos/:idRequerimiento/items/:id/editar',
    loadComponent: () =>
      import('./pages/detalles-requerimiento/detalle-requerimiento-form/detalle-requerimiento-form').then(
        (m) => m.DetalleRequerimientoForm,
      ),
  },
];
