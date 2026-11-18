import React from 'react';

export function EstadoVehiculoBar() {
  return (
    <div style={{
      background: '#f0f4f8',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '0.85rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      border: '1px solid #d9e2ec'
    }}>
      <span>🔋 Batería: <strong>80%</strong></span>
      <span>☁️ Clima: <strong>Despejado</strong></span>
      <span>📶 BT: <strong>Conectado</strong></span>
      <span>⌚ Smartwatch: <strong>Vinculado</strong></span>
    </div>
  );
}
