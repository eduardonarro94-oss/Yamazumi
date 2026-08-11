/**
 * Presets y datos iniciales para la aplicación Yamazumi Chart
 */
const PRESETS = {
  mountain_bike: {
    id: "mountain_bike",
    name: "🚲 Ensamblado: Bicicleta de Montaña",
    description: "Línea de producción de bicicletas de montaña de 4 estaciones con balanceo industrial.",
    taktTime: 150, // segundos
    timeUnit: "seg",
    stations: [
      {
        id: "st_1",
        name: "Estación 1: Cuadro y Suspensión",
        operator: "Carlos Mendoza",
        tasks: [
          { id: "t_101", name: "Montar horquilla delantera", duration: 45, category: "VA", notes: "Ajuste de rodamientos de dirección" },
          { id: "t_102", name: "Ajustar potencia y manillar", duration: 25, category: "NVA", notes: "Verificar alineación visual" },
          { id: "t_103", name: "Esperar entrega de cuadro", duration: 20, category: "Muda", notes: "Demora por transporte interno" },
          { id: "t_104", name: "Fijar amortiguador trasero", duration: 40, category: "VA", notes: "Torque especificado 12 Nm" }
        ]
      },
      {
        id: "st_2",
        name: "Estación 2: Frenos y Cambios",
        operator: "Elena Ramírez",
        tasks: [
          { id: "t_201", name: "Instalar manetas e hidráulicos", duration: 35, category: "VA", notes: "Montar en manillar" },
          { id: "t_202", name: "Guíado de cables y mangueras", duration: 30, category: "VA", notes: "Fijación con abrazaderas" },
          { id: "t_203", name: "Buscar herramienta de corte", duration: 25, category: "Muda", notes: "Desperdicio de búsqueda por falta de 5S" },
          { id: "t_204", name: "Calibrar desviador trasero", duration: 45, category: "NVA", notes: "Ajuste de tensión de guaya" },
          { id: "t_205", name: "Ajustar pastillas de freno", duration: 30, category: "VA", notes: "Alinear disco hidráulico" }
        ]
      },
      {
        id: "st_3",
        name: "Estación 3: Ruedas y Transmisión",
        operator: "Javier Paredes",
        tasks: [
          { id: "t_301", name: "Montar cassette en rueda tras.", duration: 25, category: "VA", notes: "Ajustar piñones" },
          { id: "t_302", name: "Instalar rueda delantera y tras.", duration: 35, category: "VA", notes: "Cierre rápido e inspección" },
          { id: "t_303", name: "Montar cadena y bielas", duration: 40, category: "VA", notes: "Eje de centro hueco" },
          { id: "t_304", name: "Inspección visual de calidad", duration: 35, category: "NVA", notes: "Checklist 10 puntos de control" },
          { id: "t_305", name: "Retrabajo por cadena floja", duration: 30, category: "Muda", notes: "Ajuste secundario repetido por holgura" }
        ]
      },
      {
        id: "st_4",
        name: "Estación 4: Accesorios y Empaque",
        operator: "Sofía Torres",
        tasks: [
          { id: "t_401", name: "Instalar sillín, tija y pedales", duration: 40, category: "VA", notes: "Ajustar altura estándar" },
          { id: "t_402", name: "Colocar pegatinas y manuales", duration: 20, category: "NVA", notes: "Etiquetado de garantía" },
          { id: "t_403", name: "Empaque e inserción en caja", duration: 55, category: "VA", notes: "Protección con espuma de polietileno" },
          { id: "t_404", name: "Esperar montacargas de salida", duration: 15, category: "Muda", notes: "Cuello de botella en logística de despacho" }
        ]
      }
    ]
  },
  pc_server: {
    id: "pc_server",
    name: "🖥️ Ensamblado: Servidor Rack 2U",
    description: "Línea de montaje de alto valor para servidores empresariales en rack.",
    taktTime: 200,
    timeUnit: "seg",
    stations: [
      {
        id: "st_10",
        name: "Estación 1: Chasis y Fuente",
        operator: "Mateo Silva",
        tasks: [
          { id: "t_501", name: "Inspección de chasis recibido", duration: 30, category: "NVA", notes: "Verificar abolladuras" },
          { id: "t_502", name: "Instalar fuentes redundantes", duration: 50, category: "VA", notes: "2x 800W PSU Platinum" },
          { id: "t_503", name: "Montar ventiladores hot-swap", duration: 40, category: "VA", notes: "6 módulos FAN redundantes" },
          { id: "t_504", name: "Esperar componentes faltantes", duration: 35, category: "Muda", notes: "Demora por desabastecimiento en almacén" }
        ]
      },
      {
        id: "st_20",
        name: "Estación 2: Placa Base y CPU",
        operator: "Lucía Álvarez",
        tasks: [
          { id: "t_601", name: "Colocar Placa Madre en chasis", duration: 45, category: "VA", notes: "Fijar 9 tornillos standoff" },
          { id: "t_602", name: "Instalar procesadores Dual Xeon", duration: 60, category: "VA", notes: "Aplicar pasta térmica y disipador de cobre" },
          { id: "t_603", name: "Insertar módulos RAM (128GB)", duration: 40, category: "VA", notes: "8x 16GB DDR5 en canales A/B" },
          { id: "t_604", name: "Limpiar exceso de pasta", duration: 25, category: "Muda", notes: "Error por exceso de dosificación" }
        ]
      },
      {
        id: "st_30",
        name: "Estación 3: Almacenamiento y Cableado",
        operator: "Andrés Beltrán",
        tasks: [
          { id: "t_701", name: "Instalar Backplane SAS/SATA", duration: 35, category: "VA", notes: "Conectar cables Mini-SAS HD" },
          { id: "t_702", name: "Montar 8 discos SSD en caddies", duration: 70, category: "VA", notes: "Atornillado de 8 unidades Enterprise" },
          { id: "t_703", name: "Enrutamiento de cables de poder", duration: 45, category: "NVA", notes: "Peinado de cables con cinchas de velcro" },
          { id: "t_704", name: "Buscar tornillos caídos", duration: 20, category: "Muda", notes: "Desperdicio de movimiento por ergonomía" }
        ]
      },
      {
        id: "st_40",
        name: "Estación 4: Test POST y Cierre",
        operator: "Carmen Gómez",
        tasks: [
          { id: "t_801", name: "Conectar a estación de prueba POST", duration: 30, category: "NVA", notes: "KVM + Monitor + Cable Red" },
          { id: "t_802", name: "Prueba de encendido y BIOS check", duration: 80, category: "NVA", notes: "Verificar memoria total y discos detectados" },
          { id: "t_803", name: "Colocar cubierta superior chasis", duration: 25, category: "VA", notes: "Cierre magnético y tornillos traseros" },
          { id: "t_804", name: "Esperar etiquetas barcode", duration: 30, category: "Muda", notes: "Demora en impresión de serie" }
        ]
      }
    ]
  },
  electric_scooter: {
    id: "electric_scooter",
    name: "🛴 Ensamblado: Scooter Eléctrico Urbano",
    description: "Línea de ensamblado de monopatines eléctricos con batería de litio integrada.",
    taktTime: 120, // 2 minutos
    timeUnit: "seg",
    stations: [
      {
        id: "st_sc1",
        name: "Estación 1: Estructura y Motor Rueda",
        operator: "Gabriel Ruiz",
        tasks: [
          { id: "t_901", name: "Instalar motor en rueda delantera", duration: 40, category: "VA", notes: "Ajustar tuercas con torque 35 Nm" },
          { id: "t_902", name: "Montar mástil plegable al deck", duration: 35, category: "VA", notes: "Pasador de seguridad y bisagra" },
          { id: "t_903", name: "Buscar llave allen perdida", duration: 15, category: "Muda", notes: "Desperdicio de búsqueda por desorden" }
        ]
      },
      {
        id: "st_sc2",
        name: "Estación 2: Batería y Controlador",
        operator: "Mariana Castro",
        tasks: [
          { id: "t_904", name: "Instalar pack de batería 36V", duration: 30, category: "VA", notes: "Insertar en la base de la plataforma" },
          { id: "t_905", name: "Conectar módulo de control ESC", duration: 30, category: "VA", notes: "Arnés impermeabilizado IP65" },
          { id: "t_906", name: "Esperar prueba de voltaje", duration: 20, category: "NVA", notes: "Verificación de polaridad con multímetro" },
          { id: "t_907", name: "Reorganizar cables aplastados", duration: 25, category: "Muda", notes: "Retrabajo por mal posicionamiento previa" }
        ]
      },
      {
        id: "st_sc3",
        name: "Estación 3: Manillar, Display y Freno",
        operator: "Diego Valencia",
        tasks: [
          { id: "t_908", name: "Montar manillar y acelerador de pulgar", duration: 35, category: "VA", notes: "Conexión Plug&Play al display" },
          { id: "t_909", name: "Instalar freno de disco trasero", duration: 30, category: "VA", notes: "Tensión de guaya y caliper" },
          { id: "t_910", name: "Alineación de faro LED delantero", duration: 20, category: "NVA", notes: "Regulación de haz de luz" }
        ]
      },
      {
        id: "st_sc4",
        name: "Estación 4: Control de Calidad y Carga",
        operator: "Valeria Morales",
        tasks: [
          { id: "t_911", name: "Test dinámico de aceleración", duration: 40, category: "NVA", notes: "Probar modos Eco / Sport" },
          { id: "t_912", name: "Limpieza final y pulido", duration: 25, category: "NVA", notes: "Remover restos de grasa" },
          { id: "t_913", name: "Empaque en caja máster", duration: 35, category: "VA", notes: "Colocar cargador y manual" }
        ]
      }
    ]
  }
};

