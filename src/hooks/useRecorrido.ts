import React, { useState, useEffect, useRef } from 'react';
import type {
  EstadoRecorrido,
  EstadoVehiculoMovil,
  ModalidadRecorrido,
  CondicionClima,
  IntensidadClima,
  Alerta,
  RecorridoGuardado
} from '../domain/tipos';
import { CONFIG_RECORRIDO } from '../domain/config';
import { esClimaAdverso, bateriaBaja, frecuenciaExcedida, cumpleMinimos } from '../domain/reglas';

import { useAudioAlertas } from './useAudioAlertas';
import type { EstadoConexion } from '../services/conexionSimulada';
import { guardarProgresoCurso } from '../services/storage';
import { CIRCUITOS_PRECARGADOS } from '../services/catalogo';
import { siguienteEstado, type AccionRecorrido } from '../domain/maquinaRecorrido';
export interface PantallaSeguimientoProps {
  onErrorPersistencia?: (mensaje?: string) => void;
  conexion?: EstadoConexion;
  estadoVehiculo?: Omit<EstadoVehiculoMovil, 'bluetoothSincronizado'>;
  onAvanzarOdometro?: (km: number) => void;
  umbralFrecuencia?: number;
  avisosPreviosConfirmados?: boolean;
  bateriaPct: number;
  setBateriaPct: React.Dispatch<React.SetStateAction<number>>;
  climaActual: CondicionClima;
  intensidadClima?: IntensidadClima;
  smartwatchVinculado: boolean;
  frecuenciaCardiaca: number;
  bluetoothSincronizado: boolean;
  velocidadSimulada: number;
  modalidad: ModalidadRecorrido;
  origen?: string;
  destino?: string;
  circuitoId?: string;
  nombreCircuito?: string;
  distanciaObjetivoKm?: number;
  onFinalizarRecorridoGuardado: (recorrido: RecorridoGuardado) => void;
  onCancelarOdescartar: () => void;
}

export function useRecorrido({onErrorPersistencia, conexion, estadoVehiculo, onAvanzarOdometro, umbralFrecuencia = CONFIG_RECORRIDO.UMBRAL_FRECUENCIA_CARDIACA_BPM, avisosPreviosConfirmados = false, bateriaPct, setBateriaPct, climaActual, intensidadClima = 'NORMAL', smartwatchVinculado, frecuenciaCardiaca, bluetoothSincronizado, velocidadSimulada, modalidad, origen, destino, circuitoId, nombreCircuito, onFinalizarRecorridoGuardado, onCancelarOdescartar}: PantallaSeguimientoProps) {
  const [estado, setEstado] = useState<EstadoRecorrido>(() => siguienteEstado('PREPARADO', 'INICIAR'));

  // Métricas del recorrido
  const [distanciaMetros, setDistanciaMetros] = useState<number>(0);
  const [tiempoActivoSeg, setTiempoActivoSeg] = useState<number>(0);
  const [caloriasConsumidas, setCaloriasConsumidas] = useState<number>(0);
  const [inicio] = useState(() => ({ id: crypto.randomUUID(), fecha: new Date().toISOString(), bateria: bateriaPct }));
  const acumulado = useRef({ tiempo: 0, metros: 0, kcal: 0, pulsos: 0, muestrasPulso: 0 });

  // Hardware y estado del vehículo
  const asistenciaHibrida = estadoVehiculo?.asistenciaHibrida ?? 'ACTIVA';
  const motoresDelanteros = estadoVehiculo?.motoresDelanteros ?? 'OK';
  const frenos = estadoVehiculo?.frenos ?? 'OK';

  // Alertas activas
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [historialAlertas, setHistorialAlertas] = useState<{ tipo: string; fechaHora: string; descripcion: string }[]>([]);

  const [errorGuardado, setErrorGuardado] = useState<string>();
  useEffect(() => {
    if (estado === 'FINALIZADO' || estado === 'DESCARTADO') return;
    const resultado = guardarProgresoCurso({ estado, modalidad, origen, destino, nombreCircuito,
      distanciaKm: distanciaMetros / 1000, tiempoActivoSeg, bateriaPct, climaActual,
      alertasActivas: alertas, fechaHoraInicio: inicio.fecha });
    setErrorGuardado(resultado.ok ? undefined : resultado.error);
    onErrorPersistencia?.(resultado.ok ? undefined : resultado.error);
  }, [estado, modalidad, origen, destino, nombreCircuito, distanciaMetros, tiempoActivoSeg, bateriaPct, climaActual, alertas, inicio]);

  const audioDisponible = useAudioAlertas(alertas.map(a => a.descripcion));

  // Modal de fin
  const mostrarModalFin = estado === 'FINALIZANDO';
  const cambiarEstado = (accion: AccionRecorrido) => {
    if (!accion.startsWith('CONFIRMAR_FIN') && ['EN_CURSO', 'EMERGENCIA', 'FINALIZANDO'].includes(estado)) actualizarMarcha();
    setEstado(actual => siguienteEstado(actual, accion));
  };

  // Marcas de tiempo: el navegador puede demorar los intervalos.
  const sensores = useRef({ onAvanzarOdometro, velocidadSimulada, bateriaPct, climaActual, frecuenciaCardiaca, smartwatchVinculado, bluetoothSincronizado });
  sensores.current = { onAvanzarOdometro, velocidadSimulada, bateriaPct, climaActual, frecuenciaCardiaca, smartwatchVinculado, bluetoothSincronizado };
  const ultimoInstante = useRef(Date.now());
  const ultimaVelocidad = useRef(0);
  const actualizarMarcha = () => {
    const ahora = Date.now();
    const segundos = Math.max(0, (ahora - ultimoInstante.current) / 1000);
    ultimoInstante.current = ahora;
    const lectura = sensores.current.velocidadSimulada;
    if (Number.isFinite(lectura) && lectura >= 0) ultimaVelocidad.current = lectura;
    else console.warn('Muestra de velocidad inválida: se conserva el último valor válido.');
    const velocidad = ultimaVelocidad.current;
    const km = sensores.current.bluetoothSincronizado ? velocidad * segundos / 3600 : 0;
    acumulado.current.tiempo += segundos;
    acumulado.current.metros += km * 1000;
    acumulado.current.kcal += km * CONFIG_RECORRIDO.CALORIAS_POR_KM_KCAL;
    if (segundos > 0 && sensores.current.smartwatchVinculado && Number.isFinite(sensores.current.frecuenciaCardiaca) && sensores.current.frecuenciaCardiaca > 0) {
      acumulado.current.pulsos += sensores.current.frecuenciaCardiaca;
      acumulado.current.muestrasPulso++;
    }
    setTiempoActivoSeg(acumulado.current.tiempo);
    setDistanciaMetros(acumulado.current.metros);
    sensores.current.onAvanzarOdometro?.(km);
    setCaloriasConsumidas(acumulado.current.kcal);
    setBateriaPct(prev => Math.max(0, prev - km * CONFIG_RECORRIDO.CONSUMO_BATERIA_POR_KM_PCT));
    return { ...acumulado.current, bateria: Math.max(0, sensores.current.bateriaPct - km * CONFIG_RECORRIDO.CONSUMO_BATERIA_POR_KM_PCT) };
  };
  useEffect(() => {
    ultimoInstante.current = Date.now();
    if (!['EN_CURSO', 'EMERGENCIA', 'FINALIZANDO'].includes(estado)) return;
    const timer = setInterval(actualizarMarcha, CONFIG_RECORRIDO.PERIODO_TELEMETRIA_MS);
    return () => clearInterval(timer);
  }, [estado]);
  const reconocidas = useRef(new Set<string>());
  const alertasRef = useRef<Alerta[]>([]);
  const inicializado = useRef(false);
  useEffect(() => {
    const condiciones: Alerta[] = [];
    const agregar = (id: string, tipo: Alerta['tipo'], descripcion: string) => condiciones.push({ id, tipo, descripcion, fechaHora: new Date().toISOString(), confirmada: false });
    if (bateriaBaja(bateriaPct)) agregar('bateria', 'BATERIA_BAJA', 'Batería baja. Busque un punto de carga.');
    if (esClimaAdverso(climaActual, intensidadClima)) agregar('clima-' + climaActual + '-' + intensidadClima, 'CLIMA_ADVERSO', 'Clima adverso. Extreme precauciones.');
    if (frecuenciaExcedida(frecuenciaCardiaca, smartwatchVinculado, umbralFrecuencia)) agregar('fc', 'FRECUENCIA_CARDIACA', 'Frecuencia cardíaca elevada. Reduzca la intensidad del pedaleo.');
    if (modalidad === 'PRECARGADO') {
      const circuito = CIRCUITOS_PRECARGADOS.find(c => c.id === circuitoId);
      circuito?.alertasTerreno?.filter(a => distanciaMetros + 1e-6 >= a.km * 1000).forEach(a => agregar('terreno-' + circuitoId + '-' + a.id, 'TERRENO', a.descripcion));
    }
    if (conexion?.estado === 'SIN_TELEMETRIA') agregar('bluetooth', 'BLUETOOTH', 'Bluetooth sin telemetría actualizada. Reintentando en segundo plano.');
    if (!inicializado.current) {
      if (avisosPreviosConfirmados) condiciones.filter(c => c.tipo === 'BATERIA_BAJA' || c.tipo === 'CLIMA_ADVERSO').forEach(c => reconocidas.current.add(c.id));
      inicializado.current = true;
    }
    const ids = new Set(condiciones.map(c => c.id));
    reconocidas.current.forEach(id => { if (!ids.has(id)) reconocidas.current.delete(id); });
    const nuevas = condiciones.filter(c => !reconocidas.current.has(c.id) && !alertasRef.current.some(a => a.id === c.id));
    const siguientes = [...alertasRef.current.filter(a => ids.has(a.id)), ...nuevas];
    alertasRef.current = siguientes;
    setAlertas(siguientes);
    if (nuevas.length) setHistorialAlertas(prev => [...prev, ...nuevas.map(({tipo, fechaHora, descripcion}) => ({tipo, fechaHora, descripcion}))]);
  }, [conexion?.estado, distanciaMetros, modalidad, circuitoId, umbralFrecuencia, bateriaPct, climaActual, intensidadClima, frecuenciaCardiaca, smartwatchVinculado, bluetoothSincronizado]);
  const confirmarAlerta = (id: string) => {
    reconocidas.current.add(id);
    alertasRef.current = alertasRef.current.filter(a => a.id !== id);
    setAlertas(alertasRef.current);
  };

  const handlePausar = () => cambiarEstado('PAUSAR');
  const handleReanudar = () => cambiarEstado('REANUDAR');
  const handleEmergencia = () => cambiarEstado('EMERGENCIA');
  const handleCancelarEmergencia = () => cambiarEstado('CANCELAR_EMERGENCIA');
  const handleSolicitarFin = () => cambiarEstado('SOLICITAR_FIN');

  const finalizado = useRef(false);
  const limpiarProgreso = () => {
    const resultado = guardarProgresoCurso(null);
    if (!resultado.ok) onErrorPersistencia?.(resultado.error);
  };
  const handleConfirmarFinValido = () => {
    if (estado !== 'FINALIZANDO' || finalizado.current) return;
    const metricas = actualizarMarcha();
    finalizado.current = true;
    if (!cumpleMinimos(metricas.metros, metricas.tiempo)) {
      cambiarEstado('CONFIRMAR_FIN_INVALIDO');
      limpiarProgreso();
      onCancelarOdescartar();
      return;
    }
    const velocidadPromedioKmh = metricas.tiempo > 0 ? (metricas.metros / 1000) / (metricas.tiempo / 3600) : 0;

    const recorridoGuardado: RecorridoGuardado = {
      version: 1,
      id: inicio.id,
      modalidad,
      nombre: nombreCircuito,
      origen,
      destino,
      fechaHoraInicio: inicio.fecha,
      distanciaKm: metricas.metros / 1000,
      tiempoActivoSeg: metricas.tiempo,
      velocidadPromedioKmh,
      frecuenciaCardiacaPromedio: metricas.muestrasPulso ? Math.round(metricas.pulsos / metricas.muestrasPulso) : undefined,
      caloriasConsumidas: metricas.kcal,
      bateriaInicial: inicio.bateria,
      bateriaFinal: metricas.bateria,
      alertas: historialAlertas,
    };

    cambiarEstado('CONFIRMAR_FIN_VALIDO');
    limpiarProgreso();
    onFinalizarRecorridoGuardado(recorridoGuardado);
  };

  const handleConfirmarFinInvalido = handleConfirmarFinValido;

  const handleRechazarFin = () => {
    cambiarEstado('RECHAZAR_FIN');
  };

  return { errorGuardado, audioDisponible, estado, distanciaMetros, tiempoActivoSeg, caloriasConsumidas, asistenciaHibrida, motoresDelanteros, frenos, alertas, mostrarModalFin, confirmarAlerta, handlePausar, handleReanudar, handleEmergencia, handleCancelarEmergencia, handleSolicitarFin, handleConfirmarFinValido, handleConfirmarFinInvalido, handleRechazarFin };
}
