import type { DificultadRecorrido, FiltroRecorridos, ModalidadRecorrido, ViabilidadRecorrido } from '../domain/tipos';
import { filtrarRecorridos } from '../domain/filtros';
import { CONFIG_RECORRIDO } from '../domain/config';

export interface CircuitoPrecargado {
  id: string;
  nombre: string;
  distanciaKm: number;
  /** RNF-12 / D-32: dificultad de ejemplo, no oficial. */
  dificultad: DificultadRecorrido;
  alertaTerreno?: string;
  // Posiciones ficticias reproducibles para QA; no son datos oficiales ni GPS.
  alertasTerreno?: { id: string; km: number; descripcion: string }[];
}

/** Circuitos de ejemplo (D-32). c1–c3 conservan id, distancia y alertas de terreno. */
export const CIRCUITOS_PRECARGADOS: CircuitoPrecargado[] = [
  { id: 'c1', nombre: 'Circuito Costero (6 km)', distanciaKm: 6.0, dificultad: 'MEDIA', alertaTerreno: 'Pendiente pronunciada en km 3', alertasTerreno: [{ id: 'pendiente', km: 3, descripcion: 'Pendiente pronunciada en km 3' }] },
  { id: 'c2', nombre: 'Paseo del Bosque (4 km)', distanciaKm: 4.0, dificultad: 'BAJA' },
  { id: 'c3', nombre: 'Ruta del Glaciar (10 km)', distanciaKm: 10.0, dificultad: 'ALTA', alertaTerreno: 'Superficie ripio y humedad', alertasTerreno: [{ id: 'ripio', km: 2, descripcion: 'Superficie de ripio y humedad en km 2 (simulado)' }] },
  { id: 'c4', nombre: 'Costanera Corta (3 km)', distanciaKm: 3.0, dificultad: 'BAJA' },
  { id: 'c5', nombre: 'Mirador del Canal (8 km)', distanciaKm: 8.0, dificultad: 'MEDIA' },
  { id: 'c6', nombre: 'Subida al Cerro (12 km)', distanciaKm: 12.0, dificultad: 'ALTA' },
  { id: 'c7', nombre: 'Bahía Encerrada (14 km)', distanciaKm: 14.0, dificultad: 'BAJA' },
  { id: 'c8', nombre: 'Gran Vuelta de la Ciudad (16 km)', distanciaKm: 16.0, dificultad: 'MEDIA' },
];

/** CU-02: filtra el catálogo de ejemplo con las reglas puras de domain/filtros (II.5). */
export function filtrarCircuitos(filtro: FiltroRecorridos): CircuitoPrecargado[] {
  return filtrarRecorridos(filtro, CIRCUITOS_PRECARGADOS);
}

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

/** Una selección inválida bloquea el inicio; la autonomía insuficiente solo informa (D-21). */
export function validarSeleccion(config: ConfiguracionRuta): string | undefined {
  if (config.modalidad === 'LIBRE') return;
  if (config.modalidad === 'PERSONALIZADO') {
    if (!config.origen || !config.destino) return 'Seleccione origen y destino';
    const origen = PUNTOS_REFERENCIA.find(p => p.id === config.origen || p.nombre === config.origen);
    const destino = PUNTOS_REFERENCIA.find(p => p.id === config.destino || p.nombre === config.destino);
    if (!origen || !destino) return 'Punto de referencia inexistente';
    if (origen.id === destino.id) return 'Origen igual a destino';
    return;
  }
  if (config.modalidad === 'PRECARGADO') {
    if (!config.circuitoId) return 'Circuito no seleccionado';
    if (!CIRCUITOS_PRECARGADOS.some(c => c.id === config.circuitoId)) return 'Identificador de circuito inexistente';
    return;
  }
  return 'Modalidad inexistente';
}

/**
 * Calcula la viabilidad de un recorrido según los parámetros de 6.3 y el RFC (D-15).
 */
export function calcularViabilidad(config: ConfiguracionRuta, bateriaActualPct: number = 80): ViabilidadRecorrido {
  const error = validarSeleccion(config);
  if (error) return {
    distanciaKm: 0, tiempoEstimadoMin: 0, consumoBateriaPct: 0, caloriasKcal: 0,
    esViable: false, motivoNoViable: error,
  };
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
