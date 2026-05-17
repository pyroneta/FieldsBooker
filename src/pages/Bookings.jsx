import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBookings, cancelBooking } from "../api/axios";
import "../css/Bookings.css";

const fmtDate = (dt) =>
  new Date(dt).toLocaleString("es-BO", {
    weekday: "short", day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });

const fmtTime = (dt) =>
  new Date(dt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });

const STATUS_LABEL = {
  pending:   "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const STATUS_CLASS = {
  pending:   "pending",
  confirmed: "disponible",
  cancelled: "no_disponible",
  completed: "completed",
};

const PAYMENT_LABEL = {
  QR:       "QR",
  cash:     "Efectivo",
  card:     "Tarjeta",
  transfer: "Transferencia",
};

function getCardState(b) {
  if (b.status === "cancelled") return "cancelled";
  if (b.status === "completed" || new Date(b.dateStart) < new Date()) return "past";
  return "active";
}

function isPast(b) {
  return getCardState(b) !== "active";
}

function isCancellable(b) {
  return b.status !== "cancelled" && new Date(b.dateStart) > new Date();
}

function pagoLabel(b) {
  if (b.amount == null || b.total == null) return "–";
  return Number(b.amount) >= Number(b.total) ? "Completo" : "Parcial";
}

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getBookings()
      .then(setBookings)
      .catch(() => setError("Error al cargar las reservas"))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (e, id) => {
    e.stopPropagation();
    if (!confirm("¿Seguro que querés cancelar esta reserva?")) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => b.idBooking === id ? { ...b, status: "cancelled" } : b)
      );
    } catch (err) {
      alert(err?.response?.data?.message || "No se pudo cancelar la reserva");
    } finally {
      setCancelling(null);
    }
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <main className="res-page">
      <div className="res-header">
        <h1 className="res-title">TODAS LAS<br /><span>RESERVAS</span></h1>
      </div>

      {loading ? (
        <p className="res-empty">Cargando reservas...</p>
      ) : error ? (
        <p className="res-empty">{error}</p>
      ) : bookings.length === 0 ? (
        <p className="res-empty">
          No tenés reservas aún.{" "}
          <Link to="/fields">Explorá canchas →</Link>
        </p>
      ) : (
        <div className="res-list">
          {bookings.map((b, i) => {
            const isExpanded = expanded === b.idBooking;
            const past = isPast(b);
            const cardState = getCardState(b);

            return (
              <div
                key={b.idBooking}
                className={`res-card fade-up res-card--${cardState}${isExpanded ? " res-card--open" : ""}`}
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => toggle(b.idBooking)}
              >
                <div className="res-card-accent-bar" />

                {/* ── Main row ── */}
                <div className="res-card-body">
                  <div className="res-card-left">
                    <h3 className="res-field">{b.fieldName || "Cancha"}</h3>
                    <p className="res-client">{b.clientPhone || "–"}</p>
                    <div className="res-time">
                      <span>🗓 {fmtDate(b.dateStart)}</span>
                      <span className="res-arrow">→</span>
                      <span>{fmtTime(b.dateEnd)}</span>
                    </div>
                  </div>

                  <div className="res-card-right">
                    <span className={`tag ${STATUS_CLASS[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                    <p className="res-total">Bs {b.total}</p>
                    <span className="res-chevron">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* ── Detail panel ── */}
                {isExpanded && (
                  <div className="res-detail" onClick={(e) => e.stopPropagation()}>
                    <div className="res-detail-grid">
                      <div className="res-detail-item">
                        <span className="res-detail-label">Email</span>
                        <span>{b.clientEmail || "–"}</span>
                      </div>
                      <div className="res-detail-item">
                        <span className="res-detail-label">Teléfono</span>
                        <span>{b.clientPhone || "–"}</span>
                      </div>
                      {b.amount != null && (
                        <div className="res-detail-item">
                          <span className="res-detail-label">Tipo de pago</span>
                          <span>{pagoLabel(b)}</span>
                        </div>
                      )}
                      {b.typePayment != null && (
                        <div className="res-detail-item">
                          <span className="res-detail-label">Método</span>
                          <span>{PAYMENT_LABEL[b.typePayment] ?? b.typePayment}</span>
                        </div>
                      )}
                      {b.amount != null && (
                        <div className="res-detail-item">
                          <span className="res-detail-label">Monto abonado</span>
                          <span>Bs {b.amount}</span>
                        </div>
                      )}
                      <div className="res-detail-item">
                        <span className="res-detail-label">Total</span>
                        <span>Bs {b.total}</span>
                      </div>
                      <div className="res-detail-item">
                        <span className="res-detail-label">ID</span>
                        <span className="res-id">#{b.idBooking}</span>
                      </div>
                      {b.observations && (
                        <div className="res-detail-item res-detail-full">
                          <span className="res-detail-label">Observaciones</span>
                          <span>{b.observations}</span>
                        </div>
                      )}
                    </div>

                    <div className="res-detail-actions">
                      {isCancellable(b) && (
                        <button
                          className="btn-edit"
                          onClick={() => navigate(
                            `/bookings/new?field=${b.idField}&edit=${b.idBooking}&dateStart=${encodeURIComponent(b.dateStart)}&dateEnd=${encodeURIComponent(b.dateEnd)}&amount=${b.amount ?? 0}`
                          )}
                        >
                          Editar reserva
                        </button>
                      )}
                      {isCancellable(b) && (
                        <button
                          className="btn-cancel"
                          onClick={(e) => handleCancel(e, b.idBooking)}
                          disabled={cancelling === b.idBooking}
                        >
                          {cancelling === b.idBooking ? "Cancelando…" : "Cancelar"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
