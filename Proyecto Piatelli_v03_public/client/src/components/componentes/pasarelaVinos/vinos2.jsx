import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import './VinosCarrousel2.css';

import esquina from "../decoraciones/Nav-Esquina sevillana.png";

// Importa tus imágenes de botellas
import botellaParlene from "../../img_vinos/Vino P arlene.webp";
import botellaMalbec from "../../img_vinos/Vino P Malbec.webp";
import botellaNatural from "../../img_vinos/Vino P natural.webp";
import botellaTorrontes from "../../img_vinos/Vino P torrontes.webp";
import botellaTrinita from "../../img_vinos/Vino P Trinita.webp";

function VinosCarrousel() {
  const [vinoActivo, setVinoActivo] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);



const fondos = [
    {
      id: 1,
      fondo: "linear-gradient(135deg, #5E1914 0%, #8B0000 50%, #3A0C0C 100%)",
      nombre: "Rojo Borgoña",
      vino: "Malbec Reserve"
      // Colores: Rojo vino profundo, terciopelo, elegancia clásica
      // Representa: 12 meses en roble francés, intensidad estructurada
    },
    {
      id: 2,
      fondo: "linear-gradient(135deg, #D4AF37 0%, #F5E6B3 50%, #B8860B 100%)",
      nombre: "Oro Líquido", 
      vino: "Torrontés"
      // Colores: Dorados cálidos, amarillos pálidos, luminosidad
      // Representa: Frescura en acero, aromas florales y frutales
    },
    {
      id: 3,
      fondo: "linear-gradient(135deg, #722F37 0%, #954E4A 50%, #5A2A2A 100%)",
      nombre: "Carmesí Noble",
      vino: "Arlene Blend"
      // Colores: Carmesí profundo, tonos terrosos, sofisticación
      // Representa: Equilibrio y complejidad de blend armónico
    },
    {
      id: 4,
      fondo: "linear-gradient(135deg, #8B7355 0%, #D2B48C 50%, #A52A2A 100%)",
      nombre: "Ámbar Dulce",
      vino: "Natural Sweet"
      // Colores: Ámbar, beige dorado, toques cobrizos
      // Representa: Dulzura natural, notas de miel y frutas
    },
    {
      id: 5, 
      fondo: "linear-gradient(135deg, #2F1B14 0%, #5D4037 50%, #8B4513 100%)",
      nombre: "Roble Añejo",
      vino: "Trinita"
      // Colores: Marrones profundos, tonos de roble, elegancia atemporal
      // Representa: 16 meses en roble francés, complejidad premium
    }
  ];

const vinos = [
    {
      id: 1,
      nombre: "Malbec Reserve",
      tipo: "Tinto",
      anio: 2020,
      descripcion: "Un vino intenso y elegante con aromas a ciruelas maduras, especias dulces y un toque de vainilla. En boca es robusto pero equilibrado, con taninos sedosos y un final persistente.",
      uva: "Malbec 100%",
      maridaje: "Carnes rojas a la parrilla, cordero, quesos curados",
      alcohol: "14.5%",
      envejecimiento: "12 meses en roble francés",
      temperatura: "16-18°C",
      imagen: botellaMalbec
    },
    {
      id: 2,
      nombre: "Torrontés",
      tipo: "Blanco", 
      anio: 2023,
      descripcion: "Expresivo y aromático, con notas intensas a rosas, jazmín y durazno blanco. Fresco en boca, con buena acidez y un final floral característico de los Valles Calchaquíes.",
      uva: "Torrontés Riojano 100%",
      maridaje: "Sushi, ceviche, comidas picantes, quesos frescos",
      alcohol: "13.8%",
      envejecimiento: "3 meses en acero inoxidable",
      temperatura: "8-10°C",
      imagen: botellaTorrontes
    },
    {
      id: 3,
      nombre: "Arlene Blend",
      tipo: "Blend",
      anio: 2021,
      descripcion: "Una mezcla cuidadosamente elaborada que combina la estructura de variedades tintas con la elegancia y complejidad. Equilibrado y armonioso con capas de frutos rojos y especias.",
      uva: "Blend de variedades seleccionadas",
      maridaje: "Pastas con salsas rojas, carnes blancas, platos mediterráneos",
      alcohol: "14%",
      envejecimiento: "10 meses en barricas de roble",
      temperatura: "15-17°C",
      imagen: botellaParlene
    },
    {
      id: 4,
      nombre: "Natural Sweet",
      tipo: "Dulce",
      anio: 2022,
      descripcion: "Vino dulce natural con aromas frutales intensos y un perfecto equilibrio entre azúcar y acidez. Sedoso en paladar con notas de miel, frutas tropicales y flores blancas.",
      uva: "Variedades seleccionadas para vinos dulces",
      maridaje: "Postres, foie gras, quesos azules, frutas",
      alcohol: "12.5%",
      envejecimiento: "6 meses en acero inoxidable",
      temperatura: "6-8°C",
      imagen: botellaNatural
    },
    {
      id: 5,
      nombre: "Trinita",
      tipo: "Tinto",
      anio: 2019,
      descripcion: "Vino complejo y sutil que representa la esencia del terroir. Proporciones quirúrgicas en su elaboración logran la identidad más fina. Cada elemento contribuye al blend final con distinción.",
      uva: "Blend premium de uvas seleccionadas",
      maridaje: "Carnes de caza, platos gourmet, quesos añejados",
      alcohol: "14.8%",
      envejecimiento: "16 meses en barricas de roble francés",
      temperatura: "17-19°C",
      imagen: botellaTrinita
    }
  ];
  
  const scrollToEtiqueta = () => {
    const etiquetaSection = document.querySelector('.contenido-con-etiqueta');
    if (etiquetaSection) {
      const elementPosition = etiquetaSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100; // 100px más arriba
    
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const siguienteVino = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setVinoActivo((prev) => (prev + 1) % vinos.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const anteriorVino = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setVinoActivo((prev) => (prev - 1 + vinos.length) % vinos.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') siguienteVino();
      if (e.key === 'ArrowLeft') anteriorVino();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

// Función para obtener índices de botellas laterales - 5 BOTELLAS
const getBotellasLaterales = () => {
  const totalVinos = vinos.length;
  
  const indices = [
    (vinoActivo - 2 + totalVinos) % totalVinos, // 2 anterior
    (vinoActivo - 1 + totalVinos) % totalVinos, // 1 anterior
    vinoActivo,                                 // Actual
    (vinoActivo + 1) % totalVinos,              // 1 siguiente
    (vinoActivo + 2) % totalVinos               // 2 siguiente
  ];

  const posiciones = ['left-2', 'left-1', 'center', 'right-1', 'right-2'];
  const distancias = [2, 1, 0, 1, 2];

  return indices.map((index, i) => ({
    index, 
    position: posiciones[i], 
    distance: distancias[i]
  }));
};
  return (
    <div className="carrousel-container" >
    
      <div className="carrousel-wrapper" >
        {/* Flecha izquierda */}
        <button className="flecha flecha-izquierda" onClick={anteriorVino}>
          ‹
        </button>

        {/* Contenedor principal */}
        <div className="carrousel-contenedor">
          {/* Botellas laterales */}
          <div className="botellas-laterales" style={{ 
            background: fondos[vinoActivo].fondo,
            transition: "background 0.8s ease-in-out"
          }}>
              {/* Esquinas decorativas */}
            <img src={esquina} alt="decoración" className="corner top-left" />
            <img src={esquina} alt="decoración" className="corner top-right" />
            <img src={esquina} alt="decoración" className="corner bottom-left" />
            <img src={esquina} alt="decoración" className="corner bottom-right" />

            {getBotellasLaterales().map(({ index, position, distance }) => (
              <motion.div
                key={`${position}-${index}`}
                className={`botella-lateral ${position} ${position === 'center' ? 'activa' : ''}`}
                initial={{ opacity: 0, x: position === 'left' ? -50 : position === 'right' ? 50 : 0 }}
                animate={{ 
                  opacity: position === 'center' ? 1 : 0.4,
                  x: 0,
                  scale: position === 'center' ? 1 : 0.7,
                  y: position === 'center' ? 0 : 20
                }}
                whileHover={{
                  y: -1, // 
                  transition: { 
                    duration: 0.1, // AJUSTAR LA VELOCIDAD - actual: 0.3 segundos
                    ease: "easeOut" 
                  }
                }}
                transition={{ 
                  duration: 0.5,
                  delay: position === 'center' ? 0 : distance * 0.1
                }}
                onClick={() => {
                  setVinoActivo(index);
                  // Solo la botella del centro hace scroll
                  if (position === 'center') {
                    scrollToEtiqueta();
                  }
                }}
              >
                <div className="botella-img-container">
                  <img 
                    src={vinos[index].imagen} 
                    alt={vinos[index].nombre}
                    className="botella-img"
                  />
                </div>
                <div className="nombre-botella-lateral">
                  {vinos[index].nombre}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contenido con etiqueta */}
          <div className="contenido-con-etiqueta">
            <AnimatePresence mode="wait">
              <motion.div
                key={vinoActivo}
                className="vino-slide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }} // El slide desaparece después de todo
              >
                <div className="slide-content-con-botella">
                  {/* Contenedor de etiqueta y botella superpuestos */}
                  <div className="contenedor-superpuesto">
                    {/* Etiqueta que se despliega desde la derecha hacia la izquierda (FONDO) */}
                    <motion.div
                      className="etiqueta-desplegable"
                      initial={{ 
                        scaleX: 0,
                        opacity: 1,
                        x: 50,
                        transformOrigin: "right center"
                      }}
                      animate={{ 
                        scaleX: 1,
                        opacity: 1,
                        x: 0,
                        transformOrigin: "right center"
                      }}
                      exit={{ 
                        scaleX: 1,
                        opacity: 1,
                        x: 50,
                        transformOrigin: "right center",
                        transition: { 
                          duration: 0.4 // Primera en enrollarse
                        }
                      }}
                      transition={{ 
                        delay: 0.3, 
                        duration: 0.6,
                        type: "tween",
                        stiffness: 150
                      }}
                    >
                      <div className="etiqueta-contenido">
                        <div className="etiqueta-header">
                          <h3 className="vino-nombre">{vinos[vinoActivo].nombre}</h3>
                          <span className="vino-tipo-anio">
                            {vinos[vinoActivo].tipo} • {vinos[vinoActivo].anio}
                          </span>
                        </div>

                        <p className="vino-descripcion">
                          {vinos[vinoActivo].descripcion}
                        </p>

                        <div className="vino-detalles">
                          <div className="detalle-columna">
                            <p><strong>Varietal:</strong> {vinos[vinoActivo].uva}</p>
                            <p><strong>Maridaje:</strong> {vinos[vinoActivo].maridaje}</p>
                            <p><strong>Alcohol:</strong> {vinos[vinoActivo].alcohol}</p>
                          </div>
                          <div className="detalle-columna">
                            <p><strong>Envejecimiento:</strong> {vinos[vinoActivo].envejecimiento}</p>
                            <p><strong>Temperatura:</strong> {vinos[vinoActivo].temperatura}</p>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Botella activa a la derecha (DELANTE) */}
                    <motion.div 
                      className="botella-container-activa"
                      initial={{ scale: 0.8, opacity: 0, x: 20 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      exit={{ 
                        scaleX: 0.8,
                        opacity: 0, 
                        x: 20,
                        transition: { 
                          duration: 0.1,
                          delay: 0.8 // Última en desaparecer
                        }
                      }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                    >
                      <div className="botella-activa">
                        <img 
                          src={vinos[vinoActivo].imagen} 
                          alt={vinos[vinoActivo].nombre}
                          className="botella-img-activa"
                        />
                      </div>
                    </motion.div>
                    
                    {/* Etiqueta escondida detrás del vino */}
                    <motion.div
                      className="etiqueta-escondida"style={{ 
                        background: fondos[vinoActivo].fondo,
                        transition: "background 0.8s ease-in-out"
                      }}
                      initial={{ 
                        scaleX: 0,
                        opacity: 0,
                        x: 50,
                        transformOrigin: "right center"
                      }}
                      animate={{ 
                        scaleX: 1,
                        opacity: 0.6,
                        x: 0,
                        transformOrigin: "right center"
                      }}
                      exit={{ 
                        scaleX: 1,
                        opacity: 0,
                        x: 50,
                        transformOrigin: "right center",
                        transition: { 
                          duration: 1,
                          delay: 0.2 // Segunda en enrollarse
                        }
                      }}
                      transition={{ 
                        delay: 0.2, 
                        duration: 0.4,
                        type: "tween",
                        stiffness: 150
                      }}
                      
                    >
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Flecha derecha */}
        <button className="flecha flecha-derecha" onClick={siguienteVino}>
          ›
        </button>
      </div>

    </div>
  );
}

export default VinosCarrousel;