/**
 * Forma común de toda opción de un <select> que referencia otra entidad por
 * FK. Cada servicio de entidad decide cómo arma el `label` a partir de sus
 * propios campos (y, si hace falta, uniendo con otra entidad del lado del
 * cliente) mediante su método `listConLabel()` — así el formulario que
 * consume el dropdown no necesita saber nada de la entidad referenciada.
 */
export interface OpcionSelect {
  id: number;
  label: string;
}
