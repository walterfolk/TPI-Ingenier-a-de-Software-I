import React, { useState } from 'react';
import type { ModalidadRecorrido, RecorridoGuardado } from './domain/tipos';
import { EstadoVehiculoBar } from './components/EstadoVehiculoBar';
import { SelectorModalidad } from './components/SelectorModalidad';
import { ConfiguracionRecorrido } from './components/ConfiguracionRecorrido';
import { PantallaSeguimiento } from './components/PantallaSeguimiento';
import { PantallaResumen } from './components/PantallaResumen';
import { guardarRecorridoHistorial } from './services/storage';
import { CIRCUITOS_PRECARGADOS } from './services/catalogo';

type PantallaApp = 'CONFIGURACION' | 'SEGUIMIENTO' | 'RESUMEN';

export default function App() {
  const [pantalla, setPantalla] = useState<PantallaApp>('CONFIGURACION');
  const [modalidad, setModalidad] = useState<ModalidadRecorrido>('LIBRE');
  const [mensajeFiltro, setMensajeFiltro] = useState<string | null>(null);

  const [configuracionActual, setConfiguracionActual] = useState<{
    modalidad: ModalidadRecorrido;
    origen?: string;
    destino?: string;
    circuitoId?: string;
    nombreCircuito?: string;
  } | null>(null);

  const [recorridoTerminado, setRecorridoTerminado] = useState<RecorridoGuardado | null>(null);

  const handleFiltrarClick = () => {
    setMensajeFiltro('Disponible en la SPEC Filtrar recorridos (CU_02)');
    setTimeout(() => setMensajeFiltro(null), 4000);
  };

  const handleIniciar = (config: {
    modalidad: ModalidadRecorrido;
    origen?: string;
    destino?: string;
    circuitoId?: string;
  }) => {
    let nombreCircuito: string | undefined = undefined;
    if (config.circuitoId) {
      const circ = CIRCUITOS_PRECARGADOS.find(c => c.id === config.circuitoId);
      if (circ) {
        nombreCircuito = circ.nombre;
      }
    }

    setConfiguracionActual({
      ...config,
      nombreCircuito,
    });
    setPantalla('SEGUIMIENTO');
  };

  const handleFinalizarRecorridoGuardado = (recorrido: RecorridoGuardado) => {
    guardarRecorridoHistorial(recorrido);
    setRecorridoTerminado(recorrido);
    setPantalla('RESUMEN');
  };

  const handleCancelarOdescartar = () => {
    setConfiguracionActual(null);
    setPantalla('CONFIGURACION');
  };

  const handleVolverInicio = () => {
    setRecorridoTerminado(null);
    setConfiguracionActual(null);
    setPantalla('CONFIGURACION');
  };

  return (
    <div style={{
      maxWidth: '414px',
      margin: '0 auto',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      background: '#f8fafc',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.25rem', color: '#1a365d', margin: '0 0 4px 0' }}>
          Sistemas Triciclos UNTDF
        </h1>
        <h2 style={{ fontSize: '0.9rem', color: '#4a5568', margin: 0, fontWeight: 'normal' }}>
          CU_01: Realizar Recorrido
        </h2>
      </header>

      <EstadoVehiculoBar />

      {mensajeFiltro && (
        <div style={{
          background: '#feebc8',
          color: '#744210',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          marginBottom: '12px',
          border: '1px solid #fbd38d',
          textAlign: 'center'
        }}>
          {mensajeFiltro}
        </div>
      )}

      {pantalla === 'CONFIGURACION' && (
        <>
          <SelectorModalidad
            modalidadSeleccionada={modalidad}
            onSelectModalidad={setModalidad}
            onFiltrarClick={handleFiltrarClick}
          />

          <ConfiguracionRecorrido
            modalidad={modalidad}
            onIniciar={handleIniciar}
          />
        </>
      )}

      {pantalla === 'SEGUIMIENTO' && configuracionActual && (
        <PantallaSeguimiento
          modalidad={configuracionActual.modalidad}
          origen={configuracionActual.origen}
          destino={configuracionActual.destino}
          circuitoId={configuracionActual.circuitoId}
          nombreCircuito={configuracionActual.nombreCircuito}
          onFinalizarRecorridoGuardado={handleFinalizarRecorridoGuardado}
          onCancelarOdescartar={handleCancelarOdescartar}
        />
      )}

      {pantalla === 'RESUMEN' && recorridoTerminado && (
        <PantallaResumen
          recorrido={recorridoTerminado}
          onVolverInicio={handleVolverInicio}
        />
      )}
    </div>
  );
}
