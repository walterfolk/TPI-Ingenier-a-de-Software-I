import { describe, expect, it } from 'vitest';
import type { FiltroRecorridos } from './tipos';
import { caloriasEstimadas, cumpleFiltro, filtrarRecorridos, OPCIONES_FILTRO } from './filtros';
import { CIRCUITOS_PRECARGADOS, filtrarCircuitos } from '../services/catalogo';

const ids = (filtro: FiltroRecorridos) => filtrarCircuitos(filtro).map(c => c.id);

describe('CU-02: reglas de filtrado (RF-05, RNF-12)', () => {
  it('TC-33/RNF-12: las opciones son exactamente las preestablecidas', () => {
    expect(OPCIONES_FILTRO.distancia.map(o => o.etiqueta)).toEqual(['Hasta 5 km', 'Hasta 10 km', 'Hasta 15 km', 'Más de 15 km']);
    expect(OPCIONES_FILTRO.calorias.map(o => o.etiqueta)).toEqual(['Hasta 150 kcal', 'Hasta 300 kcal', 'Hasta 500 kcal', 'Más de 500 kcal']);
    expect(OPCIONES_FILTRO.dificultad.map(o => o.etiqueta)).toEqual(['Baja', 'Media', 'Alta']);
  });

  it('TC-35/D-30: límites acumulativos de distancia y calorías', () => {
    const km = (distanciaKm: number) => ({ distanciaKm, dificultad: 'BAJA' as const });
    expect(cumpleFiltro(km(5), { distancia: 'HASTA_5' })).toBe(true);
    expect(cumpleFiltro(km(5.1), { distancia: 'HASTA_5' })).toBe(false);
    expect(cumpleFiltro(km(5), { distancia: 'HASTA_10' })).toBe(true);
    expect(cumpleFiltro(km(15), { distancia: 'HASTA_15' })).toBe(true);
    expect(cumpleFiltro(km(15), { distancia: 'MAS_15' })).toBe(false);
    expect(cumpleFiltro(km(15.1), { distancia: 'MAS_15' })).toBe(true);
    // kcal = km × 35: 150 kcal ≈ 4.2857 km; 500 kcal ≈ 14.2857 km.
    expect(caloriasEstimadas(km(150 / 35))).toBeCloseTo(150);
    expect(cumpleFiltro(km(150 / 35), { calorias: 'HASTA_150' })).toBe(true);
    expect(cumpleFiltro(km(151 / 35), { calorias: 'HASTA_150' })).toBe(false);
    expect(cumpleFiltro(km(300 / 35), { calorias: 'HASTA_300' })).toBe(true);
    expect(cumpleFiltro(km(500 / 35), { calorias: 'HASTA_500' })).toBe(true);
    expect(cumpleFiltro(km(500 / 35), { calorias: 'MAS_500' })).toBe(false);
    expect(cumpleFiltro(km(501 / 35), { calorias: 'MAS_500' })).toBe(true);
  });

  it('TC-35: un criterio desconocido se trata como «Cualquiera»', () => {
    const raro = { distancia: 'HASTA_99', calorias: 'X', dificultad: 'EXTREMA' } as unknown as FiltroRecorridos;
    expect(filtrarRecorridos(raro, CIRCUITOS_PRECARGADOS)).toHaveLength(CIRCUITOS_PRECARGADOS.length);
  });

  it('TC-34/CA2-05: combina criterios con AND sobre el catálogo de ejemplo', () => {
    expect(ids({ distancia: 'HASTA_10', dificultad: 'MEDIA' })).toEqual(['c1', 'c5']);
    expect(ids({ calorias: 'HASTA_150' })).toEqual(['c2', 'c4']);
    expect(ids({ distancia: 'MAS_15' })).toEqual(['c8']);
    expect(ids({ distancia: 'HASTA_15', calorias: 'HASTA_500', dificultad: 'ALTA' })).toEqual(['c3', 'c6']);
  });

  it('TC-37/5.A y TC-39/D-31: sin coincidencias devuelve [] y sin criterios devuelve todo', () => {
    expect(ids({ distancia: 'HASTA_5', dificultad: 'ALTA' })).toEqual([]);
    expect(ids({})).toEqual(CIRCUITOS_PRECARGADOS.map(c => c.id));
  });

  it('D-32: el catálogo cubre todos los rangos y conserva c1–c3', () => {
    expect(CIRCUITOS_PRECARGADOS).toHaveLength(8);
    for (const o of OPCIONES_FILTRO.distancia) expect(ids({ distancia: o.valor }).length).toBeGreaterThan(0);
    for (const o of OPCIONES_FILTRO.calorias) expect(ids({ calorias: o.valor }).length).toBeGreaterThan(0);
    for (const o of OPCIONES_FILTRO.dificultad) expect(ids({ dificultad: o.valor }).length).toBeGreaterThan(0);
    expect(CIRCUITOS_PRECARGADOS.slice(0, 3).map(c => [c.id, c.distanciaKm])).toEqual([['c1', 6], ['c2', 4], ['c3', 10]]);
  });
});
