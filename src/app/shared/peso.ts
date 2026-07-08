/**
 * El backend guarda tara/pesoBruto/pesoNeto en kilogramos (Decimal, como
 * string). Esta conversión es puramente de presentación: no se envía al
 * servidor ni se guarda en ningún lado.
 */
export function kgATon(valorKg: string | number | null | undefined): string {
  const numero = Number(valorKg);
  if (!valorKg || Number.isNaN(numero)) {
    return '0.000';
  }
  return (numero / 1000).toFixed(3);
}
