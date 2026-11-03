import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Calendar,
  Clock,
  Users,
  Upload,
  CheckCircle2,
  XCircle,
  Sparkles,
  Store,
  UserCheck,
  Coffee,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Smartphone,
  Calculator,
  CalendarRange,
  HardDrive,
  Archive,
  Timer,
  ShieldCheck
} from 'lucide-react';

import materias from "./materias.json";

function horaAMinutos(horaString) {
  if (!horaString || !horaString.includes(":")) return null;
  const partes = horaString.split(":");
  const horas = parseInt(partes[0], 10);
  const minutos = parseInt(partes[1], 10);
  if (isNaN(horas) || isNaN(minutos)) return null;
  return (horas * 60) + minutos;
}

function obtenerDiaSemana(item) {
  const texto = String(item.fechaISO || item.fecha || "").toLowerCase();
  // 1. Si el texto menciona el nombre del día (ej: "Lunes 02/11")
  if (texto.includes("dom")) return 0;
  if (texto.includes("lun")) return 1;
  if (texto.includes("mar")) return 2;
  if (texto.includes("mié") || texto.includes("mie")) return 3;
  if (texto.includes("jue")) return 4;
  if (texto.includes("vie")) return 5;
  if (texto.includes("sáb") || texto.includes("sab")) return 6;

  // 2. Si viene como YYYY-MM-DD (ej: "2026-11-02")
  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    return new Date(texto.slice(0, 10) + "T00:00:00").getDay();
  }

  // 3. Si viene como DD/MM/YYYY (ej: "02/11/2026")
  const match = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const [, d, m, y] = match;
    return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00`).getDay();
  }
  return null;
}

import datosPublicados from "./horariosPublicados.json";
import EstadisticasEmpleado from './EstadisticasEmpleado';
import BorradorPlanilla from './BorradorPlanilla';
// ============================================================================
// DATOS REALES EXTRAÍDOS DE LA PLANILLA: MARTES 03/11/2026 (Tienda 91 - BK)
// ============================================================================
const ASIGNACIONES_MARTES_03_11 = [
  { legajo: "91372", nombre: "GIMENEZ, ELIAN ALEXIS", trabaja: "Si", horaEntrada: "06:00", horaSalida: "10:30" },
  { legajo: "91322", nombre: "DE LA CONCEPCION, MARIANA ABRIL", trabaja: "Si", horaEntrada: "06:00", horaSalida: "10:30" },
  { legajo: "91203", nombre: "REYES, ORIANA JAEL", trabaja: "Si", horaEntrada: "06:00", horaSalida: "10:30" },
  { legajo: "91301", nombre: "PAESANO, TOMAS", trabaja: "Si", horaEntrada: "06:00", horaSalida: "10:00" },
  { legajo: "91303", nombre: "CARRION, GUADALUPE CELESTE", trabaja: "Si", horaEntrada: "07:00", horaSalida: "12:00" },
  { legajo: "91325", nombre: "NUNEZ BECERRA, ARIADNA BELEN", trabaja: "Si", horaEntrada: "08:00", horaSalida: "13:00" },
  { legajo: "91247", nombre: "LOBOS, LARA SABRINA", trabaja: "Si", horaEntrada: "08:30", horaSalida: "13:30" },
  { legajo: "91380", nombre: "VIGIL ESPEJO, JUAN FRANCISCO", trabaja: "Si", horaEntrada: "10:00", horaSalida: "14:00" },
  { legajo: "91124", nombre: "LEDESMA, BRUNO NAHUEL", trabaja: "Si", horaEntrada: "10:30", horaSalida: "15:00" },
  { legajo: "91361", nombre: "PERALTA, EBER EZEQUIEL", trabaja: "Si", horaEntrada: "10:30", horaSalida: "15:00" },
  { legajo: "91244", nombre: "CARRION, LUCIANA AYLEN", trabaja: "Si", horaEntrada: "10:30", horaSalida: "15:00" },
  { legajo: "91335", nombre: "QUIÑA, IARA AYLEN", trabaja: "Si", horaEntrada: "12:00", horaSalida: "17:00" },
  { legajo: "91366", nombre: "ANDREOZZI, LUCIANA YAZMIN", trabaja: "Si", horaEntrada: "12:00", horaSalida: "17:00" },
  { legajo: "91266", nombre: "PIZARRO, VALENTINA ABRIL", trabaja: "Si", horaEntrada: "12:00", horaSalida: "16:00" },
  { legajo: "91344", nombre: "GAMBOA, LAUTARO DANIEL", trabaja: "Si", horaEntrada: "12:30", horaSalida: "17:30" },
  { legajo: "91334", nombre: "AZCONA, AGUSTINA LUZ", trabaja: "Si", horaEntrada: "13:00", horaSalida: "18:00" },
  { legajo: "78184", nombre: "PAZ, CAROLINA NICOLE", trabaja: "Si", horaEntrada: "13:00", horaSalida: "18:00" },
  { legajo: "91356", nombre: "POMA PALOMINO, JHOSTIN FRANK", trabaja: "Si", horaEntrada: "13:00", horaSalida: "18:00" },
  { legajo: "91387", nombre: "GIMENEZ, DYLAN JOEL", trabaja: "Si", horaEntrada: "17:00", horaSalida: "21:30" },
  { legajo: "91277", nombre: "BARRIENTOS, SOFIA AILEN", trabaja: "Si", horaEntrada: "17:30", horaSalida: "22:30" },
  { legajo: "91271", nombre: "MAIELLO ESCALONA, GIADA ANDREA", trabaja: "Si", horaEntrada: "18:00", horaSalida: "22:30" },
  { legajo: "91286", nombre: "GAUNA, JESICA CAROLINA", trabaja: "Si", horaEntrada: "18:00", horaSalida: "22:30" },
  { legajo: "91370", nombre: "ANFOSSO, TOBIAS", trabaja: "Si", horaEntrada: "18:00", horaSalida: "23:00" },
  { legajo: "91371", nombre: "AEL, FARID", trabaja: "Si", horaEntrada: "20:00", horaSalida: "00:00" },
  { legajo: "91390", nombre: "RECARDO DIAZ, SANTINO", trabaja: "Si", horaEntrada: "20:00", horaSalida: "00:00" },
  { legajo: "91349", nombre: "PEREZ, ARIANA IRIEL", trabaja: "Si", horaEntrada: "20:00", horaSalida: "00:00" },
  { legajo: "91362", nombre: "VILARNOVO, RODRIGO FAUSTO", trabaja: "Si", horaEntrada: "20:30", horaSalida: "00:30" },
  { legajo: "91337", nombre: "LEZCANO CABRERA, SOFIA ARACELI", trabaja: "Si", horaEntrada: "20:30", horaSalida: "01:30" },
  { legajo: "91388", nombre: "RAINIERI, SANTIAGO SALVADOR", trabaja: "Si", horaEntrada: "21:30", horaSalida: "02:00" },
  { legajo: "91252", nombre: "JIMENEZ, GALA CAROLINA", trabaja: "Si", horaEntrada: "23:30", horaSalida: "04:00" },
  { legajo: "125033", nombre: "AGUIRRE, LUCIA VERONICA", trabaja: "Si", horaEntrada: "23:30", horaSalida: "04:00" },
  { legajo: "91149", nombre: "HIGASHI ALEJOS, GIAN ALBERTO", trabaja: "Si", horaEntrada: "00:00", horaSalida: "04:00" },
  { legajo: "91351", nombre: "IRATO JIMENEZ, LOLA ALUHE", trabaja: "Si", horaEntrada: "00:00", horaSalida: "04:00" },
  { legajo: "43003", nombre: "CASTILLO, CAMILA NELIDA", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91321", nombre: "CUEVAS, LOURDES MARA", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91382", nombre: "BOTTANI JEREZ, GENERO LUCA", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91383", nombre: "RECARDO DIAZ, LUCAS", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91341", nombre: "PACCIONE MORAIS, BRUNO", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91309", nombre: "SILVA, ANA MICAELA", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91347", nombre: "GALLARDI, MICAELA AGUSTINA", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91385", nombre: "SANCHEZ, TOBIAS AGUSTIN", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91389", nombre: "FOSSA LUCARELLA, TOMAS", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "C12067", nombre: "RIEDEL, GUADALUPE MICAELA", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91368", nombre: "COLMAN, HAROLD TOBIAS", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91369", nombre: "GUARDERAS, ROCIO AYELEN", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "117122", nombre: "PUCCIO, GIAN ARIEL", trabaja: "Off", horaEntrada: "-", horaSalida: "-" },
  { legajo: "91285", nombre: "LUQUE PACHELLI, ANDRES GABRIEL", trabaja: "ADPyN 2.0 - Lic", horaEntrada: "-", horaSalida: "-" },
  { legajo: "92366", nombre: "RABAZANO, LUNA ABIGAIL", trabaja: "Licencia por Re", horaEntrada: "-", horaSalida: "-" }
];

// Generador auxiliar para los días Demo (Miércoles 04/11 y Jueves 05/11)
function generarDiaDemo(variante) {
  return ASIGNACIONES_MARTES_03_11.map((emp, idx) => {
    if (emp.legajo === "91149") {
      if (variante === "miercoles") {
        return { ...emp, trabaja: "Si", horaEntrada: "23:30", horaSalida: "04:00" };
      }
      if (variante === "jueves") {
        return { ...emp, trabaja: "Off", horaEntrada: "-", horaSalida: "-" };
      }
    }
    if (emp.legajo === "91351") {
      if (variante === "miercoles") {
        return { ...emp, trabaja: "Si", horaEntrada: "00:00", horaSalida: "04:00" };
      }
      if (variante === "jueves") {
        return { ...emp, trabaja: "Si", horaEntrada: "23:30", horaSalida: "04:00" };
      }
    }
    if (variante === "miercoles" && idx % 7 === 0) {
      return emp.trabaja === "Si"
        ? { ...emp, trabaja: "Off", horaEntrada: "-", horaSalida: "-" }
        : { ...emp, trabaja: "Si", horaEntrada: "12:00", horaSalida: "17:00" };
    }
    if (variante === "jueves" && idx % 5 === 0) {
      return emp.trabaja === "Si"
        ? { ...emp, trabaja: "Off", horaEntrada: "-", horaSalida: "-" }
        : { ...emp, trabaja: "Si", horaEntrada: "18:00", horaSalida: "23:00" };
    }
    return { ...emp };
  });
}

const PLANILLAS_INICIALES = [
  {
    id: "2026-11-03",
    fechaISO: "2026-11-03",
    fechaEtiqueta: "MARTES 03/11/2026",
    tienda: "91 - BK Fondo de la Legua",
    fechaImpresion: "29/10/26 04:56",
    version: "1",
    esDemo: false,
    horasTotalesPlanilla: 150,
    asignaciones: ASIGNACIONES_MARTES_03_11
  },
  {
    id: "2026-11-04",
    fechaISO: "2026-11-04",
    fechaEtiqueta: "MIÉRCOLES 04/11/2026",
    tienda: "91 - BK Fondo de la Legua",
    fechaImpresion: "30/10/26 11:20 (Demo editable)",
    version: "1",
    esDemo: true,
    horasTotalesPlanilla: 146,
    asignaciones: generarDiaDemo("miercoles")
  },
  {
    id: "2026-11-05",
    fechaISO: "2026-11-05",
    fechaEtiqueta: "JUEVES 05/11/2026",
    tienda: "91 - BK Fondo de la Legua",
    fechaImpresion: "30/10/26 19:40 (Demo editable)",
    version: "1",
    esDemo: true,
    horasTotalesPlanilla: 152,
    asignaciones: generarDiaDemo("jueves")
  },
  {
    id: "2026-10-20",
    fechaISO: "2026-10-20",
    fechaEtiqueta: "MARTES 20/10/2026",
    tienda: "91 - BK Fondo de la Legua",
    fechaImpresion: "17/10/26 10:15 (>7 días - Lista para auto-limpieza)",
    version: "1",
    esDemo: true,
    horasTotalesPlanilla: 148,
    asignaciones: generarDiaDemo("miercoles")
  }
];

// Historial inicial de quincenas consolidadas (de gráficas de semanas pasadas ya depuradas)
const HISTORIAL_QUINCENAS_INICIAL = {
  "2026-10-18": {
    fechaISO: "2026-10-18",
    fechaEtiqueta: "DOMINGO 18/10/2026",
    purgadoEn: "26/10/2026 (Auto-limpieza 7d)",
    registros: {
      "91149": { horas: 4, horaEntrada: "00:00", horaSalida: "04:00" },
      "91351": { horas: 4, horaEntrada: "00:00", horaSalida: "04:00" },
      "91372": { horas: 4.5, horaEntrada: "06:00", horaSalida: "10:30" }
    }
  },
  "2026-10-19": {
    fechaISO: "2026-10-19",
    fechaEtiqueta: "LUNES 19/10/2026",
    purgadoEn: "27/10/2026 (Auto-limpieza 7d)",
    registros: {
      "91149": { horas: 4.5, horaEntrada: "23:30", horaSalida: "04:00" },
      "91351": { horas: 4, horaEntrada: "00:00", horaSalida: "04:00" },
      "91372": { horas: 4.5, horaEntrada: "06:00", horaSalida: "10:30" }
    }
  }
};

// Claves de persistencia equivalentes al AbstractConPropertiesActivity.java original
const STORAGE_KEY_PLANILLAS = "mis_asignaciones_bk91_planillas_v2";
const STORAGE_KEY_HISTORIAL_QUINCENA = "mis_asignaciones_bk91_quincenas_v2";
const STORAGE_KEY_AUTO_PURGE = "mis_asignaciones_bk91_autopurge_7d";
const STORAGE_KEY_ULTIMO_LEGAJO = "KEY_ultimo_legajo";
const STORAGE_KEY_GEMINI_API_KEY = "mis_asignaciones_bk91_gemini_key";

const obtenerHoySinHora = () => {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
};

function calcularDiasDesdeFechaISO(fechaISO) {
  if (!fechaISO) return 0;
  const partes = fechaISO.split("-").map(Number);
  if (partes.length !== 3 || isNaN(partes[0])) return 0;
  const fechaPlanilla = new Date(partes[0], partes[1] - 1, partes[2]);
  const hoy = obtenerHoySinHora();
  const diffMs = hoy.getTime() - fechaPlanilla.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function obtenerClaveQuincena(fechaISO) {
  if (!fechaISO) return null;
  const [anioStr, mesStr, diaStr] = fechaISO.split("-");
  const anio = Number(anioStr);
  const mes = Number(mesStr);
  const dia = Number(diaStr);
  if (!anio || !mes || !dia) return null;

  const nombresMes = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const ultimoDiaMes = new Date(anio, mes, 0).getDate();
  const esPrimera = dia <= 15;
  const id = `${anio}-${String(mes).padStart(2, "0")}-${esPrimera ? "Q1" : "Q2"}`;
  const titulo = esPrimera
    ? `1° Quincena de ${nombresMes[mes - 1]} ${anio}`
    : `2° Quincena de ${nombresMes[mes - 1]} ${anio}`;
  const rango = esPrimera
    ? `Del 01/${String(mes).padStart(2, "0")} al 15/${String(mes).padStart(2, "0")}/${anio}`
    : `Del 16/${String(mes).padStart(2, "0")} al ${ultimoDiaMes}/${String(mes).padStart(2, "0")}/${anio}`;

  return { id, titulo, rango, esPrimera, anio, mes };
}

// ============================================================================
// UTILIDADES DE CÁLCULO DE HORAS Y SUPERPOSICIÓN DE TURNOS
// ============================================================================
function aMinutos(horaStr) {
  if (!horaStr || !horaStr.includes(":")) return null;
  const [h, m] = horaStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function obtenerIntervaloTurno(entradaStr, salidaStr) {
  const ent = aMinutos(entradaStr);
  const sal = aMinutos(salidaStr);
  if (ent === null || sal === null) return null;

  let inicio = ent;
  let fin = sal;

  // En estas gráficas de BK, "00:00" a "04:00" es la madrugada de cierre junto con los de "23:30" a "04:00"
  if (inicio === 0 && fin <= 360) {
    inicio = 24 * 60;
    fin = 24 * 60 + fin;
  } else if (fin <= inicio) {
    fin += 24 * 60;
  }
  return [inicio, fin];
}

function calcularDuracionHoras(entradaStr, salidaStr) {
  const intervalo = obtenerIntervaloTurno(entradaStr, salidaStr);
  if (!intervalo) return 0;
  const diffMin = intervalo[1] - intervalo[0];
  return Math.round((diffMin / 60) * 10) / 10;
}

function turnosCoinciden(entA, salA, entB, salB) {
  const intA = obtenerIntervaloTurno(entA, salA);
  const intB = obtenerIntervaloTurno(entB, salB);
  if (!intA || !intB) return false;
  return Math.max(intA[0], intB[0]) < Math.min(intA[1], intB[1]);
}

function clasificarFranja(entradaStr) {
  const min = aMinutos(entradaStr);
  if (min === null) return "franco";
  if (min === 0 || min >= 20 * 60) return "noche";
  if (min >= 12 * 60) return "tarde";
  return "manana";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function App() {
  //Detecta automáticamente si estás en tu PC (Admin) o si es la web pública de Vercel (Solo lectura)
  const esModoAdminLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.");

  const [planillas, setPlanillas] = useState(() => {
    // 1. Si es la web pública (Vercel), mostramos siempre lo último que publicaste en el archivo JSON
    if (!esModoAdminLocal && Array.isArray(datosPublicados?.planillas) && datosPublicados.planillas.length > 0) {
      return datosPublicados.planillas;
    }
    // 2. Si estás en tu PC (Admin), leemos lo que tenés cargado en tu navegador
    try {
      const guardado = localStorage.getItem(STORAGE_KEY_PLANILLAS);
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error leyendo planillas de localStorage:", e);
    }
    return Array.isArray(datosPublicados?.planillas) && datosPublicados.planillas.length > 0
      ? datosPublicados.planillas
      : PLANILLAS_INICIALES;
  });

  const [legajoActual, setLegajoActual] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ULTIMO_LEGAJO) || "91149";
    } catch {
      return "91149";
    }
  });

  const [historialQuincenas, setHistorialQuincenas] = useState(() => {
    // 1. En Vercel (público), usa el historial publicado en tu archivo JSON
    if (
      !esModoAdminLocal &&
      datosPublicados?.historialQuincenas &&
      Object.keys(datosPublicados.historialQuincenas).length > 0
    ) {
      return datosPublicados.historialQuincenas;
    }
    // 2. En tu PC (Admin), usa tu localStorage
    try {
      const guardado = localStorage.getItem(STORAGE_KEY_HISTORIAL_QUINCENA);
      if (guardado) {
        return JSON.parse(guardado);
      }
    } catch (e) {
      console.error("Error leyendo historial:", e);
    }
    return datosPublicados?.historialQuincenas || {};
  });

  // Función para descargar el archivo listo para subir a GitHub
  const exportarDatosParaVercel = () => {
    const paquete = {
      planillas,
      historialQuincenas
    };
    const blob = new Blob([JSON.stringify(paquete, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "horariosPublicados.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const [autoLimpiezaActiva, setAutoLimpiezaActiva] = useState(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEY_AUTO_PURGE);
      return val === null ? true : val === "true";
    } catch {
      return true;
    }
  });

  const [quincenaSeleccionadaId, setQuincenaSeleccionadaId] = useState("2026-11-Q1");
  const [mostrarDesgloseQuincena, setMostrarDesgloseQuincena] = useState(false);

  const [busquedaInput, setBusquedaInput] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState("mis-horarios");
  const [diaExpandido, setDiaExpandido] = useState("2026-11-03");
  const [copiadoExito, setCopiadoExito] = useState(false);
  const [mensajeToast, setMensajeToast] = useState(null);

  const [fechaGrillaSeleccionada, setFechaGrillaSeleccionada] = useState("2026-11-03");
  const [filtroGrillaEstado, setFiltroGrillaEstado] = useState("todos");
  const [busquedaEnGrilla, setBusquedaEnGrilla] = useState("");

  const [borradorPendiente, setBorradorPendiente] = useState(null);
  const [procesandoFotos, setProcesandoFotos] = useState(false);
  const [resultadosCargaIA, setResultadosCargaIA] = useState([]);
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GEMINI_API_KEY) || "";
    } catch {
      return "";
    }
  });
  const [mostrarConfigApi, setMostrarConfigApi] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLANILLAS, JSON.stringify(planillas));
    } catch (e) {
      console.error("No se pudo guardar en localStorage:", e);
    }
  }, [planillas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORIAL_QUINCENA, JSON.stringify(historialQuincenas));
    } catch (e) {
      console.error("No se pudo guardar historial quincenal:", e);
    }
  }, [historialQuincenas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUTO_PURGE, String(autoLimpiezaActiva));
    } catch (e) {
      console.error(e);
    }
  }, [autoLimpiezaActiva]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GEMINI_API_KEY, customApiKey);
    } catch (e) {
      console.error(e);
    }
  }, [customApiKey]);

  const mostrarNotificacion = (texto) => {
    setMensajeToast(texto);
    setTimeout(() => {
      setMensajeToast((actual) => (actual === texto ? null : actual));
    }, 3500);
  };

  const consolidarPlanillaEnHistorial = (planilla, motivo = "Auto-limpieza semanal (>7 días)") => {
    const registrosDia = {};
    planilla.asignaciones.forEach((asig) => {
      if (asig.trabaja === "Si") {
        const hs = calcularDuracionHoras(asig.horaEntrada, asig.horaSalida);
        if (hs > 0) {
          registrosDia[asig.legajo] = {
            horas: hs,
            horaEntrada: asig.horaEntrada,
            horaSalida: asig.horaSalida
          };
        }
      }
    });

    return {
      fechaISO: planilla.fechaISO,
      fechaEtiqueta: planilla.fechaEtiqueta,
      purgadoEn: motivo,
      registros: registrosDia
    };
  };

  const ejecutarLimpiezaSemanal = (silencioso = false) => {
    const vencidas = planillas.filter((p) => calcularDiasDesdeFechaISO(p.fechaISO) > 7);
    const vigentes = planillas.filter((p) => calcularDiasDesdeFechaISO(p.fechaISO) <= 7);

    if (vencidas.length === 0) {
      if (!silencioso) {
        mostrarNotificacion("No hay gráficas con más de 7 días para depurar.");
      }
      return;
    }

    if (vigentes.length === 0) {
      if (!silencioso) {
        mostrarNotificacion("Se conservó la última planilla para no dejar el sistema vacío.");
      }
      return;
    }

    setHistorialQuincenas((prev) => {
      const nuevoHistorial = { ...prev };
      vencidas.forEach((p) => {
        nuevoHistorial[p.fechaISO] = consolidarPlanillaEnHistorial(
          p,
          "Depurada automáticamente (>7 días)"
        );
      });
      return nuevoHistorial;
    });

    setPlanillas(vigentes);
    if (!vigentes.some((v) => v.id === fechaGrillaSeleccionada)) {
      setFechaGrillaSeleccionada(vigentes[0].id);
    }
    mostrarNotificacion(
      `🧹 ${vencidas.length} gráfica(s) >7 días borrada(s). ¡Horas guardadas en tu Quincena!`
    );
  };

  const seleccionarEmpleado = (legajo) => {
    setLegajoActual(legajo);
    setBusquedaInput("");
    setMostrarSugerencias(false);
    try {
      localStorage.setItem(STORAGE_KEY_ULTIMO_LEGAJO, legajo);
    } catch (e) {
      console.error(e);
    }
    mostrarNotificacion(`Legajo ${legajo} guardado en tu dispositivo`);
  };

  const padronEmpleados = useMemo(() => {
    const mapa = new Map();
    planillas.forEach((p) => {
      p.asignaciones.forEach((a) => {
        if (!mapa.has(a.legajo)) {
          mapa.set(a.legajo, { legajo: a.legajo, nombre: a.nombre });
        }
      });
    });
    return Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [planillas]);

  const sugerenciasFiltradas = useMemo(() => {
    const q = busquedaInput.trim().toLowerCase();
    if (!q) return padronEmpleados.slice(0, 10);
    return padronEmpleados.filter(
      (e) =>
        e.legajo.toLowerCase().includes(q) ||
        e.nombre.toLowerCase().includes(q)
    );
  }, [busquedaInput, padronEmpleados]);

  const respuestaEmpleado = useMemo(() => {
    const planillasOrdenadas = [...planillas].sort((a, b) =>
      a.fechaISO.localeCompare(b.fechaISO)
    );

    const empleadoInfo = padronEmpleados.find(
      (e) => e.legajo.toLowerCase() === legajoActual.toLowerCase()
    );

    const misTurnos = planillasOrdenadas.map((planilla) => {
      const fila = planilla.asignaciones.find(
        (a) => a.legajo.toLowerCase() === legajoActual.toLowerCase()
      );

      if (!fila) {
        return {
          idPlanilla: planilla.id,
          fecha: planilla.fechaEtiqueta,
          fechaISO: planilla.fechaISO,
          tienda: planilla.tienda,
          fechaImpresion: planilla.fechaImpresion,
          esDemo: planilla.esDemo,
          trabaja: "Sin asignar",
          horaEntrada: "-",
          horaSalida: "-",
          horasDuracion: 0,
          companeros: []
        };
      }

      const trabajaHoy = fila.trabaja === "Si";
      const horasDuracion = trabajaHoy
        ? calcularDuracionHoras(fila.horaEntrada, fila.horaSalida)
        : 0;

      const companeros = trabajaHoy
        ? planilla.asignaciones.filter(
            (otro) =>
              otro.legajo !== fila.legajo &&
              otro.trabaja === "Si" &&
              turnosCoinciden(
                fila.horaEntrada,
                fila.horaSalida,
                otro.horaEntrada,
                otro.horaSalida
              )
          )
        : [];

      return {
        idPlanilla: planilla.id,
        fecha: planilla.fechaEtiqueta,
        fechaISO: planilla.fechaISO,
        tienda: planilla.tienda,
        fechaImpresion: planilla.fechaImpresion,
        esDemo: planilla.esDemo,
        trabaja: fila.trabaja,
        horaEntrada: fila.horaEntrada,
        horaSalida: fila.horaSalida,
        horasDuracion,
        companeros
      };
    });

    const totalHoras = misTurnos.reduce((acc, item) => acc + item.horasDuracion, 0);
    const diasTrabajados = misTurnos.filter((t) => t.trabaja === "Si").length;
    const diasFranco = misTurnos.filter((t) => t.trabaja !== "Si").length;

    return {
      legajo: empleadoInfo ? empleadoInfo.legajo : legajoActual,
      nombre: empleadoInfo ? empleadoInfo.nombre : "EMPLEADO NO ENCONTRADO EN PADRÓN",
      tienda: planillasOrdenadas[0]?.tienda || "91 - BK Fondo de la Legua",
      fechaConsulta: new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      totalHoras,
      diasTrabajados,
      diasFranco,
      asignaciones: misTurnos
    };
  }, [planillas, legajoActual, padronEmpleados]);

  // ============================================================================
  // CÁLCULO DE HORAS POR QUINCENA (DEL 1 AL 15 Y DEL 16 A FIN DE MES)
  // ============================================================================
  const resumenQuincenasEmpleado = useMemo(() => {
    const mapaQuincenas = new Map();

    const registrarTurnoEnQuincena = (fechaISO, fechaEtiqueta, horaEntrada, horaSalida, horas, origen) => {
      const infoQ = obtenerClaveQuincena(fechaISO);
      if (!infoQ) return;

      if (!mapaQuincenas.has(infoQ.id)) {
        mapaQuincenas.set(infoQ.id, {
          ...infoQ,
          totalHoras: 0,
          diasTrabajados: 0,
          diasActivosCount: 0,
          diasArchivadosCount: 0,
          turnos: []
        });
      }

      const q = mapaQuincenas.get(infoQ.id);
      if (horas > 0) {
        q.totalHoras = Number((q.totalHoras + horas).toFixed(1));
        q.diasTrabajados += 1;
        if (origen === "activa") q.diasActivosCount += 1;
        if (origen === "archivada") q.diasArchivadosCount += 1;

        q.turnos.push({
          fechaISO,
          fechaEtiqueta,
          horaEntrada,
          horaSalida,
          horas,
          origen
        });
      }
    };

    const fechasActivasSet = new Set();
    planillas.forEach((p) => {
      fechasActivasSet.add(p.fechaISO);
      const infoQ = obtenerClaveQuincena(p.fechaISO);
      if (infoQ && !mapaQuincenas.has(infoQ.id)) {
        mapaQuincenas.set(infoQ.id, {
          ...infoQ,
          totalHoras: 0,
          diasTrabajados: 0,
          diasActivosCount: 0,
          diasArchivadosCount: 0,
          turnos: []
        });
      }

      const fila = p.asignaciones.find(
        (a) => a.legajo.toLowerCase() === legajoActual.toLowerCase()
      );
      if (fila && fila.trabaja === "Si") {
        const hs = calcularDuracionHoras(fila.horaEntrada, fila.horaSalida);
        registrarTurnoEnQuincena(
          p.fechaISO,
          p.fechaEtiqueta,
          fila.horaEntrada,
          fila.horaSalida,
          hs,
          "activa"
        );
      }
    });

    Object.values(historialQuincenas).forEach((itemArchivado) => {
      if (fechasActivasSet.has(itemArchivado.fechaISO)) return;
      const reg = itemArchivado.registros?.[legajoActual];
      const infoQ = obtenerClaveQuincena(itemArchivado.fechaISO);
      if (infoQ && !mapaQuincenas.has(infoQ.id)) {
        mapaQuincenas.set(infoQ.id, {
          ...infoQ,
          totalHoras: 0,
          diasTrabajados: 0,
          diasActivosCount: 0,
          diasArchivadosCount: 0,
          turnos: []
        });
      }
      if (reg && reg.horas > 0) {
        registrarTurnoEnQuincena(
          itemArchivado.fechaISO,
          itemArchivado.fechaEtiqueta,
          reg.horaEntrada,
          reg.horaSalida,
          reg.horas,
          "archivada"
        );
      }
    });

    const lista = Array.from(mapaQuincenas.values()).sort((a, b) =>
      b.id.localeCompare(a.id)
    );
    lista.forEach((q) => {
      q.turnos.sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));
    });
    return lista;
  }, [planillas, historialQuincenas, legajoActual]);

  const quincenaActivaObj = useMemo(() => {
    return (
      resumenQuincenasEmpleado.find((q) => q.id === quincenaSeleccionadaId) ||
      resumenQuincenasEmpleado[0] || {
        id: "2026-11-Q1",
        titulo: "1° Quincena de Noviembre 2026",
        rango: "Del 01/11 al 15/11/2026",
        totalHoras: 0,
        diasTrabajados: 0,
        diasActivosCount: 0,
        diasArchivadosCount: 0,
        turnos: []
      }
    );
  }, [resumenQuincenasEmpleado, quincenaSeleccionadaId]);

  const cantidadGraficasVencidas = useMemo(() => {
    return planillas.filter((p) => calcularDiasDesdeFechaISO(p.fechaISO) > 7).length;
  }, [planillas]);

  const pesoMemoriaKB = useMemo(() => {
    const str = JSON.stringify(planillas) + JSON.stringify(historialQuincenas);
    return Math.max(1, Math.round((str.length * 2) / 1024));
  }, [planillas, historialQuincenas]);

  const copiarMisHorarios = () => {
    const lineas = respuestaEmpleado.asignaciones.map((a) => {
      if (a.trabaja === "Si") {
        return `🟢 *${a.fecha}*: ${a.horaEntrada} a ${a.horaSalida} (${a.horasDuracion} hs)`;
      }
      return `⚪ *${a.fecha}*: ${a.trabaja === "Off" ? "FRANCO (Off)" : a.trabaja}`;
    });
    const texto = `🍔 *Mis Asignaciones — ${respuestaEmpleado.tienda}*\n👤 *${respuestaEmpleado.nombre}* (Legajo: ${respuestaEmpleado.legajo})\n\n${lineas.join("\n")}\n\n📊 *${quincenaActivaObj.titulo}:* ${quincenaActivaObj.totalHoras} hs acumuladas (${quincenaActivaObj.diasTrabajados} turnos).`;
    navigator.clipboard.writeText(texto);
    setCopiadoExito(true);
    mostrarNotificacion("¡Horarios y quincena copiados al portapapeles!");
    setTimeout(() => setCopiadoExito(false), 2500);
  };

  const eliminarPlanilla = (idPlanilla, guardarEnQuincena = true) => {
    if (planillas.length <= 1) {
      mostrarNotificacion("Debe quedar al menos 1 planilla activa en el sistema.");
      return;
    }
    const planillaABorrar = planillas.find((p) => p.id === idPlanilla);
    if (planillaABorrar && guardarEnQuincena) {
      setHistorialQuincenas((prev) => ({
        ...prev,
        [planillaABorrar.fechaISO]: consolidarPlanillaEnHistorial(
          planillaABorrar,
          "Gráfica depurada (Horas conservadas en Quincena)"
        )
      }));
    }

    const nuevas = planillas.filter((p) => p.id !== idPlanilla);
    setPlanillas(nuevas);
    if (fechaGrillaSeleccionada === idPlanilla && nuevas.length > 0) {
      setFechaGrillaSeleccionada(nuevas[0].id);
    }
    mostrarNotificacion(
      guardarEnQuincena
        ? "Gráfica borrada. Las horas trabajadas quedaron guardadas en la Quincena."
        : "Planilla eliminada completamente."
    );
  };

  const restaurarDatosFijos = () => {
    setPlanillas(PLANILLAS_INICIALES);
    setHistorialQuincenas(HISTORIAL_QUINCENAS_INICIAL);
    setFechaGrillaSeleccionada("2026-11-03");
    mostrarNotificacion("Datos originales y quincenas restaurados.");
  };

  // ============================================================================
  // PROCESAMIENTO DE FOTOS DE WHATSAPP CON GEMINI API (CON FILTRO ANTI-BASURA)
  // ============================================================================
  const manejarSubidaFotos = async (event) => {
    const archivos = Array.from(event.target.files || []);
    if (archivos.length === 0) return;

    setProcesandoFotos(true);
    const nuevosReportes = [];
    const apiKey = customApiKey.trim() || "";

    for (const file of archivos) {
      try {
        const base64Data = await fileToBase64(file);
        const promptSistema = `Analiza esta imagen enviada por un grupo de WhatsApp de trabajo.
Primero determina si la imagen es una planilla impresa de "Horarios" de Alsea / Burger King (suele tener arriba "Horarios", "Tienda:", "Fecha de Gráfica:" y una tabla con columnas "Legajo", "Nombre y Apellido", "Trabaja", "Entrada", "Salida").
Si es una foto de otra cosa (mercadería, comida, limpieza, personas, capturas que no son de horarios), devuelve exactamente esPlanillaHorarios: false y explica qué es en motivoDescarte.
Si SÍ es una planilla de horarios, extrae:
- fechaEtiqueta (ej. "JUEVES 05/11/2026")
- fechaISO en formato YYYY-MM-DD (ej. "2026-11-05")
- tienda (ej. "91 - BK Fondo de la Legua")
- fechaImpresion
- asignaciones: lista completa de todas las filas de empleados, tanto los que dicen "Si" en Trabaja como los que aparecen debajo con "Off" o "Licencia". Si no tiene hora de entrada/salida, pon "-".`;

        const claveActiva = (customApiKey || localStorage.getItem(STORAGE_KEY_GEMINI_API_KEY) || "").trim();
        console.log("Mi clave al enviar es:", claveActiva);

        if (!claveActiva) {
          throw new Error("La clave sigue vacía en el navegador. Tocá el botón 'Configurar API Key Local' arriba y volvé a pegarla.");
        }

        const cuerpoPeticion = JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: promptSistema },
                { inlineData: { mimeType: file.type || "image/jpeg", data: base64Data } }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                esPlanillaHorarios: { type: "BOOLEAN" },
                motivoDescarte: { type: "STRING" },
                fechaISO: { type: "STRING" },
                fechaEtiqueta: { type: "STRING" },
                tienda: { type: "STRING" },
                fechaImpresion: { type: "STRING" },
                asignaciones: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      legajo: { type: "STRING" },
                      nombre: { type: "STRING" },
                      trabaja: { type: "STRING" },
                      horaEntrada: { type: "STRING" },
                      horaSalida: { type: "STRING" }
                    },
                    required: ["legajo", "nombre", "trabaja", "horaEntrada", "horaSalida"]
                  }
                }
              },
              required: ["esPlanillaHorarios", "fechaISO", "fechaEtiqueta", "asignaciones"]
            }
          }
        });

        // 1. Obtenemos los modelos activos en tu cuenta, priorizando los Flash y Pro de visión
        let modelosDisponibles = [
          "gemini-2.5-flash",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
          "gemini-3.8-flash"
        ];

        try {
          const resLista = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${claveActiva}`
          );
          if (resLista.ok) {
            const dataLista = await resLista.json();
            const encontrados = (dataLista.models || [])
              .filter(
                (m) =>
                  m.supportedGenerationMethods?.includes("generateContent") &&
                  m.name.includes("gemini") &&
                  !m.name.includes("embedding") &&
                  !m.name.includes("imagen") &&
                  !m.name.includes("tts") &&
                  !m.name.includes("audio")
              )
              .map((m) => m.name.replace("models/", ""))
              // Dejamos los modelos "-lite" o "8b" para el final porque a veces devuelven 0 legajos en tablas grandes
              .sort((a, b) => {
                const peso = (nombre) => {
                  if (nombre.includes("lite") || nombre.includes("8b")) return 2;
                  if (nombre === "gemini-3.8-flash") return 1;
                  return 0;
                };
                return peso(a) - peso(b);
              });

            if (encontrados.length > 0) {
              modelosDisponibles = encontrados;
            }
          }
        } catch (e) {
          console.warn("Usando lista por defecto:", e);
        }

        // Pequeña pausa de 1.5 segs para no saturar la API al subir varias fotos juntas
        await new Promise((r) => setTimeout(r, 1500));

        let respuestaFetch = null;
        for (const modelo of modelosDisponibles) {
          console.log(`Intentando leer ${file.name} con:`, modelo);

          const controlador = new AbortController();
          const timer = setTimeout(() => controlador.abort(), 35000); // 35 segs máx para tablas de 48 filas

          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${claveActiva}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: cuerpoPeticion,
                signal: controlador.signal
              }
            );
            clearTimeout(timer);

            if (res.ok) {
              // Clonamos la respuesta para verificar que el JSON esté sano y tenga más de 0 legajos antes de aceptarla
              const clon = res.clone();
              const dataPrueba = await clon.json();
              const textoJson = dataPrueba?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
              const objetoPrueba = JSON.parse(textoJson);

              if (
                objetoPrueba.esPlanillaHorarios &&
                (!objetoPrueba.asignaciones || objetoPrueba.asignaciones.length === 0)
              ) {
                console.warn(`El modelo ${modelo} devolvió 0 legajos. Probando con el siguiente...`);
                continue;
              }

              // ¡JSON válido y con todos los legajos! Nos quedamos con esta respuesta
              respuestaFetch = res;
              break;
            }

            if ([429, 503, 404, 400].includes(res.status)) {
              console.warn(`Saltando ${modelo} por código HTTP ${res.status}`);
              continue;
            } else {
              respuestaFetch = res;
              break;
            }
          } catch (errIntento) {
            clearTimeout(timer);
            console.warn(`Fallo o JSON incompleto en ${modelo} (${errIntento.message}), probando el siguiente...`);
            continue;
          }
        }

        if (!respuestaFetch) {
          throw new Error("Ningún modelo disponible pudo extraer todos los legajos en este momento. Probá subir esta foto sola en unos segundos.");
        }

        const dataJson = await respuestaFetch.json();
        const textoRespuesta = dataJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        const resultado = JSON.parse(textoRespuesta);

        if (!resultado.esPlanillaHorarios) {
          nuevosReportes.push({
            archivo: file.name,
            estado: "descartada",
            mensaje:
              resultado.motivoDescarte ||
              "La imagen no es una gráfica de horarios (Foto del grupo ignorada)."
          });
        } else {
          const idFecha = resultado.fechaISO || `planilla-${Date.now()}`;
          const nuevaPlanilla = {
            id: idFecha,
            fechaISO: idFecha,
            fechaEtiqueta: (resultado.fechaEtiqueta || idFecha).toUpperCase(),
            tienda: resultado.tienda || "91 - BK Fondo de la Legua",
            fechaImpresion: resultado.fechaImpresion || "Extraída por IA",
            version: "1",
            esDemo: false,
            horasTotalesPlanilla: 150,
            asignaciones: Array.isArray(resultado.asignaciones)
              ? resultado.asignaciones
              : []
          };

          // Mandamos los datos al limbo (Borrador) en vez de guardarlos directo
          setBorradorPendiente({
            nuevaPlanilla: nuevaPlanilla,
            idFecha: idFecha,
            archivo: file
          });

          nuevosReportes.push({
            archivo: file.name,
            estado: "exito",
            fechaDetectada: nuevaPlanilla.fechaEtiqueta,
            cantidadEmpleados: nuevaPlanilla.asignaciones.length,
            mensaje: `Planilla del ${nuevaPlanilla.fechaEtiqueta} extraída (${nuevaPlanilla.asignaciones.length} legajos). La imagen pesada fue descartada de la memoria.`
          });
        }
      } catch (err) {
        console.error(err);
        nuevosReportes.push({
          archivo: file.name,
          estado: "error",
          mensaje: `Error real: ${err.message || err}`
        });
      }
    }

    setResultadosCargaIA((prev) => [...nuevosReportes, ...prev]);
    setProcesandoFotos(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const planillaGrillaActiva = useMemo(() => {
    return (
      planillas.find((p) => p.id === fechaGrillaSeleccionada) || planillas[0]
    );
  }, [planillas, fechaGrillaSeleccionada]);

  const filasGrillaFiltradas = useMemo(() => {
    if (!planillaGrillaActiva) return [];
    return planillaGrillaActiva.asignaciones.filter((item) => {
      const coincideTexto =
        !busquedaEnGrilla.trim() ||
        item.legajo.toLowerCase().includes(busquedaEnGrilla.toLowerCase()) ||
        item.nombre.toLowerCase().includes(busquedaEnGrilla.toLowerCase());

      if (!coincideTexto) return false;

      if (filtroGrillaEstado === "trabajan") return item.trabaja === "Si";
      if (filtroGrillaEstado === "francos") return item.trabaja !== "Si";
      if (filtroGrillaEstado === "manana")
        return item.trabaja === "Si" && clasificarFranja(item.horaEntrada) === "manana";
      if (filtroGrillaEstado === "tarde")
        return item.trabaja === "Si" && clasificarFranja(item.horaEntrada) === "tarde";
      if (filtroGrillaEstado === "noche")
        return item.trabaja === "Si" && clasificarFranja(item.horaEntrada) === "noche";
      return true;
    });
  }, [planillaGrillaActiva, filtroGrillaEstado, busquedaEnGrilla]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* NOTIFICACIÓN FLOTANTE (Equivalente al Toast de Android) */}
      {mensajeToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-amber-500 text-slate-950 font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm">{mensajeToast}</span>
        </div>
      )}

      {/* ENCABEZADO SUPERIOR */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-md shadow-orange-500/20 font-black text-white text-lg">
              BK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Mis Asignaciones
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Web v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Tienda 91 — BK Fondo de la Legua</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Cargado hasta:{" "}
              <strong className="text-white">
                {[...planillas].sort((a, b) => b.fechaISO.localeCompare(a.fechaISO))[0]?.fechaEtiqueta}
              </strong>
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto border-t border-slate-800/80 bg-slate-900/60">
          <button
            onClick={() => setPestanaActiva("mis-horarios")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              pestanaActiva === "mis-horarios"
                ? "border-amber-500 text-amber-400 bg-amber-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mis Horarios ({legajoActual})</span>
          </button>

          <button
            onClick={() => setPestanaActiva("grilla-dia")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              pestanaActiva === "grilla-dia"
                ? "border-amber-500 text-amber-400 bg-amber-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Planilla Completa (47)</span>
          </button>
        {esModoAdminLocal && (
          <button
            onClick={() => setPestanaActiva("cargar-ia")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              pestanaActiva === "cargar-ia"
                ? "border-amber-500 text-amber-400 bg-amber-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Subir Fotos de WhatsApp</span>
          </button>
        )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5 space-y-6">
        {/* ===================================================================
            PESTAÑA 1: MIS HORARIOS
           =================================================================== */}
        {pestanaActiva === "mis-horarios" && (
          <>
            {/* BUSCADOR DE LEGAJO O NOMBRE */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Consultar por Legajo o Apellido
                  </label>
                  <p className="text-xs text-slate-400">
                    Tu legajo queda guardado automáticamente en el celular igual que en la app original.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => seleccionarEmpleado("91149")}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      legajoActual === "91149"
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    91149 (Gian Higashi)
                  </button>
                  <button
                    onClick={() => seleccionarEmpleado("91351")}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      legajoActual === "91351"
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    91351 (Lola Irato)
                  </button>
                  <button
                    onClick={() => seleccionarEmpleado("43003")}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      legajoActual === "43003"
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    43003 (Camila Castillo)
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={busquedaInput}
                      onFocus={() => setMostrarSugerencias(true)}
                      onChange={(e) => {
                        setBusquedaInput(e.target.value);
                        setMostrarSugerencias(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && sugerenciasFiltradas.length > 0) {
                          seleccionarEmpleado(sugerenciasFiltradas[0].legajo);
                        }
                      }}
                      placeholder="Escribí tu legajo (ej: 91149) o tu nombre/apellido..."
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500"
                    />
                  </div>
                  {mostrarSugerencias && (
                    <button
                      onClick={() => setMostrarSugerencias(false)}
                      className="px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                    >
                      Cerrar
                    </button>
                  )}
                </div>

                {mostrarSugerencias && sugerenciasFiltradas.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-40 divide-y divide-slate-800">
                    {sugerenciasFiltradas.map((emp) => (
                      <button
                        key={emp.legajo}
                        onClick={() => seleccionarEmpleado(emp.legajo)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-800/90 flex items-center justify-between transition"
                      >
                        <span className="font-medium text-sm text-slate-100">
                          {emp.nombre}
                        </span>
                        <span className="text-xs font-mono bg-slate-800 border border-slate-700 text-amber-400 px-2 py-0.5 rounded-md">
                          Legajo #{emp.legajo}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* TARJETA DE RESUMEN DEL EMPLEADO */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950">
                      LEGAJO: {respuestaEmpleado.legajo}
                    </span>
                    <span className="text-xs text-slate-400">
                      • Consulta: {respuestaEmpleado.fechaConsulta}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                    {respuestaEmpleado.nombre}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {respuestaEmpleado.tienda}
                  </p>
                </div>

                <button
                  onClick={copiarMisHorarios}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition shrink-0"
                >
                  {copiadoExito ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado para WhatsApp!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Copiar mis horarios</span>
                    </>
                  )}
                </button>
              </div>

              {/* INDICADORES RÁPIDOS */}
              <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-800/90">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400 uppercase font-medium">
                    Días en Grilla
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">
                    {respuestaEmpleado.diasTrabajados}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      de {respuestaEmpleado.asignaciones.length}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400 uppercase font-medium">
                    Horas Semana
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-amber-400 mt-0.5">
                    {respuestaEmpleado.totalHoras} hs
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400 uppercase font-medium">
                    Francos / Off
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-sky-400 mt-0.5">
                    {respuestaEmpleado.diasFranco}
                  </div>
                </div>
              </div>
            </section>

            {/* CONTROL DE HORAS POR QUINCENA (1 AL 15 / 16 A FIN DE MES) */}
            <section className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-extrabold text-white">
                        Contador de Horas por Quincena
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Protegido ante borrado semanal
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Separa del 1 al 15 y del 16 a fin de mes (28/29/30/31) aunque se borren las fotos viejas
                    </p>
                  </div>
                </div>

                {/* SELECTOR DE QUINCENA */}
                <div className="flex flex-wrap gap-1.5">
                  {resumenQuincenasEmpleado.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setQuincenaSeleccionadaId(q.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        quincenaActivaObj.id === q.id
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {q.esPrimera ? "1° Quincena" : "2° Quincena"} ({q.id.slice(5, 7)}/{q.id.slice(2, 4)})
                    </button>
                  ))}
                </div>
              </div>

              {/* RESUMEN DE LA QUINCENA SELECCIONADA */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <CalendarRange className="w-3.5 h-3.5" />
                    {quincenaActivaObj.titulo}
                  </div>
                  <div className="text-xs text-slate-400">
                    Período de liquidación: <strong className="text-slate-200">{quincenaActivaObj.rango}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      🟢 {quincenaActivaObj.diasActivosCount} día(s) en planilla activa
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300">
                      📦 {quincenaActivaObj.diasArchivadosCount} día(s) de semanas ya depuradas
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      {quincenaActivaObj.totalHoras} hs
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      en {quincenaActivaObj.diasTrabajados} jornada(s) trabajadas
                    </div>
                  </div>
                  <button
                    onClick={() => setMostrarDesgloseQuincena(!mostrarDesgloseQuincena)}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 transition"
                  >
                    <span>Detalle</span>
                    {mostrarDesgloseQuincena ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {/* GRÁFICOS Y ESTIMACIÓN DE SUELDO QUINCENAL */}
              <EstadisticasEmpleado
                quincenaActivaObj={quincenaActivaObj}
                resumenQuincenasEmpleado={resumenQuincenasEmpleado}
              />
              {/* DESGLOSE DÍA POR DÍA DE LA QUINCENA */}
              {mostrarDesgloseQuincena && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-semibold text-slate-400 px-1">
                    Desglose de turnos contabilizados en {quincenaActivaObj.titulo}:
                  </div>
                  {quincenaActivaObj.turnos.length === 0 ? (
                    <div className="text-xs text-slate-500 bg-slate-950/50 rounded-xl p-3 border border-slate-800/60">
                      Todavía no hay turnos trabajados registrados para este legajo en esta quincena.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/80 bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
                      {quincenaActivaObj.turnos.map((t) => (
                        <div
                          key={t.fechaISO}
                          className="px-3.5 py-2.5 flex items-center justify-between text-xs"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white">{t.fechaEtiqueta}</span>
                            {t.origen === "archivada" ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                                <Archive className="w-3 h-3" /> Foto borrada (Horas guardadas)
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Planilla activa
                              </span>
                            )}
                          </div>
                          <div className="font-mono font-bold text-amber-300">
                            {t.horaEntrada} → {t.horaSalida} ({t.horas} hs)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* AVISO SI HAY GRÁFICAS DE MÁS DE 7 DÍAS LISTAS PARA AUTO-LIMPIEZA */}
            {cantidadGraficasVencidas > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 text-xs text-amber-200">
                  <Timer className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      Hay {cantidadGraficasVencidas} planilla(s) de hace más de 7 días.
                    </span>{" "}
                    Podés depurarlas ahora para que no se acumulen; las horas trabajadas pasarán intactas a tu historial de Quincena.
                  </div>
                </div>
                <button
                  onClick={() => ejecutarLimpiezaSemanal(false)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs shrink-0 transition"
                >
                  Limpiar &gt;7 días y guardar horas
                </button>
              </div>
            )}

            {/* LISTA DE ASIGNACIONES DÍA POR DÍA */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cronograma de Días Publicados
                </h3>
                <span className="text-xs text-slate-500">
                  Tocá un día para ver con quién trabajás
                </span>
              </div>

              {respuestaEmpleado.asignaciones.map((item) => {
                const trabaja = item.trabaja === "Si";
                const expandido = diaExpandido === item.idPlanilla;
                // --- CÁLCULO DE CHOQUE CON MATERIAS ---
                const materiasChocadas = [];
                const legajoActual = String(respuestaEmpleado.legajo).trim();
                const cursadaEmpleado = materias[legajoActual];

                if (trabaja && cursadaEmpleado && item.horaEntrada && item.horaSalida) {
                  const diaSemana = obtenerDiaSemana(item);
                  let tim = horaAMinutos(item.horaEntrada);
                  let tfm = horaAMinutos(item.horaSalida);

                  if (diaSemana !== null && tim !== null && tfm !== null) {
                    if (tim > tfm) tfm += 1440; // Parche trasnoche

                    for (let i = 0; i < cursadaEmpleado.length; i++) {
                      if (cursadaEmpleado[i].dia === diaSemana) {
                        let cim = horaAMinutos(cursadaEmpleado[i].inicio);
                        let cfm = horaAMinutos(cursadaEmpleado[i].fin);
                        if (cim > cfm) cfm += 1440;

                        if (!(tfm <= cim || cfm <= tim)) {
                          materiasChocadas.push(
                            `${cursadaEmpleado[i].materia} (${cursadaEmpleado[i].inicio} a ${cursadaEmpleado[i].fin})`
                          );
                        }
                      }
                    }
                  }
                }

                return (
                  <div
                    key={item.idPlanilla}
                    className={`rounded-2xl border transition overflow-hidden ${
                      trabaja
                        ? "bg-slate-900 border-emerald-500/30 shadow-lg shadow-emerald-950/10"
                        : "bg-slate-900/60 border-slate-800"
                    }`}
                  >
                  {materiasChocadas.length > 0 && (
                    <div className="bg-red-950/60 border-b border-red-500/40 px-4 py-2.5 text-xs text-red-200">
                      <div className="font-bold text-red-400 flex items-center gap-1.5">
                        <span>⚠️ ¡Choque con la Facultad!</span>
                      </div>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-red-300">
                        {materiasChocadas.map((choque, idx) => (
                          <li key={idx}>{choque}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                    <div
                      onClick={() =>
                        setDiaExpandido(expandido ? null : item.idPlanilla)
                      }
                      className="p-4 cursor-pointer hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                            trabaja
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {trabaja ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <Coffee className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-base text-white">
                              {item.fecha}
                            </span>
                            {item.esDemo ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Demo (Subí foto real para pisar)
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Planilla Oficial
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{item.tienda}</span>
                            <span>•</span>
                            <span>Impresa: {item.fechaImpresion}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-800/80 pt-2.5 sm:pt-0">
                        {trabaja ? (
                          <div className="text-left sm:text-right">
                            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                              {item.horaEntrada} → {item.horaSalida}
                            </div>
                            <div className="text-xs text-slate-400">
                              Jornada de {item.horasDuracion} hs •{" "}
                              <span className="text-amber-400 font-medium">
                                {item.companeros.length} en tu franja
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-left sm:text-right">
                            <span className="inline-block px-3 py-1 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold text-sm">
                              {item.trabaja === "Off"
                                ? "FRANCO (Off)"
                                : item.trabaja}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Sin horario asignado
                            </div>
                          </div>
                        )}

                        <div className="text-slate-500">
                          {expandido ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandido && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/50">
                        {trabaja ? (
                          <div>
                            <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
                              <UserCheck className="w-4 h-4 text-amber-400" />
                              <span>
                                Compañeros que coinciden con tu turno ({item.horaEntrada} a {item.horaSalida}):
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.companeros.map((comp) => (
                                <div
                                  key={comp.legajo}
                                  onClick={() => seleccionarEmpleado(comp.legajo)}
                                  className="cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs transition"
                                >
                                  <div className="truncate pr-2">
                                    <span className="font-semibold text-slate-200">
                                      {comp.nombre}
                                    </span>
                                    <span className="text-slate-500 ml-1.5 font-mono">
                                      #{comp.legajo}
                                    </span>
                                  </div>
                                  <span className="font-mono font-bold text-emerald-400 shrink-0">
                                    {comp.horaEntrada} - {comp.horaSalida}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-slate-400 py-1">
                            <span>
                              En esta fecha figurás como{" "}
                              <strong className="text-slate-200">{item.trabaja}</strong>.
                            </span>
                            <button
                              onClick={() => {
                                setFechaGrillaSeleccionada(item.idPlanilla);
                                setPestanaActiva("grilla-dia");
                              }}
                              className="text-amber-400 hover:underline font-medium"
                            >
                              Ver quiénes trabajan este día →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </>
        )}

        {/* ===================================================================
            PESTAÑA 2: PLANILLA COMPLETA DEL DÍA (LOS 47 EMPLEADOS)
           =================================================================== */}
        {pestanaActiva === "grilla-dia" && planillaGrillaActiva && (
          <section className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    Gráfica Completa del Local
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tocá cualquier empleado para fijar su legajo como predeterminado
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {planillas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFechaGrillaSeleccionada(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        planillaGrillaActiva.id === p.id
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {p.fechaEtiqueta}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busquedaEnGrilla}
                    onChange={(e) => setBusquedaEnGrilla(e.target.value)}
                    placeholder="Filtrar en esta planilla por nombre o legajo..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: "todos", label: "Todos" },
                    { id: "trabajan", label: "Trabajan (Si)" },
                    { id: "francos", label: "Francos (Off)" },
                    { id: "manana", label: "Mañana" },
                    { id: "tarde", label: "Tarde" },
                    { id: "noche", label: "Cierre / Noche" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFiltroGrillaEstado(f.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        filtroGrillaEstado === f.id
                          ? "bg-slate-200 text-slate-950"
                          : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Legajo</th>
                      <th className="py-3 px-4">Nombre y Apellido</th>
                      <th className="py-3 px-4">Trabaja</th>
                      <th className="py-3 px-4">Entrada</th>
                      <th className="py-3 px-4">Salida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filasGrillaFiltradas.map((fila) => {
                      const esMiLegajo = fila.legajo === legajoActual;
                      const trabaja = fila.trabaja === "Si";
                      return (
                        <tr
                          key={fila.legajo}
                          onClick={() => {
                            seleccionarEmpleado(fila.legajo);
                            setPestanaActiva("mis-horarios");
                          }}
                          className={`cursor-pointer transition ${
                            esMiLegajo
                              ? "bg-amber-500/15 hover:bg-amber-500/20"
                              : "hover:bg-slate-800/60"
                          }`}
                        >
                          <td className="py-2.5 px-4 font-mono font-bold text-amber-400">
                            {fila.legajo}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-white">
                            {fila.nombre}
                            {esMiLegajo && (
                              <span className="ml-2 text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                                VOS
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                trabaja
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {fila.trabaja}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-200">
                            {fila.horaEntrada}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-200">
                            {fila.horaSalida}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================
            PESTAÑA 3: SUBIR FOTOS DE WHATSAPP (LECTOR IA + AUTO-LIMPIEZA 7D)
           =================================================================== */}
        {esModoAdminLocal && pestanaActiva === "cargar-ia" && (
          <section className="space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white">
                      Lector Inteligente de Planillas de WhatsApp
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Seleccioná las fotos que mandaron al grupo de WhatsApp (incluso si están mezcladas con otras fotos del trabajo). El sistema detecta cuáles tienen el formato de <strong>Horarios BK</strong>, extrae la fecha y los 47 empleados, y las suma al cronograma.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
                <button
                  onClick={exportarDatosParaVercel}
                  className="text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition cursor-pointer"
                >
                  💾 Descargar JSON para Vercel
                </button>
                <button
                  onClick={() => setMostrarConfigApi(!mostrarConfigApi)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold"
                >
                  {customApiKey ? "🔑 API Key Local Activa" : "⚙️ Configurar API Key Local"}
                </button>
              </div>
              </div>

              {mostrarConfigApi && (
                <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="font-bold text-amber-300">
                    Clave para usar el lector de fotos fuera de este preview (Uso Local / Celular):
                  </div>
                  <p className="text-slate-400">
                    Si corrés la app en tu PC o celular, pegá acá tu clave gratuita de{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 underline font-semibold"
                    >
                      Google AI Studio (aistudio.google.com)
                    </a>
                    . Quedará guardada solo en tu navegador.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="Pegá tu API Key acá (AIzaSy...)"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                    />
                    <button
                      onClick={() => {
                        setMostrarConfigApi(false);
                        mostrarNotificacion("API Key guardada en tu navegador local.");
                      }}
                      className="bg-amber-500 text-slate-950 font-bold px-3 py-2 rounded-lg"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              <div
                onClick={() => !procesandoFotos && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                  procesandoFotos
                    ? "border-amber-500/50 bg-amber-500/5 cursor-wait"
                    : "border-slate-700 hover:border-amber-500 hover:bg-slate-800/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={manejarSubidaFotos}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                {procesandoFotos ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-300 animate-pulse">
                      Analizando foto(s) y extrayendo legajos...
                    </p>
                    <p className="text-xs text-slate-400">
                      Descartando fotos que no sean de horarios y armando la tabla...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">
                      Tocá acá para elegir fotos de las planillas (Miércoles 04/11, Jueves 05/11, etc.)
                    </p>
                    <p className="text-xs text-slate-400">
                      Podés subir 1 o varias fotos juntas directamente desde la galería de WhatsApp
                    </p>
                  </div>
                )}
              </div>
              {borradorPendiente && (
                <BorradorPlanilla 
                  imagenUrl={URL.createObjectURL(borradorPendiente.archivo)} 
                  datosExtraidosIA={borradorPendiente.nuevaPlanilla} 
                  alGuardar={(datosCorregidos) => {
                    // 1. Guardamos la planilla final corregida
                    setPlanillas((prev) => {
                      const existeIdx = prev.findIndex((p) => p.id === borradorPendiente.idFecha);
                      return existeIdx >= 0
                        ? prev.map((item, idx) => (idx === existeIdx ? datosCorregidos : item))
                        : [...prev, datosCorregidos];
                    });

                    // 2. Actualizamos la interfaz
                    const infoQ = obtenerClaveQuincena(borradorPendiente.idFecha);
                    if (infoQ) setQuincenaSeleccionadaId(infoQ.id);
                    setFechaGrillaSeleccionada(borradorPendiente.idFecha);
                    setDiaExpandido(borradorPendiente.idFecha);

                    // 3. Cerramos el borrador
                    setBorradorPendiente(null);
                  }} 
                />
              )}

              {resultadosCargaIA.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Resultado del análisis de imágenes
                  </h3>
                  {resultadosCargaIA.map((rep, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        rep.estado === "exito"
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                          : rep.estado === "descartada"
                          ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                          : "bg-red-950/40 border-red-500/40 text-red-200"
                      }`}
                    >
                      {rep.estado === "exito" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">{rep.archivo}</div>
                        <div className="opacity-90 mt-0.5">{rep.mensaje}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MOTOR DE AUTO-LIMPIEZA SEMANAL (7 DÍAS) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                      Auto-Limpieza Semanal de Gráficas e Imágenes
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        0 MB Fotos • {pesoMemoriaKB} KB Datos
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Las fotos se procesan en memoria y se descartan al instante. Las grillas de más de 7 días se borran solas luego de guardar las horas en el Contador por Quincena.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    onClick={() => setAutoLimpiezaActiva(!autoLimpiezaActiva)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      autoLimpiezaActiva
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {autoLimpiezaActiva ? "Auto-borrado 7d: ACTIVO" : "Auto-borrado 7d: PAUSADO"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Planillas activas en el teléfono ({planillas.length})
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => ejecutarLimpiezaSemanal(false)}
                    className="text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition"
                  >
                    <Archive className="w-3.5 h-3.5" /> Depurar &gt;7 días ahora ({cantidadGraficasVencidas})
                  </button>
                  <button
                    onClick={restaurarDatosFijos}
                    className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 px-2 py-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Restaurar demo
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-800">
                {planillas.map((p) => {
                  const diasAntiguedad = calcularDiasDesdeFechaISO(p.fechaISO);
                  const diasRestantes = 7 - diasAntiguedad;
                  const vencida = diasAntiguedad > 7;

                  return (
                    <div
                      key={p.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex flex-wrap items-center gap-2">
                          <span>{p.fechaEtiqueta}</span>
                          {p.esDemo ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                              Demo editable
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              Foto Real (Imagen descartada, solo texto)
                            </span>
                          )}
                          {vencida ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ⏱️ Hace {diasAntiguedad} días (Lista para auto-borrado)
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              ⏳ Se limpia en {Math.max(1, diasRestantes)} día(s)
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400">
                          {p.asignaciones.length} empleados • Impresa: {p.fechaImpresion}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => eliminarPlanilla(p.id, true)}
                          className="px-2.5 py-1.5 text-slate-300 hover:text-amber-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition flex items-center gap-1"
                          title="Borrar planilla conservando las horas en la Quincena"
                        >
                          <Archive className="w-3.5 h-3.5 text-amber-400" />
                          <span>Archivar y borrar</span>
                        </button>
                        <button
                          onClick={() => eliminarPlanilla(p.id, false)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                          title="Eliminar sin archivar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DÍAS YA DEPURADOS PERO CONSERVADOS EN EL HISTORIAL DE QUINCENAS */}
              {Object.keys(historialQuincenas).length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5" />
                    Semanas pasadas ya depuradas (Imágenes borradas, horas aseguradas en Quincena):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(historialQuincenas).map((h) => (
                      <div
                        key={h.fechaISO}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2"
                      >
                        <span className="font-semibold text-white">{h.fechaEtiqueta}</span>
                        <span className="text-sky-400">
                          ({Object.keys(h.registros || {}).length} turnos guardados)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}