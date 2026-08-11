/**
 * Módulo de Arrastrar y Soltar (Drag & Drop) para Rebalanceo de Línea en el Gráfico Yamazumi
 */
const DragDropEngine = {
  draggedTaskId: null,
  sourceStationId: null,
  onTaskMovedCallback: null,

  init(onTaskMoved) {
    this.onTaskMovedCallback = onTaskMoved;
  },

  /**
   * Asigna eventos de Drag & Drop a los elementos del DOM en el gráfico
   */
  bindEvents(containerEl) {
    if (!containerEl) return;

    // Tareas arrastrambles (.yamazumi-task-block)
    const taskBlocks = containerEl.querySelectorAll('.yamazumi-task-block');
    taskBlocks.forEach(block => {
      block.setAttribute('draggable', 'true');

      block.removeEventListener('dragstart', this.handleDragStart);
      block.removeEventListener('dragend', this.handleDragEnd);

      block.addEventListener('dragstart', (e) => this.handleDragStart(e, block));
      block.addEventListener('dragend', (e) => this.handleDragEnd(e, block));
    });

    // Zonas de caída (Columnas de estación .yamazumi-station-column)
    const stationColumns = containerEl.querySelectorAll('.yamazumi-station-column');
    stationColumns.forEach(col => {
      col.removeEventListener('dragover', this.handleDragOver);
      col.removeEventListener('dragleave', this.handleDragLeave);
      col.removeEventListener('drop', this.handleDrop);

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

    // Estilo visual durante el arrastre
    blockEl.classList.add('opacity-40', 'scale-95', 'ring-2', 'ring-indigo-500');

    // Añadir clase global al body para resaltar zonas de destino
    document.body.classList.add('is-dragging-task');
  },

  handleDragEnd(e, blockEl) {
    blockEl.classList.remove('opacity-40', 'scale-95', 'ring-2', 'ring-indigo-500');
    document.body.classList.remove('is-dragging-task');

    // Limpiar resaltados de columnas
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
    // Si el puntero sale de la columna
    if (!colEl.contains(e.relatedTarget)) {
      colEl.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-50/50', 'dark:bg-indigo-900/30');
    }
  },

  handleDrop(e, targetColEl) {
    e.preventDefault();
    targetColEl.classList.remove('ring-4', 'ring-indigo-400', 'bg-indigo-50/50', 'dark:bg-indigo-900/30');

    const targetStationId = targetColEl.getAttribute('data-station-id');
    if (!this.draggedTaskId || !targetStationId) return;

    // Calcular índice de inserción opcional si se soltó sobre otra tarea
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

    // Resetear
    this.draggedTaskId = null;
    this.sourceStationId = null;
  }
};
