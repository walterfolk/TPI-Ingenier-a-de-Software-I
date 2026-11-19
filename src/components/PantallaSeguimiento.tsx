import React from 'react';
import { Icono } from './Icono';
import { Metrica } from './Metrica';
import { ICONO_CLIMA, ETIQUETA_CLIMA } from './clima';
import { useRecorrido, type PantallaSeguimientoProps } from '../hooks/useRecorrido';
import { PantallaEmergencia } from './PantallaEmergencia';
import { ModalValidacionFin } from './ModalValidacionFin';

interface PantallaSeguimientoProps {
  modalidad: ModalidadRecorrido;
  origen?: string;
  destino?: string;
  circuitoId?: string;
  nombreCircuito?: string;
  distanciaObjetivoKm?: number;
  onFinalizarRecorridoGuardado: (recorrido: RecorridoGuardado) => void;
  onCancelarOdescartar: () => void;
}

export function PantallaSeguimiento({
  modalidad,
  origen,
  destino,
  nombreCircuito,
  distanciaObjetivoKm = 0,
  onFinalizarRecorridoGuardado,
  onCancelarOdescartar,
}: PantallaSeguimientoProps) {
  const [estado, setEstado] = useState<EstadoRecorrido>('EN_CURSO');
  
  // Telemetría y sensores simulados
  const [bateriaPct, setBateriaPct] = useState<number>(80);
  const [bateriaInicialValor] = useState<number>(80);
  const [acumuladorBateria, setAcumuladorBateria] = useState<number>(0);
  const [climaActual, setClimaActual] = useState<CondicionClima>('DESPEJADO');
  const [smartwatchVinculado, setSmartwatchVinculado] = useState<boolean>(true);
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState<number>(125);
  const [bluetoothSincronizado, setBluetoothSincronizado] = useState<boolean>(true);
  const [velocidadSimulada, setVelocidadSimulada] = useState<number>(12); // km/h

  // Métricas del recorrido
  const [distanciaMetros, setDistanciaMetros] = useState<number>(0);
  const [tiempoActivoSeg, setTiempoActivoSeg] = useState<number>(0);
  const [tiempoPausadoSeg, setTiempoPausadoSeg] = useState<number>(0);
  const [caloriasConsumidas, setCaloriasConsumidas] = useState<number>(0);
  const [velocidadesAcumuladas, setVelocidadesAcumuladas] = useState<number[]>([12]);

  // Hardware y estado del vehículo
  const [asistenciaHibrida, setAsistenciaHibrida] = useState<AsistenciaHibrida>('ACTIVA');
  const [motoresDelanteros, setMotoresDelanteros] = useState<EstadoSistema>('OK');
  const [frenos, setFrenos] = useState<EstadoSistema>('OK');

  // Alertas activas
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [historialAlertas, setHistorialAlertas] = useState<{ tipo: string; fechaHora: string; descripcion: string }[]>([]);

  // Modal de fin
  const [mostrarModalFin, setMostrarModalFin] = useState<boolean>(false);

  // Simulación de marcha por intervalo (cada segundo real / acelerado)
  useEffect(() => {
    if (estado !== 'EN_CURSO') return;

    const timer = setInterval(() => {
      // Incrementar tiempo activo
      setTiempoActivoSeg((prev) => prev + 1);

      // Calcular avance de distancia basado en velocidad simulada (km/h -> metros por segundo)
      const metrosPorSegundo = (velocidadSimulada * 1000) / 3600;
      setDistanciaMetros((prev) => Math.round((prev + metrosPorSegundo) * 10) / 10);

      // Calorías
      setCaloriasConsumidas((prev) => Math.round((prev + (velocidadSimulada > 0 ? 0.2 : 0.05)) * 10) / 10);

      // Registrar velocidad
      setVelocidadesAcumuladas((prev) => [...prev, velocidadSimulada]);

      // Consumo de batería proporcional a la distancia recorrida (decrece de a 1% entero)
      if (velocidadSimulada > 0) {
        setAcumuladorBateria((prevAcum) => {
          const nuevoAcum = prevAcum + 0.005;
          if (nuevoAcum >= 1) {
            setBateriaPct((prevBat) => Math.max(0, prevBat - 1));
            return nuevoAcum - 1;
          }
          return nuevoAcum;
        });
      }

      // Evaluar reglas y alertas en tiempo real
      evaluarAlertasEnTiempoReal();

    }, CONFIG_RECORRIDO.PERIODO_TELEMETRIA_MS);

    return () => clearInterval(timer);
  }, [estado, velocidadSimulada, bateriaPct, climaActual, frecuenciaCardiaca, smartwatchVinculado, bluetoothSincronizado]);

  // Monitoreo reactivo del nivel de batería
  useEffect(() => {
    if (!bateriaBaja(bateriaPct)) {
      setAlertas((prev) => prev.filter((a) => a.tipo !== 'BATERIA_BAJA'));
      setAsistenciaHibrida('ACTIVA');
    } else {
      const ahoraStr = new Date().toLocaleTimeString();
      agregarAlertaUnica({
        id: 'alerta-bateria',
        tipo: 'BATERIA_BAJA',
        descripcion: `Batería baja (${Math.round(bateriaPct)}%). Busque punto de carga.`,
        fechaHora: ahoraStr,
        confirmada: false,
      });
    }
  }, [bateriaPct]);

  // Si está pausado, incrementar tiempo pausado
  useEffect(() => {
    if (estado !== 'PAUSADO') return;
    const timer = setInterval(() => {
      setTiempoPausadoSeg((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [estado]);

  const evaluarAlertasEnTiempoReal = () => {
    const ahoraStr = new Date().toLocaleTimeString();

    // 2. Clima adverso
    if (esClimaAdverso(climaActual)) {
      agregarAlertaUnica({
        id: 'alerta-clima',
        tipo: 'CLIMA_ADVERSO',
        descripcion: `Condición climática adversa detectada: ${climaActual}. Extreme precauciones.`,
        fechaHora: ahoraStr,
        confirmada: false,
        estadoClima: climaActual,
      });
    }

    // 3. Frecuencia cardíaca excedida (> 160 bpm)
    if (frecuenciaExcedida(frecuenciaCardiaca, smartwatchVinculado)) {
      agregarAlertaUnica({
        id: 'alerta-fc',
        tipo: 'FRECUENCIA_CARDIACA',
        descripcion: `Frecuencia cardíaca elevada (${frecuenciaCardiaca} bpm). Reduzca el ritmo.`,
        fechaHora: ahoraStr,
        confirmada: false,
      });
    }

    // 4. Bluetooth desconectado
    if (!bluetoothSincronizado) {
      agregarAlertaUnica({
        id: 'alerta-bt',
        tipo: 'BLUETOOTH',
        descripcion: 'Pérdida de conexión Bluetooth con el triciclo. Reintentando...',
        fechaHora: ahoraStr,
        confirmada: false,
      });
    }
  };

  const agregarAlertaUnica = (nuevaAlerta: Alerta) => {
    setAlertas((prev) => {
      if (prev.some((a) => a.tipo === nuevaAlerta.tipo)) {
        return prev;
      }
      return [...prev, nuevaAlerta];
    });
  };

  const confirmarAlerta = (id: string) => {
    const alertaEncontrada = alertas.find((a) => a.id === id);
    if (alertaEncontrada) {
      setHistorialAlertas((prev) => [
        ...prev,
        {
          tipo: alertaEncontrada.tipo,
          fechaHora: alertaEncontrada.fechaHora,
          descripcion: alertaEncontrada.descripcion,
        },
      ]);
      if (alertaEncontrada.tipo === 'BATERIA_BAJA') {
        setAsistenciaHibrida('INACTIVA');
      }
    }
    setAlertas((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePausar = () => setEstado('PAUSADO');
  const handleReanudar = () => setEstado('EN_CURSO');
  const handleEmergencia = () => setEstado('EMERGENCIA');
  const handleCancelarEmergencia = () => setEstado('EN_CURSO');
  const handleSolicitarFin = () => setMostrarModalFin(true);

  const handleCambiarBateria = (nuevoPct: number) => {
    const entero = Math.round(nuevoPct);
    setBateriaPct(entero);
    setAcumuladorBateria(0);
  };

  const handleConfirmarFinValido = () => {
    const velocidadPromedioKmh = velocidadesAcumuladas.length > 0
      ? velocidadesAcumuladas.reduce((a, b) => a + b, 0) / velocidadesAcumuladas.length
      : 0;

    const recorridoGuardado: RecorridoGuardado = {
      version: 1,
      id: `rec-${Date.now()}`,
      modalidad,
      nombre: nombreCircuito,
      origen,
      destino,
      fechaHoraInicio: new Date().toISOString(),
      distanciaKm: distanciaMetros / 1000,
      tiempoActivoSeg,
      velocidadPromedioKmh,
      frecuenciaCardiacaPromedio: smartwatchVinculado ? frecuenciaCardiaca : undefined,
      caloriasConsumidas,
      bateriaInicial: bateriaInicialValor,
      bateriaFinal: Math.round(bateriaPct),
      alertas: historialAlertas,
    };

    onFinalizarRecorridoGuardado(recorridoGuardado);
  };

  const handleConfirmarFinInvalido = () => {
    onCancelarOdescartar();
  };

  const handleRechazarFin = () => {
    setMostrarModalFin(false);
  };

  return (
    <div>
      {/* Panel de Simulación para pruebas */}
      <PanelSimulacion
        bateriaPct={bateriaPct}
        onCambiarBateria={handleCambiarBateria}
        climaActual={climaActual}
        onCambiarClima={setClimaActual}
        frecuenciaCardiaca={frecuenciaCardiaca}
        onCambiarFc={setFrecuenciaCardiaca}
        smartwatchVinculado={smartwatchVinculado}
        onToggleSmartwatch={() => setSmartwatchVinculado(!smartwatchVinculado)}
        bluetoothSincronizado={bluetoothSincronizado}
        onToggleBluetooth={() => setBluetoothSincronizado(!bluetoothSincronizado)}
        velocidadSimulada={velocidadSimulada}
        onCambiarVelocidad={setVelocidadSimulada}
      />

      {/* Pantalla de Emergencia si aplica */}
      {estado === 'EMERGENCIA' && (
        <PantallaEmergencia onCancelarEmergencia={handleCancelarEmergencia} />
      )}

      {errorGuardado && <p role="alert">{errorGuardado}</p>}
      {!audioDisponible && <p role="status">Audio no disponible. Lea y confirme los avisos visuales.</p>}
      {/* Alertas Activas */}
      {alertas.length > 0 && (
        <div className="alertas-activas">
          {alertas.map((alerta) => (
            <div className="alerta" key={alerta.id}>
              <div>
                <strong>Alerta ({alerta.tipo}):</strong>
                <div>{alerta.descripcion}</div>
              </div>
              <button
                onClick={() => confirmarAlerta(alerta.id)}
              >
                Confirmar
              </button>
            </div>
          ))}
        </div>
      )}

      {props.conexion?.estado !== 'CONECTADO' && props.conexion && <p className="aviso-conexion" role="status">
        {props.conexion.estado === 'SIN_TELEMETRIA' && <span role="img" aria-label="Bluetooth sin telemetría"><Icono nombre="bluetoothDesconectado" /></span>}
        {props.conexion.estado === 'REINTENTANDO' ? 'Reintentando Bluetooth' : 'Bluetooth sin telemetría'} · Intentos: {props.conexion.intentos}. Datos del vehículo no actualizados.
      </p>}
      <section className="tablero-marcha" aria-label="Métricas principales y controles">
        <div className="metricas">
          <Metrica nombre="Velocidad actual" icono="velocidad" valor={(velocidadVisible ?? '--') + ' km/h'} />
          <Metrica nombre="Distancia recorrida" icono="ruta" valor={(distanciaMetros / 1000).toFixed(2) + ' km'} />
          <Metrica nombre="Tiempo activo" icono="reloj" valor={Math.floor(tiempoActivoSeg / 60) + ':' + Math.floor(tiempoActivoSeg % 60).toString().padStart(2, '0')} />
          <Metrica nombre="Batería del triciclo" icono="bateria" valor={Math.round(bateriaPct) + '%'} />
          <Metrica nombre="Clima" icono={ICONO_CLIMA[climaActual]} valor={ETIQUETA_CLIMA[climaActual]} clase="metrica-clima" />
          {smartwatchVinculado ? <Metrica nombre="Frecuencia cardíaca" icono="pulso" valor={frecuenciaCardiaca + ' bpm'} /> : <Metrica nombre="Calorías" icono="calorias" valor={caloriasConsumidas.toFixed(1) + ' kcal'} />}
        </div>
        <div className="controles-marcha">
          <button aria-label="Pausar" disabled={estado !== 'EN_CURSO'} onClick={handlePausar}><Icono nombre="pausa" />Pausar</button>
          <button aria-label="Emergencia" disabled={estado !== 'EN_CURSO'} onClick={handleEmergencia}><Icono nombre="emergencia" />Emergencia</button>
          <button aria-label="Finalizar Recorrido" disabled={estado !== 'EN_CURSO'} onClick={handleSolicitarFin}><Icono nombre="fin" />Finalizar</button>
        </div>
      </section>
      <section className="detalle-vehiculo" aria-label="Estado de la aplicación y del vehículo">
        <h2>Estado del recorrido</h2><p className="detalle-modalidad">{modalidad}</p>
        {modalidad === 'PERSONALIZADO' && <p className="detalle-ruta">Origen: {origen} · Destino: {destino}</p>}
        {modalidad === 'PRECARGADO' && <p className="detalle-ruta">{nombreCircuito}</p>}
        <p>Asistencia híbrida: <strong>{asistenciaHibrida}</strong></p>
        <p><strong>Motores: {motoresDelanteros} | Frenos: {frenos}</strong></p>
        <p>Bluetooth: <strong>{bluetoothSincronizado ? 'Sincronizado' : 'Desconectado'}</strong></p>
        <p>Batería móvil: <strong>{props.estadoVehiculo?.bateriaMovilPct ?? 65}%</strong></p>
        <p>Odómetro: <strong>{(props.estadoVehiculo?.odometroKm ?? 0).toFixed(2)} km</strong></p>
        <p>Calorías: {caloriasConsumidas.toFixed(1)} kcal</p>
      </section>

      {/* Modal de Validación de Mínimos al Finalizar */}
      {mostrarModalFin && (
        <ModalValidacionFin
          distanciaMetros={distanciaMetros}
          tiempoMarchaSeg={tiempoActivoSeg}
          onConfirmarFinValido={handleConfirmarFinValido}
          onConfirmarFinInvalido={handleConfirmarFinInvalido}
          onRechazarFin={handleRechazarFin}
        />
      )}
    </div>
  );
}
