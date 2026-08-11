/**
 * Motor de Renderizado del Gráfico Yamazumi con Integración de Video Analytics Philo
 * Padding superior pt-10 / pt-8 agregado para dar respiro al badge de Cuello de Botella
 */
const YamazumiChart = {
  activeTaskId: null,

  /**
   * Renderiza el gráfico Yamazumi dentro del contenedor especificado
   */
  render(stations = [], taktTime = 180) {
    const containerEl = document.getElementById('yamazumi-chart-container');
    if (!containerEl) return;

    taktTime = Number(taktTime) || 180;
    const metrics = MetricsEngine.calculateMetrics(stations, taktTime);
    const maxCycleTime = metrics.maxCycleTime || 0;

    const highestValue = Math.max(taktTime, maxCycleTime, 100);
    const maxYScale = Math.ceil((highestValue * 1.25) / 20) * 20;

    const chartHeightPx = 380;
    const pxPerSecond = chartHeightPx / maxYScale;
    const taktTimePxFromBottom = taktTime * pxPerSecond;

    let html = `
      <div class="relative w-full min-h-[460px] overflow-x-auto pb-4 pt-10 bg-slate-900/40 rounded-2xl border border-slate-700/60 backdrop-blur-md shadow-2xl">
        <!-- Barra de escala lateral Y & Contenedor Principal del Gráfico con Padding Superior pt-6 -->
        <div class="flex items-end min-w-max px-4 pt-8" style="height: ${chartHeightPx + 150}px; min-height: ${chartHeightPx + 150}px;">
          
          <!-- Eje Y (Escala de Tiempo en Segundos) -->
          <div class="flex flex-col justify-between pr-2.5 text-[11px] font-semibold text-slate-400 border-r border-slate-700/80 sticky left-0 bg-slate-900/90 z-20 shadow-md select-none" style="height: ${chartHeightPx}px; min-height: ${chartHeightPx}px; bottom: 55px;">
            ${this.renderYAxisTicks(maxYScale, chartHeightPx)}
          </div>

          <!-- Área de Columnas de Estaciones -->
          <div class="relative flex items-end space-x-3 pl-4 flex-1 min-h-[${chartHeightPx}px]" style="min-height: ${chartHeightPx}px;">
            
            <!-- Línea Horizontal de Takt Time -->
            <div class="absolute left-0 right-0 z-10 pointer-events-none transition-all duration-300 group" style="bottom: ${taktTimePxFromBottom + 55}px;">
              <div class="w-full border-b-2 border-dashed border-rose-500/90 shadow-[0_0_12px_rgba(244,63,94,0.4)]"></div>
              
              <!-- Badge de Takt Time -->
              <div class="absolute left-2 -top-3.5 pointer-events-auto bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center space-x-1 cursor-pointer hover:bg-rose-500 transition-colors"
                   title="Haz clic para modificar el Tiempo Takt Objetivo"
                   onclick="app.openTaktModal()">
                <span>⏱️ Takt: ${taktTime}s</span>
                <svg class="w-2.5 h-2.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </div>
            </div>

            <!-- Columnas por Estación (Limitadas a max-w-[160px]) -->
            ${stations.map((st, index) => this.renderStationColumn(st, index, metrics.stationMetrics[index], metrics, pxPerSecond, chartHeightPx, taktTime)).join('')}

            <!-- Botón Compacto para Agregar Nueva Estación -->
            <div class="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl transition-all p-2 cursor-pointer group hover:bg-indigo-500/5 select-none w-36 max-w-[150px]"
                 style="height: ${chartHeightPx}px; min-height: ${chartHeightPx}px; margin-bottom: 55px;"
                 onclick="app.openStationModal()">
              <div class="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center transition-all shadow-md mb-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              </div>
              <span class="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-300 text-center">Nueva Estación</span>
            </div>

          </div>
        </div>
      </div>
    `;

    containerEl.innerHTML = html;
    DragDropEngine.bindEvents(containerEl);
  },

  renderYAxisTicks(maxYScale, chartHeightPx) {
    const numTicks = 5;
    const step = maxYScale / numTicks;
    let ticksHtml = '';

    for (let i = numTicks; i >= 0; i--) {
      const val = Math.round(step * i);
      ticksHtml += `
        <div class="flex items-center space-x-1">
          <span>${val}s</span>
        </div>
      `;
    }
    return ticksHtml;
  },

  renderStationColumn(st, index, stMetrics, globalMetrics, pxPerSecond, chartHeightPx, taktTime) {
    const isOverburdened = stMetrics ? stMetrics.isOverburdened : false;
    const isBottleneck = globalMetrics.bottleneckStation && globalMetrics.bottleneckStation.id === st.id && globalMetrics.maxCycleTime > 0;
    const totalTime = stMetrics ? stMetrics.totalTime : st.tasks.reduce((a, b) => a + (b.duration || 0), 0);
    const overTaktDelta = stMetrics ? stMetrics.overTaktDelta : 0;
    
    const columnContainerClasses = isBottleneck 
      ? 'ring-2 ring-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.4)] bg-amber-500/10 rounded-xl p-1 -m-1' 
      : '';

    return `
      <div class="yamazumi-station-column relative flex flex-col items-center w-38 sm:w-40 max-w-[160px] group transition-all flex-shrink-0 ${columnContainerClasses}"
           data-station-id="${st.id}">
        
        <!-- Header de la Estación (Badge con Respiro Superior pt-1) -->
        <div class="mb-1.5 w-full flex flex-col items-center pt-1">
          ${isBottleneck ? `
            <span class="animate-pulse inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[9.5px] font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/40 mb-1.5 border border-yellow-300 tracking-tight">
              🔥 CUELLO BOTELLA
            </span>
          ` : isOverburdened ? `
            <span class="animate-bounce inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/50 mb-1.5">
              ⚠️ +${overTaktDelta}s
            </span>
          ` : ''}
          
          <div class="flex items-center justify-between w-full px-1.5 py-0.5 bg-slate-800/90 border border-slate-700/80 rounded-md shadow-xs cursor-pointer hover:border-indigo-400"
               onclick="app.selectStationForVideo('${st.id}')"
               title="Haz clic para cargar el video de esta estación">
            <span class="text-[11px] font-bold ${isBottleneck ? 'text-amber-300 font-black' : isOverburdened ? 'text-rose-400' : 'text-slate-200'}">
              ⏱️ ${totalTime}s
            </span>
            <span class="text-[9px] text-slate-400">
              ${st.tasks.length} task${st.tasks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <!-- Contenedor Visual de la Barra Apilada -->
        <div class="relative w-full bg-slate-950/70 border ${isBottleneck ? 'border-amber-400/80' : 'border-slate-800'} rounded-t-lg overflow-hidden flex flex-col-reverse shadow-inner transition-all hover:border-slate-600"
             style="height: ${chartHeightPx}px; min-height: ${chartHeightPx}px;">
          
          <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:14px_14px] opacity-20 pointer-events-none"></div>

          ${st.tasks.map((task, tIndex) => this.renderTaskBlock(task, tIndex, st, pxPerSecond)).join('')}

          ${st.tasks.length === 0 ? `
            <div class="h-full flex flex-col items-center justify-center p-2 text-slate-600 text-center">
              <span class="text-[10px]">Sin tareas</span>
            </div>
          ` : ''}
        </div>

        <!-- Pie de la Estación (Nombre del Puesto y Operador) -->
        <div class="w-full mt-2 p-2 bg-slate-800/90 border border-slate-700/80 rounded-b-lg flex flex-col justify-between shadow-md">
          <div class="flex items-start justify-between">
            <h4 class="text-[11px] font-bold ${isBottleneck ? 'text-amber-300' : 'text-slate-100'} truncate max-w-[110px]" title="${st.name}">
              ${st.name}
            </h4>
            
            <div class="flex items-center space-x-0.5 opacity-80 hover:opacity-100">
              <button onclick="app.openStationModal('${st.id}')" title="Editar Estación" class="text-slate-400 hover:text-indigo-400 p-0.5">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 113.536 3.536L12 20.243H8.5v-3.572L16.732 3.732z"/></svg>
              </button>
              <button onclick="app.deleteStation('${st.id}')" title="Eliminar Estación" class="text-slate-400 hover:text-rose-400 p-0.5">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>

          <div class="flex items-center space-x-1 mt-0.5 text-[10px] text-indigo-300/90 font-medium">
            <svg class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span class="truncate" title="Operador: ${st.operator || 'Sin asignar'}">${st.operator || 'Operador'}</span>
          </div>

          <button onclick="app.openTaskModal(null, '${st.id}')"
                  class="mt-1.5 w-full py-0.5 px-1.5 text-[10px] font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded border border-indigo-500/30 transition-all flex items-center justify-center space-x-1 shadow-xs">
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <span>+ Tarea</span>
          </button>
        </div>

      </div>
    `;
  },

  renderTaskBlock(task, index, station, pxPerSecond) {
    const blockHeightPx = Math.max(Math.round(task.duration * pxPerSecond), 22);
    const isSelected = this.activeTaskId === task.id;

    let bgClasses = '';
    let categoryBadge = '';
    const cat = (task.category || task.type || 'VA').toUpperCase();
    
    if (cat === 'VA') {
      bgClasses = 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/50 text-white shadow-emerald-900/40';
      categoryBadge = 'VA';
    } else if (cat === 'NVA') {
      bgClasses = 'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-300/50 text-amber-950 shadow-amber-900/40 font-semibold';
      categoryBadge = 'NVA';
    } else {
      bgClasses = 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-400/50 text-white shadow-rose-900/40';
      categoryBadge = 'MUDA';
    }

    const selectedRing = isSelected ? 'ring-2 ring-white scale-[1.02] z-10' : '';

    return `
      <div class="yamazumi-task-block relative w-full border-t border-b ${bgClasses} ${selectedRing} px-1.5 py-1 cursor-pointer transition-all duration-150 hover:brightness-110 hover:shadow-md flex items-center justify-between group/task overflow-hidden select-none"
           style="height: ${blockHeightPx}px;"
           data-task-id="${task.id}"
           data-station-id="${station.id}"
           onclick="app.handleTaskClicked('${task.id}', '${station.id}')"
           title="Clic para saltar al timestamp en video (${task.videoStart || task.timestamp || 0}s): ${task.name}">
        
        <div class="flex items-center space-x-1 overflow-hidden pr-1">
          <span class="text-[9px] text-white/80">▶</span>
          
          <div class="flex flex-col overflow-hidden leading-tight">
            <span class="text-[10px] font-bold truncate">
              ${task.name}
            </span>
            ${blockHeightPx > 28 ? `
              <span class="text-[8.5px] opacity-90 font-medium">
                ${task.duration}s (${categoryBadge})
              </span>
            ` : ''}
          </div>
        </div>

        <div class="flex items-center space-x-0.5 flex-shrink-0">
          <span class="text-[8.5px] font-extrabold px-1 py-0.2 rounded bg-black/20 backdrop-blur-xs">
            ${categoryBadge}
          </span>
          
          <div class="hidden group-hover/task:flex items-center space-x-0.5 bg-slate-900/90 rounded px-1 py-0.5 border border-slate-700 shadow-md">
            <button onclick="event.stopPropagation(); app.openTaskModal('${task.id}', '${station.id}')"
                    class="p-0.5 text-slate-300 hover:text-indigo-400" title="Editar">
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
            <button onclick="event.stopPropagation(); app.deleteTask('${task.id}', '${station.id}')"
                    class="p-0.5 text-slate-300 hover:text-rose-400" title="Eliminar">
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

      </div>
    `;
  }
};
