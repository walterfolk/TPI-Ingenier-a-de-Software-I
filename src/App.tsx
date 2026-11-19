import React, { useState, useRef, useEffect } from 'react';
import { useConexionSimulada } from './hooks/useConexionSimulada';
import { prepararAudio } from './services/audio';
import type { CondicionClima, EstadoVehiculoMovil, IntensidadClima, ModalidadRecorrido, RecorridoGuardado } from './domain/tipos';
import { Icono } from './components/Icono';
import { EstadoVehiculoBar } from './components/EstadoVehiculoBar';
import { SelectorModalidad } from './components/SelectorModalidad';
import { ConfiguracionRecorrido } from './components/ConfiguracionRecorrido';
import { PantallaSeguimiento } from './components/PantallaSeguimiento';
import { PantallaResumen } from './components/PantallaResumen';
import { PanelSimulacion } from './components/PanelSimulacion';
import { guardarRecorridoHistorial } from './services/storage';
import { CIRCUITOS_PRECARGADOS } from './services/catalogo';

type PantallaApp = 'CONFIGURACION' | 'SEGUIMIENTO' | 'RESUMEN';

export default function App() {
  const [errorLocal, setErrorLocal] = useState<string>();
  const [errorHistorial, setErrorHistorial] = useState<string>();
  const [avisoDescarte, setAvisoDescarte] = useState(false);
  const finRegistrado = useRef(false);
  const [vehiculo, setVehiculo] = useState<Omit<EstadoVehiculoMovil, 'bluetoothSincronizado'>>({ bateriaMovilPct: 65, asistenciaHibrida: 'ACTIVA', odometroKm: 120, motoresDelanteros: 'OK', frenos: 'OK' });
  const [tema, setTema] = useState<'claro' | 'oscuro'>('claro');
  const [pantalla, setPantalla] = useState<PantallaApp>('CONFIGURACION');
  useEffect(() => { window.scrollTo(0, 0); }, [pantalla]);
  const [modalidad, setModalidad] = useState<ModalidadRecorrido>('LIBRE');

  // Una misma fuente simulada antes y durante el recorrido.
  const [bateriaPct, setBateriaPct] = useState(80);
  const [climaActual, setClimaActual] = useState<CondicionClima>('DESPEJADO');
  const [intensidadClima, setIntensidadClima] = useState<IntensidadClima>('NORMAL');
  const [smartwatchVinculado, setSmartwatchVinculado] = useState(true);
  const [umbralFrecuencia, setUmbralFrecuencia] = useState<number>(160);
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState(125);
  const [bluetoothSincronizado, setBluetoothSincronizado] = useState(true);
  const conexion = useConexionSimulada(bluetoothSincronizado);
  const [velocidadSimulada, setVelocidadSimulada] = useState(12);

  const [configuracionActual, setConfiguracionActual] = useState<{
    modalidad: ModalidadRecorrido;
    origen?: string;
    destino?: string;
    circuitoId?: string;
    nombreCircuito?: string;
  } | null>(null);

  const [recorridoTerminado, setRecorridoTerminado] = useState<RecorridoGuardado | null>(null);

  const handleIniciar = (config: {
    modalidad: ModalidadRecorrido;
    origen?: string;
    destino?: string;
    circuitoId?: string;
  }) => {
    finRegistrado.current = false;
    setErrorLocal(undefined); setErrorHistorial(undefined); setAvisoDescarte(false);
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
    if (finRegistrado.current) return;
    finRegistrado.current = true;
    const guardado = guardarRecorridoHistorial(recorrido);
    setErrorHistorial(guardado.ok ? undefined : guardado.error);
    setRecorridoTerminado(recorrido);
    setPantalla('RESUMEN');
  };

  const handleCancelarOdescartar = () => {
    setAvisoDescarte(true);
    setConfiguracionActual(null);
    setPantalla('CONFIGURACION');
  };

  const handleVolverInicio = () => {
    setRecorridoTerminado(null);
    setConfiguracionActual(null);
    setPantalla('CONFIGURACION');
  };

  const estadoBar = (<EstadoVehiculoBar
        bateriaPct={bateriaPct}
        climaActual={climaActual}
        bluetoothSincronizado={conexion.estado === 'CONECTADO'}
        smartwatchVinculado={smartwatchVinculado}
      />);

  return (
    <div onPointerDown={prepararAudio} onKeyDown={prepararAudio} className={'conductor' + (pantalla === 'SEGUIMIENTO' ? ' en-marcha' : pantalla === 'CONFIGURACION' ? ' configuracion' : ' resumen')} data-tema={tema}>
      {pantalla !== 'SEGUIMIENTO' && <header className="cabecera-app"><span className="marca-app" aria-hidden="true"><Icono nombre="ruta" /></span><div>
        <h1>
          Sistemas Triciclos UNTDF
        </h1>
        <h2>
          CU_01: Realizar Recorrido
        </h2></div>
      </header>}

      {errorLocal && <p role="alert">{errorLocal}</p>}
      {avisoDescarte && pantalla === 'CONFIGURACION' && <p role="status">Recorrido descartado: no alcanzó 300 m ni 3 minutos. No se incorporó al historial.</p>}
      {pantalla === 'CONFIGURACION' && estadoBar}


      {(
        <PanelSimulacion
          vehiculo={vehiculo}
          onCambiarVehiculo={cambios => setVehiculo(prev => ({...prev, ...cambios}))}
          umbralFrecuencia={umbralFrecuencia}
          onCambiarUmbral={setUmbralFrecuencia}
          intensidadClima={intensidadClima}
          onCambiarIntensidad={setIntensidadClima}
          bateriaPct={bateriaPct}
          onCambiarBateria={setBateriaPct}
          climaActual={climaActual}
          onCambiarClima={setClimaActual}
          frecuenciaCardiaca={frecuenciaCardiaca}
          onCambiarFc={setFrecuenciaCardiaca}
          smartwatchVinculado={smartwatchVinculado}
          onToggleSmartwatch={() => setSmartwatchVinculado(prev => !prev)}
          bluetoothSincronizado={bluetoothSincronizado}
          onToggleBluetooth={() => setBluetoothSincronizado(prev => !prev)}
          velocidadSimulada={velocidadSimulada}
          onCambiarVelocidad={setVelocidadSimulada}
        />
      )}

      {pantalla === 'CONFIGURACION' && <button className="selector-tema" onClick={() => setTema(actual => actual === 'claro' ? 'oscuro' : 'claro')} aria-pressed={tema === 'oscuro'}>Modo {tema === 'claro' ? 'oscuro' : 'claro'}</button>}

      {pantalla === 'CONFIGURACION' && (
        <>
          <SelectorModalidad
            modalidadSeleccionada={modalidad}
            onSelectModalidad={setModalidad}
          />

          <ConfiguracionRecorrido
            climaActual={climaActual}
            intensidadClima={intensidadClima}
            modalidad={modalidad}
            bateriaPct={bateriaPct}
            onIniciar={handleIniciar}
          />
        </>
      )}

      {pantalla === 'SEGUIMIENTO' && configuracionActual && (
        <PantallaSeguimiento
          onErrorPersistencia={setErrorLocal}
          conexion={conexion}
          estadoVehiculo={vehiculo}
          onAvanzarOdometro={km => setVehiculo(prev => ({...prev, odometroKm: prev.odometroKm + km}))}
          umbralFrecuencia={umbralFrecuencia}
          avisosPreviosConfirmados
          bateriaPct={bateriaPct}
          setBateriaPct={setBateriaPct}
          intensidadClima={intensidadClima}
          climaActual={climaActual}
          smartwatchVinculado={smartwatchVinculado}
          frecuenciaCardiaca={frecuenciaCardiaca}
          bluetoothSincronizado={conexion.estado === 'CONECTADO'}
          velocidadSimulada={velocidadSimulada}
          modalidad={configuracionActual.modalidad}
          origen={configuracionActual.origen}
          destino={configuracionActual.destino}
          circuitoId={configuracionActual.circuitoId}
          nombreCircuito={configuracionActual.nombreCircuito}
          onFinalizarRecorridoGuardado={handleFinalizarRecorridoGuardado}
          onCancelarOdescartar={handleCancelarOdescartar}
        />
      )}

      {pantalla === 'SEGUIMIENTO' && estadoBar}

      {pantalla === 'RESUMEN' && recorridoTerminado && (
        <PantallaResumen
          errorGuardado={errorHistorial}
          recorrido={recorridoTerminado}
          onVolverInicio={handleVolverInicio}
        />
      )}
    </div>
  );
}
