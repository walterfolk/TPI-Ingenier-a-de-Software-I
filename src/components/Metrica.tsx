import { Icono, type NombreIcono } from './Icono';
export function Metrica({ nombre, icono, valor }: { nombre: string; icono: NombreIcono; valor: string }) {
  return <figure className="metrica" aria-label={nombre}><Icono nombre={icono} /><figcaption><span className="metrica-etiqueta">{nombre}</span><strong className="metrica-valor">{valor}</strong></figcaption></figure>;
}
