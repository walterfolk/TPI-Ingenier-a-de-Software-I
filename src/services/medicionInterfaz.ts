/** Herramienta QA de TC-06/07/27: mide la página local, sin enviar datos. */
export function medirInterfaz() {
  const raiz = document.querySelector('.conductor [aria-modal="true"]') ?? document.querySelector('.conductor');
  if (!raiz) return 'Interfaz no disponible';
  const ancho = window.innerWidth, alto = window.innerHeight;
  const visible = (r: DOMRect) => r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < ancho && r.top < alto;
  const graficos = [...raiz.querySelectorAll<HTMLElement>('svg, button')].filter(e => !e.closest('.panel-simulacion')).map(e => e.getBoundingClientRect()).filter(visible);
  const textos: DOMRect[] = [], fuentes: number[] = [];
  const nodos = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  while (nodos.nextNode()) {
    const nodo = nodos.currentNode, padre = nodo.parentElement;
    if (!padre || !nodo.textContent?.trim() || padre.closest('.panel-simulacion')) continue;
    const rango = document.createRange(); rango.selectNodeContents(nodo);
    const rectangulos = [...rango.getClientRects()].filter(visible);
    if (rectangulos.length) { textos.push(...rectangulos); fuentes.push(parseFloat(getComputedStyle(padre).fontSize)); }
  }
  const contiene = (rects: DOMRect[], x: number, y: number) => rects.some(r => x >= r.left && x < r.right && y >= r.top && y < r.bottom);
  let visual = 0, texto = 0;
  // Muestreo uniforme de área: el texto prevalece para evitar el doble conteo.
  for (let i = 0; i < 100; i++) for (let j = 0; j < 100; j++) {
    const x = (i + 0.5) * ancho / 100, y = (j + 0.5) * alto / 100;
    if (contiene(textos, x, y)) texto++;
    else if (contiene(graficos, x, y)) visual++;
  }
  const iconos = [...raiz.querySelectorAll('svg.icono')].map(e => e.getBoundingClientRect()).filter(visible);
  const metricas = [...raiz.querySelectorAll('.metrica')].map(e => {
    const r = e.getBoundingClientRect();
    return { nombre: e.getAttribute('aria-label'), visible: r.left >= 0 && r.top >= 0 && r.right <= ancho + 1 && r.bottom <= alto + 1 };
  });
  return JSON.stringify({ ancho, alto, visualPct: visual / 100, textoPct: texto / 100,
    fuenteMinPx: Math.min(...fuentes), iconoMinVh: iconos.length ? Math.min(...iconos.map(r => r.height / alto * 100)) : null,
    desbordamientoHorizontal: document.documentElement.scrollWidth > ancho, metricas }, null, 2);
}
