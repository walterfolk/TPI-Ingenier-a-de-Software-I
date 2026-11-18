import { CondicionClima } from './tipos';
import { CONFIG_RECORRIDO } from './config';

/**
 * Evalúa si una condición climática es adversa (D-04, sección 6.3).
 * Climas adversos: LLUVIA, VIENTO_FUERTE, TORMENTA.
 */
export function esClimaAdverso(clima: CondicionClima): boolean {
  return (CONFIG_RECORRIDO.CLIMAS_ADVERSOS as readonly string[]).includes(clima);
}

/**
 * Evalúa si el nivel de batería es bajo (D-19, RNF-09, sección 6.3).
 * Batería baja: porcentaje menor o igual a 20 %.
 */
export function bateriaBaja(bateriaPct: number): boolean {
  return bateriaPct <= CONFIG_RECORRIDO.UMBRAL_BATERIA_BAJA_PCT;
}

/**
 * Evalúa si la frecuencia cardíaca excede el umbral máximo recomendado (D-05, sección 6.3).
 * Excedida: valor estrictamente superior a 160 bpm (y solo con smartwatch vinculado).
 */
export function frecuenciaExcedida(frecuenciaBpm: number, smartwatchVinculado: boolean): boolean {
  if (!smartwatchVinculado) {
    return false;
  }
  return frecuenciaBpm > CONFIG_RECORRIDO.UMBRAL_FRECUENCIA_CARDIACA_BPM;
}

/**
 * Evalúa si el recorrido cumple los mínimos para ser guardado en el historial (D-08, RNF-10, sección 6.3).
 * Mínimos: distancia acumulada >= 300 metros O tiempo de marcha (sin pausas) >= 180 segundos.
 * @param distanciaMetros Distancia recorrida en metros.
 * @param tiempoMarchaSeg Tiempo de marcha (sin pausas) en segundos.
 */
export function cumpleMinimos(distanciaMetros: number, tiempoMarchaSeg: number): boolean {
  const cumpleDistancia = distanciaMetros >= CONFIG_RECORRIDO.MINIMO_DISTANCIA_METROS;
  const cumpleTiempo = tiempoMarchaSeg >= CONFIG_RECORRIDO.MINIMO_TIEMPO_MARCHA_SEG;
  return cumpleDistancia || cumpleTiempo;
}
