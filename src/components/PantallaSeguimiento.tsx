import React, { useState, useEffect } from 'react';
import type { 
  EstadoRecorrido, 
  ModalidadRecorrido, 
  CondicionClima, 
  Alerta, 
  AsistenciaHibrida, 
  EstadoSistema, 
  RecorridoGuardado 
} from '../domain/tipos';
import { CONFIG_RECORRIDO } from '../domain/config';
import { esClimaAdverso, bateriaBaja, frecuenciaExcedida } from '../domain/reglas';
import { PanelSimulacion } from './PanelSimulacion';
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

      {/* Alertas Activas */}
      {alertas.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {alertas.map((alerta) => (
            <div key={alerta.id} style={{
              background: '#fffaf0',
              border: '1px solid #ed8936',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem'
            }}>
              <div>
                <strong style={{ color: '#c05621' }}>⚠️ Alerta ({alerta.tipo}):</strong>
                <div style={{ color: '#4a5568' }}>{alerta.descripcion}</div>
              </div>
              <button
                onClick={() => confirmarAlerta(alerta.id)}
                style={{
                  background: '#ed8936',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}
              >
                Confirmar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tarjeta Principal de Seguimiento y Telemetría */}
      <div style={{
        background: '#fff',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1a365d' }}>
            {estado === 'EN_CURSO' ? '🟢 Recorrido en Curso' : estado === 'PAUSADO' ? '⏸️ Recorrido Pausado' : '⚡ Monitoreo'}
          </h3>
          <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
            {modalidad}
          </span>
        </div>

        {/* Info de ruta */}
        <div style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '14px', background: '#f7fafc', padding: '8px', borderRadius: '6px' }}>
          {modalidad === 'PERSONALIZADO' && (
            <div>Origen: <strong>{origen}</strong> ➔ Destino: <strong>{destino}</strong></div>
          )}
          {modalidad === 'PRECARGADO' && (
            <div>Circuito: <strong>{nombreCircuito}</strong></div>
          )}
          {modalidad === 'LIBRE' && (
            <div>Modalidad libre sin destino establecido.</div>
          )}
        </div>

        {/* Panel de Telemetría Principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#edf2f7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#718096' }}>VELOCIDAD ACTUAL</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2d3748' }}>
              {velocidadSimulada} <span style={{ fontSize: '0.8rem' }}>km/h</span>
            </div>
          </div>

          <div style={{ background: '#edf2f7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#718096' }}>DISTANCIA RECORRIDA</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2d3748' }}>
              {(distanciaMetros / 1000).toFixed(2)} <span style={{ fontSize: '0.8rem' }}>km</span>
            </div>
          </div>

          <div style={{ background: '#edf2f7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#718096' }}>TIEMPO ACTIVO</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2d3748' }}>
              {Math.floor(tiempoActivoSeg / 60)}:{(tiempoActivoSeg % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div style={{ background: '#edf2f7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#718096' }}>CALORÍAS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2d3748' }}>
              {caloriasConsumidas} <span style={{ fontSize: '0.8rem' }}>kcal</span>
            </div>
          </div>
        </div>

        {/* Estado del Sistema y Sensores */}
        <div style={{ fontSize: '0.8rem', color: '#4a5568', background: '#f7fafc', padding: '10px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>🔋 Batería: <strong>{Math.round(bateriaPct)}%</strong></div>
          <div>⚡ Asistencia Híbrida: <strong>{asistenciaHibrida}</strong></div>
          <div>⚙️ Motores / Frenos: <strong>Motores: {motoresDelanteros} | Frenos: {frenos}</strong></div>
          <div>☁️ Clima: <strong>{climaActual}</strong></div>
          {smartwatchVinculado && (
            <div>⌚ Frecuencia Cardíaca: <strong style={{ color: frecuenciaCardiaca > 160 ? '#c53030' : 'inherit' }}>{frecuenciaCardiaca} bpm</strong></div>
          )}
          <div>📶 Bluetooth: <strong>{bluetoothSincronizado ? 'Sincronizado' : 'Desconectado'}</strong></div>
        </div>

        {/* Botones de Control del Recorrido */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {estado === 'EN_CURSO' ? (
              <button
                onClick={handlePausar}
                style={{ flex: 1, padding: '10px', background: '#dd6b20', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ⏸️ Pausar
              </button>
            ) : (
              <button
                onClick={handleReanudar}
                style={{ flex: 1, padding: '10px', background: '#319795', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ▶️ Reanudar
              </button>
            )}

            <button
              onClick={handleEmergencia}
              style={{ flex: 1, padding: '10px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🚨 Emergencia
            </button>
          </div>

          <button
            onClick={handleSolicitarFin}
            style={{ width: '100%', padding: '12px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🏁 Finalizar Recorrido
          </button>
        </div>
      </div>

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
