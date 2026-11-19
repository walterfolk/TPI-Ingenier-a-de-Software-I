import type { CondicionClima } from '../domain/tipos';
import type { NombreIcono } from './Icono';

export const ICONO_CLIMA: Record<CondicionClima, NombreIcono> = {
  DESPEJADO: 'sol', NUBLADO: 'nube', LLUVIA: 'lluvia', VIENTO: 'viento',
  ESCARCHA_HIELO: 'hielo', VIENTO_FUERTE: 'vientoFuerte', TORMENTA: 'tormenta',
};
export const ETIQUETA_CLIMA: Record<CondicionClima, string> = {
  DESPEJADO: 'Despejado', NUBLADO: 'Nublado', LLUVIA: 'Lluvia', VIENTO: 'Viento',
  ESCARCHA_HIELO: 'Escarcha o hielo', VIENTO_FUERTE: 'Viento fuerte', TORMENTA: 'Tormenta',
};
