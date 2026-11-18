import { EstadoRecorrido } from './tipos';

export type AccionRecorrido =
  | "INICIAR"
  | "PAUSAR"
  | "REANUDAR"
  | "EMERGENCIA"
  | "CANCELAR_EMERGENCIA"
  | "SOLICITAR_FIN"
  | "RECHAZAR_FIN"
  | "CONFIRMAR_FIN_VALIDO"
  | "CONFIRMAR_FIN_INVALIDO";

export class TransicionInvalidaError extends Error {
  constructor(estadoActual: EstadoRecorrido, accion: AccionRecorrido) {
    super(`Transición inválida: no se puede ejecutar '${accion}' desde el estado '${estadoActual}'`);
    this.name = "TransicionInvalidaError";
  }
}

export function siguienteEstado(
  estadoActual: EstadoRecorrido,
  accion: AccionRecorrido
): EstadoRecorrido {
  switch (estadoActual) {
    case "PREPARADO":
      if (accion === "INICIAR") return "EN_CURSO";
      break;

    case "EN_CURSO":
      if (accion === "PAUSAR") return "PAUSADO";
      if (accion === "EMERGENCIA") return "EMERGENCIA";
      if (accion === "SOLICITAR_FIN") return "FINALIZANDO";
      break;

    case "PAUSADO":
      if (accion === "REANUDAR") return "EN_CURSO";
      break;

    case "EMERGENCIA":
      if (accion === "CANCELAR_EMERGENCIA") return "EN_CURSO";
      break;

    case "FINALIZANDO":
      if (accion === "RECHAZAR_FIN") return "EN_CURSO";
      if (accion === "CONFIRMAR_FIN_VALIDO") return "FINALIZADO";
      if (accion === "CONFIRMAR_FIN_INVALIDO") return "DESCARTADO";
      break;

    case "FINALIZADO":
    case "DESCARTADO":
      // Estados terminales
      break;
  }

  throw new TransicionInvalidaError(estadoActual, accion);
}
