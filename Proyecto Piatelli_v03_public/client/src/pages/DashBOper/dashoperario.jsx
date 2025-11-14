import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase/client";

import "./dashoperario.css";

//funciones de BD

// Importar componete gmail respuestas
import CorreosNoRespondidos from "../../components/componentes/correoGer/CorreosNoRespondidos";

const DashOp = () => {


  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [numeroSeleccionado, setNumeroSeleccionado] = useState("");
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [dialogoConfirmacion, setDialogoConfirmacion] = useState(null);
  const [busquedaTarea, setBusquedaTarea] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [mensajeExito, setMensajeExito] = useState("");

    // BD
  const [operario, setOperario] = useState("");
  const [habitaciones, setHabitaciones]= useState([])
  const [tareas, setTareas] = useState([]);
  const [reservas, setReservas] = useState([]);

  // estados para filtros
  const [ordenarPor, setOrdenarPor] = useState("prioridad");
  const [ordenAscendente, setOrdenAscendente] = useState(true);

  // peticiones a BD

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

  const fetchTareas = async () => {
    try {
      // Obtener sesión
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setTareas([]);
        return;
      }

      // Obtener perfil con trabajador_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('trabajador_id')
        .eq('trabajador_id', session.user.id)
        .single();

      if (!profile?.trabajador_id) {
        setTareas([]);
        return;
      }

      // Traer tareas filtradas
      const { data, error } = await supabase
        .from("tareas")
        .select(`
          tarea_id,
          prioridad,
          nombre_tarea,
          fecha_tarea,
          estado,
          trabajador_id
        `)

        .eq('trabajador_id', profile.trabajador_id);

      if (error) throw error;

      const tareas = data.map(tarea => ({
        id: tarea.tarea_id,
        nombre: tarea.nombre_tarea,
        fecha: tarea.fecha_tarea + 'T12:00:00',
        estado: tarea.estado,
        prioridad: tarea.prioridad,
      }));

      setTareas(tareas);

    } catch (error) {
      console.error("Error en fetchTareas:", error);
    }
  };
  

  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        reserva_id,
        clientes!inner(nom_cli),
        reservas_habitaciones(
          habitacion_id,
          habitaciones(
            tipo_habitacion,
            numero_habitacion
          )
        ),
        fecha_inicio,
        fecha_fin
      `)
      .gte('fecha_fin', new Date().toISOString().split('T')[0])
      .in('estado', ['confirmada', 'pendiente']);

    if (error) {
      console.log("Error al traer datos de la tabla reservas:", error);
      return;
    }

    console.log("Datos crudos de reservas:", data);

    // Procesar cada reserva para incluir TODAS las habitaciones
    const reservasProcesadas = data.map(reserva => {
      console.log("Reserva ID:", reserva.reserva_id);
      console.log("Todas las habitaciones:", reserva.reservas_habitaciones); // ← CORREGIDO: reserva en lugar de reservas

      // Obtener todas las habitaciones de esta reserva
      const habitacionesReserva = reserva.reservas_habitaciones.map(rh => ({
        habitacion_id: rh.habitacion_id,
        tipo: rh.habitaciones?.tipo_habitacion || "Sin tipo",
        numero: rh.habitaciones?.numero_habitacion || "N/A"
      }));

      console.log("Habitaciones procesadas:", habitacionesReserva);

      return {
        id: reserva.reserva_id,
        nombre: reserva.clientes.nom_cli,
        habitaciones: habitacionesReserva, // Array con todas las habitaciones
        fechaEntrada: reserva.fecha_inicio + 'T12:00:00',
        fechaSalida: reserva.fecha_fin + 'T12:00:00'
        };
      });

      console.log("Reservas finales:", reservasProcesadas);
      setReservas(reservasProcesadas);
  };

  
  useEffect(() => {
    const obtenerUsuarioActual = async () => {
      try {
        // Obtener la sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error al obtener sesión:', error);
          return;
        }

        if (session?.user) {
          // Si hay usuario autenticado, obtener su perfil
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('nom_perfil')
            .eq('trabajador_id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error al obtener perfil:', profileError);
            // Si no puedes obtener el perfil, usa el email como fallback
            setOperario(session.user.email || "Usuario");
          } else {
            setOperario(profile.nom_perfil || session.user.email || "Usuario");
          }
        } else {
          setOperario("Invitado");
        }
      } catch (error) {
        console.error('Error inesperado:', error);
        setOperario("Usuario");
      }
    };

    obtenerUsuarioActual();
  }, []);

  useEffect(() => {
    fecthHabitaciones();
  }, []);
  
  useEffect(()=>{
    fetchTareas();
  }, [])
  
  useEffect(()=>{
    fetchReservas();
  }, []);

//fin peticiones




  const tareasPorPagina = 8;

  const mostrarMensajeExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(""), 3000);
  };

  const estadisticas = useMemo(() => {
    const totalTareas = tareas.length;
    const tareasPendientes = tareas.filter(
      (t) => t.estado === "pendiente"
    ).length;
    const tareasCompletadas = tareas.filter((t) => t.estado === "hecho").length;
    const tareasAlta = tareas.filter(
      (t) => t.prioridad === "alta" && t.estado === "pendiente"
    ).length;

    return {
      totalTareas,
      tareasPendientes,
      tareasCompletadas,
      tareasAlta,
      porcentajeCompletado:
        totalTareas > 0
          ? Math.round((tareasCompletadas / totalTareas) * 100)
          : 0,
    };
  }, [tareas]);

  const tareasFiltradas = useMemo(() => {
    let resultado = tareas.filter((tarea) => {
      // Filtro por búsqueda
      const coincideBusqueda = busquedaTarea
        ? tarea.nombre.toLowerCase().includes(busquedaTarea.toLowerCase())
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
  ]);

  const indiceUltimaTarea = paginaActual * tareasPorPagina;
  const indicePrimeraTarea = indiceUltimaTarea - tareasPorPagina;
  const tareasActuales = tareasFiltradas.slice(
    indicePrimeraTarea,
    indiceUltimaTarea
  );
  const totalPaginas = Math.ceil(tareasFiltradas.length / tareasPorPagina);


const editarTarea = async (tareaActualizada) => {
  try {
    // Guardar estado anterior por si hay error
    const tareaOriginal = tareas.find(t => t.id === tareaActualizada.id);
    
    // Optimistic update
    setTareas(prevTareas =>
      prevTareas.map((t) => (t.id === tareaActualizada.id ? tareaActualizada : t))
    );

    // UPDATE en Supabase
    const { error } = await supabase
      .from('tareas')
      .update({
        nombre_tarea: tareaActualizada.nombre,
        fecha_tarea: tareaActualizada.fecha,
        prioridad: tareaActualizada.prioridad,
        estado: tareaActualizada.estado,
        trabajador_id: tareaActualizada.trabajador_id
      })
      .eq('tarea_id', tareaActualizada.id);

    if (error) {
      throw error;
    }

    // Mostrar mensaje de éxito
    const mensaje =
      tareaActualizada.estado === "hecho"
        ? "✓ Tarea completada exitosamente"
        : "✓ Tarea actualizada exitosamente";
    
    mostrarMensajeExito(mensaje);

  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    
    // Revertir en caso de error
    setTareas(prevTareas => prevTareas.map(t => 
      t.id === tareaActualizada.id ? tareaOriginal : t
    ));
    
    mostrarMensajeError("✗ Error al actualizar la tarea");
  }
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


  const abrirDialogo = (tarea = null) => {
    setTareaEditando(tarea);
    setDialogoAbierto(true);
  };

  const cerrarDialogo = () => {
    setDialogoAbierto(false);
    setTareaEditando(null);
  };

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

const cancelarReserva = async (reservaId) => {
  try {
    // 1. Buscar la reserva en el estado local
    const reserva = reservas.find((r) => r.id === reservaId);
    
    if (!reserva) {
      console.error("Reserva no encontrada");
      return;
    }

    console.log("Cancelando reserva:", reserva);

    // 2. Actualizar el estado de TODAS las habitaciones a "libre" en Supabase
    const habitacionIds = reserva.habitaciones.map(h => h.habitacion_id);
    
    const { error: errorHabitacion } = await supabase
      .from('habitaciones')
      .update({ estado: 'libre' })
      .in('habitacion_id', habitacionIds);

    if (errorHabitacion) {
      console.error("Error al actualizar habitaciones:", errorHabitacion);
      throw errorHabitacion;
    }

    // 3. Actualizar el estado de la reserva a "cancelada" en Supabase
    const { error: errorReserva } = await supabase
      .from('reservas')
      .update({ estado: 'cancelada' })
      .eq('reserva_id', reservaId);

    if (errorReserva) {
      console.error("Error al actualizar reserva:", errorReserva);
      throw errorReserva;
    }

    // 4. Actualizar el estado local de TODAS las habitaciones
    const nuevasHabitaciones = habitaciones.map((hab) =>
      habitacionIds.includes(hab.id) ? { ...hab, estado: "libre" } : hab
    );
    setHabitaciones(nuevasHabitaciones);

    // 5. Filtrar la reserva cancelada de la lista
    const nuevasReservas = reservas.filter((r) => r.id !== reservaId);
    setReservas(nuevasReservas);

    console.log(`✓ Reserva de ${reserva.nombre} cancelada correctamente`);
    console.log(`✓ ${habitacionIds.length} habitaciones liberadas`);

  } catch (error) {
    console.error("Error al cancelar reserva:", error);
  } finally {
    setDialogoConfirmacion(null);
  }
};
  const obtenerColorEstadoHabitacion = (estado) => {
    const colores = {
      libre: "#4CAF50",
      mantenimiento: "#FF9800",
      reservada: "#2196F3",
    };
    return colores[estado] || "#666";
  };
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

  const obtenerTextoEstadoHabitacion = (estado) => {
    const textos = {
      libre: "Libre",
      mantenimiento: "En Mantenimiento",
      reservada: "Reservada",
    };
    return textos[estado] || "Desconocido";
  };

  const limpiarSeleccion = () => {
    setTipoSeleccionado("");
    setNumeroSeleccionado("");
    setHabitacionSeleccionada(null);
  };

  const limpiarFiltros = () => {
    setBusquedaTarea("");
    setFiltroEstado("todos");
    setFiltroPrioridad("todos");
    setPaginaActual(1);
  };

  const FormularioTarea = ({ tarea, onGuardar, onCancelar }) => {
    const [estado, setEstado] = useState(tarea.estado);

    const manejarGuardar = () => {
      onGuardar({ ...tarea, estado });
      onCancelar();
    };

    return (
      <div className="dialogo-overlay">
        <div className="dialogo-contenido">
          <h2 className="dialogo-titulo">Actualizar Estado de Tarea</h2>
          <div className="tarea-info">
            <p className="tarea-nombre">{tarea.nombre}</p>
            <p className="tarea-fecha">
              Fecha: {new Date(tarea.fecha).toLocaleDateString()}
            </p>
            <span className={`prioridad-badge prioridad-${tarea.prioridad}`}>
              Prioridad {tarea.prioridad}
            </span>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select
              className="form-select"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="hecho">Completada</option>
            </select>
          </div>
          <div className="dialogo-acciones">
            <button className="btn-cancelar" onClick={onCancelar}>
              Cancelar
            </button>
            <button className="btn-guardar" onClick={manejarGuardar}>
              Actualizar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DialogoConfirmacion = ({ reserva, onConfirmar, onCancelar }) => {
    return (
      <div className="dialogo-overlay">
        <div className="dialogo-contenido">
          <h2 className="dialogo-titulo">Confirmar Cancelación</h2>
          <p className="dialogo-mensaje">
            ¿Estás seguro de que deseas cancelar la reserva de{" "}
            <strong>{reserva.nombre}</strong>?
          </p>

          <div className="habitaciones-reserva">
            <h4>Habitaciones a liberar:</h4>
            {reserva.habitaciones.map((hab, index) => (
              <div key={index} className="habitacion-info">
                • {hab.tipo} - N° {hab.numero}
              </div>
            ))}
          </div>

          <div className="dialogo-acciones">
            <button className="btn-cancelar" onClick={onCancelar}>
              No, mantener
            </button>
            <button
              className="btn-confirmar"
              onClick={() => onConfirmar(reserva.id)}
            >
              Sí, Liberar Reserva ({reserva.habitaciones.length} habitaciones)
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard - {operario}</h1>
        <p className="dashboard-fecha">
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Mensaje de éxito */}
      {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}

      {/* Tarjetas de estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card stat-pendientes">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>{estadisticas.tareasPendientes}</h3>
            <p>Tareas Pendientes</p>
          </div>
        </div>
        <div className="stat-card stat-completadas">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>{estadisticas.tareasCompletadas}</h3>
            <p>Completadas</p>
          </div>
        </div>
        <div className="stat-card stat-alta">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{estadisticas.tareasAlta}</h3>
            <p>Prioridad Alta</p>
          </div>
        </div>
        <div className="stat-card stat-progreso">
          <div className="stat-content">
            <h3>{estadisticas.porcentajeCompletado}%</h3>
            <p>Progreso</p>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{ width: `${estadisticas.porcentajeCompletado}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sección de tareas */}
      <div className="tareas-section">
        <div className="section-header">
          <h2 className="section-title">Gestión de Tareas</h2>
        </div>

        {/* Filtros y búsqueda */}
        <div className="filtros-container">
          <div className="busqueda-wrapper">
            <span className="busqueda-icon">🔍</span>
            <input
              type="text"
              className="busqueda-input"
              placeholder="Buscar tarea..."
              value={busquedaTarea}
              onChange={(e) => {
                setBusquedaTarea(e.target.value);
                setPaginaActual(1);
              }}
            />
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
          {(busquedaTarea ||
            filtroEstado !== "todos" ||
            filtroPrioridad !== "todos") && (
            <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
              Limpiar
            </button>
          )}
        </div>

        <div className="tabla-container">
          <table className="tabla-tareas">
            <thead>
              <tr>
                <th>Prioridad</th>
                <th>Tarea</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareasActuales.map((tarea) => (
                <tr
                  key={tarea.id}
                  className={`fila-tarea ${
                    tarea.estado === "hecho" ? "tarea-completada" : ""
                  }`}
                >
                  <td>
                    <div
                      className={`prioridad-indicator prioridad-${tarea.prioridad}`}
                      style={{
                        backgroundColor: obtenerColorPrioridad(tarea.prioridad)
                      }}
                    />
                  </td>
                  <td>{tarea.nombre}</td>
                  <td>{new Date(tarea.fecha).toLocaleDateString()}</td>
                  <td>
                    <span className={`estado-chip estado-${tarea.estado}`}>
                      {tarea.estado === "hecho" ? "Completada" : "Pendiente"}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-grupo">
                      {tarea.estado !== "hecho" && (
                        <button
                          className="btn-accion btn-completar"
                          onClick={() => completarTareaRapido(tarea.id)}
                          title="Completar tarea"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => abrirDialogo(tarea)}
                        title="Editar estado"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tareasActuales.length === 0 && (
                <tr>
                  <td colSpan="5" className="sin-datos">
                    No se encontraron tareas
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                (pagina) => (
                  <button
                    key={pagina}
                    className={`btn-pagina ${
                      pagina === paginaActual ? "active" : ""
                    }`}
                    onClick={() => setPaginaActual(pagina)}
                  >
                    {pagina}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sección de mantenimiento */}
      <div className="metrica-card">
        <div className="section-header">
          <h2 className="section-title">Mantenimiento de Habitaciones</h2>
          <span className="info-icon">ℹ️</span>
        </div>

        {/* Alerta de habitaciones en mantenimiento */}
        {habitacionesMantenimiento.length > 0 && (
          <div className="alerta alerta-warning">
            <span>⚠️</span>
            <span>
              {habitacionesMantenimiento.length} habitación(es) en mantenimiento
            </span>
          </div>
        )}

        {/* Lista de habitaciones en mantenimiento */}
        {habitacionesMantenimiento.length > 0 && (
          <div className="subseccion">
            <h3 className="subseccion-titulo">Habitaciones en Mantenimiento</h3>
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
            {[...new Set(habitaciones.map((h) => h.tipo))].map((tipo) => (
              <option key={tipo} value={tipo}>
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

      {/* Sección de Reservas */}
      <div className="reservas-section">
        <div className="section-header">
          <h2 className="section-title">Reservas Activas</h2>
          <span className="badge-count">{reservas.length}</span>
        </div>
        <div className="tabla-container">
          <table className="tabla-reservas">
            <thead>
              <tr>
                <th>Habitaciones</th>
                <th>Cliente</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="fila-reserva">
                  <td>
                    <div className="habitaciones-lista">
                      {reserva.habitaciones.map((hab, index) => (
                        <div key={index} className="habitacion-item">
                          <span className="tipo-habitacion">{hab.tipo.toUpperCase()}</span>
                          <span className="numero-habitacion"> {hab.numero}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{reserva.nombre}</td>
                  <td>{new Date(reserva.fechaEntrada).toLocaleDateString()}</td>
                  <td>{new Date(reserva.fechaSalida).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-cancelar-reserva"
                      onClick={() => setDialogoConfirmacion(reserva)}
                    >
                      Liberar Reserva ({reserva.habitaciones.length})
                    </button>
                  </td>
                </tr>
              ))}
              {reservas.length === 0 && (
                <tr>
                  <td colSpan="5" className="sin-datos">
                    No hay reservas activas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diálogo de edición */}
      {dialogoAbierto && (
        <FormularioTarea
          tarea={tareaEditando}
          onGuardar={editarTarea}
          onCancelar={cerrarDialogo}
        />
      )}

      {/* Diálogo de confirmación */}
      {dialogoConfirmacion && (
        <DialogoConfirmacion
          reserva={dialogoConfirmacion}
          onConfirmar={cancelarReserva}
          onCancelar={() => setDialogoConfirmacion(null)}
        />
      )}

      <CorreosNoRespondidos />
    </div>
  );
};

export default DashOp;
