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
];
