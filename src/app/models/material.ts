export type TipoMaterial = 'sulfuro' | 'oxido';

export const TIPOS_MATERIAL: { valor: TipoMaterial; etiqueta: string }[] = [
  { valor: 'sulfuro', etiqueta: 'Sulfuro' },
  { valor: 'oxido', etiqueta: 'Óxido' },
];

/** Espejo de api.Material (GestionMinera/api/models.py). */
export interface Material {
  id: number;
  nombre: string;
  lugar: string;
  tipo: TipoMaterial;
}
