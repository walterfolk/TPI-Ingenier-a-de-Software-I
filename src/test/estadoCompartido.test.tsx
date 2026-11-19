import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

function barra() {
  return within(screen.getByRole('group', { name: 'Estado actual del vehículo' }));
}

function seguimiento() {
  return within(screen.getByRole('region', { name: 'Seguimiento del recorrido' }));
}

function cambiarBateria(valor: number) {
  fireEvent.change(screen.getByRole('slider', { name: 'Batería del triciclo' }), {
    target: { value: String(valor) },
  });
}

describe('T-02a — estado simulado compartido (TC-01/02/03)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('TC-01: conserva valores iniciales y modalidades disponibles', () => {
    render(<App />);
    expect(barra().getByText('80%')).toBeInTheDocument();
    expect(barra().getByText('Despejado')).toBeInTheDocument();
    expect(barra().getByText('Conectado')).toBeInTheDocument();
    expect(barra().getByText('Vinculado')).toBeInTheDocument();
    for (const modalidad of ['Libre', 'Personalizado', 'Precargado']) {
      expect(screen.getByRole('button', { name: modalidad })).toBeInTheDocument();
    }
  });

  it.each(['Libre', 'Personalizado', 'Precargado'])(
    'TC-01/02: mantiene batería, clima y sensores al iniciar %s',
    modalidad => {
      render(<App />);
      fireEvent.click(screen.getByText(/Panel de Simulación/));
      cambiarBateria(55);
      fireEvent.change(screen.getByRole('combobox', { name: 'Clima simulado' }), {
        target: { value: 'NUBLADO' },
      });
      fireEvent.change(screen.getByRole('slider', { name: 'Velocidad simulada' }), {
        target: { value: '18' },
      });
      fireEvent.change(screen.getByRole('slider', { name: 'Frecuencia cardíaca simulada' }), {
        target: { value: '140' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Conectado' }));

      expect(barra().getByText('55%')).toBeInTheDocument();
      expect(barra().getByText('Nublado')).toBeInTheDocument();
      expect(barra().getByText('Desconectado')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: modalidad }));
      fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));

      expect(barra().getByText('55%')).toBeInTheDocument();
      expect(seguimiento().getByText('55%')).toBeInTheDocument();
      expect(seguimiento().getByText('NUBLADO')).toBeInTheDocument();
      expect(seguimiento().getByText('140 bpm')).toBeInTheDocument();
      expect(seguimiento().getByText('Desconectado')).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Velocidad simulada' })).toHaveValue('18');
    },
  );

  it('TC-03: usa la batería compartida para recalcular viabilidad sin cambiar estimaciones', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Panel de Simulación/));
    fireEvent.click(screen.getByRole('button', { name: 'Precargado' }));

    cambiarBateria(20);
    expect(barra().getByText('20%')).toBeInTheDocument();
    expect(screen.getByText(/No viable \(Consumo superior a la batería actual\)/)).toBeInTheDocument();
    expect(screen.getByText('6.0 km')).toBeInTheDocument();
    expect(screen.getByText('24%')).toBeInTheDocument();
    expect(screen.getByText('210 kcal')).toBeInTheDocument();

    cambiarBateria(30);
    expect(screen.getByText(/Viable \(Suficiente batería\)/)).toBeInTheDocument();
    expect(screen.getByText('24%')).toBeInTheDocument();
    expect(screen.getByText('210 kcal')).toBeInTheDocument();
  });

  it('TC-01/02: refleja cambios durante marcha y conserva sensores al volver e iniciar de nuevo', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Panel de Simulación/));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
    cambiarBateria(45);
    fireEvent.change(screen.getByRole('combobox', { name: 'Clima simulado' }), {
      target: { value: 'NUBLADO' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Vinculado' }));
    fireEvent.click(screen.getByRole('button', { name: 'Conectado' }));
    expect(barra().getByText('45%')).toBeInTheDocument();
    expect(seguimiento().getByText('45%')).toBeInTheDocument();
    expect(barra().getByText('Nublado')).toBeInTheDocument();
    expect(seguimiento().getByText('NUBLADO')).toBeInTheDocument();
    expect(barra().getByText('No vinculado')).toBeInTheDocument();
    expect(seguimiento().queryByText(/125 bpm/)).not.toBeInTheDocument();
    expect(barra().getByText('Desconectado')).toBeInTheDocument();
    expect(seguimiento().getByText('Desconectado')).toBeInTheDocument();

    // La marcha y la pausa existentes siguen operando con la fuente compartida.
    act(() => vi.advanceTimersByTime(1000));
    expect(seguimiento().getByText('0:01')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Pausar/ }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('dialog', {name: 'Recorrido en pausa'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar recorrido' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(seguimiento().getByText('0:02')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Finalizar Recorrido/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Descartar y Salir' }));
    expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeInTheDocument();
    expect(barra().getByText('Nublado')).toBeInTheDocument();
    const bateriaConservada = screen.getByRole('slider', { name: 'Batería del triciclo' }).getAttribute('value');

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
    expect(screen.getByRole('slider', { name: 'Batería del triciclo' })).toHaveValue(bateriaConservada);
    expect(seguimiento().getByText('NUBLADO')).toBeInTheDocument();
    expect(seguimiento().getByText('Desconectado')).toBeInTheDocument();
    expect(barra().getByText('No vinculado')).toBeInTheDocument();
    expect(seguimiento().getByText('0:00')).toBeInTheDocument();
  });
});
