# AGENTS.md - Guia para Asistentes de IA (Informal)

Instrucciones para cuando la IA trabaja en este repositorio del prototipo de triciclos UNTDF.

## Contexto del proyecto

- **Que se arma:** prototipo web responsive de la Spec 1 — *Realizar recorrido* (Sistemas triciclos UNTDF).
- **Stack:** React + TypeScript + Vite. Tests con Vitest. Cero backend.
- **Persistencia:** `localStorage` del navegador. Hardware, Bluetooth, clima y frecuencia cardiaca son **simulados** (ver RFC, seccion 1).
- **Documentos clave:**
  - `docs/documento_de_prototipo.pdf`: spec original del TPI.
  - `SDD_PLAYBOOK.md`: como nos organizamos.
  - `RFC_REALIZAR_RECORRIDO.md`: fuente de verdad de la feature.
  - `REGISTRO_BUILD.md`: donde anotamos las tareas y prompts.

## Regla principal

**Toda modificacion o feature nueva tiene que seguir el proceso del [SDD_PLAYBOOK.md](./SDD_PLAYBOOK.md)** (Plan → Build → Validate). No se programa nada sin pasar primero por el plan.

| Fase | Que tenes que hacer | Referencia |
| :--- | :--- | :--- |
| **Plan** | Actualizar el RFC si hace falta. Listar dudas y preguntar. Definir los casos de prueba (TC-xx). | Playbook, seccion 3 |
| **Build** | Realizar codigo de a tareas chicas (seccion 10 del RFC), probar que ande y atar todo a los requisitos. | Playbook, seccion 4 |
| **Validate** | Correr los TC-xx y verificar que todo cierre bien. | Playbook, seccion 5 |

## Reglas de trabajo

- La fuente de verdad es el RFC: `RFC_REALIZAR_RECORRIDO.md`. No inventes cosas que no esten ahi.
- **El RFC esta aprobado si dice `Estado: Aprobado`.** Si esta en borrador, no toques el codigo.
- Ante cualquier duda o contradiccion, pregunta antes de implementar. Las decisiones ya tomadas estan en la seccion 9.1 del RFC.
- Respeta los no-objetivos.
- Trabaja por tareas chicas y verificables. Una sola cosa a la vez.
- Corre los tests (`npm test`) y el build antes de entregar.
- No agregues librerias ni dependencias sin avisar.

## Al terminar una tarea

Informa:
1. Que archivos tocaste.
2. Como se prueba (comandos exactos).
3. Que requisito y TC-xx cubre.
4. Desvios si es que hubo alguno.

## Prohibido

- Programar sin RFC aprobado.
- Hacer todo el prototipo de una sola vez.
- Incorporar backend, bases de datos reales o APIs de afuera.
