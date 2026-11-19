import { Icono } from './Icono';
import React, { useEffect, useState, type ReactNode } from 'react';
import type { CondicionClima, IntensidadClima, ModalidadRecorrido } from '../domain/tipos';
import { useAudioAlertas } from '../hooks/useAudioAlertas';
import { bateriaBaja, esClimaAdverso } from '../domain/reglas';
import { PUNTOS_REFERENCIA, CIRCUITOS_PRECARGADOS, calcularViabilidad, validarSeleccion, type CircuitoPrecargado } from '../services/catalogo';
import { caloriasEstimadas, OPCIONES_FILTRO } from '../domain/filtros';

interface ConfiguracionRecorridoProps {
  modalidad: ModalidadRecorrido;
  bateriaPct: number;
  climaActual?: CondicionClima;
  intensidadClima?: IntensidadClima;
  onIniciar: (config: { modalidad: ModalidadRecorrido; origen?: string; destino?: string; circuitoId?: string }) => void;
  /** CU-02: circuitos que cumplen el filtro aplicado (CU-01 3.A.2). Por defecto, todos. */
  circuitos?: CircuitoPrecargado[];
  /** CU-02: true si hubo una búsqueda con «Buscar» o «Limpiar filtros». */
  busquedaRealizada?: boolean;
  panelFiltros?: ReactNode;
}

const etiquetaDificultad = (c: CircuitoPrecargado) => OPCIONES_FILTRO.dificultad.find(o => o.valor === c.dificultad)?.etiqueta ?? c.dificultad;

export function ConfiguracionRecorrido({ modalidad, bateriaPct, climaActual = 'DESPEJADO', intensidadClima = 'NORMAL', onIniciar, circuitos = CIRCUITOS_PRECARGADOS, busquedaRealizada = false, panelFiltros }: ConfiguracionRecorridoProps) {
  const [origen, setOrigen] = useState(PUNTOS_REFERENCIA[0].nombre);
  const [destino, setDestino] = useState(PUNTOS_REFERENCIA[1].nombre);
  const [circuitoElegido, setCircuitoId] = useState(CIRCUITOS_PRECARGADOS[0].id);
  // Si el circuito elegido quedó fuera del filtro se toma el primer resultado; sin resultados no hay selección (5.A).
  const circuitoId = circuitos.some(c => c.id === circuitoElegido) ? circuitoElegido : circuitos[0]?.id;
  const circuitoActual = circuitos.find(c => c.id === circuitoId);
  const sinResultados = modalidad === 'PRECARGADO' && circuitos.length === 0;
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

      {modalidad === 'PRECARGADO' && panelFiltros}

      {modalidad === 'PRECARGADO' && (
        <div className="campo-circuito">
          {busquedaRealizada && (circuitos.length > 0
            ? <p className="resultado-filtro" role="status">{circuitos.length === 1 ? '1 recorrido encontrado' : `${circuitos.length} recorridos encontrados`}</p>
            : <p className="resultado-filtro sin-resultados" role="status">No se encontraron resultados. Modifique los filtros y vuelva a buscar.</p>)}
          {circuitos.length > 0 && <>
            <label>
              Seleccionar circuito de ejemplo:
            </label>
            <select
              aria-label="Circuito precargado"
              value={circuitoId}
              onChange={(e) => setCircuitoId(e.target.value)}
            >
              {circuitos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {caloriasEstimadas(c)} kcal · {etiquetaDificultad(c)} {c.alertaTerreno ? `(${c.alertaTerreno})` : ''}
                </option>
              ))}
            </select>
            {circuitoActual && <p className="detalle-circuito">Dificultad: <strong>{etiquetaDificultad(circuitoActual)}</strong> · {circuitoActual.distanciaKm} km · {caloriasEstimadas(circuitoActual)} kcal</p>}
          </>}
        </div>
      )}

      {/* Estimaciones de viabilidad (en 5.A no hay circuito: el mensaje de sin resultados las reemplaza) */}
      {!sinResultados && <div className="estimaciones">
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
      </div>}

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
      {errorSeleccion && !sinResultados && <p role="alert">{errorSeleccion}</p>}
    </div>
  );
}
