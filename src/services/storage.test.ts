import { afterEach, expect, it, vi } from 'vitest';
import { guardarRecorridoHistorial, obtenerHistorialRecorridos, obtenerProgresoCurso } from './storage';
import type { RecorridoGuardado } from '../domain/tipos';
afterEach(() => vi.restoreAllMocks());
const recorrido = (): RecorridoGuardado => ({ version: 1, id: 'prueba', modalidad: 'LIBRE', fechaHoraInicio: new Date().toISOString(), distanciaKm: 0.3, tiempoActivoSeg: 36, velocidadPromedioKmh: 30, caloriasConsumidas: 10.5, bateriaInicial: 80, bateriaFinal: 78.8, alertas: [] });
it('TC-16/21: conserva historial previo y evita doble guardado por ID', () => {
  guardarRecorridoHistorial({ ...recorrido(), id: 'anterior' });
  expect(guardarRecorridoHistorial(recorrido()).ok).toBe(true);
  expect(guardarRecorridoHistorial(recorrido()).ok).toBe(true);
  expect(obtenerHistorialRecorridos().map(r => r.id)).toEqual(['prueba', 'anterior']);
});
it.each(['{', '{}', '[{}]'])('TC-22: lectura tolerante a %s sin sobrescribir registros dañados', texto => {
  localStorage.setItem('triciclos.historial.v1', texto);
  expect(obtenerHistorialRecorridos()).toEqual([]);
  expect(guardarRecorridoHistorial(recorrido()).ok).toBe(false);
  expect(localStorage.getItem('triciclos.historial.v1')).toBe(texto);
  localStorage.setItem('triciclos.recorridoEnCurso.v1', texto);
  expect(obtenerProgresoCurso()).toBeNull();
});
it('TC-16/22: cuota agotada y métricas inválidas devuelven fallo explícito', () => {
  expect(guardarRecorridoHistorial({ ...recorrido(), distanciaKm: NaN }).ok).toBe(false);
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('Cuota agotada', 'QuotaExceededError'); });
  expect(guardarRecorridoHistorial(recorrido()).ok).toBe(false);
});
