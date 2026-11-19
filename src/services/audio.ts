let contexto: AudioContext | undefined;
let enunciadoActual: SpeechSynthesisUtterance | undefined;
const RETARDO_VOZ_MS = 250;

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
  let espera: ReturnType<typeof setTimeout> | undefined;
  const detener = () => {
    if (intervalo) clearInterval(intervalo);
    intervalo = undefined;
    if (espera) clearTimeout(espera);
    espera = undefined;
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
      };
      emitir();
      intervalo = setInterval(emitir, 5000);
      if (vozDisponible) {
        // Igual que el primer prototipo (AudioService): la voz se dice una vez por alerta y el pitido se repite.
        // Sin condicionar a `speaking` (puede quedar en true tras cancel() y silenciar la voz).
        // Se difiere porque Chrome descarta speak() justo después de cancel(); se guarda el enunciado para evitar el GC.
        espera = setTimeout(() => {
          espera = undefined;
          const mensaje = new window.SpeechSynthesisUtterance(mensajes.join('. '));
          mensaje.lang = 'es-AR';
          mensaje.volume = 1;
          const voz = window.speechSynthesis.getVoices?.().find(v => v.lang.toLowerCase().startsWith('es'));
          if (voz) mensaje.voice = voz;
          enunciadoActual = mensaje;
          mensaje.onend = () => { if (enunciadoActual === mensaje) enunciadoActual = undefined; };
          window.speechSynthesis.resume?.();
          window.speechSynthesis.speak(mensaje);
        }, RETARDO_VOZ_MS);
      }
      return pitidoDisponible && vozDisponible;
    },
  };
}
