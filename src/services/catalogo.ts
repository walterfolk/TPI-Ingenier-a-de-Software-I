import { ModalidadRecorrido, ViabilidadRecorrido } from '../domain/tipos';
import { CONFIG_RECORRIDO } from '../domain/config';

export interface CircuitoPrecargado {
  id: string;
  nombre: string;
  distanciaKm: number;
  alertaTerreno?: string;
}

export const CIRCUITOS_PRECARGADOS: CircuitoPrecargado[] = [
  { id: 'c1', nombre: 'Circuito Costero (6 km)', distanciaKm: 6.0, alertaTerreno: 'Pendiente pronunciada en km 3' },
  { id: 'c2', nombre: 'Paseo del Bosque (4 km)', distanciaKm: 4.0 },
  { id: 'c3', nombre: 'Ruta del Glaciar (10 km)', distanciaKm: 10.0, alertaTerreno: 'Superficie ripio y humedad' },
];

/**
 * Limitación documental: La documentación oficial (RFC y spec) no define coordenadas (x, y) 
 * oficiales en kilómetros para los puntos de referencia. Se asignan coordenadas provisionales 
 * orientativas con fines de cálculo de distancia euclídea.
 */
export interface PuntoReferencia {
  id: string;
  nombre: string;
  x: number; // km
  y: number; // km
}

export const PUNTOS_REFERENCIA: PuntoReferencia[] = [
  { id: 'p1', nombre: 'Campus Universitario UNTDF', x: 0, y: 0 },
  { id: 'p2', nombre: 'Centro Cívico', x: 6, y: 0 }, // Distancia euclídea = 6 km desde p1
  { id: 'p3', nombre: 'Polo Industrial Ushuaia', x: 3, y: 4 }, // Distancia euclídea = 5 km desde p1
  { id: 'p4', nombre: 'Puerto de Ushuaia', x: 0, y: 5 }, // Distancia euclídea = 5 km desde p1
];

export interface ConfiguracionRuta {
  modalidad: ModalidadRecorrido;
  origen?: string;
  destino?: string;
  circuitoId?: string;
}

/**
 * Calcula la viabilidad de un recorrido según los parámetros de 6.3 y el RFC (D-15).
 */
export function calcularViabilidad(config: ConfiguracionRuta, bateriaActualPct: number = 80): ViabilidadRecorrido {
  if (config.modalidad === 'LIBRE') {
    return {
      distanciaKm: 0,
      tiempoEstimadoMin: 0,
      consumoBateriaPct: 0,
      caloriasKcal: 0,
      esViable: true,
    };
  }

  let distanciaKm = 0;

  if (config.modalidad === 'PERSONALIZADO') {
    if (config.origen && config.destino) {
      if (config.origen === config.destino) {
        return {
          distanciaKm: 0,
          tiempoEstimadoMin: 0,
          consumoBateriaPct: 0,
          caloriasKcal: 0,
          esViable: false,
          motivoNoViable: 'Origen igual a destino',
        };
      }
      const p1 = PUNTOS_REFERENCIA.find(p => p.nombre === config.origen || p.id === config.origen);
      const p2 = PUNTOS_REFERENCIA.find(p => p.nombre === config.destino || p.id === config.destino);
      if (p1 && p2) {
        distanciaKm = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      }
    }
  }

  if (config.modalidad === 'PRECARGADO') {
    if (!config.circuitoId) {
      return {
        distanciaKm: 0,
        tiempoEstimadoMin: 0,
        consumoBateriaPct: 0,
        caloriasKcal: 0,
        esViable: false,
        motivoNoViable: 'Circuito no seleccionado',
      };
    }
    const circuito = CIRCUITOS_PRECARGADOS.find(c => c.id === config.circuitoId);
    if (!circuito) {
      return {
        distanciaKm: 0,
        tiempoEstimadoMin: 0,
        consumoBateriaPct: 0,
        caloriasKcal: 0,
        esViable: false,
        motivoNoViable: 'Identificador de circuito inexistente',
      };
    }
    distanciaKm = circuito.distanciaKm;
  }

  const tiempoEstimadoMin = (distanciaKm / CONFIG_RECORRIDO.VELOCIDAD_ESTIMADA_KMH) * 60;
  const consumoBateriaPct = distanciaKm * CONFIG_RECORRIDO.CONSUMO_BATERIA_POR_KM_PCT;
  const caloriasKcal = distanciaKm * CONFIG_RECORRIDO.CALORIAS_POR_KM_KCAL;
  const esViable = consumoBateriaPct <= bateriaActualPct;

  return {
    distanciaKm,
    tiempoEstimadoMin,
    consumoBateriaPct,
    caloriasKcal,
    esViable,
    motivoNoViable: esViable ? undefined : 'Consumo superior a la batería actual',
  };
}
