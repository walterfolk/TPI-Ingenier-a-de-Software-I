import React from 'react';

interface PantallaEmergenciaProps {
  onCancelarEmergencia: () => void;
}

export function PantallaEmergencia({ onCancelarEmergencia }: PantallaEmergenciaProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#fff5f5',
        border: '3px solid #e53e3e',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🚨</div>
        <h2 style={{ color: '#c53030', margin: '0 0 12px 0', fontSize: '1.4rem' }}>
          MODO EMERGENCIA ACTIVADO
        </h2>
        <p style={{ color: '#4a5568', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.4' }}>
          Se ha activado el protocolo de emergencia del triciclo. Asistencia técnica y de seguridad notificada (simulado).
        </p>
        <button
          onClick={onCancelarEmergencia}
          style={{
            background: '#3182ce',
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Cancelar Emergencia y Reanudar Marcha
        </button>
      </div>
    </div>
  );
}
