import { Icono } from './Icono';
interface PantallaEmergenciaProps { onCancelarEmergencia: () => void; }
export function PantallaEmergencia({ onCancelarEmergencia }: PantallaEmergenciaProps) {
  return <div className="modal-recorrido emergencia" role="dialog" aria-modal="true" aria-label="Emergencia" onKeyDown={e => { if(e.key === 'Tab') e.preventDefault(); }}>
    <section><h2>Emergencia</h2><p>Pantalla de prueba. No se envían reportes ni se solicita asistencia externa.</p>
      <button autoFocus onClick={onCancelarEmergencia}><Icono nombre="emergencia" />Cancelar</button>
    </section>
  </div>;
}
