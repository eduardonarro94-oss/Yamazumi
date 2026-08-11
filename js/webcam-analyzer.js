/**
 * Módulo de Captura en Vivo con Webcam & Estudio de Tiempos en Real-Time
 */
const WebcamAnalyzer = {
  stream: null,
  mediaRecorder: null,
  isRecording: false,
  startTime: null,
  taskStartTime: null,
  timerInterval: null,
  recordedTasks: [],

  init() {
    console.log("Inicializando WebcamAnalyzer...");
  },

  /**
   * Enciende la cámara del usuario (navigator.mediaDevices.getUserMedia)
   */
  async startCamera(deviceId = null) {
    const videoEl = document.getElementById('webcam-preview');
    const statusEl = document.getElementById('webcam-status-badge');

    try {
      if (this.stream) {
        this.stopCamera();
      }

      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoEl) {
        videoEl.srcObject = this.stream;
        await videoEl.play();
      }

      if (statusEl) {
        statusEl.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5";
        statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span>📷 Cámara En Vivo</span>`;
      }

      // Enumerar dispositivos de cámara disponibles
      this.populateCameraDevices();

    } catch (err) {
      console.error("Error al acceder a la webcam:", err);
      if (statusEl) {
        statusEl.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40";
        statusEl.innerText = "❌ Error: Sin acceso a cámara";
      }
      alert("No se pudo acceder a la cámara. Por favor permite el acceso a la webcam en tu navegador.");
    }
  },

  /**
   * Detiene la transmisión de la cámara
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    const videoEl = document.getElementById('webcam-preview');
    if (videoEl) videoEl.srcObject = null;

    const statusEl = document.getElementById('webcam-status-badge');
    if (statusEl) {
      statusEl.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700";
      statusEl.innerText = "📷 Cámara Apagada";
    }
  },

  /**
   * Llena el selector con las cámaras encontradas
   */
  async populateCameraDevices() {
    const selectEl = document.getElementById('webcam-device-select');
    if (!selectEl) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      selectEl.innerHTML = videoDevices.map((d, i) => `
        <option value="${d.deviceId}">${d.label || `Cámara ${i + 1}`}</option>
      `).join('');
    } catch (e) {
      console.warn("No se pudieron enumerar las cámaras:", e);
    }
  },

  /**
   * 🔴 Iniciar Grabación / Iniciar Tiempo de Estación
   */
  startRecording() {
    if (!this.stream) {
      this.startCamera().then(() => this.executeStartRecording());
    } else {
      this.executeStartRecording();
    }
  },

  executeStartRecording() {
    this.isRecording = true;
    this.startTime = Date.now();
    this.taskStartTime = this.startTime;
    this.recordedTasks = [];

    // Actualizar UI
    document.getElementById('btn-webcam-start').classList.add('hidden');
    document.getElementById('btn-webcam-mark').classList.remove('hidden');
    document.getElementById('btn-webcam-stop').classList.remove('hidden');

    const statusEl = document.getElementById('webcam-status-badge');
    if (statusEl) {
      statusEl.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse flex items-center space-x-1.5 shadow-lg shadow-rose-500/40";
      statusEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span><span>🔴 GRABANDO ESTACIÓN</span>`;
    }

    // Cronómetro en vivo
    this.timerInterval = setInterval(() => {
      this.updateLiveTimers();
    }, 100);

    this.renderLiveTasksTable();
  },

  /**
   * Actualiza los visores de tiempo en pantalla
   */
  updateLiveTimers() {
    if (!this.isRecording) return;

    const now = Date.now();
    const totalElapsedSec = ((now - this.startTime) / 1000).toFixed(1);
    const taskElapsedSec = ((now - (this.taskStartTime || now)) / 1000).toFixed(1);

    const totalTimerEl = document.getElementById('webcam-timer-total');
    const taskTimerEl = document.getElementById('webcam-timer-task');

    if (totalTimerEl) totalTimerEl.innerText = `${totalElapsedSec}s`;
    if (taskTimerEl) taskTimerEl.innerText = `${taskElapsedSec}s`;
  },

  /**
   * ⏱️ Marcar / Guardar Tarea Actual en Vivo
   */
  markTask() {
    if (!this.isRecording) return;

    const now = Date.now();
    const duration = Math.max(Math.round((now - this.taskStartTime) / 1000), 1);

    const nameInput = document.getElementById('webcam-task-name');
    const categoryInput = document.getElementById('webcam-task-category');
    const notesInput = document.getElementById('webcam-task-notes');

    const name = nameInput.value.trim() || `Tarea ${this.recordedTasks.length + 1}`;
    const category = categoryInput.value;
    const notes = notesInput ? notesInput.value.trim() : '';

    const newTask = {
      id: `t_live_${Date.now()}_${Math.random().toString(36).substr(2,3)}`,
      name: name,
      duration: duration,
      category: category,
      notes: notes,
      timestamp: new Date().toLocaleTimeString()
    };

    this.recordedTasks.push(newTask);

    // Resetear inicio de la siguiente tarea
    this.taskStartTime = now;

    // Limpiar input de nombre para la siguiente tarea
    nameInput.value = '';
    if (notesInput) notesInput.value = '';

    // Actualizar tabla de tareas capturadas en vivo
    this.renderLiveTasksTable();
  },

  /**
   * ⏹️ Detener y Analizar: Envía las tareas capturadas al Gráfico Yamazumi
   */
  stopAndAnalyze() {
    if (!this.isRecording) return;

    // Si había una tarea en curso no marcada, ofrecer registrarla
    const now = Date.now();
    const currentTaskSec = Math.round((now - this.taskStartTime) / 1000);
    
    if (currentTaskSec >= 2) {
      const nameInput = document.getElementById('webcam-task-name');
      const categoryInput = document.getElementById('webcam-task-category');
      const name = nameInput.value.trim() || `Tarea ${this.recordedTasks.length + 1}`;
      
      this.recordedTasks.push({
        id: `t_live_${Date.now()}`,
        name: name,
        duration: currentTaskSec,
        category: categoryInput.value,
        notes: "Finalizada al detener ciclo",
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Detener temporizadores y resetear estado de grabación
    this.isRecording = false;
    clearInterval(this.timerInterval);

    document.getElementById('btn-webcam-start').classList.remove('hidden');
    document.getElementById('btn-webcam-mark').classList.add('hidden');
    document.getElementById('btn-webcam-stop').classList.add('hidden');

    const statusEl = document.getElementById('webcam-status-badge');
    if (statusEl) {
      statusEl.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
      statusEl.innerHTML = `<span>✅ Grabación Finalizada (${this.recordedTasks.length} tareas)</span>`;
    }

    // Transferir automáticamente las tareas grabadas a la estación seleccionada en app.state
    const targetStationId = document.getElementById('webcam-target-station').value;
    const targetSt = app.state.stations.find(s => s.id === targetStationId);

    if (targetSt && this.recordedTasks.length > 0) {
      this.recordedTasks.forEach(t => {
        targetSt.tasks.push({
          id: t.id,
          name: t.name,
          duration: t.duration,
          category: t.category,
          notes: t.notes
        });
      });

      // Refrescar estado global de Yamazumi y cambiar a la pestaña de gráfico
      app.refresh();
      app.switchTab('chart');

      alert(`¡Éxito! Se transfirieron ${this.recordedTasks.length} tareas grabadas en vivo a '${targetSt.name}'. El gráfico Yamazumi y el Cuello de Botella se han actualizado automáticamente.`);
    } else {
      alert("No se registraron tareas durante la sesión o no se encontró la estación.");
    }
  },

  /**
   * Elimina una tarea capturada de la lista temporal
   */
  removeLiveTask(index) {
    this.recordedTasks.splice(index, 1);
    this.renderLiveTasksTable();
  },

  /**
   * Renderiza la tabla temporal de tareas capturadas en vivo
   */
  renderLiveTasksTable() {
    const tbody = document.getElementById('webcam-tasks-tbody');
    if (!tbody) return;

    if (this.recordedTasks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-500 text-xs">No hay tareas registradas aún. Haz clic en '🔴 Iniciar Grabación' y luego '⏱️ Marcar Tarea'.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.recordedTasks.map((t, idx) => {
      let badge = '';
      if (t.category === 'VA') badge = '<span class="text-[10px] font-bold text-emerald-400">🟩 VA</span>';
      else if (t.category === 'NVA') badge = '<span class="text-[10px] font-bold text-amber-400">🟨 NVA</span>';
      else badge = '<span class="text-[10px] font-bold text-rose-400">🟥 Muda</span>';

      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 text-xs">
          <td class="px-3 py-2 font-mono text-slate-400">${idx + 1}</td>
          <td class="px-3 py-2 font-bold text-slate-100">${t.name}</td>
          <td class="px-3 py-2 font-mono font-bold text-indigo-300">${t.duration}s</td>
          <td class="px-3 py-2">${badge}</td>
          <td class="px-3 py-2 text-right">
            <button onclick="WebcamAnalyzer.removeLiveTask(${idx})" class="text-rose-400 hover:text-rose-300">✕</button>
          </td>
        </tr>
      `;
    }).join('');
  }
};
