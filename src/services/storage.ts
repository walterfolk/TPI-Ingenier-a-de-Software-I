import { RecorridoGuardado, ProgresoRecorridoCurso } from '../domain/tipos';
import { CONFIG_RECORRIDO } from '../domain/config';

export function guardarRecorridoHistorial(recorrido: RecorridoGuardado): void {
  try {
    const historial = obtenerHistorialRecorridos();
    historial.unshift(recorrido);
    localStorage.setItem(CONFIG_RECORRIDO.STORAGE_KEY_HISTORIAL, JSON.stringify(historial));
  } catch (e) {
    console.error('Error al guardar recorrido en localStorage:', e);
  }
}

export function obtenerHistorialRecorridos(): RecorridoGuardado[] {
  try {
    const data = localStorage.getItem(CONFIG_RECORRIDO.STORAGE_KEY_HISTORIAL);
    if (!data) return [];
    return JSON.parse(data) as RecorridoGuardado[];
  } catch (e) {
    console.error('Error al leer historial de localStorage:', e);
    return [];
  }
}

export function guardarProgresoCurso(progreso: ProgresoRecorridoCurso | null): void {
  try {
    if (!progreso) {
      localStorage.removeItem(CONFIG_RECORRIDO.STORAGE_KEY_EN_CURSO);
    } else {
      localStorage.setItem(CONFIG_RECORRIDO.STORAGE_KEY_EN_CURSO, JSON.stringify(progreso));
    }
  } catch (e) {
    console.error('Error al guardar progreso en curso:', e);
  }
}

export function obtenerProgresoCurso(): ProgresoRecorridoCurso | null {
  try {
    const data = localStorage.getItem(CONFIG_RECORRIDO.STORAGE_KEY_EN_CURSO);
    if (!data) return null;
    return JSON.parse(data) as ProgresoRecorridoCurso;
  } catch (e) {
    console.error('Error al leer progreso en curso:', e);
    return null;
  }
}
