import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '../App';
afterEach(cleanup);
it('TC-27: cambia tema antes de iniciar y lo conserva durante recorrido', () => {
  const { container } = render(<App />);
  expect(container.querySelector('.conductor')).toHaveAttribute('data-tema', 'claro');
  fireEvent.click(screen.getByRole('button', { name: 'Modo oscuro' }));
  expect(container.querySelector('.conductor')).toHaveAttribute('data-tema', 'oscuro');
  // D-29 (v0.6): el botón de filtros del CU-02 ya no se oculta (antes T-05b/D-02).
  expect(screen.getByRole('button', { name: /Filtrar recorridos/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
  expect(container.querySelector('.conductor')).toHaveAttribute('data-tema', 'oscuro');
  expect(screen.queryByRole('button', { name: 'Modo claro' })).not.toBeInTheDocument();
});
