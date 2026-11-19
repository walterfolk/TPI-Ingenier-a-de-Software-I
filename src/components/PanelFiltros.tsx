import { useState } from 'react';
import type { FiltroRecorridos } from '../domain/tipos';
import { OPCIONES_FILTRO } from '../domain/filtros';

interface PanelFiltrosProps {
  filtroAplicado: FiltroRecorridos | null;
  onBuscar: (filtro: FiltroRecorridos) => void;
  onLimpiar: () => void;
}

/** CU-02 pasos 2–4: subpanel con valores preestablecidos (CA2-02/03) que se aplica recién con «Buscar». */
export function PanelFiltros({ filtroAplicado, onBuscar, onLimpiar }: PanelFiltrosProps) {
  const [borrador, setBorrador] = useState<FiltroRecorridos>(filtroAplicado ?? {});
  const cambiar = (campo: keyof FiltroRecorridos, valor: string) =>
    setBorrador(prev => ({ ...prev, [campo]: valor || undefined }));
  const criterios = [
    { campo: 'distancia' as const, etiqueta: 'Distancia', opciones: OPCIONES_FILTRO.distancia },
    { campo: 'calorias' as const, etiqueta: 'Calorías', opciones: OPCIONES_FILTRO.calorias },
    { campo: 'dificultad' as const, etiqueta: 'Dificultad', opciones: OPCIONES_FILTRO.dificultad },
  ];
  return (
    <section id="panel-filtros" className="panel-filtros" aria-label="Filtros de recorridos">
      <div className="criterios-filtro">
        {criterios.map(({ campo, etiqueta, opciones }) => (
          <label key={campo}>
            {etiqueta}
            <select aria-label={`Filtro de ${etiqueta.toLowerCase()}`} value={borrador[campo] ?? ''} onChange={e => cambiar(campo, e.target.value)}>
              <option value="">Cualquiera</option>
              {opciones.map(o => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="acciones-filtro">
        <button onClick={() => { setBorrador({}); onLimpiar(); }}>Limpiar filtros</button>
        <button className="boton-primario" onClick={() => onBuscar(borrador)}>Buscar</button>
      </div>
    </section>
  );
}
