/**
 * Datos Mock Industriales - Línea de Ensamblado "Philo" (Google Data Center Mass Storage Unit)
 * Arreglo de Estaciones e Inicialización Exacta enviada por el Usuario
 */
const PHILO_DATA = {
  id: "google_philo_v1",
  name: "Google Philo Storage Server Line",
  product: "Philo High-Density Data Center Server (Rack 2U)",
  taktTime: 180, // segundos por unidad
  timeUnit: "seg",
  stations: [
    {
      id: "ST-01",
      name: "ST-01: PCB & Backplane",
      operator: "Marcus Vance",
      description: "Montaje de tarjeta madre servidor, procesador dual y backplane NVMe/SAS.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      tasks: [
        { id: 1, name: "Conectar arnés", duration: 25, category: "VA", videoStart: 20, notes: "Conexión de poder y datos" },
        { id: 2, name: "Espera componentes", duration: 33, category: "Muda", videoStart: 45, notes: "Espera en entrega de kitting" }
      ]
    },
    {
      id: "ST-02",
      name: "ST-02: Deflector & Fuentes",
      operator: "Sarah Chen",
      description: "Instalación de fuentes redundantes 1200W y deflector transparente de aire.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      tasks: [
        { id: 3, name: "Esperar entrega de fuentes", duration: 45, category: "Muda", videoStart: 115, notes: "Demora en logística de suministro" },
        { id: 4, name: "Fijar deflector de aire transp...", duration: 130, category: "VA", videoStart: 160, notes: "Fijación por remaches rápidos" }
      ]
    },
    {
      id: "ST-03",
      name: "ST-03: Discos & Escaneo (Cuello de Botella)",
      operator: "David Miller",
      description: "Inserción y traba de bahías de discos SSDs/HDDs y escaneo de códigos de barra.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      tasks: [
        { id: 5, name: "Insertar Array Discos 13 al 24", duration: 65, category: "VA", videoStart: 90, notes: "Asegurar traba mecánica" },
        { id: 6, name: "Retrabajo por disco trabado", duration: 40, category: "Muda", videoStart: 155, notes: "Caddie atascado reemplazado" },
        { id: 7, name: "Escanear códigos Barcode...", duration: 30, category: "NVA", videoStart: 195, notes: "Registro de números de serie" },
        { id: 8, name: "Ajuste de cubierta", duration: 90, category: "VA", videoStart: 225, notes: "Tornillos imperdibles 8.5 in-lbs" }
      ]
    },
    {
      id: "ST-04",
      name: "ST-04: Cableado",
      operator: "Aisha Patel",
      description: "Ruteo de cableado blindado Mini-SAS/PCIe y peinado con cinchas velcro.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      tasks: [
        { id: 9, name: "Buscar cinchas de repuesto", duration: 40, category: "Muda", videoStart: 40, notes: "Falta de cinchas en punto de uso" },
        { id: 10, name: "Peinado de Cables", duration: 100, category: "VA", videoStart: 140, notes: "Guiado térmico y estético" }
      ]
    },
    {
      id: "ST-05",
      name: "ST-05: Empaque",
      operator: "Kenji Sato",
      description: "Inspección final de calidad, etiquetado y preparación para empaque.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      tasks: [
        { id: 11, name: "Inspección final", duration: 50, category: "NVA", videoStart: 50, notes: "Checklist de aseguramiento de calidad" }
      ]
    }
  ]
};

PHILO_DATA.getInitialState = function() {
  return JSON.parse(JSON.stringify(PHILO_DATA));
};

const INITIAL_FINDINGS = [
  {
    id: "f_101",
    timestamp: 155,
    timestampStr: "00:02:35.000",
    stationId: "ST-03",
    stationName: "ST-03: Discos & Escaneo (Cuello de Botella)",
    category: "Cuello de Botella",
    severity: "Alta",
    description: "Retrabajo por disco trabado en bahía acumulando 225s total sobre el Takt Time de 180s.",
    createdAt: "10:15 AM"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PHILO_DATA, INITIAL_FINDINGS };
}
