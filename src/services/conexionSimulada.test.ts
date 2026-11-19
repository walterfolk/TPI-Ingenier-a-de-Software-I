import { afterEach, expect, it, vi } from 'vitest';
import { crearConexionSimulada } from './conexionSimulada';
afterEach(() => vi.useRealTimers());
it('TC-11/24: tres intentos, pérdida a 9s y recuperación posterior en segundo plano', () => {
  vi.useFakeTimers();
  const notificar = vi.fn();
  const conexion = crearConexionSimulada(notificar);
  conexion.establecerDisponible(false);
  expect(notificar).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'REINTENTANDO', intentos: 0 }));
  vi.advanceTimersByTime(6000);
  expect(notificar).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'REINTENTANDO', intentos: 2 }));
  vi.advanceTimersByTime(3000);
  expect(notificar).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'SIN_TELEMETRIA', intentos: 3 }));
  vi.advanceTimersByTime(3000);
  expect(notificar).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'SIN_TELEMETRIA', intentos: 4 }));
  conexion.establecerDisponible(true);
  vi.advanceTimersByTime(3000);
  expect(notificar).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'CONECTADO', intentos: 0 }));
  conexion.detener();
});

it('TC-11: reconexión exitosa antes del límite no anuncia pérdida de telemetría', () => {
  vi.useFakeTimers(); const notificar = vi.fn();
  const conexion = crearConexionSimulada(notificar);
  conexion.establecerDisponible(false);
  vi.advanceTimersByTime(3000);
  conexion.establecerDisponible(true);
  vi.advanceTimersByTime(3000);
  expect(notificar.mock.calls.some(([e]) => e.estado === 'SIN_TELEMETRIA')).toBe(false);
  conexion.detener();
});
