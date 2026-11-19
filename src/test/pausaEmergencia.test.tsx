import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from '../App';
afterEach(() => { cleanup(); vi.useRealTimers(); });
it('TC-12: modal pausa exclusivo, solo Continuar reanuda y no acumula', () => {
  vi.useFakeTimers(); render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
  act(() => vi.advanceTimersByTime(2000));
  fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
  expect(within(screen.getByRole('dialog', { name: 'Recorrido en pausa' })).getAllByRole('button')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'Finalizar Recorrido' })).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(10000));
  fireEvent.click(screen.getByRole('button', { name: 'Continuar recorrido' }));
  expect(screen.getByText('0:02')).toBeInTheDocument();
});
it('TC-13/14: emergencia dura 30s, no ofrece otra salida y mantiene marcha', () => {
  vi.useFakeTimers(); render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
  fireEvent.click(screen.getByRole('button', { name: 'Emergencia' }));
  act(() => vi.advanceTimersByTime(30000));
  const dialogo = within(screen.getByRole('dialog', { name: 'Emergencia' }));
  expect(dialogo.getAllByRole('button')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'Reanudar' })).not.toBeInTheDocument();
  fireEvent.click(dialogo.getByRole('button', { name: 'Cancelar' }));
  expect(screen.getByText('0:30')).toBeInTheDocument();
  expect(screen.queryByRole('dialog', { name: 'Emergencia' })).not.toBeInTheDocument();
});
