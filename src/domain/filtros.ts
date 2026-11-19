import type { DificultadRecorrido, FiltroRecorridos } from './tipos';
import { CONFIG_RECORRIDO } from './config';

/** Lo mínimo que necesita el filtro de un recorrido precargado (RF-05). */
export interface RecorridoFiltrable {
  distanciaKm: number;
  dificultad: DificultadRecorrido;
}

type CriterioDistancia = NonNullable<FiltroRecorridos['distancia']>;
type CriterioCalorias = NonNullable<FiltroRecorridos['calorias']>;

/**
 * RNF-12 / D-30: rangos acumulativos. «Hasta X» es ≤ X; «Más de X» es > X.
 * Equivale a obtenerFiltros()/listaFiltros del UML y es la única fuente de opciones de la UI (CA2-03).
 */
export const OPCIONES_FILTRO = {
  distancia: [
    { valor: 'HASTA_5', etiqueta: 'Hasta 5 km' },
    { valor: 'HASTA_10', etiqueta: 'Hasta 10 km' },
    { valor: 'HASTA_15', etiqueta: 'Hasta 15 km' },
    { valor: 'MAS_15', etiqueta: 'Más de 15 km' },
  ] as { valor: CriterioDistancia; etiqueta: string }[],
  calorias: [
    { valor: 'HASTA_150', etiqueta: 'Hasta 150 kcal' },
    { valor: 'HASTA_300', etiqueta: 'Hasta 300 kcal' },
    { valor: 'HASTA_500', etiqueta: 'Hasta 500 kcal' },
    { valor: 'MAS_500', etiqueta: 'Más de 500 kcal' },
  ] as { valor: CriterioCalorias; etiqueta: string }[],
  dificultad: [
    { valor: 'BAJA', etiqueta: 'Baja' },
    { valor: 'MEDIA', etiqueta: 'Media' },
    { valor: 'ALTA', etiqueta: 'Alta' },
  ] as { valor: DificultadRecorrido; etiqueta: string }[],
};

const REGLA_DISTANCIA: Record<CriterioDistancia, (km: number) => boolean> = {
  HASTA_5: km => km <= 5,
  HASTA_10: km => km <= 10,
  HASTA_15: km => km <= 15,
  MAS_15: km => km > 15,
};

const REGLA_CALORIAS: Record<CriterioCalorias, (kcal: number) => boolean> = {
  HASTA_150: kcal => kcal <= 150,
  HASTA_300: kcal => kcal <= 300,
  HASTA_500: kcal => kcal <= 500,
  MAS_500: kcal => kcal > 500,
};

/** D-32: las kcal se derivan con la misma constante que las estimaciones de RF-06 (D-21). */
export function caloriasEstimadas(recorrido: Pick<RecorridoFiltrable, 'distanciaKm'>): number {
  return recorrido.distanciaKm * CONFIG_RECORRIDO.CALORIAS_POR_KM_KCAL;
}

/** UML cumpleFiltro(): AND de los criterios presentes; ausente o desconocido = «Cualquiera». */
export function cumpleFiltro(recorrido: RecorridoFiltrable, filtro: FiltroRecorridos): boolean {
  const reglaDistancia = filtro.distancia ? REGLA_DISTANCIA[filtro.distancia] : undefined;
  if (reglaDistancia && !reglaDistancia(recorrido.distanciaKm)) return false;
  const reglaCalorias = filtro.calorias ? REGLA_CALORIAS[filtro.calorias] : undefined;
  if (reglaCalorias && !reglaCalorias(caloriasEstimadas(recorrido))) return false;
  const dificultadValida = OPCIONES_FILTRO.dificultad.some(o => o.valor === filtro.dificultad);
  if (dificultadValida && recorrido.dificultad !== filtro.dificultad) return false;
  return true;
}

/** UML filtrarPor()/filtrarRecorridos(): conserva el orden; [] cuando no hay coincidencias (CU-02 5.A). */
export function filtrarRecorridos<T extends RecorridoFiltrable>(filtro: FiltroRecorridos, catalogo: T[]): T[] {
  return catalogo.filter(recorrido => cumpleFiltro(recorrido, filtro));
}
