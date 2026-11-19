import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
afterEach(cleanup);

const abrirFiltros = () => fireEvent.click(screen.getByRole('button', { name: 'Filtrar recorridos' }));
const elegir = (criterio: string, etiqueta: string) => {
  const select = screen.getByRole('combobox', { name: `Filtro de ${criterio}` }) as HTMLSelectElement;
  const opcion = within(select).getByRole('option', { name: etiqueta }) as HTMLOptionElement;
  fireEvent.change(select, { target: { value: opcion.value } });
};
const buscar = () => fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
const circuitos = () => within(screen.getByRole('combobox', { name: 'Circuito precargado' })).getAllByRole('option').map(o => o.textContent ?? '');

describe('CU-02 Filtrar recorridos (UI)', () => {
  it('TC-31/32: el botón está en el panel principal, selecciona Precargado y abre el subpanel', () => {
    render(<App />);
    const boton = within(screen.getByRole('navigation', { name: 'Seleccionar modalidad de recorrido' })).getByRole('button', { name: 'Filtrar recorridos' });
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(boton);
    expect(screen.getByRole('button', { name: 'Precargado' })).toHaveAttribute('aria-pressed', 'true');
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('region', { name: 'Filtros de recorridos' });
    for (const c of ['distancia', 'calorías', 'dificultad']) expect(within(panel).getByRole('combobox', { name: `Filtro de ${c}` })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument();
    fireEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: 'Filtros de recorridos' })).not.toBeInTheDocument();
  });

  it('TC-33/CA2-03: solo valores preestablecidos, sin campos de texto', () => {
    render(<App />);
    abrirFiltros();
    const panel = screen.getByRole('region', { name: 'Filtros de recorridos' });
    expect(within(panel).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(panel).queryByRole('spinbutton')).not.toBeInTheDocument();
    const opciones = (c: string) => within(within(panel).getByRole('combobox', { name: `Filtro de ${c}` })).getAllByRole('option').map(o => o.textContent);
    expect(opciones('distancia')).toEqual(['Cualquiera', 'Hasta 5 km', 'Hasta 10 km', 'Hasta 15 km', 'Más de 15 km']);
    expect(opciones('calorías')).toEqual(['Cualquiera', 'Hasta 150 kcal', 'Hasta 300 kcal', 'Hasta 500 kcal', 'Más de 500 kcal']);
    expect(opciones('dificultad')).toEqual(['Cualquiera', 'Baja', 'Media', 'Alta']);
  });

  it('TC-34/CA2-04/05: combina criterios con AND y filtra recién al presionar Buscar', () => {
    render(<App />);
    abrirFiltros();
    elegir('distancia', 'Hasta 10 km');
    elegir('dificultad', 'Media');
    expect(circuitos()).toHaveLength(8);
    buscar();
    expect(screen.getByText('2 recorridos encontrados')).toBeInTheDocument();
    expect(circuitos().map(t => t.split(' ·')[0])).toEqual(['Circuito Costero (6 km)', 'Mirador del Canal (8 km)']);
  });

  it('TC-36/CA2-06: muestra la lista con km, kcal y dificultad', () => {
    render(<App />);
    abrirFiltros();
    elegir('calorías', 'Hasta 150 kcal');
    buscar();
    expect(screen.getByText('2 recorridos encontrados')).toBeInTheDocument();
    expect(screen.getByText('Baja', { selector: '.detalle-circuito strong' })).toBeInTheDocument();
    expect(circuitos()).toEqual(['Paseo del Bosque (4 km) · 140 kcal · Baja ', 'Costanera Corta (3 km) · 105 kcal · Baja ']);
  });

  it('TC-37/38 (5.A, CA2-07/08): sin resultados informa, bloquea el inicio y permite una nueva búsqueda', () => {
    render(<App />);
    abrirFiltros();
    elegir('distancia', 'Hasta 5 km');
    elegir('dificultad', 'Alta');
    buscar();
    expect(screen.getByText(/No se encontraron resultados/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Circuito precargado' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeDisabled();
    expect(screen.queryByText('Estimaciones de Viabilidad:')).not.toBeInTheDocument();
    expect((screen.getByRole('combobox', { name: 'Filtro de dificultad' }) as HTMLSelectElement).value).toBe('ALTA');
    elegir('dificultad', 'Baja');
    buscar();
    expect(screen.queryByText(/No se encontraron resultados/)).not.toBeInTheDocument();
    expect(circuitos().map(t => t.split(' ·')[0])).toEqual(['Paseo del Bosque (4 km)', 'Costanera Corta (3 km)']);
    expect(screen.getByRole('button', { name: 'Iniciar Recorrido' })).toBeEnabled();
  });

  it('TC-39/D-31: Buscar sin filtros muestra todo y Limpiar resetea en una sola acción', () => {
    render(<App />);
    abrirFiltros();
    buscar();
    expect(screen.getByText('8 recorridos encontrados')).toBeInTheDocument();
    elegir('distancia', 'Más de 15 km');
    elegir('calorías', 'Más de 500 kcal');
    buscar();
    expect(circuitos()).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(circuitos()).toHaveLength(8);
    for (const c of ['distancia', 'calorías', 'dificultad']) expect((screen.getByRole('combobox', { name: `Filtro de ${c}` }) as HTMLSelectElement).value).toBe('');
  });

  it('TC-40/CU-01 3.A.2: el circuito filtrado conserva las estimaciones RF-06 e inicia el recorrido', () => {
    render(<App />);
    abrirFiltros();
    elegir('distancia', 'Más de 15 km');
    buscar();
    expect(circuitos()[0]).toContain('Gran Vuelta de la Ciudad (16 km)');
    expect(screen.getByText('16.0 km')).toBeInTheDocument();
    expect(screen.getByText('560 kcal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Recorrido' }));
    const seguimiento = screen.getByRole('region', { name: 'Seguimiento del recorrido' });
    expect(within(seguimiento).getByText('Gran Vuelta de la Ciudad (16 km)')).toBeInTheDocument();
  });
});
