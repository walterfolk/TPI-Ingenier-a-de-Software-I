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
  filtro: 'M3 5h18l-7 8v6l-4 2v-8L3 5',
  sol: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  nube: 'M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9H6',
  lluvia: 'M6 14a4 4 0 0 1-1-7 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 8H6M8 17l-1 3M12 17l-1 3M16 17l-1 3',
  viento: 'M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7',
  hielo: 'M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 4l3 2 3-2M9 20l3-2 3 2',
  vientoFuerte: 'M2 6h11a3 3 0 1 0-3-3M2 10h17a3 3 0 1 1-3 3M2 14h8a3 3 0 1 1-3 3M2 18h4',
  tormenta: 'M6 13a4 4 0 0 1-1-7 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 8M13 11l-3 5h4l-3 5',
  bluetooth: 'M7 7l10 10-5 4V3l5 4L7 17',
  smartwatch: 'M8 3h8l1 4H7l1-4M7 17h10l-1 4H8l-1-4M7 7h10v10H7V7M12 10v3l2 1',
  smartwatchNo: 'M8 3h8l1 4H7l1-4M7 17h10l-1 4H8l-1-4M7 7h10v10H7V7M3 3l18 18',
};
export type NombreIcono = keyof typeof trazos;
export function Icono({ nombre }: { nombre: NombreIcono }) {
  return <svg className="icono" aria-hidden="true" viewBox="0 0 24 24"><path d={trazos[nombre]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
