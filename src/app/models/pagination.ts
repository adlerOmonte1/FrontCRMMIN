/**
 * Forma exacta de toda respuesta de listado de la API (PageNumberPagination
 * de Django REST Framework, PAGE_SIZE=20). Genérica porque los 15 recursos
 * del backend la comparten sin variación.
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
