import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useRecorrido, type PantallaSeguimientoProps } from './useRecorrido';

function opciones(): PantallaSeguimientoProps {
  return { bateriaPct: 80, setBateriaPct: vi.fn(), climaActual: 'DESPEJADO',
    smartwatchVinculado: true, frecuenciaCardiaca: 125, bluetoothSincronizado: true,
    velocidadSimulada: 12, modalidad: 'LIBRE', onFinalizarRecorridoGuardado: vi.fn(), onCancelarOdescartar: vi.fn() };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('TC-12/13/14: integra transiciones y conserva marcha en emergencia, pausa congela', () => {
  const { result } = renderHook(() => useRecorrido(opciones()));
  expect(result.current.estado).toBe('EN_CURSO');
  act(() => result.current.handlePausar());
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.tiempoActivoSeg).toBe(0);
  act(() => result.current.handleReanudar());
  act(() => result.current.handleEmergencia());
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.estado).toBe('EMERGENCIA');
  expect(result.current.tiempoActivoSeg).toBe(1);
  act(() => result.current.handleCancelarEmergencia());
  expect(result.current.estado).toBe('EN_CURSO');
});

it('TC-15/17: FINALIZANDO mantiene marcha; volver no finaliza y confirmar descarte sí', () => {
  const opts = opciones();
  const { result } = renderHook(() => useRecorrido(opts));
  act(() => result.current.handleSolicitarFin());
  expect(result.current.estado).toBe('FINALIZANDO');
  expect(result.current.mostrarModalFin).toBe(true);
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.tiempoActivoSeg).toBe(1);
  act(() => result.current.handleRechazarFin());
  expect(result.current.estado).toBe('EN_CURSO');
  expect(opts.onCancelarOdescartar).not.toHaveBeenCalled();
  act(() => result.current.handleSolicitarFin());
  act(() => result.current.handleConfirmarFinInvalido());
  expect(result.current.estado).toBe('DESCARTADO');
  expect(opts.onCancelarOdescartar).toHaveBeenCalledTimes(1);
});

it('TC-05/12/21: recupera tiempo demorado, congela pausas y acumula distancia/kcal coherentes', () => {
  const { result } = renderHook(() => useRecorrido(opciones()));
  const inicio = Date.now();
  act(() => { vi.setSystemTime(inicio + 29000); vi.advanceTimersByTime(1000); });
  expect(result.current.tiempoActivoSeg).toBe(30);
  expect(result.current.distanciaMetros).toBeCloseTo(100);
  expect(result.current.caloriasConsumidas).toBeCloseTo(3.5);
  act(() => result.current.handlePausar());
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.tiempoActivoSeg).toBe(30);
  expect(result.current.distanciaMetros).toBeCloseTo(100);
  act(() => result.current.handleReanudar());
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.tiempoActivoSeg).toBe(31);
});

it('TC-08/09/10: reconoce sin cortar asistencia, rearma por condición y limpia al desvincular', () => {
  const opts = opciones();
  const { result, rerender } = renderHook(p => useRecorrido(p), { initialProps: opts });
  rerender({ ...opts, bateriaPct: 19 });
  expect(result.current.alertas).toHaveLength(1);
  act(() => result.current.confirmarAlerta('bateria'));
  rerender({ ...opts, bateriaPct: 18 });
  expect(result.current.alertas).toHaveLength(0);
  expect(result.current.asistenciaHibrida).toBe('ACTIVA');
  rerender(opts);
  rerender({ ...opts, bateriaPct: 19 });
  expect(result.current.alertas).toHaveLength(1);
  rerender({ ...opts, frecuenciaCardiaca: 170 });
  expect(result.current.alertas.map(a => a.tipo)).toEqual(['FRECUENCIA_CARDIACA']);
  rerender({ ...opts, frecuenciaCardiaca: 170, smartwatchVinculado: false });
  expect(result.current.alertas).toHaveLength(0);
});

it.each(['LIBRE', 'PERSONALIZADO', 'PRECARGADO'] as const)('TC-08/RNF-27: terreno por progreso solo en precargado (%s)', modalidad => {
  const { result } = renderHook(() => useRecorrido({ ...opciones(), modalidad, circuitoId: 'c1', velocidadSimulada: 360 }));
  act(() => vi.advanceTimersByTime(29000));
  expect(result.current.alertas.filter(a => a.tipo === 'TERRENO')).toHaveLength(0);
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.alertas.filter(a => a.tipo === 'TERRENO')).toHaveLength(modalidad === 'PRECARGADO' ? 1 : 0);
  if (modalidad === 'PRECARGADO') {
    act(() => result.current.confirmarAlerta('terreno-c1-pendiente'));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.alertas.filter(a => a.tipo === 'TERRENO')).toHaveLength(0);
  }
});

it('TC-16/21: captura inicio y batería, promedia muestras vinculadas y calcula velocidad por tiempo', () => {
  const opts = { ...opciones(), bateriaPct: 55, frecuenciaCardiaca: 120, velocidadSimulada: 540 };
  const fecha = new Date().toISOString();
  const { result, rerender } = renderHook(p => useRecorrido(p), { initialProps: opts });
  act(() => vi.advanceTimersByTime(1000));
  rerender({ ...opts, frecuenciaCardiaca: 140 });
  act(() => vi.advanceTimersByTime(1000));
  rerender({ ...opts, frecuenciaCardiaca: 180, smartwatchVinculado: false });
  act(() => vi.advanceTimersByTime(1000));
  act(() => result.current.handleSolicitarFin());
  act(() => result.current.handleConfirmarFinValido());
  expect(opts.onFinalizarRecorridoGuardado).toHaveBeenCalledWith(expect.objectContaining({
    fechaHoraInicio: fecha, bateriaInicial: 55, frecuenciaCardiacaPromedio: 130,
    tiempoActivoSeg: 3, distanciaKm: 0.45, velocidadPromedioKmh: 540,
  }));
});

it('TC-22: progreso local avanza, registra pausa y se limpia al descartar', () => {
  const { result } = renderHook(() => useRecorrido(opciones()));
  act(() => vi.advanceTimersByTime(1000));
  const clave = 'triciclos.recorridoEnCurso.v1';
  expect(JSON.parse(localStorage.getItem(clave)!).tiempoActivoSeg).toBe(1);
  act(() => result.current.handlePausar());
  expect(JSON.parse(localStorage.getItem(clave)!).estado).toBe('PAUSADO');
  act(() => result.current.handleReanudar());
  act(() => result.current.handleSolicitarFin());
  act(() => result.current.handleConfirmarFinInvalido());
  expect(localStorage.getItem(clave)).toBeNull();
});

it('TC-15/16: confirmar dos veces en el mismo evento solo finaliza una vez', () => {
  const opts = { ...opciones(), velocidadSimulada: 0 };
  const { result } = renderHook(() => useRecorrido(opts));
  act(() => vi.advanceTimersByTime(180000));
  act(() => result.current.handleSolicitarFin());
  act(() => { result.current.handleConfirmarFinValido(); result.current.handleConfirmarFinValido(); });
  expect(opts.onFinalizarRecorridoGuardado).toHaveBeenCalledTimes(1);
});

it('TC-05: descarta velocidad NaN/negativa conservando última muestra válida', () => {
  const advertencia = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const opts = opciones();
  const { result, rerender } = renderHook(p => useRecorrido(p), { initialProps: opts });
  act(() => vi.advanceTimersByTime(1000));
  rerender({ ...opts, velocidadSimulada: NaN });
  act(() => vi.advanceTimersByTime(1000));
  rerender({ ...opts, velocidadSimulada: -3 });
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.distanciaMetros).toBeCloseTo(10);
  expect(Number.isFinite(result.current.caloriasConsumidas)).toBe(true);
  expect(advertencia).toHaveBeenCalled();
  advertencia.mockRestore();
});
