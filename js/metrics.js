/**
 * Módulo de Cálculo de Métricas Lean Manufacturing para el Gráfico Yamazumi
 * Soporta categorización por t.category o t.type ('VA', 'NVA', 'MUDA')
 */
const MetricsEngine = {
  calculateMetrics(stations = [], taktTime = 180, options = {}) {
    taktTime = Number(taktTime) || 180;
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
          const cat = (t.category || t.type || 'VA').toUpperCase();
          if (cat === 'VA') stVA += dur;
          else if (cat === 'NVA') stNVA += dur;
          else if (cat === 'MUDA' || cat === 'WASTE') stMuda += dur;
          else stVA += dur;
        });
      }

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
    
    const bottleneckStation = stationMetrics.find(s => s.totalTime === maxCycleTime) || null;

    let lineBalanceEfficiency = 0;
    if (numStations > 0 && maxCycleTime > 0) {
      lineBalanceEfficiency = (totalWorkContent / (numStations * maxCycleTime)) * 100;
    }

    const balanceDelay = 100 - lineBalanceEfficiency;

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
      stationsCount: numStations,
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
