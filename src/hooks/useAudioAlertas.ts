import { useEffect, useState } from 'react';
import { crearAudioAlertas } from '../services/audio';

export function useAudioAlertas(mensajes: string[]) {
  const [disponible, setDisponible] = useState(true);
  const contenido = JSON.stringify(mensajes);
  useEffect(() => {
    if (contenido === '[]') { setDisponible(true); return; }
    const audio = crearAudioAlertas();
    setDisponible(audio.iniciar(JSON.parse(contenido) as string[]));
    return audio.detener;
  }, [contenido]);
  return disponible;
}
