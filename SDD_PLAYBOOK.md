# Playbook SDD (Version Informal y Relajada)

## Spec-Driven Development: Plan → Build → Validate para el Prototipo

Este playbook te guia paso a paso en como armar el prototipo con ayuda de la IA sin perder el norte.

---

## 1. Vision general del proceso

```
 SPEC (TPI)        PLAN (RFC)          BUILD               VALIDATE
┌──────────┐    ┌────────────┐    ┌────────────┐    ┌──────────────┐
│ CU, RF,  │──▶ │ Stack,     │──▶ │ Tareas     │──▶ │ Pruebas,     │
│ RNF      │    │ disenio,   │    │ chicas     │    │ trazabilidad │
│          │    │ pruebas    │    │ con IA     │    │ y revision   │
└──────────┘    └─────┬──────┘    └─────┬──────┘    └──────┬───────┘
                      │                 │                  │
                      ▼                 ▼                  ▼
                 RFC aprobado      Codigo que corre    Todo validado
```

| Fase | Que se busca | Entregable |
| :--- | :--- | :--- |
| **1. Plan** | Entender que hay que hacer y armar el RFC | `RFC_REALIZAR_RECORRIDO.md` aprobado |
| **2. Build** | Escribir codigo de a pasos con tests | Codigo modular en `src/` |
| **3. Validate** | Comprobar que pasen los tests y cumpla la spec | Pruebas exitosas con Vitest |

---

## 2. Roles y responsabilidades

- **Humano:** Manda, decide, aprueba los gates y revisa que todo tenga sentido.
- **IA (Asistente):** Escribe codigo, propone estructuras, arma los tests y avisa si hay cosas para revisar.

---

## 3. Fase 1 — PLAN
Antes de tocar una sola linea de codigo, hay que tener el RFC bien redactado y aprobado. Si hay dudas sobre la letra chica de la spec, se charlan y se documentan en la seccion 9 del RFC.

---

## 4. Fase 2 — BUILD
Se programa siguiendo el plan de tareas de la seccion 10 del RFC. Cada componente tiene su lugar:
- `src/domain/`: reglas puras y tipos.
- `src/services/`: simulaciones (vehiculo, bluetooth, clima, audio).
- `src/components/`: pantallas y paneles responsive.
- `src/hooks/`: logica del recorrido.

---

## 5. Fase 3 — VALIDATE
Se corren las pruebas automatizadas con `npm test` para asegurar que ningun cambio rompa lo anterior y que se cumplan todos los casos de prueba (TC-xx).
