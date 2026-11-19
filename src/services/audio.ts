let contexto: AudioContext | undefined;

export function prepararAudio(): boolean {
  try {
    if (!contexto && typeof window.AudioContext === 'function') contexto = new window.AudioContext();
    if (contexto?.state === 'suspended') void contexto.resume().catch(() => {});
    return Boolean(contexto);
  } catch { return false; }
}

/** Un reproductor por pantalla; no superpone voces y corta toda repetición al confirmar. */
export function crearAudioAlertas() {
  let intervalo: ReturnType<typeof setInterval> | undefined;
  let oscilador: OscillatorNode | undefined;
  const detener = () => {
    if (intervalo) clearInterval(intervalo);
    intervalo = undefined;
    try { oscilador?.stop(); } catch { /* El pitido puede haber finalizado. */ }
    oscilador = undefined;
    window.speechSynthesis?.cancel();
  };
  return {
    detener,
    iniciar(mensajes: string[]) {
      detener();
      if (!mensajes.length) return true;
      const pitidoDisponible = prepararAudio();
      const vozDisponible = typeof window.speechSynthesis?.speak === 'function' && typeof window.SpeechSynthesisUtterance === 'function';
      const emitir = () => {
        if (contexto) {
          try {
            oscilador = contexto.createOscillator();
            const ganancia = contexto.createGain();
            ganancia.gain.value = 0.08;
            oscilador.frequency.value = 660;
            oscilador.connect(ganancia); ganancia.connect(contexto.destination);
            oscilador.start(); oscilador.stop(contexto.currentTime + 0.25);
          } catch { /* Banner permanece visible si el navegador no permite audio. */ }
        }
        if (vozDisponible && !window.speechSynthesis.speaking) {
          const mensaje = new window.SpeechSynthesisUtterance(mensajes.join('. '));
          mensaje.lang = 'es-AR';
          const voz = window.speechSynthesis.getVoices?.().find(v => v.lang.startsWith('es'));
          if (voz) mensaje.voice = voz;
          window.speechSynthesis.speak(mensaje);
        }
      };
      emitir();
      intervalo = setInterval(emitir, 5000);
      return pitidoDisponible && vozDisponible;
    },
  };
}
