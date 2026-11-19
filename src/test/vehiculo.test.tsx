import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '../App';
afterEach(cleanup);
it('TC-18/19: muestra batería móvil, odómetro y cambios de componentes simulados', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Panel de Simulación/));
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
  fireEvent.change(screen.getByRole('slider', { name: 'Batería móvil simulada' }), { target: { value: '42' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Odómetro simulado' }), { target: { value: '250' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Asistencia simulada' }), { target: { value: 'LIMITADA' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Motores simulados' }), { target: { value: 'ATENCION' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Frenos simulados' }), { target: { value: 'ATENCION' } });
  const panel = within(screen.getByRole('region', { name: 'Seguimiento del recorrido' }));
  expect(panel.getByText('42%')).toBeInTheDocument();
  expect(panel.getByText('250.00 km')).toBeInTheDocument();
  expect(panel.getByText('LIMITADA')).toBeInTheDocument();
  expect(panel.getByText('Motores: ATENCION | Frenos: ATENCION')).toBeInTheDocument();
});
