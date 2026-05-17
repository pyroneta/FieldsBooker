import { Link } from "react-router-dom";
import "../css/FieldCard.css";

const SPORT_COLORS = {
  "1": "#a3e635",
  "2": "#fb923c",
  "3": "#34d399",
  "4": "#60a5fa",
  "5": "#f472b6",
};

export default function FieldCard({ field, sportName, delay = 0 }) {

  const accent = SPORT_COLORS[field.sportId] || "#a3e635";

  const available = field.status === "available";

  return (
    <Link
      to={`/fields/${field.idField}`}
      className="field-card fade-up"
      style={{ animationDelay: `${delay}ms`, "--accent": accent }}
    >
      <div className="field-card-img">

        {field.imagenUrl ? (
  <img
  src={field.imagenUrl}
  alt={field.name}
  className={!available ? "field-disabled-img" : ""}
/>
) : (
          <div className="field-card-placeholder">
            <span>{sportName?.charAt(0) || ""}</span>
          </div>
        )}

        {!available && (
  <div className="field-unavailable-overlay">
    NO DISPONIBLE
  </div>
)}
      </div>

      <div className="field-card-body">

        <p className="field-card-sport">{sportName}</p>

        <h3 className="field-card-name">
          {field.name}
        </h3>

        <p className="field-card-location">
           {field.ubication}
        </p>

        <div className="field-card-footer">

          <span className="field-card-price">
            <strong>Bs {field.priceHour}</strong>/hr
          </span>

          {available && (
            <span className="field-card-action">
              Book →
            </span>
          )}

        </div>
      </div>
    </Link>
  );
}