import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import userDef1 from "../../../assets/user-def-1.png";
import userDef2 from "../../../assets/user-def-2.png";
import userDef3 from "../../../assets/user-def-3.png";
import { supabase } from "../../../supabase/client";
import "./valo.css";

// Hook para obtener valoraciones desde la BD
function useValoracionesDesdeBD() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarValoraciones = async () => {
      try {
        setLoading(true);
        setError(null);

        // Consultar valoraciones con información de usuarios
        const { data: valoracionesData, error: errorValoraciones } = await supabase
          .from('valoraciones')
          .select(`
            valoracion,
            comentario,
            clientes (
              nom_cli,
              apel_cli
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (errorValoraciones) throw errorValoraciones;

        console.log("Valoraciones desde BD:", valoracionesData);

        // Mapear los datos de BD a la estructura que necesita el frontend
        const reviewsMapeadas = valoracionesData.map((valoracion, index) => {
          // Asignar imágenes por defecto basado en el índice
          const imagenesPorDefecto = [userDef1, userDef2, userDef3];
          const imagenIndex = index % imagenesPorDefecto.length;

          return {
            id: index + 1,
            rating: valoracion.valoracion,
            text: valoracion.comentario || "Excelente experiencia en general",
            author: valoracion.clientes ? 
              `${valoracion.clientes.nom_cli} ${valoracion.clientes.apel_cli}` : 
              "Cliente",
            image: imagenesPorDefecto[imagenIndex]
          };
        });

        // Si no hay valoraciones en BD, usar las por defecto
        const reviewsFinal = reviewsMapeadas.length > 0 ? reviewsMapeadas : [
          {
            id: 1,
            rating: 4,
            text: "Buen vino, buenas camas",
            author: "Nicolas Celaya",
            image: userDef1,
          },
          {
            id: 2,
            rating: 5,
            text: "Calidad excepcional, superó todas mis expectativas completamente",
            author: "Juan Pérez",
            image: userDef2,
          },
          {
            id: 3,
            rating: 4,
            text: "Excelente servicio, muy recomendado para cualquier ocasión especial",
            author: "María González",
            image: userDef3,
          },
        ];

        setReviews(reviewsFinal);

      } catch (err) {
        console.error("Error cargando valoraciones:", err);
        setError(err.message);
        // En caso de error, usar reviews por defecto
        setReviews([
          {
            id: 1,
            rating: 4,
            text: "Buen vino, buenas camas",
            author: "Nicolas Celaya",
            image: userDef1,
          },
          {
            id: 2,
            rating: 5,
            text: "Calidad excepcional, superó todas mis expectativas completamente",
            author: "Juan Pérez",
            image: userDef2,
          },
          {
            id: 3,
            rating: 4,
            text: "Excelente servicio, muy recomendado para cualquier ocasión especial",
            author: "María González",
            image: userDef3,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    cargarValoraciones();
  }, []);

  return { reviews, loading, error };
}

function ReviewCard() {
  const { reviews, loading, error } = useValoracionesDesdeBD();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBlurred, setIsBlurred] = useState(false);

  // ✅ CORREGIDO: useEffect que se reinicia cuando las reviews cambian
  useEffect(() => {
    // Solo configurar timers si hay reviews disponibles
    if (loading || reviews.length === 0) return;

    const blurTimer = setTimeout(() => {
      setIsBlurred(true);
    }, 6000); // Blur después de 6 segundos

    const changeTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
      setIsBlurred(false);
    }, 8000); // Cambiar review después de 8 segundos

    return () => {
      clearTimeout(blurTimer);
      clearTimeout(changeTimer);
    };
  }, [currentIndex, loading, reviews.length]); // ✅ Agregar reviews.length como dependencia

  // ✅ CORREGIDO: Manejar loading state primero
  if (loading) {
    return (
      <div className="review-container">
        <p>Cargando valoraciones...</p>
      </div>
    );
  }

  // ✅ CORREGIDO: Manejar error state
  if (error) {
    console.error("Error cargando reviews:", error);
    // El hook ya estableció reviews por defecto, así que continuamos
  }

  // ✅ CORREGIDO: Validar que hay reviews antes de continuar
  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-container">
        <p>No hay valoraciones disponibles</p>
      </div>
    );
  }

  const currentReview = reviews[currentIndex];
  
  // ✅ CORREGIDO: Validación adicional con valores por defecto
  if (!currentReview) {
    return (
      <div className="review-container">
        <p>Error cargando la valoración actual</p>
      </div>
    );
  }

  return (
    <div className="review-container">
      <motion.div
        className="review-bg-shape review-shape-1"
        animate={{
          x: [0, 20, 0, -20, 0],
          y: [0, -15, 0, 15, 0],
          rotate: [0, 3, 0, -3, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="review-bg-shape review-shape-2"
        animate={{
          x: [0, -18, 0, 18, 0],
          y: [0, 20, 0, -20, 0],
          rotate: [0, -5, 0, 5, 0],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="review-bg-shape review-shape-3"
        animate={{
          x: [0, 15, 0, -15, 0],
          y: [0, -18, 0, 18, 0],
          rotate: [0, 6, 0, -6, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="review-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={`card-${currentReview.id}-${currentIndex}`} // ✅ Agregar currentIndex para forzar re-render
            className="review-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="review-chat-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            >
              <div className="review-chat-dot"></div>
              <div className="review-chat-dot"></div>
              <div className="review-chat-dot"></div>
            </motion.div>

            <motion.div
              className="review-image-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              <img
                src={currentReview.image}
                alt={currentReview.author}
                className={`review-image ${
                  isBlurred ? "review-image-blurred" : ""
                }`}
                onError={(e) => {
                  e.target.src = userDef1; // Fallback si la imagen falla
                }}
              />
            </motion.div>

            <div className="review-content">
              <div className="review-rating">
                <div className="review-stars-container">
                  {[...Array(5)].map((_, index) => (
                    <motion.span
                      key={index}
                      className={`review-star ${
                        index < currentReview.rating
                          ? "review-star-filled"
                          : "review-star-empty"
                      }`}
                      initial={{ opacity: 0, scale: 0, rotate: -120 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }}
                      transition={{
                        delay: 0.2 + index * 0.12,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                    >
                      {index < currentReview.rating ? "★" : "☆"}
                    </motion.span>
                  ))}
                </div>
                <motion.span
                  className="review-rating-text"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 0.7, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {currentReview.rating}.0 rating
                </motion.span>
              </div>

              <div className="review-text">
                {currentReview.text.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    className="review-text-word"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.6 + index * 0.06,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  >
                    {word}{" "}
                  </motion.span>
                ))}
              </div>

              <motion.p
                className="review-author"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
              >
                {currentReview.author}
              </motion.p>

              <motion.div
                className="review-progress-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.4 }}
              >
                <motion.div
                  className="review-progress-fill"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 8, ease: "linear" }} // ✅ Ajustado a 8 segundos para coincidir con el cambio
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ReviewCard;