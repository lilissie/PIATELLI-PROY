import { motion } from "framer-motion";
import { FaWineGlassAlt, FaMapMarkedAlt, FaWineBottle } from "react-icons/fa";

// Componentes
import Publicidad from "../../components/componentes/publicidad/publi";
import Valoraciones from "../../components/componentes/valoracion/valoraciones";
import YouTube360 from "../Actividades/video360";

/* actividades */
import act1 from "../../components/img_activ/act1.webp";
import act2 from "../../components/img_activ/act2.webp";
import act3 from "../../components/img_activ/act3.webp";
import act4 from "../../components/img_activ/act4.webp";
import header from "../../components/img_activ/header.webp";

import "./activ.css";

function Actividades() {
  const actividades = [
    {
      img: act1,
      titulo: "Spa",
      descr:
        "Un espacio de relajación y bienestar en medio de los viñedos, donde cada detalle está inspirado en la serenidad de los Valles Calchaquíes.",
      horarios: "8AM - 21PM",
    },
    {
      img: act2,
      titulo: "Paseos",
      descr:
        "Aventúrese por los imponentes paisajes de los Valles Calchaquíes y descubra la magia de Cafayate desde una perspectiva única en paseos de 1hs.",
      horarios: "Salidas desde 15hs a 19hs",
    },
    {
      img: act3,
      titulo: "Espectáculos",
      descr:
        "Disfrute de propuestas artísticas y culturales que acompañan la esencia de la bodega, fusionando vino, música y tradición en un entorno único.",
      horarios: "20PM - 21PM",
    },
    {
      img: act4,
      titulo: "Jacuzzi",
      descr:
        "Relájese rodeado de viñedos y montañas, disfrutando de un momento único de descanso y bienestar.",
      horarios: "8AM - 21PM",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="app">
      {/* Imagen principal */}
      <img src={header} alt="Portada Actividades" className="main-img" />

      {/* SECCIÓN DE PRESENTACIÓN MEJORADA */}
      <motion.div
        className="hotel-presentacion"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="presentacion-header"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            className="header-icon"
            whileHover={{
              scale: 1.3,
              rotate: -10,
              transition: { type: "spring", stiffness: 300 },
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                transition: {
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                },
              }}
            >
              <FaWineGlassAlt
                style={{
                  color: "#ff7904ff",
                  filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))",
                }}
              />
            </motion.div>
          </motion.div>

          <h2 className="presentacion-titulo">
            Piattelli Vineyards: Donde el Vino y la Hospitalidad se Encuentran
          </h2>
        </motion.div>

        <motion.p
          className="presentacion-descripcion"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          En el corazón de los majestuosos Valles Calchaquíes,{" "}
          <strong>Piattelli Vineyards</strong> no es solo una bodega—es una
          experiencia sensorial completa que combina la excelencia vitivinícola
          con la calidez de la hospitalidad argentina.
        </motion.p>

        <motion.div
          className="hotel-invitacion"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="invitacion-icon">
            <FaMapMarkedAlt />
          </div>
          <h3 className="invitacion-titulo">Vive la Experiencia Piattelli</h3>
          <p className="invitacion-texto">
            No venimos solo a ofrecerte un vino o una habitación—te invitamos a
            ser parte de una tradición, a crear momentos inolvidables entre
            montañas y viñedos, donde cada copa cuenta una historia y cada
            atardecer se convierte en recuerdo.
          </p>
          <p className="hotel-destacado">
            <strong>En Piattelli, no te alojamos—te recibimos en casa.</strong>
          </p>
        </motion.div>
      </motion.div>

      {/* Título de Actividades */}
      <div className="titulo">
        <h1 className="title">Actividades</h1>
      </div>

      {/* Lista de actividades */}
      <div className="actividades-grid">
        {actividades.map((act, index) => (
          <div className="actividad" key={index}>
            {/* alternar: par -> texto primero / impar -> imagen primero */}
            {index % 2 === 0 ? (
              <>
                <div className="actividad-img-box">
                  <img
                    src={act.img}
                    alt={act.titulo}
                    className="actividad-img"
                  />
                </div>
                <div className="actividad-texto">
                  <h2 className="actividad-titulo">{act.titulo}</h2>
                  <p className="actividad-descr">{act.descr}</p>
                  <p className="actividad-horarios">{act.horarios}</p>
                </div>
              </>
            ) : (
              <>
                <div className="actividad-texto">
                  <h2 className="actividad-titulo">{act.titulo}</h2>
                  <p className="actividad-descr">{act.descr}</p>
                  <p className="actividad-horarios">{act.horarios}</p>
                </div>
                <div className="actividad-img-box">
                  <img
                    src={act.img}
                    alt={act.titulo}
                    className="actividad-img"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Publicidad / valoraciones */}
      <div className="publicidad">
        <Publicidad />
      </div>
      {/* Video */}
      <YouTube360 />
      {/* Valoraciones */}
      <div className="valoraciones">
        <Valoraciones />
      </div>
    </div>
  );
}

export default Actividades;
