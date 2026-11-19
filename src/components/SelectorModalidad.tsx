import type { ModalidadRecorrido } from '../domain/tipos';
import { Icono } from './Icono';
interface SelectorModalidadProps {
  modalidadSeleccionada: ModalidadRecorrido;
  onSelectModalidad: (mod: ModalidadRecorrido) => void;
  /** CU-02 / CA2-01 (D-32): botón de filtros en el panel principal. */
  filtrosAbiertos?: boolean;
  onFiltrarRecorridos?: () => void;
}
export function SelectorModalidad({modalidadSeleccionada,onSelectModalidad,filtrosAbiertos=false,onFiltrarRecorridos}: SelectorModalidadProps) {
  return <nav className="modalidades" aria-label="Seleccionar modalidad de recorrido">
    <div className="titulo-modalidades"><p className="sobretitulo">PLANIFICÁ TU SALIDA</p><h2>Elegí tu modalidad</h2><p>Un recorrido a tu manera.</p></div>
    {(['LIBRE','PERSONALIZADO','PRECARGADO'] as const).map(mod => <button key={mod} aria-label={mod==='LIBRE'?'Libre':mod==='PERSONALIZADO'?'Personalizado':'Precargado'} aria-pressed={modalidadSeleccionada===mod} onClick={()=>onSelectModalidad(mod)}>
      <span className="modalidad-icono"><Icono nombre={mod==='LIBRE'?'brujula':mod==='PERSONALIZADO'?'ubicacion':'mapa'}/></span><span className="modalidad-textos"><strong>{mod==='LIBRE'?'Libre':mod==='PERSONALIZADO'?'Personalizado':'Precargado'}</strong><span>{mod==='LIBRE'?'Explorá a tu propio ritmo':mod==='PERSONALIZADO'?'Elegí tu origen y destino':'Descubrí circuitos de ejemplo'}</span></span>
    </button>)}
    {onFiltrarRecorridos && <button className="boton-filtros" aria-expanded={filtrosAbiertos} aria-controls="panel-filtros" onClick={onFiltrarRecorridos}>
      <Icono nombre="filtro" />Filtrar recorridos
    </button>}
  </nav>;
}
