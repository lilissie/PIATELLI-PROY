import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Fondo from "../../assets/home-fondo.png"; // Sube 2 niveles hasta src, luego a assets
import Ramas from "../../assets/ramas.png"; // Sube 2 niveles hasta src, luego a assets
import "./home.css"; // Ruta relativa correcta (mismo directorio)

const Home = () => {
  // Fondo: zoom muy lento y continuo
  const fondoAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: 1.2,
      transition: {
        duration: 5,
        ease: "easeInOut",
      },
    },
  };

  // Ramas: zoom, blur y fade-out
  const ramasAnimation = {
    initial: {
      opacity: 1,
      scale: 1.1,
      filter: "blur(1px)",
    },
    animate: {
      opacity: 0,
      scale: 1.8,
      filter: "blur(12px)",
      transition: {
        duration: 1.6,
        ease: "easeInOut",
        delay: 1,
      },
    },
  };

  // Texto y botón central
  const textoAnimation = {
    initial: { opacity: 0, y: 20, filter: "blur(5px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: 4, duration: 1, ease: "easeOut" },
    },
  };

  return (
    <div className="home-container">
      {/* Fondo */}
      <motion.img
        src={Fondo}
        alt="Fondo del viñedo"
        className="fondo"
        variants={fondoAnimation}
        initial="initial"
        animate="animate"
      />

      {/* Ramas con zoom y desenfoque */}
      <motion.img
        src={Ramas}
        alt="Ramas"
        className="ramas-fondo"
        variants={ramasAnimation}
        initial="initial"
        animate="animate"
      />

      {/* Contenido central */}
      <motion.div
        className="contenido"
        variants={textoAnimation}
        initial="initial"
        animate="animate"
      >
        <h1 className="frase">Bienvenidos a Piattelli</h1>
        <Link to="/Actividades" className="entrar-btn">
          Conocer más
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;
