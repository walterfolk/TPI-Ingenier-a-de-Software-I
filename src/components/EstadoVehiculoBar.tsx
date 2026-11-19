import { Metrica } from './Metrica';
import { Icono } from './Icono';
import type { CondicionClima } from '../domain/tipos';
import { ICONO_CLIMA, ETIQUETA_CLIMA } from './clima';

interface EstadoVehiculoBarProps {
  bateriaPct: number;
  climaActual: CondicionClima;
  bluetoothSincronizado: boolean;
  smartwatchVinculado: boolean;
  /** Durante el recorrido solo se muestran Bluetooth y smartwatch: batería y clima ya están arriba (D-27). */
  soloVinculos?: boolean;
}

export function EstadoVehiculoBar({ bateriaPct, climaActual, bluetoothSincronizado, smartwatchVinculado, soloVinculos }: EstadoVehiculoBarProps) {
  return (
    <div className={'estado-vehiculo' + (soloVinculos ? ' solo-vinculos' : '')} role="group" aria-label="Estado actual del vehículo">
      {!soloVinculos && <Metrica nombre="Batería del triciclo" icono="bateria" valor={Math.round(bateriaPct)+'%'} />}
      {!soloVinculos && <Metrica nombre="Clima actual" icono={ICONO_CLIMA[climaActual]} valor={ETIQUETA_CLIMA[climaActual]} clase="metrica-clima" />}
      <span className="estado-vinculo"><Icono nombre={bluetoothSincronizado ? 'bluetooth' : 'bluetoothDesconectado'} /><span className="solo-lectura">BT: <strong>{bluetoothSincronizado ? 'Conectado' : 'Desconectado'}</strong></span></span>
      <span className="estado-vinculo"><Icono nombre={smartwatchVinculado ? 'smartwatch' : 'smartwatchNo'} /><span className="solo-lectura">Smartwatch: <strong>{smartwatchVinculado ? 'Vinculado' : 'No vinculado'}</strong></span></span>
    </div>
  );
}
