import { describe, it, expect } from 'vitest';
import { siguienteEstado, TransicionInvalidaError, type AccionRecorrido } from './maquinaRecorrido';
import { EstadoRecorrido } from './tipos';

describe('Máquina de estados del recorrido (Sección 4.2 del RFC)', () => {
  it('permite iniciar un recorrido desde PREPARADO a EN_CURSO', () => {
    const estado: EstadoRecorrido = "PREPARADO";
    expect(siguienteEstado(estado, "INICIAR")).toBe("EN_CURSO");
  });

  it('permite pausar y reanudar el recorrido', () => {
    let estado: EstadoRecorrido = "EN_CURSO";
    estado = siguienteEstado(estado, "PAUSAR");
    expect(estado).toBe("PAUSADO");

    estado = siguienteEstado(estado, "REANUDAR");
    expect(estado).toBe("EN_CURSO");
  });

  it('permite accionar emergencia y cancelarla', () => {
    let estado: EstadoRecorrido = "EN_CURSO";
    estado = siguienteEstado(estado, "EMERGENCIA");
    expect(estado).toBe("EMERGENCIA");

    estado = siguienteEstado(estado, "CANCELAR_EMERGENCIA");
    expect(estado).toBe("EN_CURSO");
  });

  it('permite solicitar finalización, rechazarla, o confirmarla (válido o inválido)', () => {
    let estado: EstadoRecorrido = "EN_CURSO";
    estado = siguienteEstado(estado, "SOLICITAR_FIN");
    expect(estado).toBe("FINALIZANDO");

    // Rechazar finalización vuelve a EN_CURSO
    let rechazo = siguienteEstado(estado, "RECHAZAR_FIN");
    expect(rechazo).toBe("EN_CURSO");

    // Solicitar de nuevo para confirmar
    estado = siguienteEstado("EN_CURSO", "SOLICITAR_FIN");
    const finalizado = siguienteEstado(estado, "CONFIRMAR_FIN_VALIDO");
    expect(finalizado).toBe("FINALIZADO");

    estado = siguienteEstado("EN_CURSO", "SOLICITAR_FIN");
    const descartado = siguienteEstado(estado, "CONFIRMAR_FIN_INVALIDO");
    expect(descartado).toBe("DESCARTADO");
  });

  it('rechaza transiciones inválidas lanzando TransicionInvalidaError', () => {
    expect(() => siguienteEstado("PREPARADO", "PAUSAR")).toThrow(TransicionInvalidaError);
    expect(() => siguienteEstado("FINALIZADO", "INICIAR")).toThrow(TransicionInvalidaError);
    expect(() => siguienteEstado("PAUSADO", "EMERGENCIA")).toThrow(TransicionInvalidaError);
  });

  it('comprueba que DESCARTADO y FINALIZADO son estados terminales sin acciones permitidas', () => {
    const terminales: EstadoRecorrido[] = ["DESCARTADO", "FINALIZADO"];
    const acciones: AccionRecorrido[] = [
      "INICIAR",
      "PAUSAR",
      "REANUDAR",
      "EMERGENCIA",
      "CANCELAR_EMERGENCIA",
      "SOLICITAR_FIN",
      "RECHAZAR_FIN",
      "CONFIRMAR_FIN_VALIDO",
      "CONFIRMAR_FIN_INVALIDO"
    ];

    for (const estado of terminales) {
      for (const accion of acciones) {
        expect(() => siguienteEstado(estado, accion)).toThrow(TransicionInvalidaError);
      }
    }
  });

  it('comprueba que TransicionInvalidaError contiene en su mensaje el estado actual y la acción', () => {
    try {
      siguienteEstado("PREPARADO", "PAUSAR");
      expect.fail('Debería haber lanzado TransicionInvalidaError');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(TransicionInvalidaError);
      if (error instanceof TransicionInvalidaError) {
        expect(error.message).toContain("PREPARADO");
        expect(error.message).toContain("PAUSAR");
      }
    }
  });
});
