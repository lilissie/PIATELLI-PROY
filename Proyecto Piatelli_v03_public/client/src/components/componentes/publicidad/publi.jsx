// src/components/ReviewCard.js
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./publi.css";

import fondo from "../decoraciones/fondo.png";

function Publicidad({ rating, text, author }) {
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Opcional: dejar de observar después de que se activa
          // observer.unobserve(componentRef.current);
        }
      },
      {
        threshold: 0.3, // Se activa cuando el 30% del componente es visible
        rootMargin: "0px 0px -50px 0px", // Se activa un poco antes de que entre completamente
      }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
    };
  }, []);

  const handleReservarClick = () => {
    // Ya estamos usando Link, pero por si necesitas lógica adicional
    console.log("Redirigiendo a habitaciones");
  };

  return (
    <div
      ref={componentRef}
      className={`publi-img-container ${isVisible ? "visible" : ""}`}
    >
      <img src={fondo} alt="bodega piatelli" className="img-fondo" />
      <div className="publi-overlay">
        <p className="texto">
          El momento perfecto para disfrutar del vino, la naturaleza y el relax
          está a un clic de distancia. ¡Hacé tu reserva y descubrí Piattelli!
        </p>
        <Link to="/Habitaciones">
          <button className="btn-reserva" onClick={handleReservarClick}>
            Reservar
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Publicidad;
