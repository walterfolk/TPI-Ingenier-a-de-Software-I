import React from 'react';
import { Icono } from './Icono';
import { Metrica } from './Metrica';
import { ICONO_CLIMA, ETIQUETA_CLIMA } from './clima';
import { useRecorrido, type PantallaSeguimientoProps } from '../hooks/useRecorrido';
import { PantallaEmergencia } from './PantallaEmergencia';
import { ModalValidacionFin } from './ModalValidacionFin';
export function PantallaSeguimiento(props: PantallaSeguimientoProps) {
  const { bateriaPct, climaActual, smartwatchVinculado, frecuenciaCardiaca, bluetoothSincronizado, velocidadSimulada, modalidad, origen, destino, nombreCircuito } = props;
  // Respaldo exclusivo de presentación: no interviene en cálculos ni sensores.
  const ultimaVelocidadVisible = React.useRef<number>();
  const velocidadValida = Number.isFinite(velocidadSimulada) && velocidadSimulada >= 0;
  const velocidadVisible = velocidadValida ? velocidadSimulada : ultimaVelocidadVisible.current;
  React.useEffect(() => {
    if (velocidadValida) ultimaVelocidadVisible.current = velocidadSimulada;
  }, [velocidadValida, velocidadSimulada]);
  const { errorGuardado, audioDisponible, estado, distanciaMetros, tiempoActivoSeg, caloriasConsumidas, asistenciaHibrida, motoresDelanteros, frenos, alertas, mostrarModalFin, confirmarAlerta, handlePausar, handleReanudar, handleEmergencia, handleCancelarEmergencia, handleSolicitarFin, handleConfirmarFinValido, handleConfirmarFinInvalido, handleRechazarFin } = useRecorrido(props);
  if (estado === 'EMERGENCIA') return <div className="seguimiento" role="region" aria-label="Seguimiento del recorrido">
    <PantallaEmergencia onCancelarEmergencia={handleCancelarEmergencia} />
  </div>;
  if (estado === 'PAUSADO') return <div className="seguimiento" role="region" aria-label="Seguimiento del recorrido">
    <div className="modal-recorrido" role="dialog" aria-modal="true" aria-label="Recorrido en pausa" onKeyDown={e => { if (e.key === 'Tab') e.preventDefault(); }}>
      <section><p>Recorrido en pausa</p><button autoFocus onClick={handleReanudar}><Icono nombre="continuar" />Continuar recorrido</button></section>
    </div>
  </div>;
  return (
    <div className="seguimiento" role="region" aria-label="Seguimiento del recorrido">
      <header className="cabecera-seguimiento"><div><p className="sobretitulo">ACTIVIDAD EN CURSO</p><h1>Tu recorrido</h1></div><span className="estado-en-vivo">En vivo</span></header>

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
