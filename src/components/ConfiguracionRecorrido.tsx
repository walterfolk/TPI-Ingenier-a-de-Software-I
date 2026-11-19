import { Icono } from './Icono';
import React, { useEffect, useState } from 'react';
import type { CondicionClima, IntensidadClima, ModalidadRecorrido } from '../domain/tipos';
import { useAudioAlertas } from '../hooks/useAudioAlertas';
import { bateriaBaja, esClimaAdverso } from '../domain/reglas';
import { PUNTOS_REFERENCIA, CIRCUITOS_PRECARGADOS, calcularViabilidad, validarSeleccion } from '../services/catalogo';

interface ConfiguracionRecorridoProps {
  modalidad: ModalidadRecorrido;
  bateriaPct: number;
  climaActual?: CondicionClima;
  intensidadClima?: IntensidadClima;
  onIniciar: (config: { modalidad: ModalidadRecorrido; origen?: string; destino?: string; circuitoId?: string }) => void;
}

export function ConfiguracionRecorrido({ modalidad, bateriaPct, climaActual = 'DESPEJADO', intensidadClima = 'NORMAL', onIniciar }: ConfiguracionRecorridoProps) {
  const [origen, setOrigen] = useState(PUNTOS_REFERENCIA[0].nombre);
  const [destino, setDestino] = useState(PUNTOS_REFERENCIA[1].nombre);
  const [circuitoId, setCircuitoId] = useState(CIRCUITOS_PRECARGADOS[0].id);
  const errorSeleccion = validarSeleccion({ modalidad, origen, destino, circuitoId });
  const [confirmados, setConfirmados] = useState<string[]>([]);
  const hayBateriaBaja = bateriaBaja(bateriaPct);
  const avisos = [
    ...(hayBateriaBaja ? [{ id: 'bateria', texto: 'Batería baja: confirme para asumir el inicio del recorrido.' }] : []),
    ...(esClimaAdverso(climaActual, intensidadClima) ? [{ id: `clima-${climaActual}-${intensidadClima}`, texto: 'Clima adverso: extreme precauciones antes de iniciar.' }] : []),
  ];
  const pendientes = avisos.filter(aviso => !confirmados.includes(aviso.id));
  const audioDisponible = useAudioAlertas(pendientes.map(aviso => aviso.texto));
  useEffect(() => {
    setConfirmados(prev => prev.filter(id => avisos.some(aviso => aviso.id === id)));
  }, [hayBateriaBaja, climaActual, intensidadClima]);

  const viabilidad = calcularViabilidad({
    modalidad,
    origen,
    destino,
    circuitoId,
  }, bateriaPct);

  const handleIniciarClick = () => {
    if (errorSeleccion || pendientes.length) return;
    onIniciar({
      modalidad,
      origen: modalidad === 'PERSONALIZADO' ? origen : undefined,
      destino: modalidad === 'PERSONALIZADO' ? destino : undefined,
      circuitoId: modalidad === 'PRECARGADO' ? circuitoId : undefined,
    });
  };

  return (
    <div className="configuracion-recorrido">
      <h3>
        Configuración de Recorrido ({modalidad})
      </h3>

      {modalidad === 'LIBRE' && (
        <p>
          Recorrido sin destino fijo. Presione iniciar para comenzar la marcha libre.
        </p>
      )}

      {modalidad === 'PERSONALIZADO' && (
        <div className="campos-ruta">
          <div>
            <label>
              Punto de Origen:
            </label>
            <select
              aria-label="Punto de origen"
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
            >
              {PUNTOS_REFERENCIA.map((p) => (
                <option key={`origen-${p.id}`} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>
              Punto de Destino:
            </label>
            <select
              aria-label="Punto de destino"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
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
        <div className="campo-circuito">
          <label>
            Seleccionar circuito de ejemplo:
          </label>
          <select
            aria-label="Circuito precargado"
            value={circuitoId}
            onChange={(e) => setCircuitoId(e.target.value)}
          >
            {CIRCUITOS_PRECARGADOS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.alertaTerreno ? `(${c.alertaTerreno})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Estimaciones de viabilidad */}
      <div className="estimaciones">
        <div className="estimaciones-titulo">Estimaciones de Viabilidad:</div>
        {modalidad !== 'LIBRE' ? (
          <>
            <div className="estimaciones-grid">
              <div>Distancia: <strong>{viabilidad.distanciaKm.toFixed(1)} km</strong></div>
              <div>Tiempo est.: <strong>{viabilidad.tiempoEstimadoMin} min</strong></div>
              <div>Batería est.: <strong>{viabilidad.consumoBateriaPct}%</strong></div>
              <div>Calorías: <strong>{viabilidad.caloriasKcal} kcal</strong></div>
            </div>
            <div className="estado-viabilidad" data-viable={viabilidad.esViable}>
              Estado: {viabilidad.esViable ? 'Viable (Suficiente batería)' : `No viable (${viabilidad.motivoNoViable})`}
            </div>
          </>
        ) : (
          <div>Sin límite de destino (Recorrido Libre).</div>
        )}
      </div>

      {!audioDisponible && <p role="status">Audio no disponible. Lea y confirme los avisos visuales.</p>}
      {pendientes.map(aviso => (
        <div role="alert" key={aviso.id}>
          <p>{aviso.texto}</p>
          <button onClick={() => setConfirmados(prev => [...prev, aviso.id])}>
            Confirmar {aviso.id === 'bateria' ? 'batería baja' : 'clima adverso'}
          </button>
        </div>
      ))}
      <button className="boton-primario iniciar-recorrido"
        disabled={Boolean(errorSeleccion) || pendientes.length > 0}
        onClick={handleIniciarClick}
      >
        <Icono nombre="continuar" />Iniciar Recorrido
      </button>
      {errorSeleccion && <p role="alert">{errorSeleccion}</p>}
    </div>
  );
}
