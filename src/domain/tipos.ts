export type ModalidadRecorrido = "LIBRE" | "PERSONALIZADO" | "PRECARGADO";

export type EstadoRecorrido =
  | "PREPARADO"
  | "EN_CURSO"
  | "PAUSADO"
  | "EMERGENCIA"
  | "FINALIZANDO"
  | "FINALIZADO"
  | "DESCARTADO";

export type CondicionClima =
  | "DESPEJADO"
  | "NUBLADO"
  | "LLUVIA"
  | "VIENTO_FUERTE"
  | "TORMENTA";

export type TipoAlerta =
  | "BATERIA_BAJA"
  | "CLIMA_ADVERSO"
  | "TERRENO"
  | "FRECUENCIA_CARDIACA"
  | "BLUETOOTH";

export type AsistenciaHibrida = "ACTIVA" | "LIMITADA" | "INACTIVA";
export type EstadoSistema = "OK" | "ATENCION";

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  descripcion: string;
  fechaHora: string;
  confirmada: boolean;
  ubicacion?: string;
  estadoClima?: CondicionClima;
  kilometraje?: number;
}

export interface EstadoVehiculoMovil {
  bluetoothSincronizado: boolean;
  bateriaMovilPct: number;
  asistenciaHibrida: AsistenciaHibrida;
  odometroKm: number;
  motoresDelanteros: EstadoSistema;
  frenos: EstadoSistema;
}

export interface ViabilidadRecorrido {
  distanciaKm: number;
  tiempoEstimadoMin: number;
  consumoBateriaPct: number;
  caloriasKcal: number;
  esViable: boolean;
  motivoNoViable?: string;
}

export interface RecorridoGuardado {
  version: 1;
  id: string;
  modalidad: ModalidadRecorrido;
  nombre?: string;
  origen?: string;
  destino?: string;
  fechaHoraInicio: string;
  distanciaKm: number;
  tiempoActivoSeg: number;
  velocidadPromedioKmh: number;
  frecuenciaCardiacaPromedio?: number;
  caloriasConsumidas: number;
  bateriaInicial: number;
  bateriaFinal: number;
  alertas: { tipo: string; fechaHora: string; descripcion: string }[];
}

export interface ProgresoRecorridoCurso {
  estado: EstadoRecorrido;
  modalidad: ModalidadRecorrido;
  nombreCircuito?: string;
  origen?: string;
  destino?: string;
  distanciaKm: number;
  tiempoActivoSeg: number;
  bateriaPct: number;
  climaActual: CondicionClima;
  alertasActivas: Alerta[];
  fechaHoraInicio: string;
}
