import React, { useState } from 'react';
import type { ModalidadRecorrido } from '../domain/tipos';

interface SelectorModalidadProps {
  modalidadSeleccionada: ModalidadRecorrido;
  onSelectModalidad: (mod: ModalidadRecorrido) => void;
  onFiltrarClick: () => void;
}

export function SelectorModalidad({
  modalidadSeleccionada,
  onSelectModalidad,
  onFiltrarClick,
}: SelectorModalidadProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.95rem' }}>
        Seleccionar Modalidad de Recorrido:
      </label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={() => onSelectModalidad('LIBRE')}
          style={{
            flex: 1,
            padding: '8px 4px',
            background: modalidadSeleccionada === 'LIBRE' ? '#0066cc' : '#e2e8f0',
            color: modalidadSeleccionada === 'LIBRE' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 'bold',
          }}
        >
          Libre
        </button>
        <button
          onClick={() => onSelectModalidad('PERSONALIZADO')}
          style={{
            flex: 1,
            padding: '8px 4px',
            background: modalidadSeleccionada === 'PERSONALIZADO' ? '#0066cc' : '#e2e8f0',
            color: modalidadSeleccionada === 'PERSONALIZADO' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 'bold',
          }}
        >
          Personalizado
        </button>
        <button
          onClick={() => onSelectModalidad('PRECARGADO')}
          style={{
            flex: 1,
            padding: '8px 4px',
            background: modalidadSeleccionada === 'PRECARGADO' ? '#0066cc' : '#e2e8f0',
            color: modalidadSeleccionada === 'PRECARGADO' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 'bold',
          }}
        >
          Precargado
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onFiltrarClick}
          style={{
            padding: '6px 12px',
            background: '#4a5568',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          🔍 Filtrar recorridos
        </button>
      </div>
    </div>
  );
}
