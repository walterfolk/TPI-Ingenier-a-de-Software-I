import { afterEach, expect, it, vi } from 'vitest';
import { crearAudioAlertas } from './audio';
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it('TC-23/10: cada tipo usa pitido y voz española; confirmar detiene voz y repetición', () => {
  vi.useFakeTimers();
  const start = vi.fn(), stop = vi.fn(), speak = vi.fn(), cancel = vi.fn();
  vi.stubGlobal('AudioContext', class {
    state = 'running'; currentTime = 0; destination = {};
    createOscillator() { return { frequency: {}, connect: vi.fn(), start, stop }; }
    createGain() { return { gain: {}, connect: vi.fn() }; }
  });
  vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; lang = ''; constructor(text: string) { this.text = text; } });
  vi.stubGlobal('speechSynthesis', { speaking: false, speak, cancel });
  const audio = crearAudioAlertas();
  for (const mensaje of ['Batería baja', 'Clima adverso', 'Terreno peligroso', 'Pulso elevado']) {
    audio.iniciar([mensaje]);
    expect(speak).toHaveBeenLastCalledWith(expect.objectContaining({ text: mensaje, lang: 'es-AR' }));
    expect(start).toHaveBeenCalled();
    audio.detener();
    const cantidad = speak.mock.calls.length;
    vi.advanceTimersByTime(10000);
    expect(speak).toHaveBeenCalledTimes(cantidad);
  }
  expect(cancel).toHaveBeenCalled();
  expect(stop).toHaveBeenCalled();
});
