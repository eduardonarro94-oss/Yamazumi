/**
 * Módulo de Almacenamiento Local (LocalStorage), Exportación de Reportes e Importación CSV/JSON
 */
const DataStore = {
  STORAGE_KEY: 'yamazumi_studio_data_v3',
  KAIZEN_KEY: 'yamazumi_kaizen_proposals_v1',
  TRACKER_KEY: 'yamazumi_action_tracker_v1',

  saveState(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("No se pudo guardar el estado en localStorage:", e);
    }
  },

  loadState() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn("No se pudo leer localStorage:", e);
      return null;
    }
  },

  saveKaizenProposals(proposals) {
    try {
      localStorage.setItem(this.KAIZEN_KEY, JSON.stringify(proposals));
    } catch (e) {
      console.warn("No se pudieron guardar las propuestas Kaizen:", e);
    }
  },

  loadKaizenProposals() {
    try {
      const data = localStorage.getItem(this.KAIZEN_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveActionTracker(actions) {
    try {
      localStorage.setItem(this.TRACKER_KEY, JSON.stringify(actions));
    } catch (e) {
      console.warn("No se pudo guardar el Action Tracker:", e);
    }
  },

  loadActionTracker() {
    try {
      const data = localStorage.getItem(this.TRACKER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  exportJSON(state) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `yamazumi_philo_line_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  exportCSV(stations, taktTime) {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Estacion,Operador,Nombre_Tarea,Duracion_Seg,Categoria_Lean,Notas\n";

    stations.forEach(st => {
      st.tasks.forEach(t => {
        const row = [
          `"${st.name}"`,
          `"${st.operator || ''}"`,
          `"${t.name}"`,
          t.duration,
          t.category,
          `"${t.notes || ''}"`
        ].join(",");
        csvContent += row + "\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yamazumi_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  parseImportFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          callback(parsed);
        } catch (err) {
          alert("Error al analizar el archivo JSON. Formato inválido.");
        }
      } else if (file.name.endsWith('.csv')) {
        const parsed = this.parseCSVText(content);
        callback(parsed);
      }
    };
    reader.readAsText(file);
  },

  parseImportText(text) {
    text = text.trim();
    if (text.startsWith('{') || text.startsWith('[')) {
      try {
        return JSON.parse(text);
      } catch (e) {
        alert("Error al procesar JSON.");
        return null;
      }
    } else {
      return this.parseCSVText(text);
    }
  },

  parseCSVText(csvText) {
    const lines = csvText.split(/\r\n|\n/);
    if (lines.length < 2) return null;

    const stationsMap = {};
    let taktTime = 180;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 4) {
        const stName = cols[0] || "Estación Desconocida";
        const opName = cols[1] || "Operador";
        const taskName = cols[2] || "Tarea";
        const duration = parseFloat(cols[3]) || 10;
        const category = (cols[4] || "VA").toUpperCase();
        const notes = cols[5] || "";

        if (!stationsMap[stName]) {
          stationsMap[stName] = {
            id: `st_imp_${Object.keys(stationsMap).length + 1}`,
            name: stName,
            operator: opName,
            tasks: []
          };
        }

        stationsMap[stName].tasks.push({
          id: `t_imp_${Date.now()}_${i}`,
          name: taskName,
          duration: duration,
          category: ['VA', 'NVA', 'MUDA'].includes(category) ? category : 'VA',
          notes: notes
        });
      }
    }

    return {
      taktTime: taktTime,
      stations: Object.values(stationsMap)
    };
  }
};
