import React from 'react';
import { cumpleMinimos } from '../domain/reglas';

interface ModalValidacionFinProps {
  distanciaMetros: number;
  tiempoMarchaSeg: number;
  onConfirmarFinValido: () => void;
  onConfirmarFinInvalido: () => void;
  onRechazarFin: () => void;
}

export function ModalValidacionFin({
  distanciaMetros,
  tiempoMarchaSeg,
  onConfirmarFinValido,
  onConfirmarFinInvalido,
  onRechazarFin,
}: ModalValidacionFinProps) {
  const esValido = cumpleMinimos(distanciaMetros, tiempoMarchaSeg);
  const distanciaKm = (distanciaMetros / 1000).toFixed(2);
  const minutos = Math.floor(tiempoMarchaSeg / 60);
  const segundos = tiempoMarchaSeg % 60;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1a365d', fontSize: '1.1rem' }}>
          🏁 Finalizar Recorrido
        </h3>

        <div style={{ background: '#f7fafc', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.9rem', color: '#4a5568' }}>
          <div>Distancia recorrida: <strong>{distanciaKm} km ({distanciaMetros} m)</strong></div>
          <div>Tiempo de marcha: <strong>{minutos} min {segundos} seg</strong></div>
        </div>

        {esValido ? (
          <div>
            <p style={{ color: '#276749', fontSize: '0.9rem', marginBottom: '16px', fontWeight: 'bold' }}>
              ✓ El recorrido cumple con los mínimos requeridos (≥ 300 m o ≥ 180 s). Se guardará en el historial.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onRechazarFin}
                style={{ flex: 1, padding: '10px', background: '#e2e8f0', color: '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Continuar
              </button>
              <button
                onClick={onConfirmarFinValido}
                style={{ flex: 1, padding: '10px', background: '#319795', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Guardar y Finalizar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: '#c53030', fontSize: '0.9rem', marginBottom: '16px', fontWeight: 'bold' }}>
              ⚠️ El recorrido no alcanza los mínimos requeridos (&lt; 300 m y &lt; 180 s). No se guardará en el historial.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onRechazarFin}
                style={{ flex: 1, padding: '10px', background: '#e2e8f0', color: '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Continuar Recorrido
              </button>
              <button
                onClick={onConfirmarFinInvalido}
                style={{ flex: 1, padding: '10px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Descartar y Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
