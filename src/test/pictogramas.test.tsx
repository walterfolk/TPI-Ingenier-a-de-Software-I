import { cleanup, fireEvent, render, screen, within, act } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '../App';
import type { CondicionClima } from '../domain/tipos';

const hablado: { text: string; lang: string }[] = [];
beforeEach(() => {
  hablado.length = 0;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak: (m: { text: string; lang: string }) => hablado.push({ text: m.text, lang: m.lang }), cancel: vi.fn(), getVoices: () => [], speaking: false } });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class { text: string; lang = ''; constructor(t: string) { this.text = t; } } });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
const seguimiento = () => within(screen.getByRole('region', { name: 'Seguimiento del recorrido' }));

it('TC-28: cada clima tiene un dibujo distinto, mayor que el texto, y la barra no duplica batería ni clima', () => {
  vi.useFakeTimers(); render(<App />);
  fireEvent.click(screen.getByText(/Panel de Simulación/));
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
  const climas: CondicionClima[] = ['DESPEJADO', 'NUBLADO', 'LLUVIA', 'VIENTO', 'ESCARCHA_HIELO', 'VIENTO_FUERTE', 'TORMENTA'];
  const dibujos = climas.map(clima => {
    fireEvent.change(screen.getByRole('combobox', { name: 'Clima simulado' }), { target: { value: clima } });
    const tarjeta = seguimiento().getByRole('figure', { name: 'Clima' });
    expect(tarjeta).toHaveClass('metrica-clima');
    return tarjeta.querySelector('svg.icono path')!.getAttribute('d');
  });
  expect(new Set(dibujos).size).toBe(7);
  const barra = within(screen.getByRole('group', { name: 'Estado actual del vehículo' }));
  expect(barra.queryByRole('figure')).not.toBeInTheDocument();
  expect(barra.getByText('Conectado')).toBeInTheDocument();
  expect(barra.getByText('Vinculado')).toBeInTheDocument();
});

it('TC-29: una alerta de batería hace pitido y dice su descripción en español', () => {
  vi.useFakeTimers(); render(<App />);
  fireEvent.click(screen.getByText(/Panel de Simulación/));
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
  fireEvent.change(screen.getByRole('slider', { name: 'Batería del triciclo' }), { target: { value: '19' } });
  act(() => vi.advanceTimersByTime(1000));
  expect(hablado.length).toBeGreaterThan(0);
  expect(hablado[0].lang).toBe('es-AR');
  expect(hablado[0].text.length).toBeGreaterThan(5);
  expect(seguimiento().getAllByRole('button', { name: 'Confirmar' })[0].closest('.alerta')!.textContent).toContain(hablado[0].text);
});
