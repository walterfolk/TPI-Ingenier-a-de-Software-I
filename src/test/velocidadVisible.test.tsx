import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PantallaSeguimiento } from '../components/PantallaSeguimiento';
import type { PantallaSeguimientoProps } from '../hooks/useRecorrido';

const opciones = (velocidadSimulada: number): PantallaSeguimientoProps => ({
  bateriaPct: 80, setBateriaPct: vi.fn(), climaActual: 'DESPEJADO',
  smartwatchVinculado: true, frecuenciaCardiaca: 125, bluetoothSincronizado: true,
  velocidadSimulada, modalidad: 'LIBRE',
  onFinalizarRecorridoGuardado: vi.fn(), onCancelarOdescartar: vi.fn(),
});
const tarjeta = () => within(screen.getByRole('figure', { name: 'Velocidad actual' }));
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

it.each([NaN, Infinity, -Infinity, -3])('TC-05: sin muestra válida presenta -- ante %s', velocidad => {
  render(<PantallaSeguimiento {...opciones(velocidad)} />);
  expect(tarjeta().getByText('-- km/h')).toBeInTheDocument();
});

it('TC-05: conserva última lectura válida, recupera nuevas muestras y mantiene telemetría', () => {
  vi.useFakeTimers();
  const advertencia = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const props = opciones(12);
  const { rerender } = render(<PantallaSeguimiento {...props} />);
  expect(tarjeta().getByText('12 km/h')).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1000));
  for (const velocidad of [NaN, Infinity, -Infinity, -3]) {
    rerender(<PantallaSeguimiento {...props} velocidadSimulada={velocidad} />);
    expect(tarjeta().getByText('12 km/h')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
  }
  const progreso = JSON.parse(localStorage.getItem('triciclos.recorridoEnCurso.v1')!);
  expect(progreso.tiempoActivoSeg).toBe(5);
  expect(progreso.distanciaKm).toBeCloseTo(12 * 5 / 3600);
  expect(advertencia).toHaveBeenCalled();
  rerender(<PantallaSeguimiento {...props} velocidadSimulada={18} />);
  expect(tarjeta().getByText('18 km/h')).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1000));
  expect(JSON.parse(localStorage.getItem('triciclos.recorridoEnCurso.v1')!).tiempoActivoSeg).toBe(6);
  rerender(<PantallaSeguimiento {...props} velocidadSimulada={0} />);
  expect(tarjeta().getByText('0 km/h')).toBeInTheDocument();
});
