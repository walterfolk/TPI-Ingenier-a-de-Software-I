import { useRef } from 'react';
import { Icono } from './Icono';
import { Metrica } from './Metrica';
import { ICONO_CLIMA, ETIQUETA_CLIMA } from './clima';
import { useRecorrido, type PantallaSeguimientoProps } from '../hooks/useRecorrido';
import { PantallaEmergencia } from './PantallaEmergencia';
import { ModalValidacionFin } from './ModalValidacionFin';

export function PantallaSeguimiento(props: PantallaSeguimientoProps) {
  const { modalidad, origen, destino, nombreCircuito, bateriaPct, climaActual,
    smartwatchVinculado, frecuenciaCardiaca, bluetoothSincronizado, velocidadSimulada } = props;
  const { errorGuardado, audioDisponible, estado, distanciaMetros, tiempoActivoSeg,
    caloriasConsumidas, asistenciaHibrida, motoresDelanteros, frenos, alertas,
    mostrarModalFin, confirmarAlerta, handlePausar, handleReanudar, handleEmergencia,
    handleCancelarEmergencia, handleSolicitarFin, handleConfirmarFinValido,
    handleConfirmarFinInvalido, handleRechazarFin } = useRecorrido(props);

  const ultimaVelocidadValida = useRef<number>();
  if (Number.isFinite(velocidadSimulada) && velocidadSimulada >= 0) {
    ultimaVelocidadValida.current = velocidadSimulada;
  }
  const velocidadVisible = ultimaVelocidadValida.current;

  if (estado === 'PAUSADO') {
    return <div className="modal-recorrido pausa" role="dialog" aria-modal="true" aria-label="Recorrido en pausa" onKeyDown={e => { if (e.key === 'Tab') e.preventDefault(); }}>
      <section><h2>Recorrido en pausa</h2>
        <p>El tiempo activo y la distancia están pausados.</p>
        <button autoFocus onClick={handleReanudar}><Icono nombre="continuar" />Continuar recorrido</button>
      </section>
    </div>;
  }

  if (estado === 'EMERGENCIA') {
    return <PantallaEmergencia onCancelarEmergencia={handleCancelarEmergencia} />;
  }

  return (
    <div className="seguimiento" role="region" aria-label="Seguimiento del recorrido">
      {errorGuardado && <p role="alert">{errorGuardado}</p>}
      {!audioDisponible && <p role="status">Audio no disponible. Lea y confirme los avisos visuales.</p>}
      {alertas.length > 0 && (
        <div className="alertas-activas">
          {alertas.map((alerta) => (
            <div className="alerta" key={alerta.id}>
              <div>
                <strong>Alerta ({alerta.tipo}):</strong>
                <div>{alerta.descripcion}</div>
              </div>
              <button onClick={() => confirmarAlerta(alerta.id)}>Confirmar</button>
            </div>
          ))}
        </div>
      )}

      {props.conexion?.estado !== 'CONECTADO' && props.conexion && <p className="aviso-conexion" role="status">
        {props.conexion.estado === 'SIN_TELEMETRIA' && <span role="img" aria-label="Bluetooth sin telemetría"><Icono nombre="bluetoothDesconectado" /></span>}
        {props.conexion.estado === 'REINTENTANDO' ? 'Reintentando Bluetooth' : 'Bluetooth sin telemetría'} · Intentos: {props.conexion.intentos}. Datos del vehículo no actualizados.
      </p>}
      <section className="tablero-marcha" aria-label="Métricas principales y controles">
        <div className={'metricas' + (smartwatchVinculado ? ' metricas-7' : '')}>
          <Metrica nombre="Velocidad actual" icono="velocidad" valor={(velocidadVisible ?? '--') + ' km/h'} />
          <Metrica nombre="Distancia recorrida" icono="ruta" valor={(distanciaMetros / 1000).toFixed(2) + ' km'} />
          <Metrica nombre="Tiempo activo" icono="reloj" valor={Math.floor(tiempoActivoSeg / 60) + ':' + Math.floor(tiempoActivoSeg % 60).toString().padStart(2, '0')} />
          <Metrica nombre="Batería del triciclo" icono="bateria" valor={Math.round(bateriaPct) + '%'} />
          <Metrica nombre="Clima" icono={ICONO_CLIMA[climaActual]} valor={ETIQUETA_CLIMA[climaActual]} clase="metrica-clima" />
          {smartwatchVinculado && <Metrica nombre="Frecuencia cardíaca" icono="pulso" valor={frecuenciaCardiaca + ' bpm'} />}
          <Metrica nombre="Calorías" icono="calorias" valor={caloriasConsumidas.toFixed(1) + ' kcal'} />
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
        <p className="detalle-odometro">Odómetro: <strong>{(props.estadoVehiculo?.odometroKm ?? 0).toFixed(2)} km</strong></p>
        <p>Calorías: {caloriasConsumidas.toFixed(1)} kcal</p>
      </section>

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
