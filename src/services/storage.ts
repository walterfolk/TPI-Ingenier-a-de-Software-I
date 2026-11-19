import type { RecorridoGuardado, ProgresoRecorridoCurso } from '../domain/tipos';
import { CONFIG_RECORRIDO } from '../domain/config';
export type ResultadoGuardado = { ok: true } | { ok: false; error: string };
const objeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const numero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const modalidad = (v: unknown) => ['LIBRE','PERSONALIZADO','PRECARGADO'].includes(String(v));
const fecha = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
function esRecorrido(v: unknown): v is RecorridoGuardado {
  return objeto(v) && v.version === 1 && typeof v.id === 'string' && v.id.length > 0 && modalidad(v.modalidad) && fecha(v.fechaHoraInicio)
    && ['distanciaKm','tiempoActivoSeg','velocidadPromedioKmh','caloriasConsumidas','bateriaInicial','bateriaFinal'].every(c => numero(v[c]))
    && (v.bateriaInicial as number) <= 100 && (v.bateriaFinal as number) <= 100
    && (v.frecuenciaCardiacaPromedio === undefined || numero(v.frecuenciaCardiacaPromedio))
    && Array.isArray(v.alertas) && v.alertas.every(a => objeto(a) && ['tipo','fechaHora','descripcion'].every(c => typeof a[c] === 'string'));
}
function leerHistorial(): RecorridoGuardado[] {
  const texto = localStorage.getItem(CONFIG_RECORRIDO.STORAGE_KEY_HISTORIAL);
  if (!texto) return [];
  const valor: unknown = JSON.parse(texto);
  if (!Array.isArray(valor) || !valor.every(esRecorrido)) throw new Error('Historial inválido');
  return valor;
}
export function guardarRecorridoHistorial(recorrido: RecorridoGuardado): ResultadoGuardado {
  try {
    if (!esRecorrido(recorrido)) return { ok: false, error: 'Las métricas del recorrido son inválidas.' };
    const historial = leerHistorial();
    if (!historial.some(r => r.id === recorrido.id)) localStorage.setItem(CONFIG_RECORRIDO.STORAGE_KEY_HISTORIAL, JSON.stringify([recorrido, ...historial]));
    return { ok: true };
  } catch { return { ok: false, error: 'No se pudo guardar el historial local. Los registros anteriores no se sobrescribieron.' }; }
}
export function obtenerHistorialRecorridos(): RecorridoGuardado[] {
  try { return leerHistorial(); } catch { return []; }
}
export function guardarProgresoCurso(progreso: ProgresoRecorridoCurso | null): ResultadoGuardado {
  try {
    if (progreso === null) localStorage.removeItem(CONFIG_RECORRIDO.STORAGE_KEY_EN_CURSO);
    else localStorage.setItem(CONFIG_RECORRIDO.STORAGE_KEY_EN_CURSO, JSON.stringify(progreso));
    return { ok: true };
  } catch { return { ok: false, error: 'No se pudo guardar o limpiar el progreso local del recorrido.' }; }
}
export function obtenerProgresoCurso(): ProgresoRecorridoCurso | null {
  try {
    const texto = localStorage.getItem(CONFIG_RECORRIDO.STORAGE_KEY_EN_CURSO);
    if (!texto) return null;
    const v: unknown = JSON.parse(texto);
    if (!objeto(v) || !modalidad(v.modalidad) || !['EN_CURSO','PAUSADO','EMERGENCIA','FINALIZANDO'].includes(String(v.estado))
      || !fecha(v.fechaHoraInicio) || !['distanciaKm','tiempoActivoSeg','bateriaPct'].every(c => numero(v[c]))
      || (v.bateriaPct as number) > 100 || !['DESPEJADO','NUBLADO','LLUVIA','VIENTO','VIENTO_FUERTE','TORMENTA','ESCARCHA_HIELO'].includes(String(v.climaActual))
      || !Array.isArray(v.alertasActivas) || !v.alertasActivas.every(a => objeto(a) && typeof a.id === 'string' && typeof a.descripcion === 'string')) return null;
    return v as unknown as ProgresoRecorridoCurso;
  } catch { return null; }
}
