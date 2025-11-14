// 138 modulo para reutilizacion de carga del front al actualizar estados
// DashGerente.jsx - Dashboard principal para el gerente
import { Bed, Info, KingBed, Villa } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CssBaseline,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FaHotel, FaStar, FaWineBottle } from "react-icons/fa";
import { FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  WiDaySunny,
  WiHumidity,
  WiRain,
  WiStrongWind,
  WiThermometer,
} from "react-icons/wi";
import "./dashgerente.css";

// -------------------- Componente principal --------------------
const DashGer = () => {
  // --------- Datos iniciales y estados ---------

  // Estados para la sección de mantenimiento de habitaciones
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [numeroSeleccionado, setNumeroSeleccionado] = useState("");
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);

  // Estados para filtros y búsqueda de tareas
  const [busquedaTarea, setBusquedaTarea] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [filtroOperario, setFiltroOperario] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("prioridad");
  const [ordenAscendente, setOrdenAscendente] = useState(true);

  // Datos hardcodeados
  const [gerente] = useState("Carlos Rodríguez");
  
  // Datos hardcodeados de habitaciones
  const [habitaciones] = useState([
    { id: 1, tipo: "matrimonial", numero: "101", estado: "libre" },
    { id: 2, tipo: "matrimonial", numero: "102", estado: "libre" },
    { id: 3, tipo: "ejecutiva", numero: "201", estado: "libre" },
    { id: 4, tipo: "ejecutiva", numero: "202", estado: "mantenimiento" },
    { id: 5, tipo: "glamping", numero: "301", estado: "libre" },
    { id: 6, tipo: "glamping", numero: "302", estado: "libre" }
  ]);

  // Datos hardcodeados de tareas
  const [tareas, setTareas] = useState([
    {
      id: 1,
      nombre: "Limpieza general habitación 101",
      fecha: "2024-01-15T12:00:00",
      operario: "María González",
      estado: "pendiente",
      prioridad: 2,
      trabajador_id: 1
    },
    {
      id: 2,
      nombre: "Reparación aire acondicionado",
      fecha: "2024-01-16T12:00:00",
      operario: "Juan Pérez",
      estado: "pendiente",
      prioridad: 1,
      trabajador_id: 2
    },
    {
      id: 3,
      nombre: "Revisión sistema eléctrico",
      fecha: "2024-01-14T12:00:00",
      operario: "Carlos López",
      estado: "hecho",
      prioridad: 3,
      trabajador_id: 3
    },
    {
      id: 4,
      nombre: "Mantenimiento piscina",
      fecha: "2024-01-17T12:00:00",
      operario: "Ana Martínez",
      estado: "pendiente",
      prioridad: 2,
      trabajador_id: 4
    }
  ]);

  // Datos hardcodeados de operarios
  const [operariosDisponibles] = useState([
    { id: 1, nombre: "María González" },
    { id: 2, nombre: "Juan Pérez" },
    { id: 3, nombre: "Carlos López" },
    { id: 4, nombre: "Ana Martínez" },
    { id: 5, nombre: "Laura Rodríguez" }
  ]);

  // Datos hardcodeados de ocupación
  const [datosOcupacion] = useState([
    {
      nombre: "Matrimonial",
      porcentaje: 85,
      color: "#76d100ff",
      icono: <KingBed />,
      descripcion: "Habitaciones dobles con cama king size",
      total: 10,
      ocupadas: 8
    },
    {
      nombre: "Ejecutiva",
      porcentaje: 60,
      color: "#FF9800",
      icono: <Bed />,
      descripcion: "Habitaciones para viajeros de negocios",
      total: 8,
      ocupadas: 5
    },
    {
      nombre: "Glamping",
      porcentaje: 95,
      color: "#4CAF50",
      icono: <Villa />,
      descripcion: "Experiencia única en la naturaleza",
      total: 6,
      ocupadas: 5
    }
  ]);

  // Datos hardcodeados de ventas de vinos
  const [datosVentasVinosTimeline] = useState([
    { mes: "Ene", Torrontes: 45, Malbec: 60, Blanco: 30, Trinita: 25, Arlene: 40, total: 200 },
    { mes: "Feb", Torrontes: 52, Malbec: 65, Blanco: 35, Trinita: 28, Arlene: 45, total: 225 },
    { mes: "Mar", Torrontes: 48, Malbec: 70, Blanco: 40, Trinita: 30, Arlene: 50, total: 238 },
    { mes: "Abr", Torrontes: 55, Malbec: 75, Blanco: 45, Trinita: 32, Arlene: 55, total: 262 },
    { mes: "May", Torrontes: 60, Malbec: 80, Blanco: 50, Trinita: 35, Arlene: 60, total: 285 },
    { mes: "Jun", Torrontes: 65, Malbec: 85, Blanco: 55, Trinita: 38, Arlene: 65, total: 308 }
  ]);

  // Satisfacción hardcodeada
  const [satisfaccion] = useState(88);

  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const tareasPorPagina = 8;

  // Estado para animaciones de progreso
  const [progresosAnimados, setProgresosAnimados] = useState({
    matrimonial: 0,
    ejecutiva: 0,
    glamping: 0,
  });

  // --------- Función para cargar tareas por operario ---------
  const cargarTareasPorOperario = (operarioId) => {
    if (operarioId === "todos") {
      // Si es "todos", recargar todas las tareas hardcodeadas
      setTareas([
        {
          id: 1,
          nombre: "Limpieza general habitación 101",
          fecha: "2024-01-15T12:00:00",
          operario: "María González",
          estado: "pendiente",
          prioridad: 2,
          trabajador_id: 1
        },
        {
          id: 2,
          nombre: "Reparación aire acondicionado",
          fecha: "2024-01-16T12:00:00",
          operario: "Juan Pérez",
          estado: "pendiente",
          prioridad: 1,
          trabajador_id: 2
        },
        {
          id: 3,
          nombre: "Revisión sistema eléctrico",
          fecha: "2024-01-14T12:00:00",
          operario: "Carlos López",
          estado: "hecho",
          prioridad: 3,
          trabajador_id: 3
        },
        {
          id: 4,
          nombre: "Mantenimiento piscina",
          fecha: "2024-01-17T12:00:00",
          operario: "Ana Martínez",
          estado: "pendiente",
          prioridad: 2,
          trabajador_id: 4
        }
      ]);
      return;
    }

    // Filtrar tareas por operario (simulación)
    const tareasFiltradas = tareas.filter(tarea => 
      tarea.trabajador_id.toString() === operarioId
    );
    
    setTareas(tareasFiltradas);
  };

  // Cambia el estado de una habitación
  const cambiarEstadoHabitacion = async (id, nuevoEstado) => {
    // Actualizar INMEDIATAMENTE el estado local (sin recargar página)
    const habitacionesActualizadas = habitaciones.map(hab => 
      hab.id === id ? { ...hab, estado: nuevoEstado } : hab
    );
    
    // En una implementación real, aquí iría la llamada a la API
    console.log(`Cambiando estado de habitación ${id} a ${nuevoEstado}`);
    
    return { id, estado: nuevoEstado };
  };

  // Libera una habitación en mantenimiento
  const liberarHabitacionMantenimiento = async (id) => {
    console.log("Liberando habitación:", id);

    // Actualizar INMEDIATAMENTE el estado local
    const habitacionesActualizadas = habitaciones.map(hab => 
      hab.id === id ? { ...hab, estado: "libre" } : hab
    );

    // En una implementación real, aquí iría la llamada a la API
    console.log(`Habitación ${id} liberada de mantenimiento`);
  };

  // Obtiene color y texto según estado de habitación
  const obtenerColorEstadoHabitacion = (estado) => {
    const colores = {
      libre: "#4CAF50",
      mantenimiento: "#FF9800",
      reservada: "#2196F3",
    };
    return colores[estado] || "#666";
  };

  const obtenerTextoEstadoHabitacion = (estado) => {
    const textos = {
      libre: "Libre",
      mantenimiento: "En Mantenimiento",
      reservada: "Reservada",
    };
    return textos[estado] || "Desconocido";
  };

  // Limpia selección de habitación
  const limpiarSeleccion = () => {
    setTipoSeleccionado("");
    setNumeroSeleccionado("");
    setHabitacionSeleccionada(null);
  };

  // Limpia filtros de tareas
  const limpiarFiltros = () => {
    setBusquedaTarea("");
    setFiltroEstado("todos");
    setFiltroPrioridad("todos");
    cargarTareasPorOperario("todos");
    setPaginaActual(1);
  };

  // Cambia el orden de la tabla de tareas
  const toggleOrden = (campo) => {
    if (ordenarPor === campo) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(campo);
      setOrdenAscendente(false);
    }
  };

  // Verifica si la fecha de la tarea es próxima (<=3 días)
  const esFechaProxima = (fecha) => {
    const hoy = new Date();
    const fechaTarea = new Date(fecha);
    const diferencia = fechaTarea.getTime() - hoy.getTime();
    const diasDiferencia = diferencia / (1000 * 3600 * 24);
    return diasDiferencia <= 3 && diasDiferencia >= 0;
  };

  // Marca una tarea como completada rápidamente
  const completarTareaRapido = async (id) => {
    // Guardar estado anterior por si hay error
    const tareaOriginal = tareas.find(t => t.id === id);
   
    // Actualizar INMEDIATAMENTE el estado local (frontend)
    setTareas(prevTareas => 
      prevTareas.map(tarea => 
        tarea.id === id ? { ...tarea, estado: 'hecho' } : tarea
      )
    );

    // En una implementación real, aquí iría la llamada a la API
    console.log(`Tarea ${id} marcada como completada`);
    
    return { id, estado: 'hecho' };
  };

  // --------- Filtrado y ordenamiento de tareas ---------
  const tareasFiltradas = useMemo(() => {
    let resultado = tareas.filter((tarea) => {
      // Filtro por búsqueda
      const coincideBusqueda = busquedaTarea
        ? tarea.nombre.toLowerCase().includes(busquedaTarea.toLowerCase()) ||
          tarea.operario.toLowerCase().includes(busquedaTarea.toLowerCase())
        : true;
      // Filtro por estado
      const coincideEstado =
        filtroEstado === "todos" || tarea.estado === filtroEstado;
      // Filtro por prioridad
      const coincidePrioridad =
        filtroPrioridad === "todos" || 
        (filtroPrioridad === "alta" && tarea.prioridad === 1) ||
        (filtroPrioridad === "media" && tarea.prioridad === 2) ||
        (filtroPrioridad === "baja" && tarea.prioridad === 3);

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincidePrioridad
      );
    });

    // Ordenar
    resultado.sort((a, b) => {
      let valorA, valorB;
      switch (ordenarPor) {
        case "prioridad":
          valorA = a.prioridad;
          valorB = b.prioridad;
          break;
        case "nombre":
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
          break;
        case "fecha":
          valorA = new Date(a.fecha);
          valorB = new Date(b.fecha);
          break;
        case "operario":
          valorA = a.operario.toLowerCase();
          valorB = b.operario.toLowerCase();
          break;
        default:
          return 0;
      }
      if (valorA < valorB) return ordenAscendente ? -1 : 1;
      if (valorA > valorB) return ordenAscendente ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [
    tareas,
    busquedaTarea,
    filtroEstado,
    filtroPrioridad,
    ordenarPor,
    ordenAscendente,
  ]);

  // Paginación de tareas filtradas
  const indiceUltimaTarea = paginaActual * tareasPorPagina;
  const indicePrimeraTarea = indiceUltimaTarea - tareasPorPagina;
  const tareasActuales = tareasFiltradas.slice(
    indicePrimeraTarea,
    indiceUltimaTarea
  );
  const totalPaginas = Math.ceil(tareasFiltradas.length / tareasPorPagina);

  // --------- Datos del clima ---------
  const [datosClima, setDatosClima] = useState(null);
  useEffect(() => {
    const fetchClima = async () => {
      try {
        // Simulación de datos del clima
        setDatosClima({
          temperatura: 25,
          sensacionReal: 27,
          humedad: 65,
          velocidadViento: 15,
          probabilidadLluvia: 10,
          lluvia: 0,
          humedadSuelo: 45,
        });
      } catch (error) {
        console.error("Error obteniendo clima:", error);
      }
    };
    fetchClima();
  }, []);

  // --------- Animación de progresos ---------
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgresosAnimados({
        matrimonial: 85,
        ejecutiva: 60,
        glamping: 95,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // --------- Utilidades para gráficos ---------
  const maxVentas = useMemo(() => {
    if (!datosVentasVinosTimeline || datosVentasVinosTimeline.length === 0) {
      return 100;
    }

    try {
      // Calcular el máximo entre todos los vinos y meses
      const todosLosValores = datosVentasVinosTimeline.flatMap(mes => [
        Number(mes.Torrontes) || 0,
        Number(mes.Malbec) || 0,
        Number(mes.Blanco) || 0,
        Number(mes.Trinita) || 0,
        Number(mes.Arlene) || 0
      ]);

      const max = Math.max(...todosLosValores);
      return max > 0 ? Math.ceil(max * 1.2) : 100;
    } catch (error) {
      console.error('Error calculando maxVentas:', error);
      return 100;
    }
  }, [datosVentasVinosTimeline]);

  // --------- CRUD de tareas ---------
  const agregarTarea = async (nuevaTarea) => {
    // Convertir prioridad de texto a número
    let prioridadNumerica = 2; // default media
    if (nuevaTarea.prioridad === "baja") {
      prioridadNumerica = 3;
    } else if (nuevaTarea.prioridad === "media") {
      prioridadNumerica = 2;
    } else if (nuevaTarea.prioridad === "alta") {
      prioridadNumerica = 1;
    }

    // Encontrar el nombre del operario
    const operario = operariosDisponibles.find(op => op.id.toString() === nuevaTarea.trabajador_id);

    const nuevaTareaConId = {
      id: Date.now(), // ID temporal
      nombre: nuevaTarea.nombre,
      fecha: nuevaTarea.fecha,
      prioridad: prioridadNumerica,
      estado: nuevaTarea.estado || 'pendiente',
      trabajador_id: nuevaTarea.trabajador_id,
      operario: operario ? operario.nombre : 'Sin asignar'
    };

    setTareas([...tareas, nuevaTareaConId]);
    return nuevaTareaConId;
  };

  const editarTarea = async (tareaActualizada) => {
    try {
      // Convertir prioridad de texto a número si es necesario
      let prioridadNumerica = tareaActualizada.prioridad;
      if (tareaActualizada.prioridad === "baja") {
        prioridadNumerica = 3;
      } else if (tareaActualizada.prioridad === "media") {
        prioridadNumerica = 2;
      } else if (tareaActualizada.prioridad === "alta") {
        prioridadNumerica = 1;
      }

      // Encontrar el nombre del operario
      const operario = operariosDisponibles.find(op => op.id.toString() === tareaActualizada.trabajador_id);

      const tareaActualizadaConOperario = {
        ...tareaActualizada,
        prioridad: prioridadNumerica,
        operario: operario ? operario.nombre : 'Sin asignar'
      };

      // Actualizar el estado local
      setTareas(
        tareas.map((t) => 
          t.id === tareaActualizadaConOperario.id ? tareaActualizadaConOperario : t
        )
      );

      return tareaActualizadaConOperario;

    } catch (error) {
      console.error('Error inesperado al actualizar tarea:', error);
      return null;
    }
  };

  const eliminarTarea = async (id) => {
    try {
      // Eliminar del estado local
      setTareas(tareas.filter((t) => t.id !== id));
      console.log(`Tarea ${id} eliminada`);
    } catch (error) {
      console.error('Error inesperado al eliminar tarea:', error);
    }
  };

  // --------- Diálogo de tareas ---------
  const abrirDialogo = (tarea = null) => {
    setTareaEditando(tarea);
    setDialogoAbierto(true);
  };

  const cerrarDialogo = () => {
    setDialogoAbierto(false);
    setTareaEditando(null);
  };

  // --------- Utilidades visuales ---------
  const obtenerColorPrioridad = (prioridad) => {
    switch (prioridad) {
      case 1:
        return "#F44336";
      case 2:
        return "#FF9800";
      case 3:
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  };

  const obtenerEstadoOcupacion = (porcentaje) => {
    if (porcentaje >= 80) return "Alta";
    if (porcentaje >= 50) return "Media";
    return "Baja";
  };

  const obtenerColorEstado = (porcentaje) => {
    if (porcentaje >= 80) return "#4CAF50";
    if (porcentaje >= 50) return "#FF9800";
    return "#F44336";
  };

  // --------- Animaciones framer-motion ---------
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  // --------- Componente: Formulario de tarea ---------
  const FormularioTarea = ({ tarea, onGuardar, onCancelar }) => {
    const [formData, setFormData] = useState(
      tarea || {
        nombre: "",
        fecha: "",
        trabajador_id: "",
        estado: "pendiente",
        prioridad: "media",
      }
    );
    const [errores, setErrores] = useState({});

    const validar = () => {
      const nuevosErrores = {};
      if (!formData.nombre.trim())
        nuevosErrores.nombre = "El nombre es obligatorio";
      if (!formData.fecha) nuevosErrores.fecha = "La fecha es obligatoria";
      if (!formData.trabajador_id)
        nuevosErrores.trabajador_id = "Debe seleccionar un operario";
      return nuevosErrores;
    };

    const manejarGuardar = () => {
      const nuevosErrores = validar();
      console.log("FormData:", formData);
      if (Object.keys(nuevosErrores).length > 0) {
        setErrores(nuevosErrores);
        return;
      }
      onGuardar(formData);
      onCancelar();
    };

    return (
      <div className="dialogo-overlay">
        <motion.div
          className="dialogo-contenido"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <h2 className="dialogo-titulo">
            {tarea ? "Editar Tarea" : "Agregar Nueva Tarea"}
          </h2>
          <div className="form-grid">
            {/* Nombre */}
            <div className="form-group">
              <label className="form-label">Nombre de la tarea</label>
              <input
                type="text"
                className="form-input"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
              {errores.nombre && (
                <span className="error">{errores.nombre}</span>
              )}
            </div>
            {/* Fecha */}
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-input"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
              />
              {errores.fecha && <span className="error">{errores.fecha}</span>}
            </div>
            {/* Operario */}
            <div className="form-group">
              <label className="form-label">Responsable encargado</label>
              <select
                className="form-select"
                value={formData.trabajador_id}
                onChange={(e) =>
                  setFormData({ ...formData, trabajador_id: e.target.value })
                }
              >
                <option value="">Seleccione un operario</option>
                {operariosDisponibles.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.nombre}
                  </option>
                ))}
              </select>
              {errores.trabajador_id && (
                <span className="error">{errores.trabajador_id}</span>
              )}
            </div>
            {/* Estado */}
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
              >
                <option value="pendiente">Pendiente</option>
                <option value="hecho">Hecho</option>
              </select>
            </div>
            {/* Prioridad */}
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select
                className="form-select"
                value={formData.prioridad}
                onChange={(e) =>
                  setFormData({ ...formData, prioridad: e.target.value })
                }
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
          <div className="dialogo-acciones">
            <button className="btn-cancelar" onClick={onCancelar}>
              Cancelar
            </button>
            <button className="btn-guardar" onClick={manejarGuardar}>
              {tarea ? "Actualizar" : "Agregar"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // --------- Componente: Ocupación de habitaciones ---------
  const OcupacionHabitaciones = () => (
    <motion.div className="metrica-card" variants={itemVariants}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FaHotel style={{ color: "#000000ff" }} />
          Ocupación de Habitaciones
        </Typography>
        <Tooltip title="Porcentaje de ocupación actual por tipo de habitación">
          <IconButton size="small">
            <Info sx={{ fontSize: 25, color: "#666" }} />
          </IconButton>
        </Tooltip>
      </Box>
      {/* Barras verticales por tipo de habitación */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
          height: 200,
          px: 2,
        }}
      >
        {datosOcupacion.map((habitacion, index) => (
          <motion.div
            key={habitacion.nombre}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              height: "100%",
            }}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ delay: index * 0.2 }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: "100%",
                  backgroundColor: "#c1c1c1ff",
                  borderRadius: "4px 4px 0 0",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  custom={habitacion.porcentaje}
                  variants={{
                    hidden: { height: 0 },
                    visible: (porcentaje) => ({
                      height: `${porcentaje}%`,
                      transition: {
                        duration: 1.5,
                        ease: "easeOut",
                        delay: index * 0.2,
                      },
                    }),
                  }}
                  initial="hidden"
                  animate="visible"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: habitacion.color,
                    borderRadius: "4px 4px 0 0",
                  }}
                />
              </Box>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.5 }}
                style={{ marginTop: 8 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 700,
                    color: obtenerColorEstado(habitacion.porcentaje),
                    textAlign: "center",
                  }}
                >
                  {habitacion.porcentaje}%
                </Typography>
              </motion.div>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mt: 1,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    color: habitacion.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: `${habitacion.color}20`,
                    mb: 1,
                  }}
                >
                  {habitacion.icono}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 600,
                    color: "#4a4a4aff",
                    fontSize: "1.5rem",
                  }}
                >
                  {habitacion.nombre}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#848484ff",
                    textAlign: "center",
                    fontSize: "1rem",
                    lineHeight: 1.2,
                    mt: 0.5,
                  }}
                >
                  {obtenerEstadoOcupacion(habitacion.porcentaje)}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>
      {/* Escala vertical */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: 2, px: 3 }}
      >
        <Typography variant="caption" sx={{ color: "#666" }}>
          0%
        </Typography>
        <Typography variant="caption" sx={{ color: "#666" }}>
          50%
        </Typography>
        <Typography variant="caption" sx={{ color: "#666" }}>
          100%
        </Typography>
      </Box>
      {/* Resumen general */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card
          sx={{
            mt: 2,
            backgroundColor: "rgba(255, 223, 185, 0.3)",
            border: "1px solid #e1dedeff",
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 500,
                color: "#060606",
                textAlign: "center",
              }}
            >
              Ocupación promedio:{" "}
              <span style={{ fontWeight: 700, color: "#3bae01ff" }}>
                {Math.round(
                  datosOcupacion.reduce(
                    (acc, curr) => acc + curr.porcentaje,
                    0
                  ) / datosOcupacion.length
                )}
                %
              </span>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // --------- Componente: Gráfica de ventas de vinos ---------
  const GraficaVentasVinos = () => {
    const alturaGrafica = 500;
    const anchoGrafica = 800;
    const padding = 30;
    const anchoPunto =
      (anchoGrafica - padding * 2) / (datosVentasVinosTimeline.length - 1);
    const calcularY = (valor) => {
      return alturaGrafica - padding - (valor / maxVentas) * (alturaGrafica - padding * 2);
    };
    const calcularX = (index) => padding + index * anchoPunto;
    const generarPath = (tipoVino) =>
      datosVentasVinosTimeline
        .map((dato, index) => {
          const x = calcularX(index);
          const y = calcularY(dato[tipoVino]);
          return `${index === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ");

    // Colores hardcodeados para vinos
    const coloresVinos = {
      Torrontes: "#FFDFB9",
      Malbec: "#D32F2F",
      Blanco: "#FFEB3B",
      Trinita: "#7B1FA2",
      Arlene: "#1976D2",
    };

    return (
      <motion.div className="metrica-card" variants={itemVariants}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 1000,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FaWineBottle style={{ color: "#7B1FA2" }} />
            Ventas de Vinos - Timeline
          </Typography>
          <Tooltip title="Evolución de ventas por tipo de vino en los últimos meses">
            <IconButton size="small">
              <Info sx={{ fontSize: 18, color: "#666" }} />
            </IconButton>
          </Tooltip>
        </Box>
        <svg
          width="100%"
          height={alturaGrafica}
          viewBox={`0 0 ${anchoGrafica} ${alturaGrafica}`}
        >
          {/* Cuadrícula */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = alturaGrafica - padding - r * (alturaGrafica - padding * 2);
            return (
              <line
                key={i}
                x1={padding}
                x2={anchoGrafica - padding}
                y1={y}
                y2={y}
                stroke="#eaeaea"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Ejes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={alturaGrafica - padding}
            stroke="#ccc"
            strokeWidth="1.5"
          />
          <line
            x1={padding}
            y1={alturaGrafica - padding}
            x2={anchoGrafica - padding}
            y2={alturaGrafica - padding}
            stroke="#ccc"
            strokeWidth="1.5"
          />
          
          {/* Paths de cada vino */}
          {Object.keys(coloresVinos).map((vino) => (
            <g key={vino}>
              <motion.path
                d={generarPath(vino)}
                stroke={coloresVinos[vino]}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
              {datosVentasVinosTimeline.map((dato, index) => (
                <circle
                  key={index}
                  cx={calcularX(index)}
                  cy={calcularY(dato[vino])}
                  r="4"
                  fill={coloresVinos[vino]}
                />
              ))}
            </g>
          ))}
          
          {/* Etiquetas Y */}
          {[0, 0.5, 1].map((r, i) => {
            const y = alturaGrafica - padding - r * (alturaGrafica - padding * 2);
            return (
              <text
                key={i}
                x={padding - 30}
                y={y + (i === 0 ? 15 : -5)}
                fontSize="10"
                fill="#666"
                fontFamily='"DM Sans", sans-serif'
                textAnchor="end"
              >
                {Math.round(r * maxVentas)}
              </text>
            );
          })}
          
          {/* Etiquetas X */}
          {datosVentasVinosTimeline.map((dato, i) => (
            <text
              key={i}
              x={calcularX(i)}
              y={alturaGrafica - padding + 20}
              fontSize="10"
              textAnchor="middle"
              fill="#666"
              fontFamily='"DM Sans", sans-serif'
            >
              {dato.mes}
            </text>
          ))}
        </svg>
      </motion.div>
    );
  };

  // --------- Render principal ---------
  return (
    <div className="dashboard-container">
      <CssBaseline />
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="dashboard-title">Dashboard - {gerente}</h1>
      </motion.div>
      <motion.div
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Sección izquierda: Tabla de tareas */}
        <div className="tareas-section">
          <div className="tareas-header">
            <h2 className="tareas-title">Gestión de Tareas</h2>
            <button className="btn-agregar" onClick={() => abrirDialogo()}>
              <FiPlus size={18} />
              Agregar Tarea
            </button>
          </div>
          {/* Filtros y buscador */}
          <div className="filtros-container">
            <div className="busqueda-wrapper">
              <input
                type="text"
                className="busqueda-input"
                placeholder="Buscar tarea o operario..."
                value={busquedaTarea}
                onChange={(e) => {
                  setBusquedaTarea(e.target.value);
                  setPaginaActual(1);
                }}
              />
              <span className="busqueda-icon">🔍</span>
            </div>
            <select
              className="filtro-select"
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="hecho">Completadas</option>
            </select>
            <select
              className="filtro-select"
              value={filtroPrioridad}
              onChange={(e) => {
                setFiltroPrioridad(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="todos">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <select
              className="filtro-select"
              value={filtroOperario}
              onChange={async (e) => {
                const nuevoOperario = e.target.value;
                setFiltroOperario(nuevoOperario);
                await cargarTareasPorOperario(nuevoOperario);
                setPaginaActual(1);
              }}
            >
              <option value="todos">Todos los operarios</option>
              {operariosDisponibles.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nombre}
                </option>
              ))}
            </select>
            {(busquedaTarea ||
              filtroEstado !== "todos" ||
              filtroPrioridad !== "todos" ||
              filtroOperario !== "todos") && (
              <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
                Limpiar Filtros
              </button>
            )}
          </div>
          {/* Info de resultados filtrados */}
          {tareasFiltradas.length !== tareas.length && (
            <div className="info-filtros">
              Mostrando {tareasActuales.length} de {tareasFiltradas.length}{" "}
              tareas
              {busquedaTarea && ` para "${busquedaTarea}"`}
            </div>
          )}
          {/* Tabla de tareas */}
          <div className="tabla-container">
            <table className="tabla-tareas">
              <thead>
                <tr>
                  <th>
                    <button
                      className="btn-ordenar"
                      onClick={() => toggleOrden("prioridad")}
                    >
                      Prioridad{" "}
                      {ordenarPor === "prioridad" &&
                        (ordenAscendente ? "↑" : "↓")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="btn-ordenar"
                      onClick={() => toggleOrden("nombre")}
                    >
                      Tarea{" "}
                      {ordenarPor === "nombre" && (ordenAscendente ? "↑" : "↓")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="btn-ordenar"
                      onClick={() => toggleOrden("fecha")}
                    >
                      Fecha{" "}
                      {ordenarPor === "fecha" && (ordenAscendente ? "↑" : "↓")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="btn-ordenar"
                      onClick={() => toggleOrden("operario")}
                    >
                      Operario{" "}
                      {ordenarPor === "operario" &&
                        (ordenAscendente ? "↑" : "↓")}
                    </button>
                  </th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {tareasActuales.map((tarea) => (
                    <motion.tr
                      key={tarea.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td>
                        <motion.div
                          className={`prioridad-indicator prioridad-${tarea.prioridad}`}
                          style={{
                            backgroundColor: obtenerColorPrioridad(tarea.prioridad)
                          }}
                          variants={pulseVariants}
                          animate="pulse"
                        />
                      </td>
                      <td>
                        <div className="tarea-nombre">
                          {tarea.nombre}
                          {tarea.prioridad === 1 && (
                            <span className="badge-urgente">URGENTE</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="fecha-tarea">
                          {new Date(tarea.fecha).toLocaleDateString()}
                          {esFechaProxima(tarea.fecha) && (
                            <span className="badge-proxima">PRÓXIMA</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="operario-info">
                          <span className="avatar-operario">
                            {tarea.operario.charAt(0)}
                          </span>
                          {tarea.operario}
                        </div>
                      </td>
                      <td>
                        <span className={`estado-chip estado-${tarea.estado}`}>
                          {tarea.estado === "hecho" ? (
                            <>
                              <span className="check-icon">✓</span>
                              Completada
                            </>
                          ) : (
                            <>
                              <span className="clock-icon">⏰</span>
                              Pendiente
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="acciones-grupo">
                          {tarea.estado !== "hecho" && (
                            <button
                              className="btn-accion btn-completar"
                              onClick={() => completarTareaRapido(tarea.id)}
                              title="Marcar como completada"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            className="btn-accion btn-editar"
                            onClick={() => abrirDialogo(tarea)}
                            title="Editar tarea"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            className="btn-accion btn-eliminar"
                            onClick={() => eliminarTarea(tarea.id)}
                            title="Eliminar tarea"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {tareasActuales.length === 0 && (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td colSpan="6" className="sin-resultados">
                      <div className="sin-resultados-content">
                        <span className="sin-resultados-icon">🔍</span>
                        <p>No se encontraron tareas</p>
                        <small>Intenta ajustar los filtros de búsqueda</small>
                        {(busquedaTarea ||
                          filtroEstado !== "todos" ||
                          filtroPrioridad !== "todos" ||
                          filtroOperario !== "todos") && (
                          <button
                            className="btn-limpiar-filtros-inline"
                            onClick={limpiarFiltros}
                          >
                            Limpiar todos los filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )}
              </tbody>
            </table>
            
            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="paginacion">
                <button
                  className="btn-pagina btn-pagina-anterior"
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  ← Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let pagina;
                  if (totalPaginas <= 5) {
                    pagina = i + 1;
                  } else if (paginaActual <= 3) {
                    pagina = i + 1;
                  } else if (paginaActual >= totalPaginas - 2) {
                    pagina = totalPaginas - 4 + i;
                  } else {
                    pagina = paginaActual - 2 + i;
                  }
                  return (
                    <button
                      key={pagina}
                      className={`btn-pagina ${
                        pagina === paginaActual ? "active" : ""
                      }`}
                      onClick={() => setPaginaActual(pagina)}
                    >
                      {pagina}
                    </button>
                  );
                })}
                <button
                  className="btn-pagina btn-pagina-siguiente"
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente →
                </button>
                <div className="info-paginacion">
                  Página {paginaActual} de {totalPaginas}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Sección derecha: Métricas */}
        <div className="metricas-section">
          {/* Condiciones Climáticas */}
          <motion.div className="metrica-card" variants={itemVariants}>
            <h3 className="metrica-title">
              <WiDaySunny size={22} style={{ color: "#fbc02d" }} />
              Condiciones Climáticas
            </h3>
            {!datosClima ? (
              <p>Cargando clima...</p>
            ) : (
              <>
                <div className="clima-grid">
                  <div className="clima-item">
                    <WiThermometer size={28} style={{ color: "#ef5350" }} />
                    <div className="clima-valor">
                      {datosClima.temperatura}°C
                    </div>
                    <div className="clima-label">Temperatura</div>
                  </div>
                  <div className="clima-item">
                    <span>🔥</span>
                    <div className="clima-valor">
                      {datosClima.sensacionReal}°C
                    </div>
                    <div className="clima-label">Sensación Real</div>
                  </div>
                </div>
                <div className="clima-detalles">
                  <div className="clima-detalle">
                    <WiDaySunny size={20} style={{ color: "#fdd835" }} />
                    UV: {datosClima.indiceUV}
                  </div>
                  <div className="clima-detalle">
                    <WiStrongWind size={20} style={{ color: "#64b5f6" }} />
                    Viento: {datosClima.velocidadViento} km/h
                  </div>
                  <div className="clima-detalle">
                    <WiHumidity size={20} style={{ color: "#4fc3f7" }} />
                    Humedad: {datosClima.humedad}%
                  </div>
                  <div className="clima-detalle">
                    <WiRain size={20} style={{ color: "#4db6ac" }} />
                    Lluvia: {datosClima.probabilidadLluvia}%
                  </div>
                </div>
              </>
            )}
          </motion.div>
          {/* Ocupación de Habitaciones */}
          <OcupacionHabitaciones />
          {/* Satisfacción Clientes */}
          <motion.div className="metrica-card" variants={itemVariants}>
            <h3 className="metrica-title">
              <FaStar size={18} style={{ color: "#FFD700" }} />
              Satisfacción Clientes
            </h3>
            <div className="satisfaccion-container">
              <div className="satisfaccion-valor">{satisfaccion}%</div>
              <div className="satisfaccion-label">Clientes Satisfechos</div>
            </div>
          </motion.div>
          {/* Ventas de Vinos */}
          <GraficaVentasVinos />
        </div>
      </motion.div>
      {/* Sección de mantenimiento de habitaciones */}
      <motion.div
        className="mantenimiento-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="metrica-card">
          <div className="section-header">
            <h2 className="section-title">Gestión de Habitaciones</h2>
            <span className="info-icon">ℹ️</span>
          </div>
          {/* Alerta de habitaciones en mantenimiento */}
          {habitaciones.filter(h => h.estado === "mantenimiento").length > 0 && (
            <div className="alerta alerta-warning">
              <span>⚠️</span>
              <span>
                {habitaciones.filter(h => h.estado === "mantenimiento").length} habitación(es) en
                mantenimiento
              </span>
            </div>
          )}
          {/* Lista de habitaciones en mantenimiento */}
          {habitaciones.filter(h => h.estado === "mantenimiento").length > 0 && (
            <div className="subseccion">
              <h3 className="subseccion-titulo">
                Habitaciones en Mantenimiento
              </h3>
              <div className="lista-mantenimiento">
                {habitaciones.filter(h => h.estado === "mantenimiento").map((hab) => (
                  <div key={hab.id} className="card-mantenimiento">
                    <div className="card-mantenimiento-info">
                      <h4>
                        {hab.tipo.toUpperCase()} - {hab.numero}
                      </h4>
                      <p>En mantenimiento</p>
                    </div>
                    <button
                      className="btn-liberar-mantenimiento"
                      onClick={() => liberarHabitacionMantenimiento(hab.id)}
                    >
                      Liberar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Selección de habitación */}
          <div className="subseccion">
            <h3 className="subseccion-titulo">Cambiar Estado de Habitación</h3>
          </div>
          <div className="selects-container">
            <select
              className="form-select"
              value={tipoSeleccionado || ""}
              onChange={(e) => {
                setTipoSeleccionado(e.target.value);
                setNumeroSeleccionado("");
                setHabitacionSeleccionada(null);
              }}
            >
              <option value="">Tipo de habitación</option>
              {[...new Set(habitaciones.map((h) => h.tipo))].map((tipo,id) => (
                <option key={`tipo-${id}`} value={tipo}>
                  {tipo.toUpperCase()}
                </option>
              ))}
            </select>
            {tipoSeleccionado && (
              <select
                className="form-select"
                value={numeroSeleccionado || ""}
                onChange={(e) => {
                  setNumeroSeleccionado(e.target.value);
                  const hab = habitaciones.find(
                    (h) =>
                      h.tipo === tipoSeleccionado && h.numero === e.target.value
                  );
                  setHabitacionSeleccionada(hab);
                }}
              >
                <option value="">Número</option>
                {habitaciones
                  .filter((h) => h.tipo === tipoSeleccionado && h.estado ==="libre")
                  .map((h) => (
                    <option key={h.id} value={h.numero}>
                      {h.numero}
                    </option>
                  ))}
              </select>
            )}
          </div>
          {/* Habitación seleccionada */}
          {habitacionSeleccionada && (
            <div className="habitacion-card">
              <h3 className="habitacion-titulo">
                {habitacionSeleccionada.tipo.toUpperCase()} -{" "}
                {habitacionSeleccionada.numero}
              </h3>
              <span
                className="chip-estado"
                style={{
                  backgroundColor: obtenerColorEstadoHabitacion(
                    habitacionSeleccionada.estado
                  ),
                }}
              >
                {obtenerTextoEstadoHabitacion(habitacionSeleccionada.estado)}
              </span>
              <div className="habitacion-acciones">
                {habitacionSeleccionada.estado !== "reservada" && (
                  <button
                    className="btn-estado"
                    onClick={() =>
                      cambiarEstadoHabitacion(
                        habitacionSeleccionada.id,
                        habitacionSeleccionada.estado === "libre"
                          ? "mantenimiento"
                          : "libre"
                      )
                    }
                  >
                    Cambiar a{" "}
                    {habitacionSeleccionada.estado === "libre"
                      ? "Mantenimiento"
                      : "Libre"}
                  </button>
                )}
                <button className="btn-liberar" onClick={limpiarSeleccion}>
                  Limpiar Selección
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      {/* Diálogo para agregar/editar tareas */}
      <AnimatePresence>
        {dialogoAbierto && (
          <FormularioTarea
            tarea={tareaEditando}
            onGuardar={tareaEditando ? editarTarea : agregarTarea}
            onCancelar={cerrarDialogo}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashGer;