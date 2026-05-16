import { useNavigate } from "react-router-dom";
import "../css/SportCard.css";

export default function SportCard({ sport, count, delay = 0 }) {
  const navigate = useNavigate();

  return (
    <button
      className="sport-card fade-up"
      style={{ animationDelay: `${delay}ms`, "--accent": sport.accent }}
      onClick={() => navigate(`/fields?sport=${sport.idSport}`)}
    >
      {/* Imagen de fondo full-card */}
      <img
        className="sport-card-bg"
        src={sport.imageUrlSport}
        alt={sport.name}
      />

      {/* Overlay oscuro degradado */}
      <div className="sport-card-overlay" />

      {/* Badge superior izquierdo */}
      <span className="sport-card-badge">OLE</span>

      {/* Contenido inferior con glass */}
      <div className="sport-card-glass">
        <p className="sport-card-count">
          {count} cancha{count !== 1 ? "s" : ""} disponibles
        </p>
        <h3 className="sport-card-name">{sport.name}</h3>
        <span className="sport-card-link">
          Ver canchas →
        </span>
      </div>
    </button>
  );
}
