/**
 * ServerTech Yamazumi Studio - Lógica de Manufactura Electrónica y Ensamble de Servidores
 * 
 * Aplicación SPA orientada a la industria de manufactura de servidores y hardware informático.
 * Característica del dominio:
 * - Proceso de ensamblado SMT, chasis, placa base dual socket, disipadores, memoria ECC, risers PCIe y testing POST/BMC.
 * - Categorías Lean con Takt Time objetivo y codificación cromática:
 *   🟩 VA (Valor Agregado): Ensamble de hardware, torque de disipadores, inserción de RAM/SSD, flasheo de firmware.
 *   🟨 NVA (Sin Valor Agregado / Necesario): Enrutamiento ESD de arneses, conexión a banco POST, checklist de calidad, pruebas térmicas.
 *   🟥 Muda (Desperdicio): Esperas por kitting ESD, retrabajo por exceso de pasta térmica, búsqueda de puntas Torx, retraso en impresión de serie.
 */

/* ==========================================================================
   1. PLANTILLAS DE FACTORÍA DE SERVIDORES (PRESETS)
   ========================================================================== */
const PRESETS = {
  pc_server: {
    id: "pc_server",
    name: "🖥️ Ensamblado: Servidor Enterprise Rack 2U (Dual Xeon / EPYC)",
    description: "Línea de ensamble de servidores de alto rendimiento de 2 unidades de rack con 24 bahías NVMe.",
    taktTime: 180, // 3 minutos por servidor
    timeUnit: "seg",
    stations: [
      {
        id: "st_1",
        name: "Estación 1: Chasis, Fuentes Hot-Swap y Backplane",
        operator: "Mateo Silva (ESD Nivel 1)",
        tasks: [
          { id: "t_101", name: "Instalar fuentes redundantes Titanium 1200W", duration: 25, category: "VA", notes: "Torque 0.8 Nm + Traba de seguridad electromecánica" },
          { id: "t_102", name: "Montar módulo de ventiladores hot-swap (6x FANs)", duration: 30, category: "VA", notes: "Verificar conector de señal PWM e indicador LED" },
          { id: "t_103", name: "Fijar Backplane SAS4/PCIe 5.0 de 24 bahías", duration: 40, category: "VA", notes: "Fijación con 8 tornillos M3 anti-vibración" },
          { id: "t_104", name: "Esperar kitting de cables desde almacén ESD", duration: 25, category: "Muda", notes: "Desperdicio por espera de surtimiento de componentes" },
          { id: "t_105", name: "Prueba de continuidad de tierra en chasis ESD", duration: 20, category: "NVA", notes: "Verificar resistencia de tierra < 1.0 Ohm" }
        ]
      },
      {
        id: "st_2",
        name: "Estación 2: Placa Base, Socket CPU y Disipadores",
        operator: "Lucía Álvarez (ESD Nivel 2)",
        tasks: [
          { id: "t_201", name: "Colocar Motherboard Dual Socket en chasis", duration: 45, category: "VA", notes: "Fijar 9 tornillos standoff con torquímetro 0.6 Nm" },
          { id: "t_202", name: "Instalar 2x CPUs Intel Xeon / AMD EPYC en socket", duration: 55, category: "VA", notes: "Secuencia de palancas 1-2 e inspección de pines LGA" },
          { id: "t_203", name: "Dosificar pasta térmica de alta conductividad", duration: 20, category: "VA", notes: "Patrón automatizado en X (0.5 gramo)" },
          { id: "t_204", name: "Montar disipadores de cobre con torquímetro", duration: 45, category: "VA", notes: "Torque cruzado alternado de 1.2 Nm" },
          { id: "t_205", name: "Limpiar exceso de pasta por desborde manual", duration: 25, category: "Muda", notes: "Retrabajo por falla en cantidad de pasta aplicada" }
        ]
      },
      {
        id: "st_3",
        name: "Estación 3: Memoria RAM ECC, Tarjetas Riser y Discos",
        operator: "Andrés Beltrán (ESD Nivel 1)",
        tasks: [
          { id: "t_301", name: "Insertar 16x RAM DDR5 Registered ECC (512GB)", duration: 50, category: "VA", notes: "Asegurar doble clic en pestillos retenedores" },
          { id: "t_302", name: "Enrutamiento de arnés SlimSAS / PCIe 5.0", duration: 40, category: "NVA", notes: "Peinado de cables con cinchas de velcro antiestáticas" },
          { id: "t_303", name: "Instalar Riser PCIe con Tarjeta NIC 100GbE SFP28", duration: 35, category: "VA", notes: "Ajustar bracket de retención posterior" },
          { id: "t_304", name: "Montar 8x SSDs Enterprise en Caddies 2.5''", duration: 45, category: "VA", notes: "Atornillado en caddies con aislamiento térmico" },
          { id: "t_305", name: "Buscar punta Torx T15 extraviada en mesa", duration: 20, category: "Muda", notes: "Desperdicio por desorden y falta de 5S en estación" }
        ]
      },
      {
        id: "st_4",
        name: "Estación 4: Prueba POST, Flasheo BMC y Cierre",
        operator: "Carmen Gómez (Quality Control ESD Lead)",
        tasks: [
          { id: "t_401", name: "Conectar a banco de prueba POST automatizado", duration: 25, category: "NVA", notes: "Conexión KVM + Red IPMI + Alimentación DC 240V" },
          { id: "t_402", name: "Verificación de memoria total, BIOS y discos", duration: 75, category: "NVA", notes: "Checklist automatizado de 12 parámetros POST" },
          { id: "t_403", name: "Flasheo de Firmware BMC / IPMI y BIOS de fábrica", duration: 30, category: "VA", notes: "Carga de imagen oficial firmada digitalmente" },
          { id: "t_404", name: "Esperar impresión de etiquetas con número de serie", duration: 25, category: "Muda", notes: "Demora por cola en impresora de códigos 2D Barcode" },
          { id: "t_405", name: "Colocar cubierta superior de chasis y empaque ESD", duration: 35, category: "VA", notes: "Cierre magnético + bolsa antiestática con desecante" }
        ]
      }
    ]
  },
  gpu_ai_server: {
    id: "gpu_ai_server",
    name: "⚡ Ensamblado: Servidor IA / GPU HGX (8x SXM5 + Liquid Cooling)",
    description: "Línea especializada en nodos de Inteligencia Artificial de ultra alta densidad.",
    taktTime: 300, // 5 minutos
    timeUnit: "seg",
    stations: [
      {
        id: "st_gpu1",
        name: "Estación 1: Chasis industrial y Bloques de Refrigeración Líquida",
        operator: "Gabriel Ruiz (Especialista Térmico)",
        tasks: [
          { id: "t_g1", name: "Montar distribuidores de refrigerante líquido (Manifolds)", duration: 60, category: "VA", notes: "Ajuste con conectores de acople rápido Quick-Disconnect" },
          { id: "t_g2", name: "Prueba de hermeticidad con nitrógeno a 50 PSI", duration: 70, category: "NVA", notes: "Monitoreo de manómetro durante 1 minuto" },
          { id: "t_g3", name: "Esperar aprobación de laboratorio de fugas", duration: 40, category: "Muda", notes: "Demora por validación fuera de línea" }
        ]
      },
      {
        id: "st_gpu2",
        name: "Estación 2: Baseboard HGX con 8x GPUs NVLink",
        operator: "Mariana Castro (Ensambladora SMT/GPU)",
        tasks: [
          { id: "t_g4", name: "Posicionar módulo NVLink Baseboard en chasis", duration: 75, category: "VA", notes: "Alineación micrométrica en rieles de guiado" },
          { id: "t_g5", name: "Montar 8x GPUs SXM5 y torque de disipadores fríos", duration: 95, category: "VA", notes: "Torque controlado por software a 0.45 Nm" },
          { id: "t_g6", name: "Retrabajo por conector NVLink desalineado", duration: 45, category: "Muda", notes: "Corrección manual por fallo de inserción previa" }
        ]
      },
      {
        id: "st_gpu3",
        name: "Estación 3: Interconexión 400G InfiniBand y Alimentación 3KW",
        operator: "Diego Valencia (Técnico de Conectividad)",
        tasks: [
          { id: "t_g7", name: "Instalar 4x Tarjetas NIC InfiniBand 400G OSFP", duration: 65, category: "VA", notes: "Conexión directa al bus PCIe 5.0" },
          { id: "t_g8", name: "Conectar arnés de alimentación de 3000W DC", duration: 50, category: "VA", notes: "Barras de cobre chapadas en oro" },
          { id: "t_g9", name: "Inspección óptica de conectores de fibra", duration: 35, category: "NVA", notes: "Microscopio de fibra 400x" }
        ]
      },
      {
        id: "st_gpu4",
        name: "Estación 4: Test Stress GPU Burn-in y Certificación",
        operator: "Valeria Morales (Quality Assurance)",
        tasks: [
          { id: "t_g10", name: "Carga de Test Burn-in de GPUs y pruebas de estrés", duration: 110, category: "NVA", notes: "Prueba de carga máxima durante ciclo acelerado" },
          { id: "t_g11", name: "Verificación de firmware de NVSwitch", duration: 40, category: "VA", notes: "Flasheo de topología Mesh de GPUs" },
          { id: "t_g12", name: "Sellado de garantía y empaque técnico", duration: 45, category: "VA", notes: "Caja acolchada para transporte de alto valor" }
        ]
      }
    ]
  },
  edge_1u_server: {
    id: "edge_1u_server",
    name: "📡 Ensamblado: Servidor Edge Telecom 1U (Ruggedized 5G)",
    description: "Línea de producción compacto 1U para torres de comunicación 5G y entornos industriales.",
    taktTime: 120, // 2 minutos
    timeUnit: "seg",
    stations: [
      {
        id: "st_e1",
        name: "Estación 1: Chasis Micro-1U y Fuente DC 48V",
        operator: "Carlos Mendoza",
        tasks: [
          { id: "t_e101", name: "Instalar fuente redundante DC 48V para Telecom", duration: 30, category: "VA", notes: "Terminales de ojillo con aislamiento de calor" },
          { id: "t_e102", name: "Montar filtro de aire antipolvo y ventiladores", duration: 25, category: "VA", notes: "Malla metálica Lavable IP50" },
          { id: "t_e103", name: "Esperar prueba de aislamiento dieléctrico", duration: 15, category: "Muda", notes: "Demora por equipo de prueba ocupado" }
        ]
      },
      {
        id: "st_e2",
        name: "Estación 2: Placa Base Edge y Acelerador FPGA",
        operator: "Elena Ramírez",
        tasks: [
          { id: "t_e201", name: "Fijar placa base industrial Xeon-D", duration: 35, category: "VA", notes: "8 tornillos M3 torquiados a 0.5 Nm" },
          { id: "t_e202", name: "Instalar tarjeta aceleradora FPGA vRAN 5G", duration: 30, category: "VA", notes: "Incrustar en puerto PCIe de perfil bajo" },
          { id: "t_e203", name: "Organizar arnés de antenas GPS/GNSS", duration: 20, category: "NVA", notes: "Fijación con clips anti-vibración" }
        ]
      },
      {
        id: "st_e3",
        name: "Estación 3: Calidad, Prueba Térmica y Cierre",
        operator: "Javier Paredes",
        tasks: [
          { id: "t_e301", name: "Prueba de arranque a temperatura extendida (-40°C a 65°C)", duration: 40, category: "NVA", notes: "Validación de sensor de temperatura" },
          { id: "t_e302", name: "Etiquetado de MAC Address y Número de Serie", duration: 20, category: "NVA", notes: "Escaneo de código QR 2D" },
          { id: "t_e303", name: "Cierre de chasis con empaquetadura de neoprene", duration: 25, category: "VA", notes: "Protección ambiental IP55" }
        ]
      }
    ]
  }
};

/* ==========================================================================
   2. MOTOR DE CÁLCULO DE MÉTRICAS LEAN
   ========================================================================== */
const MetricsCalculator = {
  calculate(state, options = {}) {
    const stations = state.stations || [];
    const taktTime = Number(state.taktTime) || 180;
    const kaizenMode = !!options.kaizenMode;
    
    let totalWorkContent = 0;
    let totalVA = 0;
    let totalNVA = 0;
    let totalMuda = 0;
    let totalTasksCount = 0;

    const stationMetrics = stations.map(st => {
      let stVA = 0;
      let stNVA = 0;
      let stMuda = 0;
      let tasksCount = st.tasks ? st.tasks.length : 0;

      if (st.tasks) {
        st.tasks.forEach(t => {
          const dur = Number(t.duration) || 0;
          if (t.category === 'VA') stVA += dur;
          else if (t.category === 'NVA') stNVA += dur;
          else if (t.category === 'Muda') stMuda += dur;
        });
      }

      // En modo Kaizen el desperdicio (Muda) se elimina de los tiempos de ciclo
      const totalTime = stVA + stNVA + (kaizenMode ? 0 : stMuda);
      const isOverburdened = totalTime > taktTime;
      const overTaktDelta = isOverburdened ? (totalTime - taktTime) : 0;

      totalWorkContent += totalTime;
      totalVA += stVA;
      totalNVA += stNVA;
      totalMuda += stMuda;
      totalTasksCount += tasksCount;

      return {
        id: st.id,
        name: st.name,
        operator: st.operator,
        totalTime,
        va: stVA,
        nva: stNVA,
        muda: stMuda,
        tasksCount,
        isOverburdened,
        overTaktDelta
      };
    });

    const numStations = stations.length;
    const cycleTimes = stationMetrics.map(s => s.totalTime);
    const maxCycleTime = numStations > 0 ? Math.max(...cycleTimes, 0) : 0;
    const minCycleTime = numStations > 0 ? Math.min(...cycleTimes, 0) : 0;
    
    // Estación cuello de botella
    const bottleneckStation = stationMetrics.find(s => s.totalTime === maxCycleTime) || null;

    // Eficiencia de Balanceo de Línea (Line Balance Efficiency %)
    let lineBalanceEfficiency = 0;
    if (numStations > 0 && maxCycleTime > 0) {
      lineBalanceEfficiency = (totalWorkContent / (numStations * maxCycleTime)) * 100;
    }

    const balanceDelay = 100 - lineBalanceEfficiency;

    // Smoothness Index = sqrt( sum( (MaxCT - CT_i)^2 ) )
    let sumSquaredDiff = 0;
    cycleTimes.forEach(ct => {
      sumSquaredDiff += Math.pow(maxCycleTime - ct, 2);
    });
    const smoothnessIndex = Math.sqrt(sumSquaredDiff);

    const rawTotal = totalVA + totalNVA + totalMuda;
    const vaPercent = rawTotal > 0 ? (totalVA / rawTotal) * 100 : 0;
    const nvaPercent = rawTotal > 0 ? (totalNVA / rawTotal) * 100 : 0;
    const mudaPercent = rawTotal > 0 ? (totalMuda / rawTotal) * 100 : 0;

    const overburdenedCount = stationMetrics.filter(s => s.isOverburdened).length;

    return {
      taktTime,
      numStations,
      totalTasksCount,
      totalWorkContent,
      totalVA,
      totalNVA,
      totalMuda,
      vaPercent,
      nvaPercent,
      mudaPercent,
      maxCycleTime,
      minCycleTime,
      bottleneckStation,
      lineBalanceEfficiency,
      balanceDelay,
      smoothnessIndex,
      overburdenedCount,
      stationMetrics,
      kaizenMode
    };
  }
};

/* ==========================================================================
   3. PERSISTENCIA DE DATOS Y EXPORTACIÓN/IMPORTACIÓN
   ========================================================================== */
const DataStore = {
  STORAGE_KEY: "yamazumi_server_assembly_v2",

  load() {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        if (parsed && parsed.stations && Array.isArray(parsed.stations)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("No se pudo cargar de localStorage:", e);
    }
    return this.clonePreset("pc_server");
  },

  save(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error al guardar estado:", e);
    }
  },

  clonePreset(presetKey) {
    const preset = PRESETS[presetKey] || PRESETS.pc_server;
    return JSON.parse(JSON.stringify(preset));
  },

  exportJSON(state) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `server_line_yamazumi_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  exportCSV(state) {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Estacion_ID,Estacion_Nombre,Operador_ESD,Tarea_ID,Tarea_Nombre,Duracion_Seg,Categoria,Notas_Torque_PokaYoke\n";

    state.stations.forEach(st => {
      st.tasks.forEach(t => {
        const row = [
          `"${st.id}"`,
          `"${st.name.replace(/"/g, '""')}"`,
          `"${(st.operator || '').replace(/"/g, '""')}"`,
          `"${t.id}"`,
          `"${t.name.replace(/"/g, '""')}"`,
          t.duration,
          `"${t.category}"`,
          `"${(t.notes || '').replace(/"/g, '""')}"`
        ].join(",");
        csvContent += row + "\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `server_assembly_yamazumi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  parseCSV(csvText) {
    const lines = csvText.split(/\r\n|\n/);
    if (lines.length < 2) throw new Error("El archivo CSV está vacío o no es válido");

    const stationsMap = new Map();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const matches = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g);
      if (!matches) continue;

      const fields = matches.map(m => {
        let val = m.replace(/^,/, '');
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val.trim();
      });

      if (fields.length >= 7) {
        const stId = fields[0] || `st_${Date.now()}`;
        const stName = fields[1] || 'Estación de Ensamble';
        const stOp = fields[2] || 'Técnico ESD';
        const taskId = fields[3] || `t_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
        const taskName = fields[4] || 'Tarea de Ensamble';
        const duration = parseFloat(fields[5]) || 20;
        let category = (fields[6] || 'VA').toUpperCase();
        if (!['VA', 'NVA', 'MUDA'].includes(category)) {
          if (category === 'DESPERDICIO' || category === 'WASTE') category = 'Muda';
          else category = 'VA';
        } else if (category === 'MUDA') {
          category = 'Muda';
        }
        const notes = fields[7] || '';

        if (!stationsMap.has(stId)) {
          stationsMap.set(stId, {
            id: stId,
            name: stName,
            operator: stOp,
            tasks: []
          });
        }

        stationsMap.get(stId).tasks.push({
          id: taskId,
          name: taskName,
          duration: duration,
          category: category,
          notes: notes
        });
      }
    }

    const stations = Array.from(stationsMap.values());
    if (stations.length === 0) throw new Error("No se encontraron estaciones ni tareas válidas en el CSV");

    return {
      id: `custom_${Date.now()}`,
      name: "Línea de Servidores Importada (CSV)",
      description: "Línea de ensamble electrónica importada.",
      taktTime: 180,
      timeUnit: "seg",
      stations: stations
    };
  }
};

/* ==========================================================================
   4. MOTOR DRAG AND DROP (REBALANCEO DE TAREAS)
   ========================================================================== */
const DragDropEngine = {
  draggedTaskId: null,
  sourceStationId: null,
  onTaskMovedCallback: null,

  init(onTaskMoved) {
    this.onTaskMovedCallback = onTaskMoved;
  },

  bindEvents(containerEl) {
    if (!containerEl) return;

    const taskBlocks = containerEl.querySelectorAll('.yamazumi-task-block');
    taskBlocks.forEach(block => {
      block.setAttribute('draggable', 'true');
      block.addEventListener('dragstart', (e) => this.handleDragStart(e, block));
      block.addEventListener('dragend', (e) => this.handleDragEnd(e, block));
    });

    const stationColumns = containerEl.querySelectorAll('.yamazumi-station-column');
    stationColumns.forEach(col => {
      col.addEventListener('dragover', (e) => this.handleDragOver(e, col));
      col.addEventListener('dragleave', (e) => this.handleDragLeave(e, col));
      col.addEventListener('drop', (e) => this.handleDrop(e, col));
    });
  },

  handleDragStart(e, blockEl) {
    this.draggedTaskId = blockEl.getAttribute('data-task-id');
    this.sourceStationId = blockEl.getAttribute('data-station-id');

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: this.draggedTaskId,
      sourceStationId: this.sourceStationId
    }));

    blockEl.classList.add('opacity-40', 'scale-95', 'ring-2', 'ring-indigo-500');
    document.body.classList.add('is-dragging-task');
  },

  handleDragEnd(e, blockEl) {
    blockEl.classList.remove('opacity-40', 'scale-95', 'ring-2', 'ring-indigo-500');
    document.body.classList.remove('is-dragging-task');
    document.querySelectorAll('.yamazumi-station-column').forEach(col => {
      col.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-900/30');
    });
  },

  handleDragOver(e, colEl) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!colEl.classList.contains('ring-4')) {
      colEl.classList.add('ring-4', 'ring-indigo-400', 'bg-indigo-900/30');
    }
  },

  handleDragLeave(e, colEl) {
    if (!colEl.contains(e.relatedTarget)) {
      colEl.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-900/30');
    }
  },

  handleDrop(e, targetColEl) {
    e.preventDefault();
    targetColEl.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-900/30');

    const targetStationId = targetColEl.getAttribute('data-station-id');
    if (!this.draggedTaskId || !targetStationId) return;

    let targetIndex = -1;
    const hoveredTask = e.target.closest('.yamazumi-task-block');
    if (hoveredTask && hoveredTask.getAttribute('data-station-id') === targetStationId) {
      const hoveredTaskId = hoveredTask.getAttribute('data-task-id');
      const taskBlocks = Array.from(targetColEl.querySelectorAll('.yamazumi-task-block'));
      targetIndex = taskBlocks.findIndex(el => el.getAttribute('data-task-id') === hoveredTaskId);
    }

    if (typeof this.onTaskMovedCallback === 'function') {
      this.onTaskMovedCallback({
        taskId: this.draggedTaskId,
        sourceStationId: this.sourceStationId,
        targetStationId: targetStationId,
        targetIndex: targetIndex
      });
    }

    this.draggedTaskId = null;
    this.sourceStationId = null;
  }
};

/* ==========================================================================
   5. MOTOR DE RENDERIZADO DEL GRÁFICO YAMAZUMI
   ========================================================================== */
const YamazumiRenderer = {
  render(containerEl, state, metrics, appRef) {
    if (!containerEl) return;

    const stations = state.stations || [];
    const taktTime = metrics.taktTime || 180;
    const maxCycleTime = metrics.maxCycleTime || 0;
    const kaizenMode = appRef.kaizenMode || false;

    const highestValue = Math.max(taktTime, maxCycleTime, 120);
    const maxYScale = Math.ceil((highestValue * 1.25) / 20) * 20;

    const chartHeightPx = 450;
    const pxPerSecond = chartHeightPx / maxYScale;

    // Posición exacta en píxeles de la línea de Takt Time desde la base
    const taktTimePxFromBottom = Math.round(taktTime * pxPerSecond);

    let html = `
      <div class="space-y-3">
        
        <!-- Toolbar del Gráfico -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shadow-md">
          <div class="flex items-center space-x-3">
            <button onclick="app.toggleKaizenMode()"
                    class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 shadow ${kaizenMode ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400' : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700'}">
              <span>⚡ Modo Kaizen (Simular 0 Muda)</span>
              ${kaizenMode ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-amber-300 font-extrabold">ACTIVO</span>' : ''}
            </button>
            
            <span class="text-xs text-slate-400 hidden lg:inline">
              ${kaizenMode ? 'Simulando la eliminación completa del desperdicio (esperas ESD, desorden de herramientas, retrabajos).' : '💡 Arrastra tareas entre estaciones para nivelar el tiempo de ensamble respecto al Takt Time.'}
            </span>
          </div>

          <!-- Leyenda Lean con Colores -->
          <div class="flex items-center space-x-4 text-xs font-semibold">
            <span class="flex items-center space-x-1.5" title="Valor Agregado: Ensamble directo de piezas, torque de tornillos, montaje de componentes"><span class="w-3 h-3 rounded-sm bg-gradient-to-r from-emerald-600 to-teal-600"></span><span class="text-slate-200">VA (Valor Agregado)</span></span>
            <span class="flex items-center space-x-1.5" title="Sin Valor Agregado: Inspección ESD, cableado, conexión a prueba POST"><span class="w-3 h-3 rounded-sm bg-gradient-to-r from-amber-500 to-yellow-600"></span><span class="text-slate-200">NVA (Necesario)</span></span>
            <span class="flex items-center space-x-1.5" title="Desperdicio: Espera de kitting ESD, retrabajo por pasta térmica, búsqueda de herramientas"><span class="w-3 h-3 rounded-sm bg-gradient-to-r from-rose-600 to-red-600"></span><span class="text-slate-200">Muda (Desperdicio)</span></span>
          </div>
        </div>

        <!-- Canvas Principal del Gráfico -->
        <div class="relative w-full overflow-x-auto pb-6 pt-4 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-md shadow-2xl">
          
          <div class="min-w-max px-4">
            
            <!-- HEADER: Badges y KPIs superiores por Estación -->
            <div class="flex items-end space-x-6 pl-16 mb-3">
              ${stations.map((st, index) => {
                const stMetrics = metrics.stationMetrics[index] || {};
                const isOver = stMetrics.isOverburdened;
                const isBottleneck = stMetrics.totalTime === maxCycleTime && maxCycleTime > 0;

                return `
                  <div class="w-52 sm:w-60 flex flex-col items-center justify-end space-y-1">
                    ${isBottleneck ? `
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm flex items-center space-x-1 animate-pulse">
                        <span>🔥 Cuello de Botella Línea</span>
                      </span>
                    ` : ''}
                    
                    ${isOver ? `
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm animate-bounce">
                        ⚠️ Sobrecarga (+${stMetrics.overTaktDelta}s vs Takt)
                      </span>
                    ` : ''}

                    <div class="w-full flex items-center justify-between px-3 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl shadow-md">
                      <span class="text-xs font-black ${isOver ? 'text-rose-400' : 'text-slate-100'}">
                        ⏱️ ${stMetrics.totalTime}s
                      </span>
                      <span class="text-[10px] font-bold text-slate-400">
                        ${st.tasks.length} paso${st.tasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}

              <div class="w-36"></div>
            </div>

            <!-- CANVAS visual de columnas y línea de Takt Time -->
            <div class="relative flex items-end min-w-max" style="height: ${chartHeightPx}px;">
              
              <!-- Eje Y con ticks numéricos -->
              <div class="absolute left-0 top-0 bottom-0 z-20 flex flex-col justify-between pr-3 text-xs font-mono font-semibold text-slate-400 border-r border-slate-800 bg-slate-950/90 py-1 select-none shadow-md w-14">
                ${this.renderYAxisTicks(maxYScale)}
              </div>

              <!-- Rejilla horizontal de guía (Gridlines) -->
              <div class="absolute left-14 right-0 top-0 bottom-0 pointer-events-none flex flex-col justify-between py-1">
                ${this.renderGridlines(maxYScale)}
              </div>

              <!-- LÍNEA DE TAKT TIME INTERACTIVA -->
              <div class="absolute left-14 right-0 z-20 pointer-events-none transition-all duration-300 group" style="bottom: ${taktTimePxFromBottom}px;">
                <div class="w-full border-b-2 border-dashed border-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.7)]"></div>
                
                <div class="absolute left-2 -top-3.5 pointer-events-auto bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-xl flex items-center space-x-1 cursor-pointer transition-colors"
                     title="Haz clic para modificar el Tiempo Takt Objetivo de Ensamble"
                     onclick="app.openTaktModal()">
                  <span>⏱️ Takt Objetivo: ${taktTime}s / Servidor</span>
                  <svg class="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </div>
              </div>

              <!-- Columnas por Estación de Ensamble -->
              <div class="flex items-end space-x-6 pl-20 flex-1 h-full">
                ${stations.map((st, index) => this.renderStationColumn(st, index, metrics.stationMetrics[index], pxPerSecond, chartHeightPx, kaizenMode, stations.length)).join('')}

                <!-- Botón para Agregar Nueva Estación -->
                <div class="flex flex-col items-center justify-center h-full w-36 border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 rounded-2xl transition-all p-4 cursor-pointer group hover:bg-indigo-500/5 select-none flex-shrink-0"
                     onclick="app.openStationModal()">
                  <div class="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center transition-all shadow-md mb-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  </div>
                  <span class="text-xs font-bold text-slate-400 group-hover:text-indigo-300 text-center">Nueva Estación</span>
                </div>
              </div>

            </div>

            <!-- FOOTER: Información del Operador y Controles de Estación -->
            <div class="flex items-start space-x-6 pl-20 mt-4">
              ${stations.map((st, index) => this.renderStationFooter(st, index, stations.length)).join('')}
              <div class="w-36"></div>
            </div>

          </div>
        </div>
      </div>
    `;

    containerEl.innerHTML = html;
    DragDropEngine.bindEvents(containerEl);
  },

  renderYAxisTicks(maxYScale) {
    const numTicks = 5;
    const step = maxYScale / numTicks;
    let html = '';
    for (let i = numTicks; i >= 0; i--) {
      const val = Math.round(step * i);
      html += `<div class="text-right leading-none">${val}s</div>`;
    }
    return html;
  },

  renderGridlines(maxYScale) {
    const numTicks = 5;
    let html = '';
    for (let i = 0; i < numTicks; i++) {
      html += `<div class="w-full border-b border-slate-800/60"></div>`;
    }
    return html;
  },

  renderStationColumn(st, index, stMetrics, pxPerSecond, chartHeightPx, kaizenMode, totalStations) {
    return `
      <div class="yamazumi-station-column relative flex flex-col justify-end w-52 sm:w-60 h-full group"
           data-station-id="${st.id}">
        
        <div class="relative w-full bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden flex flex-col-reverse shadow-inner transition-all hover:border-slate-600 h-full">
          <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none"></div>

          ${st.tasks.map((task, tIndex) => this.renderTaskBlock(task, tIndex, st.id, pxPerSecond, kaizenMode, st.tasks.length, index, totalStations)).join('')}

          ${st.tasks.length === 0 ? `
            <div class="h-full flex flex-col items-center justify-center p-4 text-slate-600 text-center select-none">
              <svg class="w-8 h-8 mb-1 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              <span class="text-[11px] font-medium">Arrastra tareas de ensamble aquí</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  renderTaskBlock(task, tIndex, stationId, pxPerSecond, kaizenMode, totalTasksInStation, stationIndex, totalStations) {
    const isMuda = task.category === 'Muda';
    const isExcludedInKaizen = kaizenMode && isMuda;

    let displayDuration = isExcludedInKaizen ? 0 : task.duration;
    const blockHeightPx = Math.max(Math.round((displayDuration || task.duration) * pxPerSecond), 28);
    
    let bgClasses = '';
    let categoryBadge = '';
    
    if (task.category === 'VA') {
      bgClasses = 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/50 text-white shadow-emerald-900/40';
      categoryBadge = 'VA';
    } else if (task.category === 'NVA') {
      bgClasses = 'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-300/50 text-amber-950 shadow-amber-900/40 font-semibold';
      categoryBadge = 'NVA';
    } else { // Muda
      if (isExcludedInKaizen) {
        bgClasses = 'bg-rose-950/40 border-2 border-dashed border-rose-500/40 text-rose-300 opacity-60 line-through';
      } else {
        bgClasses = 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-400/50 text-white shadow-rose-900/40';
      }
      categoryBadge = 'MUDA';
    }

    return `
      <div class="yamazumi-task-block relative w-full border-t border-b ${bgClasses} p-1.5 cursor-grab active:cursor-grabbing transition-all duration-150 hover:brightness-110 hover:shadow-xl flex items-center justify-between group/task overflow-hidden select-none"
           style="height: ${blockHeightPx}px;"
           data-task-id="${task.id}"
           data-station-id="${stationId}"
           title="${task.name} (${task.duration}s) - ${task.category} | ${task.notes || ''}">
        
        <div class="flex items-center space-x-1.5 overflow-hidden pr-1">
          <svg class="w-3 h-3 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/></svg>
          
          <div class="flex flex-col overflow-hidden leading-tight">
            <span class="text-[11px] font-bold truncate">
              ${task.name}
            </span>
            ${blockHeightPx > 36 ? `
              <span class="text-[9px] opacity-90 font-medium">
                ${task.duration} seg ${isExcludedInKaizen ? '(⚡ Kaizen: 0s)' : ''}
              </span>
            ` : ''}
          </div>
        </div>

        <div class="flex items-center space-x-1 flex-shrink-0">
          <span class="text-[9px] font-extrabold px-1 rounded bg-black/20 backdrop-blur-xs">
            ${categoryBadge}
          </span>
          
          <div class="hidden group-hover/task:flex items-center space-x-0.5 bg-slate-950/90 rounded-lg px-1 py-0.5 border border-slate-700 shadow-xl">
            ${tIndex > 0 ? `
              <button onclick="event.stopPropagation(); app.moveTaskOrder('${task.id}', '${stationId}', -1)"
                      class="p-0.5 text-slate-300 hover:text-indigo-400" title="Subir orden en la estación">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
              </button>
            ` : ''}

            ${tIndex < totalTasksInStation - 1 ? `
              <button onclick="event.stopPropagation(); app.moveTaskOrder('${task.id}', '${stationId}', 1)"
                      class="p-0.5 text-slate-300 hover:text-indigo-400" title="Bajar orden en la estación">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
            ` : ''}

            <button onclick="event.stopPropagation(); app.openTaskModal('${task.id}', '${stationId}')"
                    class="p-0.5 text-slate-300 hover:text-amber-400" title="Editar Tarea de Ensamble">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>

            <button onclick="event.stopPropagation(); app.deleteTask('${task.id}', '${stationId}')"
                    class="p-0.5 text-slate-300 hover:text-rose-400" title="Eliminar Tarea">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

      </div>
    `;
  },

  renderStationFooter(st, index, totalStations) {
    return `
      <div class="w-52 sm:w-60 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-xl">
        <div class="flex items-start justify-between gap-1">
          <div class="overflow-hidden">
            <h4 class="text-xs font-black text-slate-100 truncate" title="${st.name}">
              ${st.name}
            </h4>
            <div class="flex items-center space-x-1 text-[11px] text-indigo-400 font-semibold mt-0.5">
              <svg class="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span class="truncate" title="Operador ESD: ${st.operator || 'Sin asignar'}">${st.operator || 'Operador ESD'}</span>
            </div>
          </div>

          <div class="flex items-center space-x-1 flex-shrink-0">
            <button onclick="app.openStationModal('${st.id}')" title="Editar Estación" class="text-slate-400 hover:text-indigo-400 p-1 rounded hover:bg-slate-800">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 113.536 3.536L12 20.243H8.5v-3.572L16.732 3.732z"/></svg>
            </button>
            <button onclick="app.deleteStation('${st.id}')" title="Eliminar Estación" class="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>

        <div class="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
          <div class="flex items-center space-x-1">
            ${index > 0 ? `
              <button onclick="app.moveStationPosition('${st.id}', -1)" title="Mover Estación a la Izquierda" class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
            ` : ''}
            ${index < totalStations - 1 ? `
              <button onclick="app.moveStationPosition('${st.id}', 1)" title="Mover Estación a la Derecha" class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            ` : ''}
          </div>

          <button onclick="app.openTaskModal(null, '${st.id}')"
                  class="py-1 px-2.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center space-x-1 shadow">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <span>+ Tarea</span>
          </button>
        </div>
      </div>
    `;
  }
};

/* ==========================================================================
   6. CONTROLADOR PRINCIPAL DE LA APLICACIÓN SPA (YAMAZUMI APP)
   ========================================================================== */
class YamazumiApp {
  constructor() {
    this.state = null;
    this.metrics = null;
    this.activeTab = 'chart';
    this.editingTaskId = null;
    this.editingStationId = null;
    this.kaizenMode = false;
    this.tableSearchQuery = '';
    this.tableCategoryFilter = 'ALL';

    // Propiedades del Cronómetro de Video
    this.stopwatchInterval = null;
    this.stopwatchStartTime = 0;
    this.stopwatchElapsedMs = 0;
    this.stopwatchRunning = false;
    this.selectedVideoCategory = 'VA';
  }

  init() {
    console.log("Inicializando ServerTech Yamazumi Studio SPA...");
    this.state = DataStore.load();
    DragDropEngine.init((moveData) => this.handleTaskMoved(moveData));
    this.bindGlobalEvents();
    this.refresh();
  }

  toggleKaizenMode() {
    this.kaizenMode = !this.kaizenMode;
    this.refresh();
  }

  refresh() {
    this.metrics = MetricsCalculator.calculate(this.state, { kaizenMode: this.kaizenMode });
    this.updateKPICards();

    if (this.activeTab === 'chart') {
      const container = document.getElementById('yamazumi-chart-container');
      if (container) {
        YamazumiRenderer.render(container, this.state, this.metrics, this);
      }
    } else if (this.activeTab === 'video') {
      this.populateVideoStationSelect();
    } else if (this.activeTab === 'table') {
      this.renderTableView();
    } else if (this.activeTab === 'analytics') {
      this.renderAnalyticsView();
    }

    DataStore.save(this.state);
  }

  updateKPICards() {
    const m = this.metrics;
    
    document.getElementById('kpi-takt-time').innerText = `${m.taktTime}s`;
    document.getElementById('kpi-bottleneck').innerText = `${m.maxCycleTime}s`;
    
    const bnNameEl = document.getElementById('kpi-bottleneck-name');
    if (bnNameEl) {
      bnNameEl.innerText = m.bottleneckStation ? m.bottleneckStation.name : 'N/A';
    }

    const effEl = document.getElementById('kpi-efficiency');
    if (effEl) {
      effEl.innerText = `${m.lineBalanceEfficiency.toFixed(1)}%`;
      effEl.className = `text-2xl font-black ${m.lineBalanceEfficiency >= 85 ? 'text-emerald-400' : m.lineBalanceEfficiency >= 70 ? 'text-amber-400' : 'text-rose-400'}`;
    }

    document.getElementById('kpi-work-content').innerText = `${m.totalWorkContent}s`;
    document.getElementById('kpi-stations-count').innerText = `${m.numStations}`;
    
    const mudaEl = document.getElementById('kpi-muda-percent');
    if (mudaEl) {
      mudaEl.innerText = `${m.totalMuda}s (${m.mudaPercent.toFixed(1)}%)`;
    }
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    
    const tabs = ['chart', 'video', 'table', 'analytics'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      const view = document.getElementById(`view-${t}`);
      
      if (t === tabName) {
        if (btn) btn.className = "px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-md flex items-center space-x-1.5 transition-all";
        if (view) view.classList.remove('hidden');
      } else {
        if (btn) btn.className = "px-4 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center space-x-1.5 transition-all";
        if (view) view.classList.add('hidden');
      }
    });

    if (tabName === 'video') {
      this.populateVideoStationSelect();
    }

    this.refresh();
  }

  populateVideoStationSelect() {
    const select = document.getElementById('video-task-station');
    if (!select || !this.state || !this.state.stations) return;

    select.innerHTML = this.state.stations.map(st => `
      <option value="${st.id}">${st.name} (${st.operator || 'Operador ESD'})</option>
    `).join('');
  }

  /* --- MÉTODOS DEL ESTUDIO DE TIEMPOS POR VIDEO Y CRONÓMETRO --- */

  startStopwatch() {
    if (this.stopwatchRunning) return;

    this.stopwatchRunning = true;
    this.stopwatchStartTime = Date.now() - this.stopwatchElapsedMs;

    this.stopwatchInterval = setInterval(() => {
      this.stopwatchElapsedMs = Date.now() - this.stopwatchStartTime;
      this.updateStopwatchDisplay();
    }, 50);

    const videoEl = document.getElementById('time-study-video');
    if (videoEl && videoEl.paused) {
      videoEl.play().catch(() => {});
    }

    const statusEl = document.getElementById('stopwatch-status');
    if (statusEl) {
      statusEl.innerText = "🔴 Cronometrando tarea de ensamble...";
      statusEl.className = "text-[11px] font-bold text-emerald-400 animate-pulse block";
    }
  }

  pauseStopwatch() {
    if (!this.stopwatchRunning) return;

    clearInterval(this.stopwatchInterval);
    this.stopwatchRunning = false;

    const videoEl = document.getElementById('time-study-video');
    if (videoEl && !videoEl.paused) {
      videoEl.pause();
    }

    const statusEl = document.getElementById('stopwatch-status');
    if (statusEl) {
      statusEl.innerText = "⏸️ Cronómetro pausado";
      statusEl.className = "text-[11px] font-semibold text-amber-400 block";
    }
  }

  stopStopwatch() {
    this.pauseStopwatch();

    const seconds = (this.stopwatchElapsedMs / 1000).toFixed(1);
    const durationInput = document.getElementById('video-task-duration');
    if (durationInput) {
      durationInput.value = seconds;
    }

    const statusEl = document.getElementById('stopwatch-status');
    if (statusEl) {
      statusEl.innerText = `⏹️ Tiempo registrado: ${seconds}s`;
      statusEl.className = "text-[11px] font-extrabold text-indigo-300 block";
    }
  }

  resetStopwatch() {
    this.pauseStopwatch();
    this.stopwatchElapsedMs = 0;
    this.updateStopwatchDisplay();

    const durationInput = document.getElementById('video-task-duration');
    if (durationInput) durationInput.value = 0;

    const statusEl = document.getElementById('stopwatch-status');
    if (statusEl) {
      statusEl.innerText = "Listo para cronometrar";
      statusEl.className = "text-[11px] font-semibold text-slate-500 block";
    }
  }

  updateStopwatchDisplay() {
    const totalSecs = Math.floor(this.stopwatchElapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((this.stopwatchElapsedMs % 1000) / 100);

    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}s`;
    
    const displayEl = document.getElementById('stopwatch-display');
    if (displayEl) displayEl.innerText = formatted;

    const durationInput = document.getElementById('video-task-duration');
    if (durationInput && this.stopwatchRunning) {
      durationInput.value = (this.stopwatchElapsedMs / 1000).toFixed(1);
    }
  }

  setVideoCategory(category) {
    this.selectedVideoCategory = category;

    ['va', 'nva', 'muda'].forEach(cat => {
      const btn = document.getElementById(`btn-cat-${cat}`);
      if (!btn) return;

      if (cat.toUpperCase() === category.toUpperCase() || (cat === 'muda' && category === 'Muda')) {
        if (cat === 'va') btn.className = "py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow-md text-center border-2 border-emerald-400 transition-all";
        else if (cat === 'nva') btn.className = "py-2 text-xs font-bold rounded-xl bg-amber-600 text-white shadow-md text-center border-2 border-amber-400 transition-all";
        else btn.className = "py-2 text-xs font-bold rounded-xl bg-rose-600 text-white shadow-md text-center border-2 border-rose-400 transition-all";
      } else {
        btn.className = "py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-400 text-center border border-slate-700 transition-all hover:bg-slate-700";
      }
    });
  }

  saveVideoTimedTask() {
    const nameInput = document.getElementById('video-task-name');
    const name = nameInput ? nameInput.value.trim() : '';
    const stationId = document.getElementById('video-task-station').value;
    const duration = parseFloat(document.getElementById('video-task-duration').value) || 0;
    const notesInput = document.getElementById('video-task-notes');
    const notes = notesInput ? notesInput.value.trim() : '';
    const category = this.selectedVideoCategory || 'VA';

    if (!name) {
      alert("Por favor ingresa un nombre para la tarea cronometrada.");
      return;
    }
    if (duration <= 0) {
      alert("La duración cronometrada debe ser mayor a 0 segundos.");
      return;
    }
    if (!stationId) {
      alert("Selecciona una estación de ensamble destino.");
      return;
    }

    const st = this.state.stations.find(s => s.id === stationId);
    if (!st) return;

    const newTask = {
      id: `t_vid_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,
      name: name,
      duration: duration,
      category: category,
      notes: notes || "Registrado mediante Estudio de Tiempos por Video"
    };

    st.tasks.push(newTask);

    // Resetear formulario y cronómetro
    if (nameInput) nameInput.value = '';
    if (notesInput) notesInput.value = '';
    this.resetStopwatch();

    // Refrescar estado y métricas (recalcula inmediatamente el cuello de botella y sobrecarga)
    this.refresh();

    const bottleneckName = this.metrics.bottleneckStation ? this.metrics.bottleneckStation.name : 'N/A';
    alert(`¡Tarea '${name}' (${duration}s - ${category}) guardada con éxito en la estación '${st.name}'!\n\nSe ha actualizado el Gráfico Yamazumi.\nCuello de botella actual: ${bottleneckName} (${this.metrics.maxCycleTime}s).`);
    
    // Cambiar vista al gráfico Yamazumi para visualizar la actualización
    this.switchTab('chart');
  }

  loadCustomVideoFile(event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const videoEl = document.getElementById('time-study-video');
      if (videoEl) {
        videoEl.src = url;
        videoEl.play().catch(() => {});
      }
    }
  }

  changeSampleVideo(sampleKey) {
    const videoEl = document.getElementById('time-study-video');
    if (!videoEl) return;

    if (sampleKey === 'demo_gpu') {
      videoEl.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
    } else {
      videoEl.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
    videoEl.play().catch(() => {});
  }

  setVideoSpeed(speed) {
    const videoEl = document.getElementById('time-study-video');
    if (videoEl) {
      videoEl.playbackRate = speed;
    }
  }

  seekVideo(deltaSeconds) {
    const videoEl = document.getElementById('time-study-video');
    if (videoEl) {
      videoEl.currentTime = Math.max(0, videoEl.currentTime + deltaSeconds);
    }
  }

  loadPreset(presetKey) {
    if (confirm("¿Deseas cargar esta configuración de línea de servidores? Se reemplazarán los datos actuales.")) {
      this.state = DataStore.clonePreset(presetKey);
      this.refresh();
    }
  }

  handleTaskMoved({ taskId, sourceStationId, targetStationId, targetIndex }) {
    if (!sourceStationId || !targetStationId) return;

    const sourceSt = this.state.stations.find(s => s.id === sourceStationId);
    const targetSt = this.state.stations.find(s => s.id === targetStationId);

    if (!sourceSt || !targetSt) return;

    const taskIndex = sourceSt.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const [movedTask] = sourceSt.tasks.splice(taskIndex, 1);

    if (targetIndex >= 0 && targetIndex < targetSt.tasks.length) {
      targetSt.tasks.splice(targetIndex, 0, movedTask);
    } else {
      targetSt.tasks.push(movedTask);
    }

    this.refresh();
  }

  moveTaskOrder(taskId, stationId, delta) {
    const st = this.state.stations.find(s => s.id === stationId);
    if (!st) return;

    const idx = st.tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;

    const newIdx = idx + delta;
    if (newIdx >= 0 && newIdx < st.tasks.length) {
      const [task] = st.tasks.splice(idx, 1);
      st.tasks.splice(newIdx, 0, task);
      this.refresh();
    }
  }

  moveStationPosition(stationId, delta) {
    const idx = this.state.stations.findIndex(s => s.id === stationId);
    if (idx === -1) return;

    const newIdx = idx + delta;
    if (newIdx >= 0 && newIdx < this.state.stations.length) {
      const [st] = this.state.stations.splice(idx, 1);
      this.state.stations.splice(newIdx, 0, st);
      this.refresh();
    }
  }

  openTaskModal(taskId = null, defaultStationId = null) {
    this.editingTaskId = taskId;
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('task-modal-title');
    const selectStation = document.getElementById('task-modal-station');

    selectStation.innerHTML = this.state.stations.map(st => `
      <option value="${st.id}">${st.name} (${st.operator || 'Operador ESD'})</option>
    `).join('');

    if (taskId) {
      modalTitle.innerText = "Editar Tarea de Ensamble de Servidor";
      let foundTask = null;
      let foundStId = null;

      for (const st of this.state.stations) {
        const t = st.tasks.find(x => x.id === taskId);
        if (t) {
          foundTask = t;
          foundStId = st.id;
          break;
        }
      }

      if (foundTask) {
        document.getElementById('task-modal-name').value = foundTask.name;
        document.getElementById('task-modal-duration').value = foundTask.duration;
        document.getElementById('task-modal-category').value = foundTask.category;
        document.getElementById('task-modal-notes').value = foundTask.notes || '';
        selectStation.value = foundStId;
      }
    } else {
      modalTitle.innerText = "Agregar Nueva Tarea de Ensamble";
      document.getElementById('task-modal-name').value = '';
      document.getElementById('task-modal-duration').value = 30;
      document.getElementById('task-modal-category').value = 'VA';
      document.getElementById('task-modal-notes').value = '';
      if (defaultStationId) {
        selectStation.value = defaultStationId;
      }
    }

    modal.classList.remove('hidden');
    document.getElementById('task-modal-name').focus();
  }

  saveTaskModal() {
    const name = document.getElementById('task-modal-name').value.trim();
    const duration = parseFloat(document.getElementById('task-modal-duration').value) || 0;
    const category = document.getElementById('task-modal-category').value;
    const targetStationId = document.getElementById('task-modal-station').value;
    const notes = document.getElementById('task-modal-notes').value.trim();

    if (!name) {
      alert("Por favor ingresa un nombre para la tarea de ensamble.");
      return;
    }
    if (duration <= 0) {
      alert("La duración debe ser mayor a 0 segundos.");
      return;
    }

    if (this.editingTaskId) {
      for (const st of this.state.stations) {
        const idx = st.tasks.findIndex(t => t.id === this.editingTaskId);
        if (idx !== -1) {
          const [task] = st.tasks.splice(idx, 1);
          task.name = name;
          task.duration = duration;
          task.category = category;
          task.notes = notes;

          const newSt = this.state.stations.find(s => s.id === targetStationId);
          if (newSt) {
            newSt.tasks.push(task);
          } else {
            st.tasks.push(task);
          }
          break;
        }
      }
    } else {
      const newTask = {
        id: `t_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,
        name,
        duration,
        category,
        notes
      };
      const st = this.state.stations.find(s => s.id === targetStationId);
      if (st) st.tasks.push(newTask);
    }

    this.closeModal('task-modal');
    this.refresh();
  }

  deleteTask(taskId, stationId) {
    if (confirm("¿Estás seguro de eliminar esta tarea del proceso de ensamble?")) {
      const st = this.state.stations.find(s => s.id === stationId);
      if (st) {
        st.tasks = st.tasks.filter(t => t.id !== taskId);
        this.refresh();
      }
    }
  }

  openStationModal(stationId = null) {
    this.editingStationId = stationId;
    const modal = document.getElementById('station-modal');
    const modalTitle = document.getElementById('station-modal-title');

    if (stationId) {
      modalTitle.innerText = "Editar Estación de Ensamble";
      const st = this.state.stations.find(s => s.id === stationId);
      if (st) {
        document.getElementById('station-modal-name').value = st.name;
        document.getElementById('station-modal-operator').value = st.operator || '';
      }
    } else {
      modalTitle.innerText = "Agregar Nueva Estación de Ensamble";
      const nextNum = this.state.stations.length + 1;
      document.getElementById('station-modal-name').value = `Estación ${nextNum}: Componentes`;
      document.getElementById('station-modal-operator').value = `Técnico ESD ${nextNum}`;
    }

    modal.classList.remove('hidden');
    document.getElementById('station-modal-name').focus();
  }

  saveStationModal() {
    const name = document.getElementById('station-modal-name').value.trim();
    const operator = document.getElementById('station-modal-operator').value.trim();

    if (!name) {
      alert("Por favor ingresa un nombre para la estación.");
      return;
    }

    if (this.editingStationId) {
      const st = this.state.stations.find(s => s.id === this.editingStationId);
      if (st) {
        st.name = name;
        st.operator = operator;
      }
    } else {
      const newSt = {
        id: `st_${Date.now()}`,
        name: name,
        operator: operator,
        tasks: []
      };
      this.state.stations.push(newSt);
    }

    this.closeModal('station-modal');
    this.refresh();
  }

  deleteStation(stationId) {
    const st = this.state.stations.find(s => s.id === stationId);
    if (!st) return;

    if (st.tasks.length > 0) {
      if (!confirm(`La estación '${st.name}' contiene ${st.tasks.length} paso(s) de ensamble. ¿Eliminarla junto con sus tareas?`)) {
        return;
      }
    } else if (!confirm(`¿Eliminar la estación '${st.name}'?`)) {
      return;
    }

    this.state.stations = this.state.stations.filter(s => s.id !== stationId);
    this.refresh();
  }

  openTaktModal() {
    document.getElementById('takt-modal-value').value = this.state.taktTime || 180;
    document.getElementById('takt-modal').classList.remove('hidden');
  }

  saveTaktModal() {
    const val = parseFloat(document.getElementById('takt-modal-value').value) || 180;
    if (val <= 0) {
      alert("El Tiempo Takt debe ser mayor a 0 segundos.");
      return;
    }
    this.state.taktTime = val;
    this.closeModal('takt-modal');
    this.refresh();
  }

  calculateTaktFromDemand() {
    const operatingMinutes = parseFloat(document.getElementById('takt-calc-time').value) || 0;
    const demandUnits = parseFloat(document.getElementById('takt-calc-demand').value) || 0;

    if (operatingMinutes > 0 && demandUnits > 0) {
      const availableSeconds = operatingMinutes * 60;
      const calculatedTakt = Math.round(availableSeconds / demandUnits);
      document.getElementById('takt-modal-value').value = calculatedTakt;
    } else {
      alert("Por favor ingresa minutos operativos del turno y demanda requerida de servidores.");
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  renderTableView() {
    const tbody = document.getElementById('table-view-tbody');
    if (!tbody) return;

    let html = '';
    let counter = 1;

    const query = (this.tableSearchQuery || '').toLowerCase();
    const filterCat = this.tableCategoryFilter || 'ALL';

    this.state.stations.forEach(st => {
      st.tasks.forEach(t => {
        if (filterCat !== 'ALL' && t.category !== filterCat) return;

        if (query) {
          const matchName = t.name.toLowerCase().includes(query);
          const matchSt = st.name.toLowerCase().includes(query);
          const matchOp = (st.operator || '').toLowerCase().includes(query);
          const matchNotes = (t.notes || '').toLowerCase().includes(query);
          if (!matchName && !matchSt && !matchOp && !matchNotes) return;
        }

        let catBadge = '';
        if (t.category === 'VA') catBadge = '<span class="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🟩 VA (Valor Agregado)</span>';
        else if (t.category === 'NVA') catBadge = '<span class="px-2 py-0.5 rounded text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">🟨 NVA (Necesario)</span>';
        else catBadge = '<span class="px-2 py-0.5 rounded text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">🟥 Muda (Desperdicio)</span>';

        html += `
          <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
            <td class="px-4 py-3 text-xs font-mono text-slate-400">${counter++}</td>
            <td class="px-4 py-3 text-xs font-semibold text-slate-200">${st.name}</td>
            <td class="px-4 py-3 text-xs text-slate-400">${st.operator || '-'}</td>
            <td class="px-4 py-3 text-xs font-bold text-slate-100">${t.name}</td>
            <td class="px-4 py-3 text-xs font-mono font-bold text-indigo-300">${t.duration} seg</td>
            <td class="px-4 py-3 text-xs">${catBadge}</td>
            <td class="px-4 py-3 text-xs text-slate-400 max-w-xs truncate" title="${t.notes || ''}">${t.notes || '-'}</td>
            <td class="px-4 py-3 text-xs text-right space-x-2">
              <button onclick="app.openTaskModal('${t.id}', '${st.id}')" class="text-indigo-400 hover:text-indigo-300 font-medium">Editar</button>
              <button onclick="app.deleteTask('${t.id}', '${st.id}')" class="text-rose-400 hover:text-rose-300 font-medium">Eliminar</button>
            </td>
          </tr>
        `;
      });
    });

    tbody.innerHTML = html || `<tr><td colspan="8" class="text-center py-8 text-slate-500">No se encontraron tareas coincidentes.</td></tr>`;
  }

  renderAnalyticsView() {
    const container = document.getElementById('analytics-view-container');
    if (!container) return;

    const m = this.metrics;
    const kaizenMetrics = MetricsCalculator.calculate(this.state, { kaizenMode: true });

    let html = `
      <div class="space-y-6">

        <!-- Grid Principal de Tarjetas KPI Industriales -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="glass-card p-6 rounded-2xl">
            <h3 class="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
              <span>📊 Clasificación de Tiempo Lean (Hardware)</span>
            </h3>
            
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-emerald-400">🟩 Valor Agregado (VA)</span>
                  <span>${m.totalVA}s (${m.vaPercent.toFixed(1)}%)</span>
                </div>
                <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500" style="width: ${m.vaPercent}%;"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-amber-400">🟨 Sin Valor Agregado (NVA)</span>
                  <span>${m.totalNVA}s (${m.nvaPercent.toFixed(1)}%)</span>
                </div>
                <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500" style="width: ${m.nvaPercent}%;"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-rose-400">🟥 Desperdicio / Muda</span>
                  <span>${m.totalMuda}s (${m.mudaPercent.toFixed(1)}%)</span>
                </div>
                <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-rose-500" style="width: ${m.mudaPercent}%;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card p-6 rounded-2xl">
            <h3 class="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
              <span>⚖️ Eficiencia y Balanceo de Línea</span>
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-slate-700/60 text-xs">
                <span class="text-slate-400">Line Balance Efficiency:</span>
                <span class="font-bold text-indigo-300 text-sm">${m.lineBalanceEfficiency.toFixed(1)}%</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-700/60 text-xs">
                <span class="text-slate-400">Balance Delay (% Inactividad):</span>
                <span class="font-bold text-amber-300 text-sm">${m.balanceDelay.toFixed(1)}%</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-700/60 text-xs">
                <span class="text-slate-400">Índice de Suavidad (Smoothness):</span>
                <span class="font-bold text-slate-200 text-sm">${m.smoothnessIndex.toFixed(1)}</span>
              </div>
              <div class="flex justify-between items-center py-2 text-xs">
                <span class="text-slate-400">Estaciones Sobrecargadas:</span>
                <span class="font-bold ${m.overburdenedCount > 0 ? 'text-rose-400' : 'text-emerald-400'} text-sm">
                  ${m.overburdenedCount} de ${m.numStations}
                </span>
              </div>
            </div>
          </div>

          <div class="glass-card p-6 rounded-2xl">
            <h3 class="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
              <span>⚡ Impacto Kaizen Potencial (0 Muda)</span>
            </h3>
            
            <div class="space-y-3 text-xs">
              <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1.5">
                <div class="flex justify-between font-semibold">
                  <span class="text-slate-400">Eficiencia Actual:</span>
                  <span class="text-slate-200">${m.lineBalanceEfficiency.toFixed(1)}%</span>
                </div>
                <div class="flex justify-between font-bold">
                  <span class="text-amber-400">Eficiencia Kaizen Potencial:</span>
                  <span class="text-emerald-400">${kaizenMetrics.lineBalanceEfficiency.toFixed(1)}%</span>
                </div>
              </div>

              <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1.5">
                <div class="flex justify-between font-semibold">
                  <span class="text-slate-400">Máx. Tiempo Ciclo Actual:</span>
                  <span class="text-slate-200">${m.maxCycleTime}s</span>
                </div>
                <div class="flex justify-between font-bold">
                  <span class="text-amber-400">Máx. Ciclo tras Kaizen:</span>
                  <span class="text-indigo-300">${kaizenMetrics.maxCycleTime}s</span>
                </div>
              </div>

              <p class="text-[11px] text-slate-400">
                💡 Al eliminar demoras de kitting ESD, retrabajos de pasta térmica y desorden de herramientas, la línea ahorra <strong>${m.totalMuda} segundos por servidor</strong>.
              </p>
            </div>
          </div>

        </div>

        <div class="glass-card p-6 rounded-2xl space-y-4">
          <h3 class="text-sm font-bold text-slate-200">Diagnóstico Detallado de Carga por Estación ESD</h3>
          
          <div class="overflow-x-auto rounded-xl border border-slate-800">
            <table class="w-full text-left">
              <thead class="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th class="px-4 py-3">Estación</th>
                  <th class="px-4 py-3">Operador ESD</th>
                  <th class="px-4 py-3 text-emerald-400">Tiempo VA</th>
                  <th class="px-4 py-3 text-amber-400">Tiempo NVA</th>
                  <th class="px-4 py-3 text-rose-400">Tiempo Muda</th>
                  <th class="px-4 py-3">Ciclo Total</th>
                  <th class="px-4 py-3">Vs Takt Time (${m.taktTime}s)</th>
                  <th class="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-xs">
                ${m.stationMetrics.map(st => {
                  const taktDelta = st.totalTime - m.taktTime;
                  return `
                    <tr class="hover:bg-slate-800/30">
                      <td class="px-4 py-3 font-bold text-slate-200">${st.name}</td>
                      <td class="px-4 py-3 text-slate-400">${st.operator || '-'}</td>
                      <td class="px-4 py-3 font-mono text-emerald-400">${st.va}s</td>
                      <td class="px-4 py-3 font-mono text-amber-400">${st.nva}s</td>
                      <td class="px-4 py-3 font-mono text-rose-400">${st.muda}s</td>
                      <td class="px-4 py-3 font-mono font-bold text-slate-100">${st.totalTime}s</td>
                      <td class="px-4 py-3 font-mono ${taktDelta > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}">
                        ${taktDelta > 0 ? `+${taktDelta}s (Sobrecarga)` : `${taktDelta}s (Holgura)`}
                      </td>
                      <td class="px-4 py-3">
                        ${st.isOverburdened ? `
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">⚠️ Sobrecargado</span>
                        ` : `
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">✅ Conforme Takt</span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    container.innerHTML = html;
  }

  exportJSON() {
    DataStore.exportJSON(this.state);
  }

  exportCSV() {
    DataStore.exportCSV(this.state);
  }

  openImportModal() {
    document.getElementById('import-modal').classList.remove('hidden');
  }

  processImport() {
    const fileInput = document.getElementById('import-file-input');
    const textInput = document.getElementById('import-text-input').value.trim();

    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          if (file.name.endsWith('.json')) {
            const data = JSON.parse(content);
            this.state = data;
          } else {
            this.state = DataStore.parseCSV(content);
          }
          this.closeModal('import-modal');
          this.refresh();
          alert("¡Datos de línea de servidores importados con éxito!");
        } catch (err) {
          alert("Error al importar archivo: " + err.message);
        }
      };
      reader.readAsText(file);
    } else if (textInput) {
      try {
        if (textInput.startsWith('{')) {
          this.state = JSON.parse(textInput);
        } else {
          this.state = DataStore.parseCSV(textInput);
        }
        this.closeModal('import-modal');
        this.refresh();
        alert("¡Datos de línea de servidores importados con éxito!");
      } catch (err) {
        alert("Error al procesar el texto: " + err.message);
      }
    } else {
      alert("Por favor selecciona un archivo o pega el contenido CSV/JSON.");
    }
  }

  triggerPrint() {
    window.print();
  }

  bindGlobalEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ['task-modal', 'station-modal', 'takt-modal', 'import-modal'].forEach(m => this.closeModal(m));
      }
    });
  }
}

// Instancia global de la aplicación
const app = new YamazumiApp();

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
