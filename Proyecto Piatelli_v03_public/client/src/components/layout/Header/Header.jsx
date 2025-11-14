// src/components/Header.js
import { NavLink } from "react-router-dom";
import esquina from "../../componentes/decoraciones/Nav-Esquina sevillana.png";
import "./Header.css";

function Header() {
    return (
    <header className="header">
        <img src={esquina} alt="decoración" className="corner top-left" />
        <img src={esquina} alt="decoración" className="corner top-right" />
        <img src={esquina} alt="decoración" className="corner bottom-left" />
        <img src={esquina} alt="decoración" className="corner bottom-right" />
        <div className="logo">PIATTELLI</div>

      <nav className="nav-links">
                <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "active-link" : ""}
        >
          Inicio
        </NavLink>

        <NavLink 
          to="/actividades" 
          className={({ isActive }) => isActive ? "active-link" : ""}
        >
          Actividades
        </NavLink>

        <NavLink 
          to="/vinos" 
          className={({ isActive }) => isActive ? "active-link" : ""}
        >
          Vinos
        </NavLink>

        <NavLink 
          to="/habitaciones" 
          className={({ isActive }) => isActive ? "active-link" : ""}
        >
          Habitaciones
        </NavLink>

        <NavLink 
          to="/ubicacion" 
          className={({ isActive }) => isActive ? "active-link" : ""}
        >
          Ubicación
        </NavLink>

        <a 
          href="https://wa.me/549XXXXXXXXXX" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Contacto
        </a>

      </nav>
    </header>
    );
}

export default Header;
