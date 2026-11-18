import React, { useState } from 'react';
import { CondicionClima } from '../domain/tipos';

interface PanelSimulacionProps {
  bateriaPct: number;
  onCambiarBateria: (pct: number) => void;
  climaActual: CondicionClima;
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
  bateriaPct,
  onCambiarBateria,
  climaActual,
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
    <div style={{
      background: '#edf2f7',
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
      padding: '8px 12px',
      marginBottom: '16px',
      fontSize: '0.85rem'
    }}>
      <div
        onClick={() => setExpandido(!expandido)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#2d3748'
        }}
      >
        <span>🛠️ Panel de Simulación (Hardware y Sensores)</span>
        <span>{expandido ? '▲ Ocultar' : '▼ Mostrar'}</span>
      </div>

      {expandido && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #cbd5e0', paddingTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Batería Triciclo: <strong>{bateriaPct}%</strong></span>
            <input
              type="range"
              min="0"
              max="100"
              value={bateriaPct}
              onChange={(e) => onCambiarBateria(Number(e.target.value))}
              style={{ width: '120px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Velocidad: <strong>{velocidadSimulada} km/h</strong></span>
            <input
              type="range"
              min="0"
              max="30"
              value={velocidadSimulada}
              onChange={(e) => onCambiarVelocidad(Number(e.target.value))}
              style={{ width: '120px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Clima:</span>
            <select
              value={climaActual}
              onChange={(e) => onCambiarClima(e.target.value as CondicionClima)}
              style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
            >
              <option value="DESPEJADO">Despejado</option>
              <option value="NUBLADO">Nublado</option>
              <option value="LLUVIA">Lluvia</option>
              <option value="VIENTO_FUERTE">Viento fuerte</option>
              <option value="TORMENTA">Tormenta</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Smartwatch:</span>
            <button
              onClick={onToggleSmartwatch}
              style={{
                padding: '2px 8px',
                background: smartwatchVinculado ? '#319795' : '#e53e3e',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {smartwatchVinculado ? 'Vinculado' : 'No vinculado'}
            </button>
          </div>

          {smartwatchVinculado && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Pulso (BPM): <strong>{frecuenciaCardiaca} bpm</strong></span>
              <input
                type="range"
                min="60"
                max="190"
                value={frecuenciaCardiaca}
                onChange={(e) => onCambiarFc(Number(e.target.value))}
                style={{ width: '120px' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Bluetooth (BLE):</span>
            <button
              onClick={onToggleBluetooth}
              style={{
                padding: '2px 8px',
                background: bluetoothSincronizado ? '#319795' : '#e53e3e',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {bluetoothSincronizado ? 'Conectado' : 'Desconectado'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
