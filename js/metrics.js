/**
 * Módulo de Cálculo de Métricas Lean Manufacturing para el Gráfico Yamazumi
 * Incluye Cálculo de Tiempo Estándar (Factor de Nivelación * Suplementos) y Takt Image
 */
const MetricsEngine = {
  calculateMetrics(stations = [], taktTime = 180, options = {}) {
    taktTime = Number(taktTime) || 180;
    const ratingFactor = Number(options.ratingFactor) || 1.05;
    const allowances = Number(options.allowances) || 0.10;
    const taktImagePercent = Number(options.taktImagePercent) || 0.90;
    const kaizenMode = !!options.kaizenMode;

    const taktImage = Math.round(taktTime * taktImagePercent);
    
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
          const durNormal = Number(t.duration) || 0;
          // Tiempo Estándar = Tiempo Normal * Factor Nivelación * (1 + Suplementos)
          const stdDur = Math.round(durNormal * ratingFactor * (1 + allowances) * 10) / 10;
          t.stdDuration = stdDur; // Guardar valor calculado para renderizado

          const cat = (t.category || t.type || 'VA').toUpperCase();
          if (cat === 'VA') stVA += stdDur;
          else if (cat === 'NVA') stNVA += stdDur;
          else if (cat === 'MUDA' || cat === 'WASTE') stMuda += stdDur;
          else stVA += stdDur;
        });
      }

      stVA = Math.round(stVA * 10) / 10;
      stNVA = Math.round(stNVA * 10) / 10;
      stMuda = Math.round(stMuda * 10) / 10;

      const totalTime = Math.round((stVA + stNVA + (kaizenMode ? 0 : stMuda)) * 10) / 10;
      const isOverburdened = totalTime > taktTime;
      const isOverTaktImage = totalTime > taktImage;
      const overTaktDelta = isOverburdened ? Math.round((totalTime - taktTime) * 10) / 10 : 0;

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
        isOverTaktImage,
        overTaktDelta
      };
    });

    totalWorkContent = Math.round(totalWorkContent * 10) / 10;
    totalVA = Math.round(totalVA * 10) / 10;
    totalNVA = Math.round(totalNVA * 10) / 10;
    totalMuda = Math.round(totalMuda * 10) / 10;

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
      taktImage,
      taktImagePercent,
      ratingFactor,
      allowances,
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
