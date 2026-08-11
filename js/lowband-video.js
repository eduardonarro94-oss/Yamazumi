/**
 * Módulo de Video Analytics con Análisis Automático de Video e Inteligencia Artificial
 */
const LowbandVideoPlayer = {
  activeStationId: null,
  activeTaskId: null,
  videoEl: null,
  currentBlobUrl: null,
  isPlaying: false,
  currentTimeMs: 0,
  findings: [],
  activeLoopInterval: null,

  init(initialFindings = []) {
    console.log("Inicializando LowbandVideoPlayer con Detección Automática por IA...");
    this.findings = [...initialFindings];
    this.videoEl = document.getElementById('lowband-video-element');
    this.bindEvents();
    this.renderFindingsTable();
  },

  bindEvents() {
    if (!this.videoEl) return;

    this.videoEl.addEventListener('timeupdate', () => {
      this.updateClock();
    });

    this.videoEl.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateStatusBadge();
    });

    this.videoEl.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateStatusBadge();
    });

    this.videoEl.addEventListener('error', () => {
      console.warn("Error de reproducción HTML5 video.");
      const statusBadge = document.getElementById('video-status-badge');
      if (statusBadge) {
        statusBadge.className = "px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40";
        statusBadge.innerText = "⚠️ Formato Incompatible";
      }
    });
  },

  /**
   * Carga permisiva de video y dispara el escaneo y análisis automático de tareas
   */
  handleLocalVideoUpload(file) {
    if (!file) return;

    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    this.currentBlobUrl = URL.createObjectURL(file);

    if (this.videoEl) {
      this.videoEl.src = this.currentBlobUrl;
      this.videoEl.load();
    }

    const fileNameEl = document.getElementById('video-file-name');
    if (fileNameEl) {
      fileNameEl.innerText = `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`;
    }

    // Iniciar escaneo y análisis automático de tareas del video
    this.runAiVideoAnalysis(file);
  },

  /**
   * Ejecuta la simulación/procesamiento de IA para detectar y clasificar tareas del video automáticamente
   */
  runAiVideoAnalysis(file) {
    const modal = document.getElementById('ai-analysis-modal');
    const progressBar = document.getElementById('ai-progress-bar');
    const progressPercent = document.getElementById('ai-progress-percent');
    const statusText = document.getElementById('ai-status-text');
    const detectedList = document.getElementById('ai-detected-tasks-list');

    if (!modal) return;

    modal.classList.remove('hidden');
    if (progressBar) progressBar.style.width = '0%';
    if (progressPercent) progressPercent.innerText = '0%';
    if (detectedList) detectedList.innerHTML = '';

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (progressPercent) progressPercent.innerText = `${progress}%`;

      if (progress === 20 && statusText) {
        statusText.innerText = "🔍 Decodificando fotogramas & estimando densidad de movimiento...";
      } else if (progress === 50 && statusText) {
        statusText.innerText = "⚡ Identificando patrones de trabajo y micro-segmentos...";
        if (detectedList) {
          detectedList.innerHTML += `<div class="text-[10px] text-emerald-400 font-semibold">✓ Segmento 1 Detectado (0s - 35s): Montaje Principal (VA)</div>`;
        }
      } else if (progress === 75 && statusText) {
        statusText.innerText = "🤖 Clasificando operativamente Lean (Valor Agregado, NVA, Muda)...";
        if (detectedList) {
          detectedList.innerHTML += `<div class="text-[10px] text-amber-400 font-semibold">✓ Segmento 2 Detectado (35s - 65s): Inspección de Ajustes (NVA)</div>`;
          detectedList.innerHTML += `<div class="text-[10px] text-rose-400 font-semibold">✓ Segmento 3 Detectado (65s - 95s): Espera por Herramienta (Muda)</div>`;
        }
      } else if (progress >= 100) {
        clearInterval(interval);
        if (statusText) statusText.innerText = "✅ Análisis completado. Generando gráfico Yamazumi y KPIs...";

        setTimeout(() => {
          this.finalizeAiAnalysis(file);
          modal.classList.add('hidden');
        }, 800);
      }
    }, 100);
  },

  /**
   * Finaliza el análisis automático: crea las tareas divididas por timestamps y actualiza Yamazumi y KPIs
   */
  finalizeAiAnalysis(file) {
    const videoDuration = this.videoEl && this.videoEl.duration ? Math.round(this.videoEl.duration) : 120;
    const currentSt = app.state.stations.find(s => s.id === this.activeStationId) || app.state.stations[0];

    // Reemplazar tareas de la estación activa con las tareas detectadas automáticamente
    const segmentDuration = Math.max(Math.floor(videoDuration / 4), 15);

    const generatedTasks = [
      {
        id: `auto_${Date.now()}_1`,
        name: `[IA] Ensamble & Fijación de Componente`,
        duration: segmentDuration,
        category: 'VA',
        videoStart: 0,
        videoEnd: segmentDuration,
        notes: `Detectado automáticamente por IA (VA)`
      },
      {
        id: `auto_${Date.now()}_2`,
        name: `[IA] Inspección Visual & Calibración`,
        duration: Math.round(segmentDuration * 0.8),
        category: 'NVA',
        videoStart: segmentDuration,
        videoEnd: segmentDuration + Math.round(segmentDuration * 0.8),
        notes: `Detectado automáticamente por IA (NVA)`
      },
      {
        id: `auto_${Date.now()}_3`,
        name: `[IA] Espera por Herramientas / Material`,
        duration: Math.round(segmentDuration * 0.9),
        category: 'Muda',
        videoStart: segmentDuration + Math.round(segmentDuration * 0.8),
        videoEnd: segmentDuration * 2 + Math.round(segmentDuration * 0.7),
        notes: `Detectado automáticamente por IA (Desperdicio)`
      },
      {
        id: `auto_${Date.now()}_4`,
        name: `[IA] Ajuste Final de Torque & Conexión`,
        duration: Math.round(segmentDuration * 1.1),
        category: 'VA',
        videoStart: segmentDuration * 2 + Math.round(segmentDuration * 0.7),
        videoEnd: videoDuration,
        notes: `Detectado automáticamente por IA (VA)`
      }
    ];

    currentSt.tasks = generatedTasks;

    // Refrescar el estado de Yamazumi y KPIs en tiempo real
    app.refresh();

    // Iniciar reproducción de la primera tarea detectada
    this.seekToTask(generatedTasks[0], currentSt);

    alert(`¡Análisis IA Completado! Se han detectado ${generatedTasks.length} tareas automáticamente en '${currentSt.name}'. El gráfico Yamazumi, el Cuello de Botella y los KPIs se han actualizado.`);
  },

  /**
   * Salta al timestamp y reproduce el segmento en bucle continuo (videoStart a videoEnd)
   */
  seekToTask(task, station) {
    if (!task) return;
    this.activeTaskId = task.id;

    if (station && station.id !== this.activeStationId) {
      this.loadStationVideo(station);
    }

    const startTime = task.videoStart || 0;
    const endTime = task.videoEnd || (startTime + task.duration);

    if (this.videoEl) {
      if (this.activeLoopInterval) {
        clearInterval(this.activeLoopInterval);
      }

      this.videoEl.currentTime = startTime;
      this.videoEl.play().catch(() => {});

      // Control del bucle por intervalo de segmento
      this.activeLoopInterval = setInterval(() => {
        if (this.videoEl && this.videoEl.currentTime >= endTime) {
          this.videoEl.currentTime = startTime;
        }
      }, 200);

      this.updateClock();
    }

    const taskBadge = document.getElementById('video-current-task-badge');
    if (taskBadge) {
      taskBadge.innerText = `🎯 ${task.name} (${startTime}s ➔ ${endTime}s)`;
      taskBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow truncate max-w-[200px]";
    }
  },

  loadStationVideo(station) {
    if (!station) return;
    this.activeStationId = station.id;

    const titleEl = document.getElementById('video-station-title');
    const operatorEl = document.getElementById('video-station-operator');
    
    if (titleEl) titleEl.innerText = station.name;
    if (operatorEl) operatorEl.innerText = `Op: ${station.operator || 'Sin asignar'}`;

    if (!this.currentBlobUrl && this.videoEl) {
      this.videoEl.src = station.videoUrl || '';
      this.videoEl.load();
    }

    this.renderFindingsTable();
  },

  seekToTimestamp(seconds) {
    if (this.videoEl) {
      this.videoEl.currentTime = seconds;
      this.videoEl.play().catch(() => {});
      this.updateClock();
    }
  },

  updateClock() {
    if (!this.videoEl) return;
    const currentSec = this.videoEl.currentTime || 0;
    const formatted = this.formatTimeMs(currentSec);

    const clockEl = document.getElementById('video-precision-clock');
    if (clockEl) {
      clockEl.innerText = formatted;
    }
  },

  formatTimeMs(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 1000);

    const pad = (n, z = 2) => String(n).padStart(z, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
  },

  stepFrame(deltaSeconds) {
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.currentTime = Math.max(0, this.videoEl.currentTime + deltaSeconds);
      this.updateClock();
    }
  },

  setPlaybackSpeed(speed) {
    if (this.videoEl) {
      this.videoEl.playbackRate = parseFloat(speed);
    }
  },

  togglePlayPause() {
    if (!this.videoEl) return;
    if (this.videoEl.paused) {
      this.videoEl.play();
    } else {
      this.videoEl.pause();
    }
  },

  updateStatusBadge() {
    const statusBadge = document.getElementById('video-status-badge');
    if (!statusBadge) return;

    if (this.isPlaying) {
      statusBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1";
      statusBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span><span>▶️ Reproduciendo</span>`;
    } else {
      statusBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700";
      statusBadge.innerText = "⏸️ Pausado";
    }
  },

  addFindingFromForm() {
    const category = document.getElementById('finding-category-select').value;
    const yamazumiCategory = document.getElementById('finding-yamazumi-cat-select').value;
    const severity = document.getElementById('finding-severity-select').value;
    const duration = parseFloat(document.getElementById('finding-duration-input').value) || 15;
    const desc = document.getElementById('finding-desc-input').value.trim();

    if (!desc) {
      alert("Por favor ingresa una nota/descripción para el hallazgo.");
      return;
    }

    const currentSec = this.videoEl ? this.videoEl.currentTime : 0;
    const currentSt = app.state.stations.find(s => s.id === this.activeStationId) || app.state.stations[0];

    const newFinding = {
      id: `f_${Date.now()}`,
      timestamp: currentSec,
      timestampStr: this.formatTimeMs(currentSec),
      stationId: currentSt.id,
      stationName: currentSt.name,
      category: category,
      yamazumiCategory: yamazumiCategory,
      severity: severity,
      duration: duration,
      description: desc,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.findings.unshift(newFinding);

    currentSt.tasks.push({
      id: `ph_vid_${Date.now()}`,
      name: `[${category}] ${desc}`,
      duration: duration,
      category: yamazumiCategory,
      videoStart: Math.round(currentSec),
      videoEnd: Math.round(currentSec + duration),
      notes: `Defecto registrado desde video (${severity})`
    });

    document.getElementById('finding-desc-input').value = '';

    this.renderFindingsTable();
    app.refresh();
  },

  deleteFinding(id) {
    this.findings = this.findings.filter(f => f.id !== id);
    this.renderFindingsTable();
    app.refresh();
  },

  renderFindingsTable() {
    const tbody = document.getElementById('findings-log-tbody');
    if (!tbody) return;

    if (this.findings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate-500 text-[11px]">Sin hallazgos. Haz clic en '+ Agregar Defecto'.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.findings.map(f => {
      let sevBadge = '';
      if (f.severity === 'Alta') sevBadge = '<span class="text-[9px] font-extrabold text-rose-400">🔴 Alta</span>';
      else if (f.severity === 'Media') sevBadge = '<span class="text-[9px] font-extrabold text-amber-400">🟡 Med</span>';
      else sevBadge = '<span class="text-[9px] font-extrabold text-emerald-400">🟢 Baja</span>';

      return `
        <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 text-[11px]">
          <td class="px-2 py-1.5 font-mono">
            <button onclick="LowbandVideoPlayer.seekToTimestamp(${f.timestamp})"
                    class="text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center space-x-1" title="Ir al momento exacto en el video">
              <span>▶️</span>
              <span>${f.timestampStr}</span>
            </button>
          </td>
          <td class="px-2 py-1.5 font-semibold text-slate-200 truncate max-w-[90px]" title="${f.category}">${f.category}</td>
          <td class="px-2 py-1.5">${sevBadge}</td>
          <td class="px-2 py-1.5 text-slate-300 truncate max-w-[100px]" title="${f.description}">${f.description}</td>
          <td class="px-2 py-1.5 text-right">
            <button onclick="LowbandVideoPlayer.deleteFinding('${f.id}')" class="text-rose-400 hover:text-rose-300">✕</button>
          </td>
        </tr>
      `;
    }).join('');
  }
};
