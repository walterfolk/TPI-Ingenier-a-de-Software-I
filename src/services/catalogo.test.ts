import { describe, it, expect } from 'vitest';
import { calcularViabilidad, CIRCUITOS_PRECARGADOS } from './catalogo';

describe('Servicio de Catálogo y Viabilidad (T04 / Etapa 2)', () => {
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
