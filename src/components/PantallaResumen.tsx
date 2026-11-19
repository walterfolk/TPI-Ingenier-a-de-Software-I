import { Metrica } from './Metrica';
import { Icono } from './Icono';
import { RecorridoGuardado } from '../domain/tipos';

interface PantallaResumenProps {
  errorGuardado?: string;
  recorrido: RecorridoGuardado;
  onVolverInicio: () => void;
}

export function PantallaResumen({ errorGuardado, recorrido, onVolverInicio }: PantallaResumenProps) {
  const minutos = Math.floor(recorrido.tiempoActivoSeg / 60);
  const segundos = Math.floor(recorrido.tiempoActivoSeg % 60);
  const bateriaConsumida = Math.max(0, recorrido.bateriaInicial - recorrido.bateriaFinal);

  return (
    <div className="pantalla-resumen">
      <h2>
        Recorrido finalizado
      </h2>
      <div className="metricas resumen-metricas">
        <Metrica nombre="Distancia total" icono="ruta" valor={recorrido.distanciaKm.toFixed(2)+' km'}/>
        <Metrica nombre="Tiempo activo" icono="reloj" valor={minutos+' min '+segundos+' seg'}/>
        <Metrica nombre="Velocidad promedio" icono="velocidad" valor={recorrido.velocidadPromedioKmh.toFixed(1)+' km/h'}/>
        <Metrica nombre="Calorías consumidas" icono="calorias" valor={recorrido.caloriasConsumidas.toFixed(1)+' kcal'}/>
        <Metrica nombre="Batería consumida" icono="bateria" valor={bateriaConsumida.toFixed(1)+'% consumido'}/>
        <Metrica nombre="Frecuencia cardíaca promedio" icono="pulso" valor={recorrido.frecuenciaCardiacaPromedio ? recorrido.frecuenciaCardiacaPromedio+' bpm' : 'Sin pulsera'}/>
      </div>
      <p className="resultado-guardado">
        {errorGuardado ?? 'El recorrido ha sido guardado correctamente en el historial.'}
      </p>
      <div className="resumen-detalle">
        <div>Modalidad: <strong>{recorrido.modalidad}</strong> {recorrido.nombre ? `(${recorrido.nombre})` : ''}</div>
        {recorrido.origen && <div>Origen: <strong>{recorrido.origen}</strong></div>}
        {recorrido.destino && <div>Destino: <strong>{recorrido.destino}</strong></div>}
        <div>Distancia total: <strong>{recorrido.distanciaKm.toFixed(2)} km</strong></div>
        <div>Tiempo activo: <strong>{minutos} min {segundos} seg</strong></div>
        <div>Velocidad promedio: <strong>{recorrido.velocidadPromedioKmh.toFixed(1)} km/h</strong></div>
        <div>Calorías consumidas: <strong>{recorrido.caloriasConsumidas.toFixed(1)} kcal</strong></div>
        <div>Batería: <strong>{recorrido.bateriaInicial.toFixed(1)}% ➔ {recorrido.bateriaFinal.toFixed(1)}% (Consumo: {bateriaConsumida.toFixed(1)}%)</strong></div>
        {recorrido.frecuenciaCardiacaPromedio && (
          <div>Frecuencia cardíaca prom.: <strong>{recorrido.frecuenciaCardiacaPromedio} bpm</strong></div>
        )}
        <div>Alertas registradas: <strong>{recorrido.alertas.length}</strong></div>
      </div>

      <button className="boton-primario"
        onClick={onVolverInicio}
      >
        <Icono nombre="continuar" />Volver al Inicio
      </button>
    </div>
  );
}
