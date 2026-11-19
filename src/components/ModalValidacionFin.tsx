import { cumpleMinimos } from '../domain/reglas';
import { Icono } from './Icono';
import { Metrica } from './Metrica';
interface ModalValidacionFinProps {
  distanciaMetros: number;
  tiempoMarchaSeg: number;
  onConfirmarFinValido: () => void;
  onConfirmarFinInvalido: () => void;
  onRechazarFin: () => void;
}


export function ModalValidacionFin({distanciaMetros, tiempoMarchaSeg, onConfirmarFinValido, onConfirmarFinInvalido, onRechazarFin}: ModalValidacionFinProps) {
  const valido = cumpleMinimos(distanciaMetros, tiempoMarchaSeg);
  return <div className="modal-recorrido finalizacion" role="dialog" aria-modal="true" aria-label="Confirmar finalización">
    <section><h2>Finalizar recorrido</h2>
      <div className="datos-fin"><Metrica nombre="Distancia recorrida" icono="ruta" valor={(distanciaMetros / 1000).toFixed(2) + ' km'} /><Metrica nombre="Tiempo activo" icono="reloj" valor={Math.floor(tiempoMarchaSeg / 60) + ':' + Math.floor(tiempoMarchaSeg % 60).toString().padStart(2, '0')} /></div>
      <p>{valido ? 'Cumple 300 m o 3 min. Se guardará en el historial.' : 'No alcanza 300 m ni 3 min. Se descartará sin guardar.'}</p>
      <div className="acciones-fin"><button autoFocus onClick={onRechazarFin}><Icono nombre="continuar" />Volver</button>
        <button onClick={valido ? onConfirmarFinValido : onConfirmarFinInvalido}><Icono nombre="fin" />{valido ? 'Guardar y Finalizar' : 'Descartar y Salir'}</button></div>
    </section>
  </div>;
}
