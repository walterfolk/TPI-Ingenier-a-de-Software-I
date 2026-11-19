import { Icono, type NombreIcono } from './Icono';
export function Metrica({ nombre, icono, valor, clase }: { nombre: string; icono: NombreIcono; valor: string; clase?: string }) {
  return <figure className={'metrica' + (clase ? ' ' + clase : '')} aria-label={nombre}><Icono nombre={icono} /><figcaption><span className="metrica-etiqueta">{nombre}</span><strong className="metrica-valor">{valor}</strong></figcaption></figure>;
}
