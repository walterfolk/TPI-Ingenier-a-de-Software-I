# RFC Técnico: [Nombre de la Spec / Feature]

> **Cómo usar:** Copiá este template, completá lo que esté entre `<...>`, borrá notas (`>`) y secciones que sobren. ¡Menos es más!

| Campo | Detalle |
| :--- | :--- |
| **Título** | RFC: [Nombre] |
| **Proyecto** | Sistemas Triciclos UNTDF |
| **Grupo** | Ingeniería de Software I — Grupo 1 |
| **Integrantes** | [Nombres] |
| **Fecha** | DD/MM/AAAA |
| **Estado** | Borrador / En revisión / Aprobado |

---

## 1. Alcance (¿Qué hacemos y qué no?)

| Componente / Módulo | Estado (Real / Simulado / Fuera de alcance) | Nota rápida |
| :--- | :--- | :--- |
| UI / Pantallas | Real | Web responsive |
| Lógica / Estados | Real | Máquina de estados local |
| Sensores / Hardware | Simulado | Batería, clima, FC, Bluetooth |
| Backend / Base de datos | Fuera de alcance | Todo en navegador con `localStorage` |

---

## 2. Stack Tecnológico

| Capa | Tecnología | Motivo |
| :--- | :--- | :--- |
| Frontend | React + TypeScript + Vite | Liviano, rápido y componentizado |
| Estilos | CSS plano | Sin frameworks pesados |
| Persistencia | `localStorage` | Sin servidores ni DB |
| Testing | Vitest + RTL | Rápido y nativo para React |

---

## 3. Arquitectura y Componentes

```text
[ Esquema rápido de componentes y flujo ]
```

| Componente | ¿Qué hace? |
| :--- | :--- |
| `Componente.tsx` | Renderiza la vista... |
| `servicio.ts` | Maneja la lógica de negocio / almacenamiento |

---

## 4. Diseño y Flujo

### 4.1 Máquina de estados principal
| Estado actual | Evento | Siguiente estado | Efecto |
| :--- | :--- | :--- | :--- |
| `ESTADO_1` | `accion` | `ESTADO_2` | Cambia vista |

---

## 5. Decisiones Clave (FAQ / Supuestos)

| ID | Tema | Decisión tomada |
| :--- | :--- | :--- |
| D-01 | [Tema] | [Decisión breve] |

---

## 6. Plan de Verificación (Casos de Prueba - TC)

| ID | Criterio de aceptación | Cómo probarlo | Resultado |
| :--- | :--- | :--- | :--- |
| TC-01 | [Criterio] | [Pasos] | Pendiente |

---

## 7. Tareas de Build

| Tarea | Descripción | Estado |
| :--- | :--- | :--- |
| T01 | [Nombre de tarea] | Pendiente |
