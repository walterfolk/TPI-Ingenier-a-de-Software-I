import { describe, it, expect } from 'vitest';
import { esClimaAdverso, bateriaBaja, frecuenciaExcedida, cumpleMinimos } from './reglas';
import { CondicionClima } from './tipos';

describe('Reglas de negocio (T03 / RFC)', () => {
  it('TC-08/25: lluvia y viento solo elevados; tormenta/escarcha siempre adversos', () => {
    for (const clima of ['LLUVIA', 'VIENTO'] as const) {
      expect(esClimaAdverso(clima, 'NORMAL')).toBe(false);
      expect(esClimaAdverso(clima, 'ELEVADA')).toBe(true);
    }
    expect(esClimaAdverso('ESCARCHA_HIELO')).toBe(true);
    expect(esClimaAdverso('TORMENTA')).toBe(true);
  });
  describe('esClimaAdverso (D-04, TC-08)', () => {
    it('identifica correctamente los climas adversos', () => {
      expect(esClimaAdverso("LLUVIA", "ELEVADA")).toBe(true);
      expect(esClimaAdverso("VIENTO_FUERTE")).toBe(true);
      expect(esClimaAdverso("TORMENTA")).toBe(true);
    });

    it('identifica correctamente los climas no adversos', () => {
      expect(esClimaAdverso("DESPEJADO")).toBe(false);
      expect(esClimaAdverso("NUBLADO")).toBe(false);
    });
  });

  describe('bateriaBaja (RNF-09, D-19, TC-04)', () => {
    it('detecta batería baja por debajo y exactamente en el umbral del 20%', () => {
      expect(bateriaBaja(15)).toBe(true);
      expect(bateriaBaja(20)).toBe(true);
    });

    it('no detecta batería baja por encima del 20%', () => {
      expect(bateriaBaja(21)).toBe(false);
      expect(bateriaBaja(80)).toBe(false);
    });
  });

  describe('frecuenciaExcedida (RF-07, D-05, TC-09)', () => {
    it('detecta frecuencia cardíaca excedida estrictamente superior a 160 bpm solo con smartwatch vinculado', () => {
      expect(frecuenciaExcedida(165, true)).toBe(true);
    });

    it('no detecta frecuencia excedida en 160 bpm exactos o por debajo, ni sin smartwatch', () => {
      expect(frecuenciaExcedida(160, true)).toBe(false);
      expect(frecuenciaExcedida(150, true)).toBe(false);
      expect(frecuenciaExcedida(165, false)).toBe(false); // Sin smartwatch vinculado
    });
  });

  describe('cumpleMinimos (RNF-10, D-08, TC-16, TC-17)', () => {
    it('cumple mínimos únicamente por distancia (>= 300 m)', () => {
      // 300 m (0.3 km expresado en metros) y 100 s de tiempo (< 180 s)
      expect(cumpleMinimos(300, 100)).toBe(true);
      expect(cumpleMinimos(400, 100)).toBe(true);
    });

    it('cumple mínimos únicamente por tiempo de marcha (>= 180 s sin pausas)', () => {
      // 100 m (< 300 m) y 180 s de tiempo de marcha
      expect(cumpleMinimos(100, 180)).toBe(true);
      expect(cumpleMinimos(100, 200)).toBe(true);
    });

    it('cumple mínimos cuando se cumplen ambas condiciones', () => {
      expect(cumpleMinimos(400, 200)).toBe(true);
    });

    it('no cumple mínimos cuando ninguna condición se alcanza (casos de descarte)', () => {
      // 299 m y 179 s
      expect(cumpleMinimos(299, 179)).toBe(false);
      expect(cumpleMinimos(200, 100)).toBe(false);
    });

    it('verifica casos de frontera exactos para 300 metros y 180 segundos', () => {
      expect(cumpleMinimos(300, 0)).toBe(true);
      expect(cumpleMinimos(0, 180)).toBe(true);
      expect(cumpleMinimos(299, 179)).toBe(false);
    });
  });
});
