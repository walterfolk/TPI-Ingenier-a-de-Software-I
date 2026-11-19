import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from '../App';
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
function iniciar(velocidad: number) {
  render(<App />);
  fireEvent.click(screen.getByText(/Panel de Simulación/));
  fireEvent.change(screen.getByRole('slider', { name: 'Velocidad simulada' }), { target: { value: String(velocidad) } });
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
}
it.each([{ velocidad: 0, segundos: 180 }, { velocidad: 30, segundos: 36 }])('TC-15/16/21: guarda por tiempo O distancia ($velocidad km/h, $segundos s)', ({ velocidad, segundos }) => {
  vi.useFakeTimers(); iniciar(velocidad);
  act(() => vi.advanceTimersByTime(segundos * 1000));
  fireEvent.click(screen.getByRole('button', { name: 'Finalizar Recorrido' }));
  expect(localStorage.getItem('triciclos.historial.v1')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar y Finalizar' }));
  expect(screen.getByText('El recorrido ha sido guardado correctamente en el historial.')).toBeInTheDocument();
  const historial = JSON.parse(localStorage.getItem('triciclos.historial.v1')!);
  expect(historial).toHaveLength(1);
  expect(historial[0].tiempoActivoSeg).toBe(segundos);
  expect(localStorage.getItem('triciclos.recorridoEnCurso.v1')).toBeNull();
});
it('TC-17: descarta con aviso y conserva historial previo', () => {
  vi.useFakeTimers(); iniciar(12);
  fireEvent.click(screen.getByRole('button', { name: 'Finalizar Recorrido' }));
  fireEvent.click(screen.getByRole('button', { name: 'Descartar y Salir' }));
  expect(screen.getByText(/Recorrido descartado: no alcanzó/)).toBeInTheDocument();
  expect(localStorage.getItem('triciclos.historial.v1')).toBeNull();
});
it('TC-16/22: falla de almacenamiento visible, sin éxito falso y sin impedir finalizar', () => {
  vi.useFakeTimers();
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('Sin espacio', 'QuotaExceededError'); });
  iniciar(0);
  expect(screen.getAllByText(/No se pudo guardar o limpiar/).length).toBeGreaterThan(0);
  act(() => vi.advanceTimersByTime(180000));
  fireEvent.click(screen.getByRole('button', { name: 'Finalizar Recorrido' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar y Finalizar' }));
  expect(screen.getByText(/No se pudo guardar el historial local/)).toBeInTheDocument();
  expect(screen.queryByText('El recorrido ha sido guardado correctamente en el historial.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Volver al Inicio' })).toBeInTheDocument();
});
