export type CategoriaInsumo = 'cocina' | 'implemento';

export const CATEGORIAS_INSUMO: { valor: CategoriaInsumo; etiqueta: string }[] = [
  { valor: 'cocina', etiqueta: 'Cocina' },
  { valor: 'implemento', etiqueta: 'Implemento' },
];

/** Espejo de api.Insumo (GestionMinera/api/models.py). `medida` es opcional. */
export interface Insumo {
  id: number;
  nombre: string;
  categoria: CategoriaInsumo;
  medida: string | null;
}
