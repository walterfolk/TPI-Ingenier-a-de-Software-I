import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '../App';
afterEach(cleanup);
it('TC-27: cambia tema antes de iniciar y lo conserva durante recorrido', () => {
  const { container } = render(<App />);
  expect(container.querySelector('.conductor')).toHaveAttribute('data-tema', 'claro');
  fireEvent.click(screen.getByRole('button', { name: 'Modo oscuro' }));
  expect(container.querySelector('.conductor')).toHaveAttribute('data-tema', 'oscuro');
  expect(screen.queryByRole('button', { name: /Filtrar/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
  expect(container.querySelector('.conductor')).toHaveAttribute('data-tema', 'oscuro');
  expect(screen.queryByRole('button', { name: 'Modo claro' })).not.toBeInTheDocument();
});
