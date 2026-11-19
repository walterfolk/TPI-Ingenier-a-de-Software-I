import React, { useState } from 'react';
import { CondicionClima, EstadoVehiculoMovil, IntensidadClima } from '../domain/tipos';

interface PanelSimulacionProps {
  vehiculo: Omit<EstadoVehiculoMovil, 'bluetoothSincronizado'>;
  onCambiarVehiculo: (cambios: Partial<Omit<EstadoVehiculoMovil, 'bluetoothSincronizado'>>) => void;
  umbralFrecuencia: number;
  onCambiarUmbral: (valor: number) => void;
  bateriaPct: number;
  onCambiarBateria: (pct: number) => void;
  climaActual: CondicionClima;
  intensidadClima: IntensidadClima;
  onCambiarIntensidad: (valor: IntensidadClima) => void;
  onCambiarClima: (clima: CondicionClima) => void;
  frecuenciaCardiaca: number;
  onCambiarFc: (fc: number) => void;
  smartwatchVinculado: boolean;
  onToggleSmartwatch: () => void;
  bluetoothSincronizado: boolean;
  onToggleBluetooth: () => void;
  velocidadSimulada: number;
  onCambiarVelocidad: (v: number) => void;
}

export function PanelSimulacion({
  vehiculo, onCambiarVehiculo,
  umbralFrecuencia, onCambiarUmbral,
  bateriaPct,
  onCambiarBateria,
  climaActual,
  intensidadClima,
  onCambiarIntensidad,
  onCambiarClima,
  frecuenciaCardiaca,
  onCambiarFc,
  smartwatchVinculado,
  onToggleSmartwatch,
  bluetoothSincronizado,
  onToggleBluetooth,
  velocidadSimulada,
  onCambiarVelocidad,
}: PanelSimulacionProps) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className={'panel-simulacion' + (expandido ? ' expandido' : '')}>
      <div className="cabecera-simulacion"
        onClick={() => setExpandido(!expandido)}
      >
        <span className="titulo-simulacion">Panel de Simulación (Hardware y Sensores)</span>
        <span>{expandido ? '▲ Ocultar' : '▼ Mostrar'}</span>
      </div>

      {expandido && (
        <div className="controles-simulacion">
          <fieldset><legend>Estado simulado</legend>
            <label>Batería móvil<input aria-label="Batería móvil simulada" type="range" min="0" max="100" value={Math.round(vehiculo.bateriaMovilPct)} onChange={e => onCambiarVehiculo({bateriaMovilPct: Number(e.target.value)})} /></label>
            <label>Odómetro<input aria-label="Odómetro simulado" type="number" min="0" value={Math.round(vehiculo.odometroKm)} onChange={e => {const n=Number(e.target.value); if(Number.isFinite(n) && n>=0) onCambiarVehiculo({odometroKm: Math.round(n)});}} /></label>
            <label>Asistencia<select aria-label="Asistencia simulada" value={vehiculo.asistenciaHibrida} onChange={e => onCambiarVehiculo({asistenciaHibrida: e.target.value as EstadoVehiculoMovil['asistenciaHibrida']})}><option>ACTIVA</option><option>LIMITADA</option><option>INACTIVA</option></select></label>
            {(['motoresDelanteros', 'frenos'] as const).map(campo => <label key={campo}>{campo === 'frenos' ? 'Frenos' : 'Motores'}<select aria-label={campo === 'frenos' ? 'Frenos simulados' : 'Motores simulados'} value={vehiculo[campo]} onChange={e => onCambiarVehiculo({[campo]: e.target.value as 'OK' | 'ATENCION'})}><option>OK</option><option>ATENCION</option></select></label>)}
          </fieldset>
          <label>Umbral cardíaco simulado (BPM)<input aria-label="Umbral cardíaco simulado" type="number" min="1" max="300" value={umbralFrecuencia} onChange={e => { const n = Number(e.target.value); if (n > 0 && n <= 300) onCambiarUmbral(n); }} /></label>
          <div>
            <span>Batería Triciclo: <strong>{Math.round(bateriaPct)}%</strong></span>
            <input
              aria-label="Batería del triciclo"
              type="range"
              min="0"
              max="100"
              value={bateriaPct}
              onChange={(e) => onCambiarBateria(Number(e.target.value))}
            />
          </div>

          <div>
            <span>Velocidad: <strong>{velocidadSimulada} km/h</strong></span>
            <input
              aria-label="Velocidad simulada"
              type="range"
              min="0"
              max="30"
              value={velocidadSimulada}
              onChange={(e) => onCambiarVelocidad(Number(e.target.value))}
            />
          </div>

          <div>
            <span>Clima:</span>
            <select
              aria-label="Clima simulado"
              value={climaActual}
              onChange={(e) => {
                const clima = e.target.value as CondicionClima;
                onCambiarClima(clima);
                if (clima === 'VIENTO_FUERTE') onCambiarIntensidad('ELEVADA');
              }}
            >
              <option value="DESPEJADO">Despejado</option>
              <option value="NUBLADO">Nublado</option>
              <option value="LLUVIA">Lluvia</option>
              <option value="VIENTO">Viento</option>
              <option value="VIENTO_FUERTE">Viento fuerte</option>
              <option value="ESCARCHA_HIELO">Escarcha o hielo</option>
              <option value="TORMENTA">Tormenta</option>
            </select>
          </div>

          <div>
            <label>Intensidad climática simulada
              <select aria-label="Intensidad climática simulada" value={intensidadClima} onChange={e => {
                const intensidad = e.target.value as IntensidadClima;
                onCambiarIntensidad(intensidad);
                if (intensidad === 'NORMAL' && climaActual === 'VIENTO_FUERTE') onCambiarClima('VIENTO');
              }}><option value="NORMAL">Normal</option><option value="ELEVADA">Elevada</option></select>
            </label>
          </div>
          <div>
            <span>Smartwatch:</span>
            <button
              onClick={onToggleSmartwatch}
            >
              {smartwatchVinculado ? 'Vinculado' : 'No vinculado'}
            </button>
          </div>

          {smartwatchVinculado && (
            <div>
              <span>Pulso (BPM): <strong>{frecuenciaCardiaca} bpm</strong></span>
              <input
                aria-label="Frecuencia cardíaca simulada"
                type="range"
                min="60"
                max="190"
                value={frecuenciaCardiaca}
                onChange={(e) => onCambiarFc(Number(e.target.value))}
              />
            </div>
          )}

          <div>
            <span>Bluetooth (BLE):</span>
            <button
              onClick={onToggleBluetooth}
            >
              {bluetoothSincronizado ? 'Conectado' : 'Desconectado'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
