import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '../App';
afterEach(cleanup);
it.each(['LLUVIA', 'VIENTO'])('TC-04/08/25: el panel QA puede forzar %s normal/elevado', clima => {
  render(<App />);
  fireEvent.click(screen.getByText(/Panel de Simulación/));
  fireEvent.change(screen.getByRole('combobox', { name: 'Clima simulado' }), { target: { value: clima } });
  expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeEnabled();
  fireEvent.change(screen.getByRole('combobox', { name: 'Intensidad climática simulada' }), { target: { value: 'ELEVADA' } });
  expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar clima adverso' }));
  expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeEnabled();
  fireEvent.change(screen.getByRole('combobox', { name: 'Intensidad climática simulada' }), { target: { value: 'NORMAL' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Intensidad climática simulada' }), { target: { value: 'ELEVADA' } });
  expect(screen.getByRole('button', { name: 'Confirmar clima adverso' })).toBeInTheDocument();
});
