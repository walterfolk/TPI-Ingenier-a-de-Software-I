import { useEffect, useRef, useState } from 'react';
import { crearConexionSimulada, type EstadoConexion } from '../services/conexionSimulada';

export function useConexionSimulada(disponible: boolean) {
  const [estado, setEstado] = useState<EstadoConexion>({ estado: 'CONECTADO', intentos: 0, ultimaConexion: new Date().toISOString() });
  const conexion = useRef<ReturnType<typeof crearConexionSimulada>>();
  useEffect(() => {
    conexion.current = crearConexionSimulada(setEstado);
    return () => conexion.current?.detener();
  }, []);
  useEffect(() => conexion.current?.establecerDisponible(disponible), [disponible]);
  return estado;
}
