/**
 * Aplicación SPA Principal (Yamazumi Studio & Video Analytics)
 * Controlador global para gestión de estado, renderizado de gráficos, IA Kaizen Engine y Action Tracker
 */
const app = {
  state: {
    preset: 'google_philo',
    taktTime: 180,
    stations: [],
    currentTab: 'dashboard',
    kaizenProposals: [],
    actionTracker: []
  },

  editingTaskRef: null,
  editingStationId: null,

  init() {
    console.log("Inicializando Yamazumi Studio App con conjunto de datos exacto INITIAL_STATIONS...");
    this.loadInitialData();
    this.bindEvents();
    this.refresh();
  },

  loadInitialData() {
    const initial = PHILO_DATA.getInitialState();
    this.state.taktTime = initial.taktTime || 180;
    this.state.stations = JSON.parse(JSON.stringify(initial.stations));
    DataStore.saveState(this.state);

    this.state.kaizenProposals = DataStore.loadKaizenProposals() || [];
    
    // Si no hay propuestas previas, generar automáticamente con IA al inicio
    if (this.state.kaizenProposals.length === 0) {
      this.generateAiKaizenProposalsSilently();
    }

    this.state.actionTracker = DataStore.loadActionTracker() || [
      {
        id: 'at_1',
        technician: 'Ing. David Miller',
        stationId: 'ST-03',
        stationName: 'ST-03: Discos & Escaneo (Cuello de Botella)',
        actionText: 'Eliminar atasco en bahía 14 y ajustar calibre de guía de discos.',
        dueDate: '2026-08-10',
        status: 'En Proceso'
      },
      {
        id: 'at_2',
        technician: 'Téc. Sarah Chen',
        stationId: 'ST-02',
        stationName: 'ST-02: Deflector & Fuentes',
        actionText: 'Instalar dispensador ergonómico para fijación de deflectores de aire.',
        dueDate: '2026-08-08',
        status: 'Completado'
      }
    ];

    LowbandVideoPlayer.init(INITIAL_FINDINGS || []);

    if (this.state.stations.length > 0) {
      LowbandVideoPlayer.loadStationVideo(this.state.stations[0]);
    }
  },

  bindEvents() {
    window.addEventListener('resize', () => {
      YamazumiChart.render(this.state.stations, this.state.taktTime);
    });
  },

  switchTab(tabName) {
    this.state.currentTab = tabName;

    const views = ['dashboard', 'table', 'analytics'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      const btn = document.getElementById(`tab-btn-${v}`);
      if (el) el.classList.toggle('hidden', v !== tabName);
      if (btn) {
        if (v === tabName) {
          btn.className = "px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-md flex items-center space-x-1 transition-all";
        } else {
          btn.className = "px-3 py-1 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center space-x-1 transition-all";
        }
      }
    });

    if (tabName === 'dashboard') {
      YamazumiChart.render(this.state.stations, this.state.taktTime);
    } else if (tabName === 'table') {
      this.renderTableView();
    } else if (tabName === 'analytics') {
      this.renderAnalyticsView();
    }
  },

  refresh() {
    DataStore.saveState(this.state);
    DataStore.saveKaizenProposals(this.state.kaizenProposals);
    DataStore.saveActionTracker(this.state.actionTracker);

    const metrics = MetricsEngine.calculateMetrics(this.state.stations, this.state.taktTime);
    this.updateKPIs(metrics);

    if (this.state.currentTab === 'dashboard') {
      YamazumiChart.render(this.state.stations, this.state.taktTime);
    } else if (this.state.currentTab === 'table') {
      this.renderTableView();
    } else if (this.state.currentTab === 'analytics') {
      this.renderAnalyticsView();
    }
  },

  updateKPIs(metrics) {
    const taktEl = document.getElementById('kpi-takt-time');
    if (taktEl) taktEl.innerText = `${metrics.taktTime}s`;

    const bottleneckEl = document.getElementById('kpi-bottleneck');
    const bottleneckNameEl = document.getElementById('kpi-bottleneck-name');
    const bottleneckCard = document.getElementById('kpi-bottleneck-card');

    if (bottleneckEl) bottleneckEl.innerText = `${metrics.bottleneckStation ? metrics.bottleneckStation.totalTime : 0}s`;
    if (bottleneckNameEl) bottleneckNameEl.innerText = metrics.bottleneckStation ? metrics.bottleneckStation.name : 'N/A';

    if (bottleneckCard) {
      if (metrics.bottleneckStation && metrics.bottleneckStation.totalTime > metrics.taktTime) {
        bottleneckCard.className = "glass-card p-2.5 rounded-xl flex flex-col justify-between border-2 border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all";
      } else {
        bottleneckCard.className = "glass-card p-2.5 rounded-xl flex flex-col justify-between hover:border-slate-600 transition-all";
      }
    }

    const effEl = document.getElementById('kpi-efficiency');
    if (effEl) effEl.innerText = `${metrics.lineBalanceEfficiency.toFixed(1)}%`;

    const workEl = document.getElementById('kpi-work-content');
    if (workEl) workEl.innerText = `${metrics.totalWorkContent}s`;

    const countEl = document.getElementById('kpi-stations-count');
    if (countEl) countEl.innerText = metrics.stationsCount;

    const mudaEl = document.getElementById('kpi-muda-percent');
    if (mudaEl) mudaEl.innerText = `${metrics.totalMuda}s (${metrics.mudaPercent.toFixed(1)}%)`;

    const findingsCountEl = document.getElementById('kpi-findings-count');
    if (findingsCountEl) findingsCountEl.innerText = LowbandVideoPlayer.findings.length;
  },

  resetDefaultData() {
    console.log("Restableciendo datos de prueba INITIAL_STATIONS...");
    const initial = PHILO_DATA.getInitialState();
    this.state.taktTime = initial.taktTime;
    this.state.stations = JSON.parse(JSON.stringify(initial.stations));
    DataStore.saveState(this.state);
    this.generateAiKaizenProposalsSilently();
    this.refresh();
    alert("¡Datos INITIAL_STATIONS restablecidos correctamente!");
  },

  // -------------------------------------------------------------
  // GESTIÓN DE ESTACIONES (EDITAR, ELIMINAR, CREAR)
  // -------------------------------------------------------------
  openStationModal(stationId = null) {
    const modalTitle = document.getElementById('station-modal-title');
    const nameInput = document.getElementById('station-modal-name');
    const opInput = document.getElementById('station-modal-operator');

    if (stationId) {
      const st = this.state.stations.find(s => s.id === stationId);
      if (st) {
        if (modalTitle) modalTitle.innerText = "Editar Estación de Trabajo";
        if (nameInput) nameInput.value = st.name;
        if (opInput) opInput.value = st.operator || '';
        this.editingStationId = stationId;
      }
    } else {
      if (modalTitle) modalTitle.innerText = "Agregar Nueva Estación";
      if (nameInput) nameInput.value = "";
      if (opInput) opInput.value = "";
      this.editingStationId = null;
    }

    this.openModal('station-modal');
  },

  saveStationModal() {
    const nameInput = document.getElementById('station-modal-name');
    const opInput = document.getElementById('station-modal-operator');

    const name = nameInput ? nameInput.value.trim() : '';
    const operator = opInput ? opInput.value.trim() : '';

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
      const newId = `ST-0${this.state.stations.length + 1}`;
      this.state.stations.push({
        id: newId,
        name: name,
        operator: operator || 'Operador',
        description: 'Estación de trabajo de la línea',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        tasks: []
      });
    }

    this.closeModal('station-modal');
    this.refresh();
  },

  deleteStation(stationId) {
    const st = this.state.stations.find(s => s.id === stationId);
    const stationName = st ? st.name : stationId;

    if (!confirm(`¿Estás seguro de que deseas eliminar la estación "${stationName}" y todas sus tareas?`)) {
      return;
    }

    this.state.stations = this.state.stations.filter(s => s.id !== stationId);
    this.refresh();
  },

  selectStationForVideo(stationId) {
    const st = this.state.stations.find(s => s.id === stationId);
    if (st) {
      LowbandVideoPlayer.loadStationVideo(st);
    }
  },

  handleTaskClicked(taskId, stationId) {
    const st = this.state.stations.find(s => s.id === stationId);
    if (!st) return;
    const task = st.tasks.find(t => t.id === Number(taskId) || t.id === taskId);
    if (task) {
      LowbandVideoPlayer.seekToTask(task, st);
    }
  },

  // -------------------------------------------------------------
  // GESTIÓN DE TAREAS (CREAR, EDITAR, ELIMINAR)
  // -------------------------------------------------------------
  openTaskModal(task = null, stationId = null) {
    const nameInput = document.getElementById('task-modal-name');
    const durInput = document.getElementById('task-modal-duration');
    const catInput = document.getElementById('task-modal-category');
    const stInput = document.getElementById('task-modal-station');
    const notesInput = document.getElementById('task-modal-notes');

    if (stInput) {
      stInput.innerHTML = this.state.stations.map(st => `
        <option value="${st.id}" ${st.id === stationId ? 'selected' : ''}>${st.name}</option>
      `).join('');
    }

    if (task) {
      document.getElementById('task-modal-title').innerText = "Editar Tarea de Ensamblado";
      if (nameInput) nameInput.value = task.name;
      if (durInput) durInput.value = task.duration;
      if (catInput) catInput.value = task.category || task.type || 'VA';
      if (stInput && stationId) stInput.value = stationId;
      if (notesInput) notesInput.value = task.notes || '';
      this.editingTaskRef = { taskId: task.id, stationId: stationId };
    } else {
      document.getElementById('task-modal-title').innerText = "Agregar Nueva Tarea de Ensamblado";
      if (nameInput) nameInput.value = "";
      if (durInput) durInput.value = 30;
      if (catInput) catInput.value = "VA";
      if (stInput && stationId) stInput.value = stationId;
      if (notesInput) notesInput.value = "";
      this.editingTaskRef = null;
    }

    this.openModal('task-modal');
  },

  saveTaskModal() {
    const name = document.getElementById('task-modal-name').value.trim();
    const duration = parseFloat(document.getElementById('task-modal-duration').value) || 10;
    const category = document.getElementById('task-modal-category').value;
    const targetStationId = document.getElementById('task-modal-station').value;
    const notes = document.getElementById('task-modal-notes').value.trim();

    if (!name) {
      alert("Por favor ingresa un nombre para la tarea.");
      return;
    }

    if (this.editingTaskRef) {
      const sourceSt = this.state.stations.find(s => s.id === this.editingTaskRef.stationId);
      if (sourceSt) {
        sourceSt.tasks = sourceSt.tasks.filter(t => t.id !== this.editingTaskRef.taskId);
      }

      const targetSt = this.state.stations.find(s => s.id === targetStationId);
      if (targetSt) {
        targetSt.tasks.push({
          id: this.editingTaskRef.taskId,
          name: name,
          duration: duration,
          category: category,
          type: category,
          notes: notes
        });
      }
    } else {
      const targetSt = this.state.stations.find(s => s.id === targetStationId);
      if (targetSt) {
        targetSt.tasks.push({
          id: Date.now(),
          name: name,
          duration: duration,
          category: category,
          type: category,
          notes: notes
        });
      }
    }

    this.closeModal('task-modal');
    this.refresh();
  },

  deleteTask(taskId, stationId) {
    if (!confirm("¿Deseas eliminar esta tarea de la estación?")) return;
    const st = this.state.stations.find(s => s.id === stationId);
    if (st) {
      st.tasks = st.tasks.filter(t => t.id !== Number(taskId) && t.id !== taskId);
      this.refresh();
    }
  },

  // -------------------------------------------------------------
  // MOTOR DE RECOMENDACIONES KAIZEN POR IA (AUTOMÁTICO)
  // -------------------------------------------------------------
  openKaizenProposalsModal() {
    const modal = document.getElementById('kaizen-proposals-modal');
    this.renderKaizenProposalsTable();
    if (modal) modal.classList.remove('hidden');
  },

  generateAiKaizenProposalsSilently() {
    const generated = [];

    this.state.stations.forEach(st => {
      st.tasks.forEach(t => {
        const cat = (t.category || t.type || '').toUpperCase();
        if (cat === 'MUDA' || cat === 'NVA' || cat === 'WASTE') {
          const taskNameLower = (t.name || '').toLowerCase();
          let proposalText = '';
          let mudaType = cat === 'MUDA' ? 'Desperdicio (MUDA)' : 'No Valor Agregado (NVA)';
          let estimatedSavings = Math.round(t.duration * 0.8) || 10;

          if (taskNameLower.includes('fuente') || taskNameLower.includes('espera') || taskNameLower.includes('esperar')) {
            proposalText = 'Implementar surtido Just-In-Time (JIT) / Kitting previo al lado de línea (Supermercado Lean).';
            mudaType = 'Espera (Waiting)';
          } else if (taskNameLower.includes('disco') || taskNameLower.includes('trabad') || taskNameLower.includes('retrabajo')) {
            proposalText = 'Estandarizar caddies de inserción e implementar Poka-Yoke con guía de alineación de cero defectos.';
            mudaType = 'Defecto / Retrabajo';
          } else if (taskNameLower.includes('cincha') || taskNameLower.includes('buscar')) {
            proposalText = 'Rediseño ergonómico de estación 5S con soportes magnéticos y sombras de herramientas.';
            mudaType = 'Movimiento / Búsqueda';
          } else if (taskNameLower.includes('escan') || taskNameLower.includes('barcode') || taskNameLower.includes('código')) {
            proposalText = 'Instalar escáner fijo manos libres omnidireccional con lectura automática por sensor.';
            mudaType = 'Sobreprocesamiento';
          } else {
            proposalText = `Optimización de método de trabajo 5S y eliminación de movimiento innecesario en "${t.name}".`;
          }

          generated.push({
            id: `kp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            stationId: st.id,
            stationName: st.name,
            operator: st.operator || 'Operador',
            taskName: t.name,
            mudaType: mudaType,
            proposal: proposalText,
            savingsSec: estimatedSavings,
            status: 'Propuesta IA',
            appliedToActionTracker: false
          });
        }
      });
    });

    this.state.kaizenProposals = generated;
    DataStore.saveKaizenProposals(this.state.kaizenProposals);
  },

  generateAiKaizenProposals() {
    this.generateAiKaizenProposalsSilently();
    this.renderKaizenProposalsTable();
  },

  applyProposalToActionTracker(id) {
    const proposal = this.state.kaizenProposals.find(p => p.id === id);
    if (!proposal) return;

    const newItem = {
      id: `at_${Date.now()}`,
      technician: `Ing. ${proposal.operator || 'Responsable'}`,
      stationId: proposal.stationId,
      stationName: proposal.stationName,
      actionText: `[IA Kaizen] ${proposal.proposal}`,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'En Proceso'
    };

    this.state.actionTracker.unshift(newItem);
    proposal.appliedToActionTracker = true;

    DataStore.saveActionTracker(this.state.actionTracker);
    DataStore.saveKaizenProposals(this.state.kaizenProposals);

    this.renderKaizenProposalsTable();
    alert(`¡Propuesta IA convertida en compromiso para ${proposal.operator} y agregada al Action Tracker!`);
  },

  deleteKaizenProposal(id) {
    this.state.kaizenProposals = this.state.kaizenProposals.filter(p => p.id !== id);
    DataStore.saveKaizenProposals(this.state.kaizenProposals);
    this.renderKaizenProposalsTable();
  },

  renderKaizenProposalsTable() {
    const tbody = document.getElementById('kaizen-proposals-tbody');
    const badge = document.getElementById('kaizen-proposals-count-badge');
    if (!tbody) return;

    if (badge) {
      badge.innerText = `${this.state.kaizenProposals.length} propuestas IA`;
    }

    if (this.state.kaizenProposals.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-6 text-slate-400">
            <p class="text-xs">No hay propuestas Kaizen generadas aún.</p>
            <p class="text-[11px] text-amber-300 font-bold mt-1">Haz clic en "✨ Generar Propuestas Kaizen con IA" arriba para escanear desperdicios.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.state.kaizenProposals.map(p => {
      const isApplied = p.appliedToActionTracker;

      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40">
          <td class="px-3 py-2.5 font-bold text-slate-200 truncate max-w-[140px]" title="${p.stationName}">${p.stationName}</td>
          <td class="px-3 py-2.5">
            <span class="px-2 py-0.5 rounded text-[9.5px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              ${p.mudaType}
            </span>
          </td>
          <td class="px-3 py-2.5 text-slate-100 font-medium truncate max-w-[220px]" title="${p.proposal}">
            ✨ ${p.proposal}
          </td>
          <td class="px-3 py-2.5 font-extrabold text-amber-400">
            -${p.savingsSec}s
          </td>
          <td class="px-3 py-2.5 text-right">
            ${isApplied ? `
              <span class="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center space-x-1">
                <span>✅ En Action Tracker</span>
              </span>
            ` : `
              <button onclick="app.applyProposalToActionTracker('${p.id}')"
                      class="px-2.5 py-1 text-[10px] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md shadow transition-all flex items-center space-x-1 ml-auto">
                <span>✅ Aplicar a Action Tracker</span>
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // MODAL ACTION TRACKER
  // -------------------------------------------------------------
  openActionTrackerModal() {
    const modal = document.getElementById('action-tracker-modal');
    const stationSelect = document.getElementById('tracker-station-select');
    
    if (stationSelect) {
      stationSelect.innerHTML = this.state.stations.map(st => `<option value="${st.id}">${st.name}</option>`).join('');
    }

    const dateInput = document.getElementById('tracker-date-input');
    if (dateInput && !dateInput.value) {
      const inSevenDays = new Date();
      inSevenDays.setDate(inSevenDays.getDate() + 7);
      dateInput.value = inSevenDays.toISOString().split('T')[0];
    }

    this.renderActionTrackerTable();
    if (modal) modal.classList.remove('hidden');
  },

  addActionTrackerItem() {
    const techName = document.getElementById('tracker-tech-input').value.trim();
    const stationId = document.getElementById('tracker-station-select').value;
    const actionText = document.getElementById('tracker-action-text').value.trim();
    const dueDate = document.getElementById('tracker-date-input').value;

    if (!techName || !actionText) {
      alert("Por favor ingresa el nombre del técnico responsable y la acción correctora.");
      return;
    }

    const st = this.state.stations.find(s => s.id === stationId);

    const newItem = {
      id: `at_${Date.now()}`,
      technician: techName,
      stationId: stationId,
      stationName: st ? st.name : 'Estación General',
      actionText: actionText,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: 'Pendiente'
    };

    this.state.actionTracker.unshift(newItem);
    document.getElementById('tracker-action-text').value = '';
    
    DataStore.saveActionTracker(this.state.actionTracker);
    this.renderActionTrackerTable();
  },

  updateTrackerStatus(id, newStatus) {
    const item = this.state.actionTracker.find(a => a.id === id);
    if (item) {
      item.status = newStatus;
      DataStore.saveActionTracker(this.state.actionTracker);
      this.renderActionTrackerTable();
    }
  },

  deleteTrackerItem(id) {
    this.state.actionTracker = this.state.actionTracker.filter(a => a.id !== id);
    DataStore.saveActionTracker(this.state.actionTracker);
    this.renderActionTrackerTable();
  },

  renderActionTrackerTable() {
    const tbody = document.getElementById('action-tracker-tbody');
    if (!tbody) return;

    if (this.state.actionTracker.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-slate-500">Sin compromisos técnicos asignados. Agrega uno nuevo arriba.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.state.actionTracker.map(a => {
      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40">
          <td class="px-3 py-2 font-bold text-indigo-300 flex items-center space-x-1">
            <span>👷</span>
            <span class="truncate max-w-[130px]" title="${a.technician}">${a.technician}</span>
          </td>
          <td class="px-3 py-2 text-slate-300 truncate max-w-[130px]" title="${a.stationName}">${a.stationName}</td>
          <td class="px-3 py-2 text-slate-200 truncate max-w-[220px]" title="${a.actionText}">${a.actionText}</td>
          <td class="px-3 py-2 font-mono text-slate-400">${a.dueDate}</td>
          <td class="px-3 py-2">
            <select onchange="app.updateTrackerStatus('${a.id}', this.value)"
                    class="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 outline-none font-bold ${
                      a.status === 'Completado' ? 'text-emerald-400 border-emerald-500/50' :
                      a.status === 'En Proceso' ? 'text-cyan-400 border-cyan-500/50' : 'text-amber-400 border-amber-500/50'
                    }">
              <option value="Pendiente" ${a.status === 'Pendiente' ? 'selected' : ''}>🟡 Pendiente</option>
              <option value="En Proceso" ${a.status === 'En Proceso' ? 'selected' : ''}>🔵 En Proceso</option>
              <option value="Completado" ${a.status === 'Completado' ? 'selected' : ''}>🟢 Completado</option>
            </select>
          </td>
          <td class="px-3 py-2 text-right">
            <button onclick="app.deleteTrackerItem('${a.id}')" class="text-rose-400 hover:text-rose-300 font-bold">✕</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Modales generales
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('hidden');
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
  },

  openTaktModal() {
    const input = document.getElementById('takt-modal-value');
    if (input) input.value = this.state.taktTime;
    this.openModal('takt-modal');
  },

  saveTaktModal() {
    const input = document.getElementById('takt-modal-value');
    if (input) {
      this.state.taktTime = parseFloat(input.value) || 180;
      this.refresh();
    }
    this.closeModal('takt-modal');
  },

  calculateTaktFromDemand() {
    const timeMin = parseFloat(document.getElementById('takt-calc-time').value) || 480;
    const demand = parseFloat(document.getElementById('takt-calc-demand').value) || 160;

    const calculatedTakt = Math.round((timeMin * 60) / demand);
    const input = document.getElementById('takt-modal-value');
    if (input) input.value = calculatedTakt;
  },

  loadPreset(presetKey) {
    if (presetKey === 'google_philo') {
      const p = PHILO_DATA.getInitialState();
      this.state.taktTime = p.taktTime;
      this.state.stations = p.stations;
    } else if (Presets[presetKey]) {
      const p = Presets[presetKey];
      this.state.taktTime = p.taktTime;
      this.state.stations = p.stations;
    }
    this.generateAiKaizenProposalsSilently();
    this.refresh();
  },

  openImportModal() {
    this.openModal('import-modal');
  },

  processImport() {
    const fileInput = document.getElementById('import-file-input');
    const textInput = document.getElementById('import-text-input').value.trim();

    if (fileInput.files && fileInput.files[0]) {
      DataStore.parseImportFile(fileInput.files[0], (data) => {
        if (data && data.stations) {
          this.state.taktTime = data.taktTime || this.state.taktTime;
          this.state.stations = data.stations;
          this.generateAiKaizenProposalsSilently();
          this.refresh();
          this.closeModal('import-modal');
        }
      });
    } else if (textInput) {
      const data = DataStore.parseImportText(textInput);
      if (data && data.stations) {
        this.state.taktTime = data.taktTime || this.state.taktTime;
        this.state.stations = data.stations;
        this.generateAiKaizenProposalsSilently();
        this.refresh();
        this.closeModal('import-modal');
      }
    }
  },

  exportJSON() {
    DataStore.exportJSON({
      taktTime: this.state.taktTime,
      stations: this.state.stations,
      kaizenProposals: this.state.kaizenProposals,
      actionTracker: this.state.actionTracker
    });
  },

  exportCSV() {
    DataStore.exportCSV(this.state.stations, this.state.taktTime);
  },

  triggerPrint() {
    window.print();
  },

  renderTableView() {
    const tbody = document.getElementById('table-view-tbody');
    if (!tbody) return;

    let index = 1;
    let html = '';

    this.state.stations.forEach(st => {
      st.tasks.forEach(task => {
        let catBadge = '';
        const cat = (task.category || task.type || 'VA').toUpperCase();
        if (cat === 'VA') catBadge = '<span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🟩 VA</span>';
        else if (cat === 'NVA') catBadge = '<span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">🟨 NVA</span>';
        else catBadge = '<span class="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">🟥 Muda</span>';

        html += `
          <tr class="border-b border-slate-800 hover:bg-slate-800/40 text-xs">
            <td class="px-4 py-2.5 font-mono text-slate-500">${index++}</td>
            <td class="px-4 py-2.5 font-bold text-slate-200">${st.name}</td>
            <td class="px-4 py-2.5 text-slate-400">${st.operator || 'N/A'}</td>
            <td class="px-4 py-2.5 text-white font-medium">${task.name}</td>
            <td class="px-4 py-2.5 font-bold text-indigo-300">${task.duration}s</td>
            <td class="px-4 py-2.5">${catBadge}</td>
            <td class="px-4 py-2.5 text-slate-400 truncate max-w-[180px]">${task.notes || '-'}</td>
            <td class="px-4 py-2.5 text-right space-x-2">
              <button onclick="app.openTaskModal(app.getTaskById('${task.id}'), '${st.id}')" class="text-indigo-400 hover:text-indigo-300 font-bold">Editar</button>
              <button onclick="app.deleteTask('${task.id}', '${st.id}')" class="text-rose-400 hover:text-rose-300 font-bold">Eliminar</button>
            </td>
          </tr>
        `;
      });
    });

    tbody.innerHTML = html || `<tr><td colspan="8" class="text-center py-4 text-slate-500">Sin tareas en la línea.</td></tr>`;
  },

  getTaskById(taskId) {
    for (const st of this.state.stations) {
      const found = st.tasks.find(t => t.id === Number(taskId) || t.id === taskId);
      if (found) return found;
    }
    return null;
  },

  renderAnalyticsView() {
    const container = document.getElementById('analytics-view-container');
    if (!container) return;

    const metrics = MetricsEngine.calculateMetrics(this.state.stations, this.state.taktTime);

    container.innerHTML = `
      <div class="glass-card rounded-2xl p-6 space-y-6">
        <h2 class="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>📈 Reporte de Desperdicios y Oportunidades Kaizen</span>
          <button onclick="app.resetDefaultData()" class="px-3 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg">
            🔄 Restablecer Datos INITIAL_STATIONS
          </button>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <span class="text-xs font-semibold text-slate-400">Desperdicio Total (Muda)</span>
            <div class="text-2xl font-black text-rose-400">${metrics.totalMuda}s</div>
            <p class="text-xs text-slate-400">${metrics.mudaPercent.toFixed(1)}% del tiempo total de ensamble</p>
          </div>

          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <span class="text-xs font-semibold text-slate-400">Estación Cuello de Botella</span>
            <div class="text-lg font-black text-amber-300 truncate">${metrics.bottleneckStation ? metrics.bottleneckStation.name : 'N/A'}</div>
            <p class="text-xs text-slate-400">Tiempo de ciclo: ${metrics.bottleneckStation ? metrics.bottleneckStation.totalTime : 0}s (Meta Takt: ${metrics.taktTime}s)</p>
          </div>

          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <span class="text-xs font-semibold text-slate-400">Potencial de Incremento de Producción</span>
            <div class="text-2xl font-black text-emerald-400">+${Math.round((metrics.totalMuda / metrics.totalWorkContent) * 100)}%</div>
            <p class="text-xs text-slate-400">Al eliminar tareas de Desperdicio identificadas</p>
          </div>
        </div>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
