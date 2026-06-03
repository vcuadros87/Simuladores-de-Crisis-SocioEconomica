# Simuladores-de-Crisis-SocioEconomica
---

## Descripción

El proyecto desarrollado consiste en un simulador interactivo de seis escenarios vinculados a fenómenos socioeconómicos de la actualidad boliviana: suministro de carburantes, inflación de precios, costos de transporte por desviación de rutas, presupuesto familiar, especulación por rumores de escasez y pérdida del poder adquisitivo.

Dicho poryecyo se desarrollo mediante modelos matemáticos simplificados, con el objetivo de comprender la interacción de las variables económicas desde una perspectiva analítica y metodológicamente neutral.

---

## Escenarios incluidos

| Escenario | Descripción |
|-----------|-------------|
| **A** | Simulador de abastecimiento de carburantes |
| **B** | Simulador de precios de alimentos |
| **C** | Simulador de costo de transporte con desvío |
| **D** | Simulador de compras familiares con presupuesto limitado |
| **E** | Simulador de rumor de escasez y compras por pánico |
| **F** | Simulador de pérdida del poder adquisitivo |

---

## Tecnologías utilizadas

- **HTML5** semántico (header, nav, main, section, footer)
- **CSS** externo —  Grid, Flexbox, Media Queries
- **JavaScript** externo — manipulación del DOM, validaciones, cálculos
- 
---

## Estructura de archivos

```
proyecto-web-crisis/
├── index.html          
├── css/
│   └── estilos.css     
├── js/
│   └── script.js      
└── README.md           
```

---

## Características técnicas

- **Diseño responsivo** Mobile First con breakpoints en 600px y 900px
- **Paleta** industrial oscura: fondos `#0d0f12`, acentos ámbar `#e8a020`
- **Semáforo visual**: verde (normal), amarillo (advertencia), rojo (crítico)
- **Casos de estudio** precargables con un clic para verificar funcionamiento
- **Validación** de campos antes de procesar cualquier cálculo
- **Código modularizado** y comentado por función

---

## Modelos matemáticos implementados

```
Reserva final        = reserva inicial + reabastecimiento − consumo
% aumento precio     = ((precio actual − precio anterior) / precio anterior) × 100
Gasto mensual        = precio × cantidad
Costo adicional      = (dist. desvío − dist. normal) × costo por km
Nueva demanda        = demanda normal × (1 + % aumento / 100)
% pérdida adquisitiva = ((gasto actual − gasto anterior) / ingreso) × 100
```

---

## Instalación y uso

1. Clonar o descargar el repositorio.
2. Abrir `index.html` en cualquier navegador moderno.
3. No se requiere servidor ni instalación adicional.

---

## Publicación

- **Página web:** _(completar enlace de GitHub Pages / Netlify / Vercel)_
- **Repositorio Git:** _https://github.com/vcuadros87/Simuladores-de-Crisis-SocioEconomica.git_

---
