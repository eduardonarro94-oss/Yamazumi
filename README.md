# 📊 Yamazumi Studio & AI Video Analytics
> **Herramienta Digital de Balanceo de Líneas Lean Manufacturing & Video Analytics de Bajo Consumo**

Plataforma interactiva web responsiva (optimizada para **tablets iPad y Android**) diseñada para ingenieros de manufactura, facilitadores Kaizen y especialistas en mejora continua. Permite analizar tiempos de ciclo, calcular el **Tiempo Estándar** ($\text{Tiempo Normal} \times \text{Rating Factor} \times (1 + \text{Suplementos})$), evaluar la meta **Takt Image (-10% Target)** y rebalancear la línea mediante arrastre táctil.

---

## 🌐 Demo en Vivo (Pruebas en Tablet)

Puedes probar la aplicación inmediatamente en cualquier tablet o navegador sin instalar nada:

🔗 **[Abrir Demo en Vivo (GitHub Pages / Web)](https://username.github.io/yamazumi-studio-app/)**

*(También es compatible con despliegues en 1-clic vía Vercel o Netlify)*

---

## 📱 Instrucciones de Prueba en Tablet (iPad & Android)

Para realizar una sesión de validación y balanceo desde una tablet, sigue estos pasos:

### 1. ⏱️ Configurar Takt Time y Parámetros Lean
- Haz clic o toca el badge **⏱️ Takt Time** en el KPI superior o la línea roja del gráfico para ajustar el tiempo takt objetivo en segundos (ej. `180s`).
- En la barra de **⚙️ Parámetros Lean**, configura el **Factor de Nivelación** (ej. `1.05`) y el porcentaje de **Suplementos/Tolerancias** (ej. `10%`). Las barras apiladas del gráfico Yamazumi se actualizarán inmediatamente utilizando el **Tiempo Estándar** resultante.

### 2. 🎯 Verificar Takt Time (100%) vs Takt Image (-10% Target)
- Observa la doble línea de referencia horizontal en el gráfico Yamazumi:
  - **🔴 Línea Takt Time (100%)**: Línea roja discontinua (`dashed`).
  - **🟢 Línea Takt Image (-10% Target)**: Línea verde punteada (`dotted`) colocada automáticamente al 90% del Takt Time (ej. $180\text{s} \times 0.90 = 162\text{s}$).

### 3. 👷 Agregar Estaciones y Tareas
- Usa el botón **`+ Tarea`** al pie de cualquier columna o el botón **`Nueva Estación`** para registrar operaciones de ensamblado.
- Clasifica cada tarea según la metodología Lean:
  - 🟩 **VA**: Valor Agregado (Verde).
  - 🟨 **NVA**: No Valor Agregado (Amarillo).
  - 🟥 **MUDA**: Desperdicio (Rojo).

### 4. 👆 Rebalanceo por Arrastre Táctil (Touch Drag & Drop)
- Toca y mantén presionada cualquier tarea dentro de una estación para arrastrarla a otra columna.
- Suéltala sobre la estación receptora para reasignar el contenido de trabajo y equilibrar la línea en tiempo real.

### 5. ✨ Propuestas Kaizen por IA & Action Tracker
- Toca **`✨ Propuestas Kaizen (IA)`** en la barra superior para escanear automáticamente las tareas de desperdicio (MUDA) y generar recomendaciones inteligentes de mejora.
- Presiona **`✅ Aplicar a Action Tracker`** para convertir la recomendación en un compromiso técnico asignado a la estación.

---

## 🚀 Despliegue Rápido (1-Clic)

### Desplegar en GitHub Pages
```bash
# Instalar dependencias
npm install

# Publicar automáticamente en gh-pages
npm run deploy
```

### Ejecutar Localmente para Pruebas
```bash
npm start
# La aplicación estará disponible en http://localhost:3000
```

---

## 📝 Guía de Feedback para Evaluadores

Agradecemos tus comentarios al probar la herramienta en tablets (iPad, Samsung Galaxy Tab, Microsoft Surface, etc.). Por favor valida los siguientes puntos específicos:

1. **👆 Fluidez Táctil (Touch Drag & Drop)**:
   - ¿El arrastre táctil de tareas entre columnas responde de manera fluida y precisa al toque del dedo?
   - ¿Las zonas táctiles y botones (de al menos 44x44 px) son cómodos sin activar el zoom accidental del navegador?

2. **📱 Legibilidad y Orientación**:
   - ¿La interfaz se visualiza limpia y legible tanto en orientación **Horizontal (Landscape)** como **Vertical (Portrait)**?
   - ¿La etiqueta **🔥 CUELLO BOTELLA** y los indicadores superiores tienen espacio adecuado sin amontonarse?

3. **📊 Precisión en Cálculo de Tiempos**:
   - ¿El cálculo del **Tiempo Estándar** ($\text{Normal} \times \text{Rating Factor} \times (1 + \text{Suplementos})$) refleja correctamente los valores deseados?
   - ¿La posición de la línea **🎯 Takt Image (-10%)** proporciona una meta visual clara para el equipo de ingeniería?

---

## 🛠️ Tecnologías Utilizadas
- **Frontend**: HTML5, Tailwind CSS (Modo Oscuro Industrial), JavaScript ES6 Vanilla (Sin dependencias pesadas).
- **Control Táctil**: HTML5 Drag & Drop + Custom Touch Event Listeners (`touchstart`, `touchmove`, `touchend`).
- **Arquitectura**: Single Page Application (SPA) con Persistencia Local (LocalStorage).

---

*Licencia MIT - Desarrollado para Equipos de Ingeniería de Manufactura y Lean Manufacturing.*
