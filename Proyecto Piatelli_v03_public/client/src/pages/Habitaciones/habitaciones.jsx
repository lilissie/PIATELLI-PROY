import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./habitaciones.css";

import { supabase } from "../../supabase/client";

// Importación de imágenes desde src/assets
// Matrimonial
import matrimonial1 from "../../assets/matrimonial1.jpg";
import matrimonial2 from "../../assets/matrimonial2.jpg";
import matrimonial3 from "../../assets/matrimonial3.jpg";
import matrimonial4 from "../../assets/matrimonial4.jpg";

// Ejecutiva
import ejecutiva1 from "../../assets/ejecutiva1.jpg";
import ejecutiva2 from "../../assets/ejecutiva2.jpg";
import ejecutiva3 from "../../assets/ejecutiva3.jpg";
import ejecutiva4 from "../../assets/ejecutiva4.jpg";

// Glamping
import glamping1 from "../../assets/glamping1.jpg";
import glamping2 from "../../assets/glamping2.jpg";
import glamping3 from "../../assets/glamping3.jpg";
import glamping4 from "../../assets/glamping4.jpg";

// Íconos
import {
  FaRegStar,
  FaStar,
  FaStarHalfAlt,
  FaUserFriends,
} from "react-icons/fa";


// Hook combinado que obtiene precios, capacidades Y valoraciones
function useDatosAlojamientosCompletos() {
  const [datos, setDatos] = useState({
    preciosPorDia: {
      alojamientos: {},
      actividades: {}
    },
    capacidadesAlojamiento: {},
    valoracionesHabitaciones: {} // Nuevo: valoraciones por tipo
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatosCompletos = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Consultar habitaciones
        const { data: habitacionesData, error: errorHabitaciones } = await supabase
          .from('habitaciones')
          .select('tipo_habitacion, precio_por_dia, capacidad_max')
          .eq('estado', 'libre')
          .order('tipo_habitacion');

        if (errorHabitaciones) throw errorHabitaciones;

        // 2. Consultar actividades
        const { data: actividadesData, error: errorActividades } = await supabase
          .from('actividades')
          .select('nombre_actividad, precio_por_dia')
          .order('nombre_actividad');

        if (errorActividades) throw errorActividades;

        // 3. Consultar valoraciones promedio
        const { data: valoracionesData, error: errorValoraciones } = await supabase
          .from('valoraciones')
          .select(`
            valoracion,
            habitaciones (
              tipo_habitacion
            )
          `);

        // No lanzamos error si no hay valoraciones, usamos valores por defecto
        let valoracionesPorTipo = {};
        if (!errorValoraciones && valoracionesData) {
          // Calcular promedios
          const promedios = {};
          valoracionesData.forEach(item => {
            const tipo = item.habitaciones.tipo_habitacion;
            if (!promedios[tipo]) {
              promedios[tipo] = { total: 0, count: 0 };
            }
            promedios[tipo].total += item.valoracion;
            promedios[tipo].count += 1;
          });

          Object.keys(promedios).forEach(tipo => {
            valoracionesPorTipo[tipo] = Number((promedios[tipo].total / promedios[tipo].count).toFixed(1));
          });
        }

        console.log("Valoraciones por tipo:", valoracionesPorTipo);

        // Mapear datos
        const preciosPorDia = { alojamientos: {}, actividades: {} };
        const capacidadesAlojamiento = {};

        // Procesar habitaciones
        habitacionesData.forEach(habitacion => {
          const tipo = habitacion.tipo_habitacion;
          preciosPorDia.alojamientos[tipo] = Number(habitacion.precio_por_dia);
          capacidadesAlojamiento[tipo] = habitacion.capacidad_max;
        });

        // Procesar actividades
        actividadesData.forEach(actividad => {
          preciosPorDia.actividades[actividad.nombre_actividad] = Number(actividad.precio_por_dia);
        });

        setDatos({
          preciosPorDia,
          capacidadesAlojamiento,
          valoracionesHabitaciones: valoracionesPorTipo
        });

      } catch (err) {
        console.error("Error en hook:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosCompletos();
  }, []);

  return { 
    preciosPorDia: datos.preciosPorDia,
    capacidadesAlojamiento: datos.capacidadesAlojamiento,
    valoracionesHabitaciones: datos.valoracionesHabitaciones,
    loading, 
    error 
  };
}

const Habitaciones = () => {
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [imagenActiva, setImagenActiva] = useState(0);

  const { 
    preciosPorDia, 
    capacidadesAlojamiento, 
    valoracionesHabitaciones, 
    loading, 
    error 
  } = useDatosAlojamientosCompletos();


  if (loading) {
    return (
      <div className="cargando-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="cargando"
        >
          Cargando habitaciones...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">Error al cargar las habitaciones: {error}</div>
      </div>
    );
  }

  const obtenerHabitacionesConValoracionesReales = () => {
    console.log("Datos cargados desde BD:", {
      preciosPorDia: preciosPorDia.alojamientos,
      capacidadesAlojamiento,
      valoracionesHabitaciones
    });

    // Valores por defecto para cuando no hay valoraciones
    const valoracionesPorDefecto = {
      "Matrimonial": 4.5,
      "Ejecutiva": 4.7,
      "Glamping": 4.9
    };

    const habitaciones = [
      {
        id: 1,
        nombre: "Matrimonial",
        calificacion: valoracionesHabitaciones["matrimonial"] || valoracionesPorDefecto["Matrimonial"],
        disponible: true,
        precio: `$${preciosPorDia.alojamientos["matrimonial"] || 8000}`,
        descripcion: "Disfruta de una estadía romántica con todas las comodidades para una experiencia inolvidable.",
        descripcionCorta: "Confort y descanso asegurados.",
        capacidad: capacidadesAlojamiento["matrimonial"] || 2,
        caracteristicas: {
          superficie: "40 m²",
          cama: "Cama doble",
          muebles: "Muebles funcionales",
          aireAcondicionado: true,
          tv: "Televisor",
          wifi: "WiFi 50 Mbps",
          bano: "Baño privado",
          vista: "Vistas panorámicas a los viñedos y montañas",
          capacidad: `${capacidadesAlojamiento["matrimonial"] || 2} personas`,
        },
        imagenes: [matrimonial1, matrimonial2, matrimonial3, matrimonial4],
      },
      {
        id: 2,
        nombre: "Ejecutiva",
        calificacion: valoracionesHabitaciones["ejecutiva"] || valoracionesPorDefecto["Ejecutiva"],
        disponible: true,
        precio: `$${preciosPorDia.alojamientos["ejecutiva"] || 9000}`,
        descripcion: "Ideal para viajeros de negocios que buscan comodidad y funcionalidad durante su estadía.",
        descripcionCorta: "Comodidad y funcionalidad.",
        capacidad: capacidadesAlojamiento["ejecutiva"] || 2,
        caracteristicas: {
          superficie: "38 m²",
          cama: "Cama doble queen size",
          muebles: "Incluidos",
          aireAcondicionado: true,
          tv: 'Smart TV 40"',
          wifi: "WiFi 100 Mbps",
          bano: "Baño privado con ducha hidromasaje",
          vista: "Vista panorámica a los viñedos",
          capacidad: `${capacidadesAlojamiento["ejecutiva"] || 2} personas`,
        },
        imagenes: [ejecutiva1, ejecutiva2, ejecutiva3, ejecutiva4],
      },
      {
        id: 3,
        nombre: "Glamping",
        calificacion: valoracionesHabitaciones["glamping"] || valoracionesPorDefecto["Glamping"],
        disponible: true,
        precio: `$${preciosPorDia.alojamientos["glamping"] || 10000}`,
        descripcion: "Vive una experiencia única en plena naturaleza sin renunciar al confort. Nuestro glamping combina comodidad, estilo y vistas panorámicas, ofreciendo un espacio ideal para relajarte y disfrutar del entorno.",
        descripcionCorta: "Naturaleza con confort.",
        capacidad: capacidadesAlojamiento["glamping"] || 4,
        caracteristicas: {
          superficie: "45 m²",
          cama: "Cama king size",
          muebles: "Muebles de lujo",
          aireAcondicionado: true,
          tv: 'Smart TV 50"',
          wifi: "WiFi 100 Mbps",
          bano: "Baño suite con jacuzzi",
          vista: "Vista premium a los viñedos",
          capacidad: `${capacidadesAlojamiento["glamping"] || 4} personas`,
        },
        imagenes: [glamping1, glamping2, glamping3, glamping4],
      },
    ];

    return habitaciones;
  };

  // Obtener el array de habitaciones con datos reales
  const habitaciones = obtenerHabitacionesConValoracionesReales();
  
  // Animaciones
  const contenedor = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const tarjetaHover = {
    scale: 1.05,
    y: -5,
    transition: { duration: 0.3, ease: "easeOut" },
  };

  const modalOverlay = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const modalContent = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: { duration: 0.3 },
    },
  };

  const imagenPrincipal = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  const seleccionarHabitacion = (habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setImagenActiva(0);
  };

  const cerrarModal = () => {
    setHabitacionSeleccionada(null);
  };

  const cambiarImagen = (index) => {
    setImagenActiva(index);
  };

  const renderEstrellas = (calificacion) => {
    const estrellas = [];
    const estrellasLlenas = Math.floor(calificacion);
    const mediaEstrella = calificacion % 1 !== 0;

    for (let i = 0; i < estrellasLlenas; i++) {
      estrellas.push(
        <motion.div
          key={`full-${i}`}
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FaStar className="icono-estrella llena" />
        </motion.div>
      );
    }

    if (mediaEstrella) {
      estrellas.push(
        <motion.div
          key="half"
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FaStarHalfAlt className="icono-estrella media" />
        </motion.div>
      );
    }

    const estrellasVacias = 5 - estrellas.length;
    for (let i = 0; i < estrellasVacias; i++) {
      estrellas.push(
        <motion.div
          key={`empty-${i}`}
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FaRegStar className="icono-estrella vacia" />
        </motion.div>
      );
    }

    return estrellas;
  };

  return (
    <motion.div
      className="habitaciones-container"
      initial="hidden"
      animate="show"
      variants={contenedor}
    >
      <motion.h1 className="titulo-principal" variants={item}>
        HABITACIONES
      </motion.h1>

      <motion.div className="tarjetas-container" variants={contenedor}>
        {habitaciones.map((habitacion) => (
          <motion.div
            key={habitacion.id}
            className="tarjeta-habitacion"
            onClick={() => seleccionarHabitacion(habitacion)}
            variants={item}
            whileHover={tarjetaHover}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="tarjeta-imagen"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <img src={habitacion.imagenes[0]} alt={habitacion.nombre} />
            </motion.div>
            <div className="tarjeta-contenido">
              <h3 className="nombre-habitacion">{habitacion.nombre}</h3>

              <div className="calificacion">
                <div className="estrellas">
                  {renderEstrellas(habitacion.calificacion)}
                </div>
                <span className="puntuacion">{habitacion.calificacion}</span>
              </div>


              <div className="capacidad-tarjeta">
                <FaUserFriends className="icono-personas" />
                <span>{habitacion.capacidad} personas</span>
              </div>

              <p className="descripcion-corta">{habitacion.descripcionCorta}</p>

              <motion.div
                className="invitacion"
                whileHover={{ backgroundColor: "#e2e8f0" }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Haz clic para ver detalles
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal de habitación seleccionada */}
      <AnimatePresence>
        {habitacionSeleccionada && (
          <motion.div
            className="modal-overlay"
            onClick={cerrarModal}
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="modal-contenido"
              onClick={(e) => e.stopPropagation()}
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.button
                className="btn-volver"
                onClick={cerrarModal}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Volver
              </motion.button>

              <div className="modal-detalles">
                <div className="modal-info">
                  <motion.h2
                    className="modal-titulo"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {habitacionSeleccionada.nombre}

                  </motion.h2>

                  <motion.div
                    className="modal-calificacion"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="estrellas">
                      {renderEstrellas(habitacionSeleccionada.calificacion)}
                    </div>
                    <span className="puntuacion">
                      {habitacionSeleccionada.calificacion}
                    </span>
                  </motion.div>

                  <motion.div
                    className="modal-capacidad"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FaUserFriends className="icono-personas-modal" />
                    <span>
                      <strong>Capacidad:</strong>{" "}
                      {habitacionSeleccionada.caracteristicas.capacidad}
                    </span>
                  </motion.div>

                  <motion.p
                    className="modal-descripcion"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {habitacionSeleccionada.descripcion}
                  </motion.p>

                  <motion.div
                    className="caracteristicas"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3>Características:</h3>
                    <ul>
                      {Object.entries(
                        habitacionSeleccionada.caracteristicas
                      ).map(([key, value], index) => (
                        <motion.li
                          key={key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <strong>
                            {key.charAt(0).toUpperCase() + key.slice(1)}:
                          </strong>{" "}
                          {value.toString()}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    className="modal-precio"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    {habitacionSeleccionada.precio}
                  </motion.div>
                </div>

                <div className="modal-imagenes">
                  <motion.div
                    className="imagen-principal"
                    key={imagenActiva}
                    variants={imagenPrincipal}
                    initial="hidden"
                    animate="visible"
                  >
                    <img
                      src={habitacionSeleccionada.imagenes[imagenActiva]}
                      alt={habitacionSeleccionada.nombre}
                    />
                  </motion.div>

                  <div className="miniaturas">
                    {habitacionSeleccionada.imagenes.map((imagen, index) => (
                      <motion.div
                        key={index}
                        className={`miniatura ${
                          index === imagenActiva ? "activa" : ""
                        }`}
                        onClick={() => cambiarImagen(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <img src={imagen} alt={`Vista ${index + 1}`} />
                      </motion.div>
                    ))}
                  </div>

                  <Link to="/Factura">
                  <motion.button
                    className="btn-reservar"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#fbbf24",
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    Reservar ahora
                  </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Habitaciones;
