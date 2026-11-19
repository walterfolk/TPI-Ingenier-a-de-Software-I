const trazos = {
  pausa: 'M8 5v14M16 5v14', continuar: 'M8 4l12 8-12 8V4',
  emergencia: 'M12 3v18M3 12h18', fin: 'M5 21V3h14l-4 5 4 5H5',
  velocidad: 'M3 17a9 9 0 1 1 18 0M12 14l5-7M5 17h14',
  reloj: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 6v6l4 2',
  ruta: 'M5 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4M19 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4M5 8v5h14v3',
  bateria: 'M3 7h17v11H3V7M20 11h2v3h-2M7 10v5M11 10v5M15 10v5',
  clima: 'M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9H6',
  pulso: 'M3 13h4l3-7 4 13 3-6h4',
  calorias: 'M12 3C9 8 5 10 5 15a7 7 0 0 0 14 0c0-4-4-7-4-7l-3 5V3',
  bluetoothDesconectado: 'M12 3v18l5-5-5-4 5-4-5-5M7 8l3 3M7 16l3-3M3 3l18 18',
  brujula: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M16 8l-3 5-5 3 3-5 5-3',
  ubicacion: 'M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 14 0M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  mapa: 'M3 5l6-3 6 3 6-3v17l-6 3-6-3-6 3V5M9 2v17M15 5v17',
};
export type NombreIcono = keyof typeof trazos;
export function Icono({ nombre }: { nombre: NombreIcono }) {
  return <svg className="icono" aria-hidden="true" viewBox="0 0 24 24"><path d={trazos[nombre]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
