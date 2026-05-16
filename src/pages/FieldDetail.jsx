import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getFieldById } from "../api/axios";
import "../css/FieldDetail.css";

export default function FieldDetail() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [field, setField] = useState(null);

  const [loading, setLoading] = useState(true);

  const [notFound, setNotFound] = useState(false);

  useEffect(() => {

    getFieldById(id)
      .then((f) => setField(f))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

  }, [id]);

  if (loading) {
    return (
      <div className="not-found">
        <p>Cargando...</p>
      </div>
    );
  }

  if (notFound || !field) {
    return (
      <div className="not-found">
        <h2>Cancha no encontrada</h2>
        <Link to="/fields">← Volver</Link>
      </div>
    );
  }

  const available = field.status === "available";

  return (
    <main className="detail-page">

      <Link to="/fields" className="detail-back">
        ← Volver a canchas
      </Link>

      <div className="detail-layout">

        <div className="detail-left">

          <div className="detail-img">

            {field.imagenUrl ? (

              <img
                src={field.imagenUrl}
                alt={field.name}
              />

            ) : (

              <div className="detail-placeholder">
                ⚽
              </div>

            )}

            <span className={`tag ${field.status} detail-status`}>
              {available ? "Disponible" : "No disponible"}
            </span>

          </div>

          <div className="detail-info">

            <p className="detail-sport">
              {field.sport?.name}
            </p>

            <h1 className="detail-name">
              {field.name}
            </h1>

            <p className="detail-location">
              📍 {field.ubication}
            </p>

            {field.description && (
              <p className="detail-desc">
                {field.description}
              </p>
            )}

            <div className="detail-price">

              <span>Precio por hora</span>

              <strong>
                Bs {field.priceHour}
              </strong>

            </div>

          </div>

        </div>

        {available && (

          <div className="detail-reserve-box">

            <h2 className="reserve-box-title">
              RESERVAR
            </h2>

            <p className="reserve-box-sub">
              Completá el formulario para reservar esta cancha.
            </p>

            <button
              className="btn-primary reserve-btn"
              onClick={() =>
                navigate(`/bookings/new?field=${field.idField}`)
              }
            >
              Ir a reservar →
            </button>

          </div>

        )}

      </div>

    </main>
  );
}