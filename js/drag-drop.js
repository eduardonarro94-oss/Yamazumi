/**
 * Módulo de Arrastrar y Soltar (Drag & Drop) para Rebalanceo de Línea en el Gráfico Yamazumi
 * Soporta HTML5 Drag & Drop nativo y Eventos Táctiles (Touch Events) para iPads y Tablets Android
 */
const DragDropEngine = {
  draggedTaskId: null,
  sourceStationId: null,
  onTaskMovedCallback: null,
  touchGhostEl: null,
  activeTouchBlock: null,

  init(onTaskMoved) {
    this.onTaskMovedCallback = onTaskMoved;
  },

  /**
   * Asigna eventos de Drag & Drop y Touch a los elementos del DOM en el gráfico
   */
  bindEvents(containerEl) {
    if (!containerEl) return;

    // Tareas arrastrables (.yamazumi-task-block)
    const taskBlocks = containerEl.querySelectorAll('.yamazumi-task-block');
    taskBlocks.forEach(block => {
      block.setAttribute('draggable', 'true');

      block.addEventListener('dragstart', (e) => this.handleDragStart(e, block));
      block.addEventListener('dragend', (e) => this.handleDragEnd(e, block));

      // Soporte Táctil (Touch Events para Tablet/iPad)
      block.addEventListener('touchstart', (e) => this.handleTouchStart(e, block), { passive: false });
      block.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
      block.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    });

    // Zonas de caída (Columnas de estación .yamazumi-station-column)
    const stationColumns = containerEl.querySelectorAll('.yamazumi-station-column');
    stationColumns.forEach(col => {
      col.addEventListener('dragover', (e) => this.handleDragOver(e, col));
      col.addEventListener('dragleave', (e) => this.handleDragLeave(e, col));
      col.addEventListener('drop', (e) => this.handleDrop(e, col));
    });
  },

  // -------------------------------------------------------------
  // EVENTOS MOUSE / HTML5 DRAG & DROP
  // -------------------------------------------------------------
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
      col.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-50/50', 'dark:bg-indigo-900/30');
    });
  },

  handleDragOver(e, colEl) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!colEl.classList.contains('ring-4')) {
      colEl.classList.add('ring-4', 'ring-indigo-400', 'bg-indigo-50/50', 'dark:bg-indigo-900/30');
    }
  },

  handleDragLeave(e, colEl) {
    if (!colEl.contains(e.relatedTarget)) {
      colEl.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-50/50', 'dark:bg-indigo-900/30');
    }
  },

  handleDrop(e, targetColEl) {
    e.preventDefault();
    targetColEl.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-50/50', 'dark:bg-indigo-900/30');

    const targetStationId = targetColEl.getAttribute('data-station-id');
    if (!this.draggedTaskId || !targetStationId) return;

    let targetIndex = -1;
    const hoveredTask = e.target.closest('.yamazumi-task-block');
    if (hoveredTask && hoveredTask.getAttribute('data-station-id') === targetStationId) {
      const hoveredTaskId = hoveredTask.getAttribute('data-task-id');
      const taskBlocks = Array.from(targetColEl.querySelectorAll('.yamazumi-task-block'));
      targetIndex = taskBlocks.findIndex(el => el.getAttribute('data-task-id') === hoveredTaskId);
    }

    this.executeMove(this.draggedTaskId, this.sourceStationId, targetStationId, targetIndex);

    this.draggedTaskId = null;
    this.sourceStationId = null;
  },

  // -------------------------------------------------------------
  // SOPORTE TÁCTIL PARA TABLETS (TOUCHSTART, TOUCHMOVE, TOUCHEND)
  // -------------------------------------------------------------
  handleTouchStart(e, blockEl) {
    if (e.touches.length > 1) return; // Permitir gestos multitáctiles estándar

    this.draggedTaskId = blockEl.getAttribute('data-task-id');
    this.sourceStationId = blockEl.getAttribute('data-station-id');
    this.activeTouchBlock = blockEl;

    // Crear clon visual fantasma que sigue el dedo
    const rect = blockEl.getBoundingClientRect();
    this.touchGhostEl = blockEl.cloneNode(true);
    this.touchGhostEl.classList.add('touch-drag-ghost');
    this.touchGhostEl.style.width = `${rect.width}px`;
    this.touchGhostEl.style.height = `${rect.height}px`;
    this.touchGhostEl.style.left = `${e.touches[0].clientX - rect.width / 2}px`;
    this.touchGhostEl.style.top = `${e.touches[0].clientY - rect.height / 2}px`;
    document.body.appendChild(this.touchGhostEl);

    blockEl.classList.add('opacity-30');
    document.body.classList.add('is-dragging-task');
  },

  handleTouchMove(e) {
    if (!this.touchGhostEl || !e.touches[0]) return;
    e.preventDefault(); // Evitar scroll mientras se arrastra la tarea

    const touch = e.touches[0];
    this.touchGhostEl.style.left = `${touch.clientX - this.touchGhostEl.offsetWidth / 2}px`;
    this.touchGhostEl.style.top = `${touch.clientY - this.touchGhostEl.offsetHeight / 2}px`;

    // Detectar estación bajo el punto táctil
    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetCol = elementUnderTouch ? elementUnderTouch.closest('.yamazumi-station-column') : null;

    document.querySelectorAll('.yamazumi-station-column').forEach(col => {
      col.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-50/50', 'dark:bg-indigo-900/30');
    });

    if (targetCol) {
      targetCol.classList.add('ring-4', 'ring-indigo-400', 'bg-indigo-50/50', 'dark:bg-indigo-900/30');
    }
  },

  handleTouchEnd(e) {
    if (!this.touchGhostEl) return;
    e.preventDefault();

    if (this.activeTouchBlock) {
      this.activeTouchBlock.classList.remove('opacity-30');
    }

    if (this.touchGhostEl.parentNode) {
      this.touchGhostEl.parentNode.removeChild(this.touchGhostEl);
    }
    this.touchGhostEl = null;
    document.body.classList.remove('is-dragging-task');

    const changedTouch = e.changedTouches[0];
    if (changedTouch) {
      const elementUnderTouch = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
      const targetColEl = elementUnderTouch ? elementUnderTouch.closest('.yamazumi-station-column') : null;

      if (targetColEl) {
        targetColEl.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-50/50', 'dark:bg-indigo-900/30');
        const targetStationId = targetColEl.getAttribute('data-station-id');

        if (this.draggedTaskId && targetStationId) {
          this.executeMove(this.draggedTaskId, this.sourceStationId, targetStationId, -1);
        }
      }
    }

    this.draggedTaskId = null;
    this.sourceStationId = null;
    this.activeTouchBlock = null;
  },

  executeMove(taskId, sourceStationId, targetStationId, targetIndex) {
    if (typeof this.onTaskMovedCallback === 'function') {
      this.onTaskMovedCallback({
        taskId: taskId,
        sourceStationId: sourceStationId,
        targetStationId: targetStationId,
        targetIndex: targetIndex
      });
    } else if (window.app && typeof window.app.moveTaskBetweenStations === 'function') {
      window.app.moveTaskBetweenStations(taskId, sourceStationId, targetStationId);
    }
  }
};
