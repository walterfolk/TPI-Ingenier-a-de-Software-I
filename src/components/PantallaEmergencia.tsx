import React from 'react';

interface PantallaEmergenciaProps {
  onCancelarEmergencia: () => void;
}

export function PantallaEmergencia({ onCancelarEmergencia }: PantallaEmergenciaProps) {
  return (
    <div style={{
      background: '#fff5f5',
      border: '2px solid #e53e3e',
      borderRadius: '10px',
      padding: '20px',
      textAlign: 'center',
      marginBottom: '16px'
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚨</div>
      <h2 style={{ color: '#c53030', margin: '0 0 8px 0', fontSize: '1.25rem' }}>
        MODO EMERGENCIA ACTIVADO
      </h2>
      <p style={{ color: '#4a5568', fontSize: '0.9rem', marginBottom: '16px' }}>
        Se ha activado el protocolo de emergencia del triciclo. Asistencia técnica y de seguridad notificada (simulado).
      </p>
      <button
        onClick={onCancelarEmergencia}
        style={{
          background: '#3182ce',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Cancelar Emergencia y Reanudar Marcha
      </button>
    </div>
  );
}
