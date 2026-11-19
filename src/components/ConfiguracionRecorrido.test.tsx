import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ConfiguracionRecorrido } from './ConfiguracionRecorrido';

afterEach(cleanup);

it('TC-03: no inicia origen=destino y permite iniciar al corregir la selección', () => {
  const iniciar = vi.fn();
  render(<ConfiguracionRecorrido modalidad="PERSONALIZADO" bateriaPct={80} onIniciar={iniciar} />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Punto de destino' }), { target: { value: 'Campus Universitario UNTDF' } });
  const boton = screen.getByRole('button', { name: 'Iniciar Recorrido' });
  expect(boton).toBeDisabled();
  fireEvent.click(boton);
  expect(iniciar).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('combobox', { name: 'Punto de destino' }), { target: { value: 'Puerto de Ushuaia' } });
  expect(boton).toBeEnabled();
  fireEvent.click(boton);
  expect(iniciar).toHaveBeenCalledTimes(1);
});

it('TC-03/D-21: la autonomía insuficiente no bloquea una selección válida', () => {
  const iniciar = vi.fn();
  render(<ConfiguracionRecorrido modalidad="PRECARGADO" bateriaPct={10} onIniciar={iniciar} />);
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar batería baja' }));
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
  expect(iniciar).toHaveBeenCalledWith(expect.objectContaining({ circuitoId: 'c1' }));
});

it('TC-04/20/25: exige confirmar cada aviso previo y rearma al reaparecer la condición', () => {
  const iniciar = vi.fn();
  const { rerender } = render(<ConfiguracionRecorrido modalidad="LIBRE" bateriaPct={20} climaActual="ESCARCHA_HIELO" onIniciar={iniciar} />);
  expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar batería baja' }));
  expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar clima adverso' }));
  expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeEnabled();
  rerender(<ConfiguracionRecorrido modalidad="LIBRE" bateriaPct={21} onIniciar={iniciar} />);
  rerender(<ConfiguracionRecorrido modalidad="LIBRE" bateriaPct={19} onIniciar={iniciar} />);
  expect(screen.getByRole('button', { name: 'Confirmar batería baja' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeDisabled();
});
