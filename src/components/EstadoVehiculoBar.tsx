import { Metrica } from './Metrica';
import type { CondicionClima } from '../domain/tipos';

interface EstadoVehiculoBarProps {
  bateriaPct: number;
  climaActual: CondicionClima;
  bluetoothSincronizado: boolean;
  smartwatchVinculado: boolean;
}

const etiquetasClima: Record<CondicionClima, string> = {
  DESPEJADO: 'Despejado',
  NUBLADO: 'Nublado',
  LLUVIA: 'Lluvia',
  VIENTO: 'Viento',
  ESCARCHA_HIELO: 'Escarcha o hielo',
  VIENTO_FUERTE: 'Viento fuerte',
  TORMENTA: 'Tormenta',
};

export function EstadoVehiculoBar({ bateriaPct, climaActual, bluetoothSincronizado, smartwatchVinculado }: EstadoVehiculoBarProps) {
  return (
    <div className="estado-vehiculo" role="group" aria-label="Estado actual del vehículo">
      <Metrica nombre="Batería del triciclo" icono="bateria" valor={Math.round(bateriaPct)+'%'} />
      <Metrica nombre="Clima actual" icono="clima" valor={etiquetasClima[climaActual]} />
      <span className="estado-vinculo">BT: <strong>{bluetoothSincronizado ? 'Conectado' : 'Desconectado'}</strong></span>
      <span className="estado-vinculo">Smartwatch: <strong>{smartwatchVinculado ? 'Vinculado' : 'No vinculado'}</strong></span>
    </div>
  );
}
