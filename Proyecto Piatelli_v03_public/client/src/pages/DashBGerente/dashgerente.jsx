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

import { supabase } from "../../supabase/client";

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

  // BD
  const [habitaciones, setHabitaciones]= useState([])
  const [gerente] = useState("Carlos Rodríguez");
  const [tareas, setTareas] = useState([]);
  const [operariosDisponibles, setOperariosDisponibles] = useState([]);
  const [datosOcupacion, setDatosOcupacion] = useState([]);
  const [datosVentasVinosTimeline, setDatosVentasVinosTimeline] = useState([]);
  const [satisfaccion, setSatisfaccion] = useState(88);

  // BD

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


  // PETICIONES A LA BD


  const fecthHabitaciones = async () => {
    const {data, error} = await supabase
    .from("habitaciones")
    .select("habitacion_id,numero_habitacion,tipo_habitacion,estado")
    .in('estado', ['libre', 'mantenimiento'])

    if(error) {
      console.error("Error al traer datos de habitaciones", error)
    }else{
      //mapeo de datos
      const habitaciones = data.map(habitacion => ({
        id: habitacion.habitacion_id,
        tipo: habitacion.tipo_habitacion,
        numero: habitacion.numero_habitacion,
        estado: habitacion.estado
      }));
      setHabitaciones(habitaciones)
    }
  }

  const fetchTareas = async () =>{
    const {data,error} = await supabase
    .from("tareas")
    .select(`
      tarea_id,
      prioridad,
      nombre_tarea,
      fecha_tarea,
      estado,
      trabajador_id,
      profiles!inner(nom_perfil)`)
  
    if(error){
      console.log("Error al traer datos de la tabla TAREAS")
    }else{
      const tareas = data.map(tarea => ({
        id: tarea.tarea_id,
        nombre: tarea.nombre_tarea,
        fecha: tarea.fecha_tarea + 'T12:00:00',
        operario: tarea.profiles.nom_perfil,
        estado: tarea.estado,
        prioridad: tarea.prioridad,
      }));
      setTareas(tareas)
    }

  }

  const fetchOperarios = async () =>{
    const {data,error} = await supabase
    .from('profiles')
    .select(`
      trabajador_id,
      nom_perfil
      `)
    if(error){
      console.error('Error al traer datos de operarios: ', error)
    }else{ //mapeo
        const operariosDisponibles = data.map(operario => ({
        id: operario.trabajador_id,
        nombre: operario.nom_perfil
      }));
      setOperariosDisponibles(operariosDisponibles)
    }
  } 


  // --------- Función para cargar tareas por operario ---------
  const cargarTareasPorOperario = async (operarioId) => {
    if (operarioId === "todos") {
      // Si es "todos", recargar todas las tareas
      await fetchTareas();
      return;
    }

    // Hacer consulta a BD para traer solo tareas de ese operario
    const { data, error } = await supabase
      .from("tareas")
      .select(`
        tarea_id,
        prioridad,
        nombre_tarea,
        fecha_tarea,
        estado,
        trabajador_id,
        profiles!inner(nom_perfil)
      `)
      .eq('trabajador_id', operarioId); // ← FILTRAR EN LA BD

    if (error) {
      console.log("Error al traer tareas por operario", error);
      return;
    }

    // Mapear los datos
    const tareasFiltradas = data.map(tarea => ({
      id: tarea.tarea_id,
      nombre: tarea.nombre_tarea,
      fecha: tarea.fecha_tarea,
      operario: tarea.profiles.nom_perfil,
      estado: tarea.estado,
      prioridad: tarea.prioridad,
      trabajador_id: tarea.trabajador_id
    }));

    // Actualizar el estado de tareas con solo las del operario seleccionado
    setTareas(tareasFiltradas);
  };

  const fetchDatosOcupacion = async ()=>{ // llamar fucnion en factura.
    const {data,error}= await supabase
    .from("habitaciones")
    .select(`
      tipo_habitacion,
      estado
      `)

    if (error) {
    console.error('Error al traer datos de ocupación:', error);
    return [];}
      // Procesar los datos para calcular porcentajes
      
    const habitacionesPorTipo = {};
        
    data.forEach(habitacion => {
      const tipo = habitacion.tipo_habitacion;
      
      if (!habitacionesPorTipo[tipo]) {
        habitacionesPorTipo[tipo] = {
          total: 0,
          ocupadas: 0
        };
      }
      
      habitacionesPorTipo[tipo].total++;
      if (habitacion.estado === 'ocupada') {
        habitacionesPorTipo[tipo].ocupadas++;
      }
    });
  
    // Mapear a la estructura que necesitas
    const datosOcupacion = Object.keys(habitacionesPorTipo).map(tipo => {
      const datos = habitacionesPorTipo[tipo];
      const porcentaje = Math.round((datos.ocupadas / datos.total) * 100);
      
      // Determinar icono según tipo de habitación
      let icono;
      switch(tipo.toLowerCase()) {
        case 'matrimonial':
          icono = <KingBed />;
          break;
        case 'ejecutiva':
          icono = <Bed />;
          break;
        case 'glamping':
          icono = <Villa />;
          break;
        default:
          icono = <Bed />;
      }
    
      // Determinar descripción según tipo
      let descripcion;
      switch(tipo.toLowerCase()) {
        case 'matrimonial':
          descripcion = "Habitaciones dobles con cama king size";
          break;
        case 'ejecutiva':
          descripcion = "Habitaciones para viajeros de negocios";
          break;
        case 'glamping':
          descripcion = "Experiencia única en la naturaleza";
          break;
        default:
          descripcion = `Habitaciones tipo ${tipo}`;
      }
    
      return {
        nombre: tipo,
        porcentaje: porcentaje,
        color: "#76d100ff",
        icono: icono,
        descripcion: descripcion,
        total: datos.total,
        ocupadas: datos.ocupadas
      };
    });
  
    return datosOcupacion;
  };
  
  const fetchVentasVinosTimeline = async () => {
    try {
      // Consulta para obtener ventas agrupadas por mes y tipo de vino
      const { data, error } = await supabase
        .from('ventas_vino')
        .select(`
          cantidad_venta,
          fecha_venta_vino,
          vinos!inner(
            nombre_vino
          )
        `)
        .order('fecha_venta_vino', { ascending: true });

      if (error) {
        console.error('Error al traer datos de ventas de vinos:', error);
        return [];
      }


      // Procesar los datos para agrupar por mes
      const ventasPorMes = {};

      data.forEach(venta => {
      const fecha = new Date(venta.fecha_venta_vino);
      const mesKey = fecha.toLocaleDateString('es-ES', { month: 'short' });
      const mesNombre = mesKey.charAt(0).toUpperCase() + mesKey.slice(1);
      const vino = venta.vinos.nombre_vino;
      const cantidad = venta.cantidad_venta;

      // Mapeo CORREGIDO de nombres de vinos
      let vinoMapeado;
      if (vino.toLowerCase().includes('torrontés') || vino.toLowerCase().includes('torront')) {
        vinoMapeado = 'Torrontes';
      } else if (vino.toLowerCase().includes('malbec')) {
        vinoMapeado = 'Malbec';
      } else if (vino.toLowerCase().includes('blanco') || vino.toLowerCase().includes('natural')) {
        vinoMapeado = 'Blanco';
      } else if (vino.toLowerCase().includes('trinita')) {
        vinoMapeado = 'Trinita';
      } else if (vino.toLowerCase().includes('arlene')) {
        vinoMapeado = 'Arlene';
      } else {
        vinoMapeado = vino; // Por si hay otros vinos
      }

      if (!ventasPorMes[mesNombre]) {
        // Inicializar con CEROS para todos los vinos
        ventasPorMes[mesNombre] = {
          mes: mesNombre,
          Torrontes: 0,
          Malbec: 0,
          Blanco: 0,
          Trinita: 0,
          Arlene: 0,
          total: 0
        };
      }

      // Sumar la cantidad al vino correspondiente - CORREGIDO
      if (ventasPorMes[mesNombre].hasOwnProperty(vinoMapeado)) {
        ventasPorMes[mesNombre][vinoMapeado] += cantidad;
      }

      ventasPorMes[mesNombre].total += cantidad;
    });

    // Convertir el objeto a array
    const datosVentas = Object.values(ventasPorMes);

    // Ordenar los meses cronológicamente
    const ordenMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    datosVentas.sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));

    return datosVentas;

    } catch (error) {
      console.error('Error inesperado en fetchVentasVinosTimeline:', error);
      return [];
    }
  };

  const fetchSatisfaccionClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('valoraciones')
        .select('c_satisfecho')
        .then(result => {
          if (result.error) throw result.error;
          
          const valoraciones = result.data;
          const total = valoraciones.length;
          const satisfechos = valoraciones.filter(v => 
            v.c_satisfecho?.toLowerCase() === 'si'
          ).length;
          return {
            data: Math.round((satisfechos / total) * 100),
            error: null
          };
        });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error calculando satisfacción:', error);
      return 88;
    }
  };

  // DATOS HARDCODEADOS

  /* const satisfaccion = 88;  */
  // --------- Datos de ventas de vinos ---------

  const coloresVinos = {
    Torrontes: "#FFDFB9",
    Malbec: "#D32F2F",
    Blanco: "#FFEB3B",
    Trinita: "#7B1FA2",
    Arlene: "#1976D2",
  };

  // Llamar la función cuando el componente se monte
  useEffect(() => {
    fecthHabitaciones();
  }, []);

  useEffect(()=>{
    fetchTareas();
  }, [])
  
  useEffect(() => {
  fetchOperarios();
  }, []);
  
  useEffect(() => {
    const cargarOcupacion = async () => {
      const datos = await fetchDatosOcupacion();
      setDatosOcupacion(datos);
    };
    
    cargarOcupacion();
  }, []);
  
  useEffect(() => {
    const cargarVentasVinos = async () => {
      const datos = await fetchVentasVinosTimeline();
      setDatosVentasVinosTimeline(datos);
    };

    cargarVentasVinos();
  }, []);

  useEffect(() => {
  const cargarSatisfaccion = async () => {
    const porcentaje = await fetchSatisfaccionClientes();
    setSatisfaccion(porcentaje);
  };
  cargarSatisfaccion();
  }, []);

  // --------- Filtros y utilidades ---------
  const habitacionesMantenimiento = habitaciones.filter(
    (hab) => hab.estado === "mantenimiento"
  );
  
  // Cambia el estado de una habitación
  const cambiarEstadoHabitacion = async(id,nuevoEstado) =>{
    // 1. Actualizar INMEDIATAMENTE el estado local (sin recargar página)
    setHabitaciones(prevHabitaciones => 
      prevHabitaciones.map(hab => 
        hab.id === id ? { ...hab, estado: nuevoEstado } : hab
      )
    )
    
    const{data,error} = await supabase // await -> espera a supabase
    .from('habitaciones')
    .update({
      estado: nuevoEstado
    })
    .eq('habitacion_id',id) // condicion WHERE
    .select() // registro actualizado

    if(error){
      console.error('Error actualizando estado de habitacion',error)
      return null;
    }
    return data[0]
  }

  // Libera una habitación en mantenimiento
  const liberarHabitacionMantenimiento = async (id) => {
    console.log("Liberando habitación:", id)

    // 1. Actualizar INMEDIATAMENTE el estado local (sin recargar página)
    setHabitaciones(prevHabitaciones => 
      prevHabitaciones.map(hab => 
        hab.id === id ? { ...hab, estado: "libre" } : hab
      )
    )

    // 2. En segundo plano, actualizar la BD
    const resultado = await cambiarEstadoHabitacion(id, "libre")

    if (!resultado) {
      // Solo si hay error, revertimos el cambio
      console.log("Error en BD, revirtiendo cambio visual")
      setHabitaciones(prevHabitaciones => 
        prevHabitaciones.map(hab => 
          hab.id === id ? { ...hab, estado: "mantenimiento" } : hab
        )
      )
    }
  }
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
   
    // 1. Actualizar INMEDIATAMENTE el estado local (frontend)
    setTareas(prevTareas => 
      prevTareas.map(tarea => 
        tarea.id === id ? { ...tarea, estado: 'hecho' } : tarea
      )
    )
    // 2. actualiza BD en seundo plano
    const{data,error} = await supabase // await -> espera a supabase
    .from('tareas')
    .update({
      estado: 'hecho'
    })
    .eq('tarea_id',id) // condicion WHERE
    .select() // registro actualizado

    if(error){
      console.error('Error actualizando estado de tarea',error)
      setTareas(prev => prev.map(t => t.id === id ? tareaOriginal : t));
      return null;
    }
    return data[0]
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
      // Filtro por operario
     //1264

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
        valorA = a.prioridad; // ← Ya son números (1, 2, 3)
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
        const url =
          "https://api.open-meteo.com/v1/forecast?latitude=-26.04516&longitude=69.99808&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,rain,wind_speed_10m,soil_moisture_0_to_1cm&timezone=America%2FSao_Paulo&forecast_days=1";
        const respuesta = await fetch(url);
        if (!respuesta.ok)
          throw new Error(`Error en la API: ${respuesta.status}`);
        const data = await respuesta.json();
        setDatosClima({
          temperatura: data.hourly.temperature_2m[0],
          sensacionReal: data.hourly.apparent_temperature[0],
          humedad: data.hourly.relative_humidity_2m[0],
          velocidadViento: data.hourly.wind_speed_10m[0],
          probabilidadLluvia: data.hourly.precipitation_probability[0],
          lluvia: data.hourly.rain[0],
          humedadSuelo: data.hourly.soil_moisture_0_to_1cm[0],
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

      // Añadir un 20% de margen para mejor visualización
      return max > 0 ? Math.ceil(max * 1.2) : 100;
    } catch (error) {
      console.error('Error calculando maxVentas:', error);
      return 100;
    }
  }, [datosVentasVinosTimeline]);

  

  // --------- CRUD de tareas ---------
  const agregarTarea = async (nuevaTarea) => {
    if (nuevaTarea.prioridad == "baja") {
      nuevaTarea.prioridad= 3
    } else if (nuevaTarea.prioridad == "media") {
      nuevaTarea.prioridad= 2
    }else if (nuevaTarea.prioridad == "alta") {
      nuevaTarea.prioridad= 1
    }
    const {data,error} = await supabase
    .from('tareas')
    .insert([{
      nombre_tarea: nuevaTarea.nombre,
      fecha_tarea: nuevaTarea.fecha,
      prioridad: nuevaTarea.prioridad,
      estado:'pendiente',
      trabajador_id: nuevaTarea.trabajador_id
    }])
    .select(`
      tarea_id,
      nombre_tarea,
      fecha_tarea,
      prioridad,
      estado,
      trabajador_id,
      profiles!inner(nom_perfil)
    `)

    .single()

    if (error) {
      console.error('Error al agregar nueva tarea: ', error)
      return null;
    }

    // Mapear con el nombre del operario
    const tareaConOperario = {
      id: data.tarea_id,
      nombre: data.nombre_tarea,
      fecha: data.fecha_tarea,
      prioridad: data.prioridad,
      estado: data.estado,
      operario: data.profiles.nom_perfil,  // ← Nombre del operario
      trabajador_id: data.trabajador_id
    }

    setTareas([...tareas, tareaConOperario]);
    return tareaConOperario;
  };

// corregir fecha
  const ajustarFechaParaUTC = (fechaString) => {
    if (!fechaString) return fechaString;
    return new Date(fechaString + 'T12:00:00').toISOString().split('T')[0];
  };

  const editarTarea = async (tareaActualizada) => {
    try {
      // Convertir prioridad de texto a número si es necesario
      let prioridadNumerica = tareaActualizada.prioridad;
      if (tareaActualizada.prioridad == "baja") {
        prioridadNumerica = 3;
      } else if (tareaActualizada.prioridad == "media") {
        prioridadNumerica = 2;
      } else if (tareaActualizada.prioridad == "alta") {
        prioridadNumerica = 1;
      }
      const fechaAjustada = ajustarFechaParaUTC(tareaActualizada.fecha);

      // Actualizar en la base de datos
      const { data, error } = await supabase
        .from('tareas')
        .update({
          nombre_tarea: tareaActualizada.nombre,
          fecha_tarea: fechaAjustada,
          prioridad: prioridadNumerica,
          estado: tareaActualizada.estado || 'pendiente',
          trabajador_id: tareaActualizada.trabajador_id
        })
        .eq('tarea_id', tareaActualizada.id)  // ← Filtrar por ID de la tarea
        .select(`
          tarea_id,
          nombre_tarea,
          fecha_tarea,
          prioridad,
          estado,
          trabajador_id,
          profiles!inner(nom_perfil)
        `)
        .single();

      if (error) {
        console.error('Error al actualizar tarea en la base de datos:', error);
        return null;
      }

      // Mapear los datos actualizados con el nombre del operario
      const tareaActualizadaConOperario = {
        id: data.tarea_id,
        nombre: data.nombre_tarea,
        fecha: data.fecha_tarea + 'T12:00:00',
        prioridad: data.prioridad,
        estado: data.estado,
        operario: data.profiles.nom_perfil,
        trabajador_id: data.trabajador_id
      };

      // Actualizar el estado local con los datos de la BD
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
      // Eliminar de la base de datos
      const { error } = await supabase
        .from('tareas')
        .delete()
        .eq('tarea_id', id);  // ← Usar .eq() para filtrar qué tarea eliminar

      if (error) {
        console.error('Error al eliminar tarea de la base de datos:', error);
        return;
      }

      // Eliminar del estado local solo si la operación en BD fue exitosa
      setTareas(tareas.filter((t) => t.id !== id));

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
                  <option key={op.id} value={op.id}> {/* guarda el valor del id del trabajador sleccionado */}
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
          
          {/* Etiquetas Y - CORREGIDAS */}
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

                // Llamar la función que carga tareas desde la BD
                await cargarTareasPorOperario(nuevoOperario);
                setPaginaActual(1); // Resetear paginación
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
          {habitacionesMantenimiento.length > 0 && (
            <div className="alerta alerta-warning">
              <span>⚠️</span>
              <span>
                {habitacionesMantenimiento.length} habitación(es) en
                mantenimiento
              </span>
            </div>
          )}
          {/* Lista de habitaciones en mantenimiento */}
          {habitacionesMantenimiento.length > 0 && (
            <div className="subseccion">
              <h3 className="subseccion-titulo">
                Habitaciones en Mantenimiento
              </h3>
              <div className="lista-mantenimiento">
                {habitacionesMantenimiento.map((hab) => (
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
