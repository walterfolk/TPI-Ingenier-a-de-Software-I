import React from 'react';
import { RecorridoGuardado } from '../domain/tipos';

interface PantallaResumenProps {
  recorrido: RecorridoGuardado;
  onVolverInicio: () => void;
}

export function PantallaResumen({ recorrido, onVolverInicio }: PantallaResumenProps) {
  const minutos = Math.floor(recorrido.tiempoActivoSeg / 60);
  const segundos = recorrido.tiempoActivoSeg % 60;
  const bateriaConsumida = Math.max(0, recorrido.bateriaInicial - recorrido.bateriaFinal);

  return (
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
      <h2 style={{ color: '#1a365d', margin: '0 0 4px 0', fontSize: '1.25rem' }}>
        ¡Recorrido Finalizado con Éxito!
      </h2>
      <p style={{ color: '#4a5568', fontSize: '0.85rem', marginBottom: '16px' }}>
        El recorrido ha sido guardado correctamente en el historial.
      </p>

      <div style={{
        background: '#f7fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '14px',
        textAlign: 'left',
        fontSize: '0.9rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '20px',
        color: '#2d3748'
      }}>
        <div>Modalidad: <strong>{recorrido.modalidad}</strong> {recorrido.nombre ? `(${recorrido.nombre})` : ''}</div>
        {recorrido.origen && <div>Origen: <strong>{recorrido.origen}</strong></div>}
        {recorrido.destino && <div>Destino: <strong>{recorrido.destino}</strong></div>}
        <div>Distancia total: <strong>{recorrido.distanciaKm.toFixed(2)} km</strong></div>
        <div>Tiempo activo: <strong>{minutos} min {segundos} seg</strong></div>
        <div>Velocidad promedio: <strong>{recorrido.velocidadPromedioKmh.toFixed(1)} km/h</strong></div>
        <div>Calorías consumidas: <strong>{recorrido.caloriasConsumidas} kcal</strong></div>
        <div>Batería: <strong>{recorrido.bateriaInicial}% ➔ {recorrido.bateriaFinal}% (Consumo: {bateriaConsumida}%)</strong></div>
        {recorrido.frecuenciaCardiacaPromedio && (
          <div>Frecuencia cardíaca prom.: <strong>{recorrido.frecuenciaCardiacaPromedio} bpm</strong></div>
        )}
        <div>Alertas registradas: <strong>{recorrido.alertas.length}</strong></div>
      </div>

      <button
        onClick={onVolverInicio}
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
        Volver al Inicio
      </button>
    </div>
  );
}
