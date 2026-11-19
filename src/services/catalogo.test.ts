import { describe, it, expect } from 'vitest';
import { calcularViabilidad, validarSeleccion, CIRCUITOS_PRECARGADOS } from './catalogo';

describe('Servicio de Catálogo y Viabilidad (T04 / Etapa 2)', () => {
  it('TC-03: rechaza puntos ausentes, desconocidos y el mismo punto expresado por ID/nombre', () => {
    for (const config of [
      { modalidad: 'PERSONALIZADO' as const },
      { modalidad: 'PERSONALIZADO' as const, origen: 'p1', destino: 'inexistente' },
      { modalidad: 'PERSONALIZADO' as const, origen: 'p1', destino: 'Campus Universitario UNTDF' },
      { modalidad: 'PRECARGADO' as const },
      { modalidad: 'PRECARGADO' as const, circuitoId: 'inexistente' },
    ]) {
      expect(validarSeleccion(config)).toBeTruthy();
      expect(calcularViabilidad(config).esViable).toBe(false);
    }
  });

  it('TC-03: no confunde autonomía insuficiente con selección inválida', () => {
    const ruta = { modalidad: 'PRECARGADO' as const, circuitoId: 'c1' };
    expect(validarSeleccion(ruta)).toBeUndefined();
    expect(calcularViabilidad(ruta, 10).esViable).toBe(false);
    expect(calcularViabilidad({ modalidad: 'PERSONALIZADO', origen: 'p1', destino: 'p3' }).distanciaKm).toBe(5);
  });
  it('calcula viabilidad para modalidad Libre', () => {
    const v = calcularViabilidad({ modalidad: 'LIBRE' }, 80);
    expect(v.esViable).toBe(true);
    expect(v.distanciaKm).toBe(0);
  });

  it('detecta origen igual a destino en Destino Personalizado', () => {
    const v = calcularViabilidad({
      modalidad: 'PERSONALIZADO',
      origen: 'Campus Universitario UNTDF',
      destino: 'Campus Universitario UNTDF',
    }, 80);
    expect(v.esViable).toBe(false);
    expect(v.motivoNoViable).toBe('Origen igual a destino');
  });

  it('calcula correctamente viabilidad para Recorrido Precargado de 6 km', () => {
    const v = calcularViabilidad({
      modalidad: 'PRECARGADO',
      circuitoId: 'c1',
    }, 80);
    expect(v.esViable).toBe(true);
    expect(v.distanciaKm).toBe(6.0);
    expect(v.tiempoEstimadoMin).toBe(30);
    expect(v.consumoBateriaPct).toBe(24);
    expect(v.caloriasKcal).toBe(210);
  });
});
