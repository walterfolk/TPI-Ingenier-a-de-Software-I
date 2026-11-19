import { CONFIG_RECORRIDO } from '../domain/config';
export interface EstadoConexion {
  estado: 'CONECTADO' | 'REINTENTANDO' | 'SIN_TELEMETRIA';
  intentos: number;
  ultimaConexion: string;
}

/** Solo simulación: disponibilidad forzada por QA, sin Web Bluetooth ni hardware. */
export function crearConexionSimulada(notificar: (estado: EstadoConexion) => void) {
  let disponible = true;
  let estado: EstadoConexion = { estado: 'CONECTADO', intentos: 0, ultimaConexion: new Date().toISOString() };
  let timer: ReturnType<typeof setInterval> | undefined;
  const publicar = () => notificar({ ...estado });
  const detener = () => { if (timer) clearInterval(timer); timer = undefined; };
  return {
    detener,
    establecerDisponible(valor: boolean) {
      disponible = valor;
      if (valor || timer) return;
      estado = { ...estado, estado: 'REINTENTANDO', intentos: 0 };
      publicar();
      timer = setInterval(() => {
        if (disponible) {
          estado = { estado: 'CONECTADO', intentos: 0, ultimaConexion: new Date().toISOString() };
          detener();
        } else {
          estado = { ...estado, intentos: estado.intentos + 1, estado: estado.intentos + 1 >= CONFIG_RECORRIDO.BLUETOOTH_REINTENTOS ? 'SIN_TELEMETRIA' : 'REINTENTANDO' };
        }
        publicar();
      }, CONFIG_RECORRIDO.BLUETOOTH_INTERVALO_MS);
    },
  };
}
