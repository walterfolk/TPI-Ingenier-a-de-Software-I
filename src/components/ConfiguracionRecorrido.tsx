import React, { useState } from 'react';
import type { ModalidadRecorrido } from '../domain/tipos';
import { PUNTOS_REFERENCIA, CIRCUITOS_PRECARGADOS, calcularViabilidad } from '../services/catalogo';

interface ConfiguracionRecorridoProps {
  modalidad: ModalidadRecorrido;
  onIniciar: (config: { modalidad: ModalidadRecorrido; origen?: string; destino?: string; circuitoId?: string }) => void;
}

export function ConfiguracionRecorrido({ modalidad, onIniciar }: ConfiguracionRecorridoProps) {
  const [origen, setOrigen] = useState(PUNTOS_REFERENCIA[0].nombre);
  const [destino, setDestino] = useState(PUNTOS_REFERENCIA[1].nombre);
  const [circuitoId, setCircuitoId] = useState(CIRCUITOS_PRECARGADOS[0].id);

  const viabilidad = calcularViabilidad({
    modalidad,
    origen,
    destino,
    circuitoId,
  }, 80);

  const handleIniciarClick = () => {
    onIniciar({
      modalidad,
      origen: modalidad === 'PERSONALIZADO' ? origen : undefined,
      destino: modalidad === 'PERSONALIZADO' ? destino : undefined,
      circuitoId: modalidad === 'PRECARGADO' ? circuitoId : undefined,
    });
  };

  return (
    <div style={{
      background: '#fff',
      padding: '16px',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#1a365d' }}>
        Configuración de Recorrido ({modalidad})
      </h3>

      {modalidad === 'LIBRE' && (
        <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: '0 0 16px 0' }}>
          Recorrido sin destino fijo. Presione iniciar para comenzar la marcha libre.
        </p>
      )}

      {modalidad === 'PERSONALIZADO' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              Punto de Origen:
            </label>
            <select
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem' }}
            >
              {PUNTOS_REFERENCIA.map((p) => (
                <option key={`origen-${p.id}`} value={p.nombre}>
                  {p.nombre} [{p.x} km, {p.y} km]
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              Punto de Destino:
            </label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem' }}
            >
              {PUNTOS_REFERENCIA.map((p) => (
                <option key={`destino-${p.id}`} value={p.nombre}>
                  {p.nombre} [{p.x} km, {p.y} km]
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {modalidad === 'PRECARGADO' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
            Seleccionar Circuito Oficial:
          </label>
          <select
            value={circuitoId}
            onChange={(e) => setCircuitoId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.9rem' }}
          >
            {CIRCUITOS_PRECARGADOS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.alertaTerreno ? `(⚠️ ${c.alertaTerreno})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Estimaciones de viabilidad */}
      <div style={{
        background: '#f7fafc',
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '0.85rem',
        marginBottom: '16px'
      }} >
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#2d3748' }}>📊 Estimaciones de Viabilidad:</div>
        {modalidad !== 'LIBRE' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: '#4a5568' }}>
              <div>Distancia: <strong>{viabilidad.distanciaKm.toFixed(1)} km</strong></div>
              <div>Tiempo est.: <strong>{viabilidad.tiempoEstimadoMin} min</strong></div>
              <div>Batería est.: <strong>{viabilidad.consumoBateriaPct}%</strong></div>
              <div>Calorías: <strong>{viabilidad.caloriasKcal} kcal</strong></div>
            </div>
            <div style={{
              marginTop: '6px',
              color: viabilidad.esViable ? '#276749' : '#c53030',
              fontWeight: 'bold'
            }}>
              Estado: {viabilidad.esViable ? 'Viable (Suficiente batería)' : `No viable (${viabilidad.motivoNoViable})`}
            </div>
          </>
        ) : (
          <div style={{ color: '#4a5568' }}>Sin límite de destino (Recorrido Libre).</div>
        )}
      </div>

      <button
        onClick={handleIniciarClick}
        style={{
          width: '100%',
          padding: '12px',
          background: '#319795',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Iniciar Recorrido
      </button>
    </div>
  );
}
