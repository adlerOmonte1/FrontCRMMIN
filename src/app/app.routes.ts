import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'empleados' },

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
    path: 'vehiculos',
    loadComponent: () =>
      import('./pages/vehiculos/vehiculo-list/vehiculo-list').then((m) => m.VehiculoList),
  },
  {
    path: 'vehiculos/nuevo',
    loadComponent: ()=>
      import('./pages/vehiculos/vehiculo-form/vehiculo-form').then((m)=>m.VehiculoForm),
  }
];
