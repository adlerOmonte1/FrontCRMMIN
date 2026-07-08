/**
 * Estructura del menú de navegación, agrupada por módulo de negocio tal
 * como los define la documentación del backend (GestionMinera/docs/01-
 * proyecto.md § Módulos funcionales). Vive en core/ porque es
 * configuración del shell de la app, no de ningún módulo en particular.
 *
 * "Detalles de inventario" e "Ítems solicitados" (detalle de Requerimientos)
 * a propósito no tienen entrada acá: solo tienen sentido dentro de un
 * Inventario/Requerimiento puntual, así que se llega a ellos con el botón
 * "Ver detalles"/"Ver ítems" de cada fila, no como sección aparte del menú.
 */
export interface EnlaceNav {
  ruta: string;
  etiqueta: string;
}

export interface GrupoNav {
  titulo: string;
  enlaces: EnlaceNav[];
}

export const NAV_MODULOS: GrupoNav[] = [
  {
    titulo: 'Personal y flota',
    enlaces: [
      { ruta: '/empleados', etiqueta: 'Empleados' },
      { ruta: '/conductores', etiqueta: 'Conductores' },
      { ruta: '/encargados', etiqueta: 'Encargados' },
      { ruta: '/vehiculos', etiqueta: 'Vehículos' },
    ],
  },
  {
    titulo: 'Pesaje y transporte',
    enlaces: [
      { ruta: '/materiales', etiqueta: 'Materiales' },
      { ruta: '/tickets', etiqueta: 'Tickets' },
      { ruta: '/gastos-viaje', etiqueta: 'Gastos de viaje' },
    ],
  },
  {
    titulo: 'Inventario',
    enlaces: [
      { ruta: '/inventarios', etiqueta: 'Inventarios' },
      { ruta: '/maquinas', etiqueta: 'Máquinas' },
      { ruta: '/insumos', etiqueta: 'Insumos' },
    ],
  },
  {
    titulo: 'Mantenimiento',
    enlaces: [{ ruta: '/mantenimientos', etiqueta: 'Mantenimientos' }],
  },
  {
    titulo: 'Reportes',
    enlaces: [{ ruta: '/reportes', etiqueta: 'Reportes' }],
  },
  {
    titulo: 'Requerimientos',
    enlaces: [{ ruta: '/requerimientos', etiqueta: 'Requerimientos' }],
  },
];
