import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
// API Storage aislada por archivo: Node 25 expone un localStorage nativo no utilizable
// por este jsdom/Vitest. El prototipo continúa usando el almacenamiento real del navegador.
const datos = new Map<string, string>();
const almacenamiento: Storage = {
  get length() { return datos.size; },
  clear: () => datos.clear(),
  getItem: clave => datos.get(clave) ?? null,
  key: indice => [...datos.keys()][indice] ?? null,
  removeItem: clave => { datos.delete(clave); },
  setItem: (clave, valor) => { datos.set(clave, String(valor)); },
};
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: almacenamiento });
// jsdom no implementa desplazamiento; la geometría se verifica en Chrome.
Object.defineProperty(window, 'scrollTo', { configurable: true, value: () => {} });
afterEach(() => almacenamiento.clear());
