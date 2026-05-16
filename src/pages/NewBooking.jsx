import { useState, useEffect, useMemo, Fragment } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getFields, createBooking, updateBooking } from "../api/axios";
import api from "../api/axios";
import "../css/NewBooking.css";

const SPORT_COLORS = {
  futbol: "#a3e635",
  volleyball: "#fb923c",
  basketball: "#34d399",
  tenis: "#60a5fa",
  padel: "#f472b6",
  futsal: "#facc15",
};

const DAYS   = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];


function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function generateSlots(openingTime, closingTime) {
  const slots = [];
  const [oh, om] = openingTime.split(":").map(Number);
  const [ch, cm] = closingTime.split(":").map(Number);
  let h = oh, m = om;
  while (h < ch || (h === ch && m < cm)) {
    const start = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    m += 60;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    const end = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    if (h < ch || (h === ch && m <= cm)) slots.push({ start, end });
  }
  return slots;
}

function isSlotBooked(slot, dayDate, bookings) {
  const slotStart = new Date(dayDate);
  const [sh, sm] = slot.start.split(":").map(Number);
  slotStart.setHours(sh, sm, 0, 0);
  const slotEnd = new Date(dayDate);
  const [eh, em] = slot.end.split(":").map(Number);
  slotEnd.setHours(eh, em, 0, 0);
  return bookings.some((b) => {
    const bs = new Date(b.dateStart);
    const be = new Date(b.dateEnd);
    return bs < slotEnd && be > slotStart;
  });
}

function isPast(slot, dayDate) {
  const now = new Date();
  const slotStart = new Date(dayDate);
  const [h, m] = slot.start.split(":").map(Number);
  slotStart.setHours(h, m, 0, 0);
  return slotStart < now;
}

function Steps({ current }) {
  const steps = ["Deporte", "Cancha", "Horario", "Pago"];
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <div key={s} className={`step ${i < current ? "done" : i === current ? "active" : ""}`}>
          <div className="step-circle">{i < current ? "✓" : i + 1}</div>
          <span>{s}</span>
          {i < steps.length - 1 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );
}

function QRPopup({ onDone, onError }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min((Date.now() - start) / 5000, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(tick);
        onDone();
      }
    }, 50);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="nb-qr-backdrop">
      <div className="nb-qr-modal">
        <div className="nb-qr-icon">📱</div>
        <p className="nb-qr-msg">aquí iría un qr xd</p>
        <p className="nb-qr-sub">Procesando tu reserva…</p>
        <div className="nb-qr-bar-wrap">
          <div className="nb-qr-bar" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function NewBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId        = searchParams.get("edit");
  const editDateStart = searchParams.get("dateStart");
  const editDateEnd   = searchParams.get("dateEnd");
  const editAmount    = Number(searchParams.get("amount") || 0);
  const isEditMode    = !!editId;

  const [step, setStep]               = useState(0);
  const [fields, setFields]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookings, setBookings]       = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [observations, setObservations] = useState("");
  const [amount, setAmount]           = useState("");
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState("");
  const [qrOpen, setQrOpen]           = useState(false);

  const days = useMemo(() => getNext7Days(), []);

  useEffect(() => {
    getFields()
      .then(setFields)
      .finally(() => setLoading(false));
  }, []);

  // Pre-seleccionar cancha desde ?field=<id>
  useEffect(() => {
    if (loading || fields.length === 0) return;
    const fieldId = searchParams.get("field");
    if (!fieldId) return;
    const match = fields.find((f) => String(f.idField) === String(fieldId));
    if (!match) return;
    setSelectedSport({
      idSport: match.sport?.idSport,
      name: match.sport?.name,
      imageUrlSport: match.sport?.imageUrlSport,
      accent: SPORT_COLORS[match.sport?.name?.toLowerCase()] || "#a3e635",
    });
    setSelectedField(match);
    setStep(2);
  }, [loading, fields, searchParams]);

  // Cargar disponibilidad 7 días al seleccionar cancha
  useEffect(() => {
    if (!selectedField) return;
    const start = new Date(days[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(days[days.length - 1]);
    end.setHours(23, 59, 59, 0);
    const fmt = (d) => d.toISOString().slice(0, 19);
    setLoadingAvail(true);
    setSelectedSlots([]);
    setSelectedDay(0);
    api
      .get(`/fields/${selectedField.idField}/availability?start=${fmt(start)}&end=${fmt(end)}`)
      .then((r) => setBookings(r.data))
      .catch(() => setBookings([]))
      .finally(() => setLoadingAvail(false));
  }, [selectedField, days]);

  const sports = useMemo(() => {
    const seen = new Map();
    fields.forEach((f) => {
      const id = f.sport?.idSport;
      const name = f.sport?.name;
      if (id && !seen.has(id)) {
        seen.set(id, {
          idSport: id, name,
          imageUrlSport: f.sport?.imageUrlSport,
          accent: SPORT_COLORS[name?.toLowerCase()] || "#a3e635",
        });
      }
    });
    return Array.from(seen.values());
  }, [fields]);

  const filteredFields = useMemo(() =>
    fields.filter((f) => f.sport?.idSport === selectedSport?.idSport && f.status === "available"),
  [fields, selectedSport]);

  const slots = useMemo(() => {
    if (!selectedField?.openingTime || !selectedField?.closingTime) return [];
    return generateSlots(selectedField.openingTime, selectedField.closingTime);
  }, [selectedField]);

  // Pre-seleccionar slots cuando se edita una reserva existente
  useEffect(() => {
    if (!isEditMode || !editDateStart || !editDateEnd || slots.length === 0) return;
    const startDate = new Date(editDateStart);
    const endDate   = new Date(editDateEnd);
    const dayIdx = days.findIndex(
      (d) =>
        d.getFullYear() === startDate.getFullYear() &&
        d.getMonth()    === startDate.getMonth() &&
        d.getDate()     === startDate.getDate()
    );
    if (dayIdx < 0) return;
    setSelectedDay(dayIdx);
    const startMins = startDate.getHours() * 60 + startDate.getMinutes();
    const endMins   = endDate.getHours()   * 60 + endDate.getMinutes();
    setSelectedSlots(
      slots.filter((slot) => {
        const [sh, sm] = slot.start.split(":").map(Number);
        const [eh, em] = slot.end.split(":").map(Number);
        return sh * 60 + sm >= startMins && eh * 60 + em <= endMins;
      })
    );
  }, [slots, editDateStart, editDateEnd, isEditMode, days]);

  const toggleSlot = (slot, dayIndex) => {
    const dayDate = days[dayIndex];
    if (isSlotBooked(slot, dayDate, bookings) || isPast(slot, dayDate)) return;
    if (dayIndex !== selectedDay) {
      setSelectedDay(dayIndex);
      setSelectedSlots([slot]);
      return;
    }
    const key = slot.start;
    const exists = selectedSlots.find((s) => s.start === key);
    if (exists) {
      const idx = selectedSlots.findIndex((s) => s.start === key);
      setSelectedSlots(selectedSlots.slice(0, idx));
    } else {
      if (selectedSlots.length === 0) {
        setSelectedSlots([slot]);
      } else {
        const last = selectedSlots[selectedSlots.length - 1];
        if (last.end === slot.start) {
          setSelectedSlots([...selectedSlots, slot]);
        } else {
          setSelectedSlots([slot]);
        }
      }
    }
  };

  const totalHours = selectedSlots.length;
  const totalPrice = selectedField ? totalHours * selectedField.priceHour : 0;
  const minPago    = totalPrice * 0.5;

  // Edit mode: calcular si se necesita pago adicional
  const minRequired      = totalPrice * 0.5;
  const needsPayment     = isEditMode && editAmount < minRequired;
  const minAdditional    = needsPayment ? minRequired - editAmount : 0;
  const additionalOk     = !needsPayment || (additionalAmount !== "" && Number(additionalAmount) >= minAdditional);

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const fmtDate = (base, timeStr) => {
        const d = new Date(base);
        const [h, m] = timeStr.split(":").map(Number);
        d.setHours(h, m, 0, 0);
        return d.toISOString().slice(0, 19);
      };
      await createBooking({
        id_field:     selectedField.idField,
        date_start:   fmtDate(days[selectedDay], selectedSlots[0].start),
        date_end:     fmtDate(days[selectedDay], selectedSlots[selectedSlots.length - 1].end),
        amount:       Number(amount),
        type_payment: "QR",
        observations,
      });
    } catch (e) {
      const msg = e?.response?.data?.message || "Error al crear la reserva";
      setError(msg);
      throw msg;
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const fmtDate = (base, timeStr) => {
        const d = new Date(base);
        const [h, m] = timeStr.split(":").map(Number);
        d.setHours(h, m, 0, 0);
        return d.toISOString().slice(0, 19);
      };
      await updateBooking(
        editId,
        fmtDate(days[selectedDay], selectedSlots[0].start),
        fmtDate(days[selectedDay], selectedSlots[selectedSlots.length - 1].end),
        needsPayment && additionalAmount !== "" ? Number(additionalAmount) : undefined,
      );
      setSuccess(true);
    } catch (e) {
      setError(e?.response?.data?.message || "Error al actualizar la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQR = () => {
    setError("");
    setQrOpen(true);
    submit().catch(() => setQrOpen(false));
  };

  const amountOk = Number(amount) >= minPago && amount !== "";

  if (success) {
    return (
      <main className="nb-page">
        <div className="nb-success">
          <div className="nb-success-icon">✓</div>
          <h2>{isEditMode ? "¡Reserva actualizada!" : "¡Reserva confirmada!"}</h2>
          <p>{selectedField?.name} · {selectedSlots[0]?.start} – {selectedSlots[selectedSlots.length - 1]?.end}</p>
          <button onClick={() => navigate("/mybookings")}>Ver mis reservas</button>
        </div>
      </main>
    );
  }

  return (
    <main className="nb-page">
      <div className="nb-header">
        <h1 className="nb-title">
          {isEditMode ? <>EDITAR <span>RESERVA</span></> : <>NUEVA <span>RESERVA</span></>}
        </h1>
        {!isEditMode && <Steps current={step} />}
      </div>

      <div className="nb-body">

        {/* STEP 0 — Deporte */}
        {step === 0 && (
          <div className="nb-step">
            <h2>Elegí un deporte</h2>
            <div className="nb-sports-grid">
              {sports.map((s) => (
                <button key={s.idSport} onClick={() => { setSelectedSport(s); setStep(1); }}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 — Cancha */}
        {step === 1 && (
          <div className="nb-step">
            <h2>Elegí una cancha</h2>
            <div className="nb-fields-grid">
              {filteredFields.map((f) => (
                <button key={f.idField} onClick={() => setSelectedField(f)}>
                  <p>{f.name}</p>
                  <p>{f.ubication}</p>
                  <p>Bs {f.priceHour}</p>
                </button>
              ))}
            </div>
            <button disabled={!selectedField} onClick={() => setStep(2)}>Continuar</button>
          </div>
        )}

        {/* STEP 2 — Horario */}
        {step === 2 && (
          <div className="nb-step nb-step--schedule">
            <h2>Elegí horario</h2>

            {loadingAvail ? (
              <div className="nb-loading">Cargando disponibilidad…</div>
            ) : (
              <div className="nb-schedule-wrap">
                <div className="nb-schedule-grid">
                  <div className="nb-schedule-corner" />
                  {days.map((d, i) => (
                    <div
                      key={i}
                      className={`nb-day-header${i === selectedDay && selectedSlots.length > 0 ? " nb-day-header--active" : ""}`}
                    >
                      <span className="nb-day-name">{DAYS[d.getDay()]}</span>
                      <span className="nb-day-num">{d.getDate()} {MONTHS[d.getMonth()]}</span>
                    </div>
                  ))}
                  {slots.map((slot) => (
                    <Fragment key={slot.start}>
                      <div className="nb-time-label">{slot.start}</div>
                      {days.map((d, i) => {
                        const booked = isSlotBooked(slot, d, bookings);
                        const past   = isPast(slot, d);
                        const sel    = i === selectedDay && selectedSlots.some((s) => s.start === slot.start);
                        const state  = booked ? "booked" : past ? "past" : sel ? "selected" : "free";
                        return (
                          <button
                            key={i}
                            className={`nb-block nb-block--${state}`}
                            disabled={booked || past}
                            onClick={() => toggleSlot(slot, i)}
                            title={`${slot.start}–${slot.end}${booked ? " · Ocupado" : ""}`}
                          />
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            )}

            <div className="nb-legend">
              <div className="nb-legend-item"><span className="nb-legend-dot nb-legend-dot--free" />Libre</div>
              <div className="nb-legend-item"><span className="nb-legend-dot nb-legend-dot--booked" />Ocupado</div>
              <div className="nb-legend-item"><span className="nb-legend-dot nb-legend-dot--selected" />Seleccionado</div>
              <div className="nb-legend-item"><span className="nb-legend-dot nb-legend-dot--past" />Pasado</div>
            </div>

            {selectedSlots.length > 0 && (
              <div className="nb-selection-bar">
                <div className="nb-selection-info">
                  <strong>{DAYS[days[selectedDay].getDay()]} {days[selectedDay].getDate()} {MONTHS[days[selectedDay].getMonth()]}</strong>
                  <span>{selectedSlots[0].start} – {selectedSlots[selectedSlots.length - 1].end}</span>
                  <span>{selectedSlots.length}h · Bs {totalPrice.toFixed(0)}</span>
                </div>
                {!isEditMode && (
                  <button className="nb-btn" onClick={() => setStep(3)}>Confirmar horario →</button>
                )}
              </div>
            )}

            {/* Sección de pago en modo edición */}
            {isEditMode && selectedSlots.length > 0 && (
              <div className="nb-pay-summary nb-edit-pay">
                <div className="nb-pay-row">
                  <span>Nuevo total</span>
                  <strong>Bs {totalPrice.toFixed(0)}</strong>
                </div>
                <div className="nb-pay-row">
                  <span>Ya abonado</span>
                  <strong>Bs {editAmount.toFixed(0)}</strong>
                </div>
                {needsPayment ? (
                  <div className="nb-pay-section">
                    <p className="nb-pay-label">Monto adicional a depositar vía QR</p>
                    <p className="nb-pay-hint">Mínimo Bs {minAdditional.toFixed(0)} <span className="nb-muted">(para alcanzar el 50%)</span></p>
                    <input
                      type="number"
                      placeholder={`Bs ${minAdditional.toFixed(0)}`}
                      value={additionalAmount}
                      min={minAdditional}
                      onChange={(e) => setAdditionalAmount(e.target.value)}
                    />
                    {additionalAmount !== "" && Number(additionalAmount) < minAdditional && (
                      <p className="nb-pay-warning">El mínimo adicional es Bs {minAdditional.toFixed(0)}</p>
                    )}
                  </div>
                ) : (
                  <p className="nb-pay-hint" style={{ marginTop: 8 }}>
                    El monto ya abonado cubre el mínimo requerido. Podés guardar sin pagar más.
                  </p>
                )}

                {error && <p className="nb-error">{error}</p>}

                <button
                  className="nb-btn"
                  onClick={submitEdit}
                  disabled={submitting || !additionalOk}
                >
                  {submitting ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Pago */}
        {step === 3 && (
          <div className="nb-step">
            <h2>Pago</h2>

            {/* Resumen */}
            <div className="nb-pay-summary">
              <div className="nb-pay-row">
                <span>Cancha</span>
                <strong>{selectedField?.name}</strong>
              </div>
              <div className="nb-pay-row">
                <span>Fecha</span>
                <strong>
                  {DAYS[days[selectedDay].getDay()]} {days[selectedDay].getDate()} {MONTHS[days[selectedDay].getMonth()]}
                </strong>
              </div>
              <div className="nb-pay-row">
                <span>Horario</span>
                <strong>{selectedSlots[0]?.start} – {selectedSlots[selectedSlots.length - 1]?.end}</strong>
              </div>
              <div className="nb-pay-row">
                <span>Duración</span>
                <strong>{totalHours}h</strong>
              </div>
              <div className="nb-pay-row nb-pay-row--total">
                <span>Total</span>
                <strong>Bs {totalPrice.toFixed(0)}</strong>
              </div>
            </div>

            {/* Monto */}
            <div className="nb-pay-section">
              <p className="nb-pay-label">Monto a depositar vía QR</p>
              <p className="nb-pay-hint">Mínimo Bs {minPago.toFixed(0)} <span className="nb-muted">(50% del total)</span></p>
              <input
                type="number"
                placeholder={`Bs ${minPago.toFixed(0)}`}
                value={amount}
                min={minPago}
                max={totalPrice}
                onChange={(e) => setAmount(e.target.value)}
              />
              {amount !== "" && Number(amount) < minPago && (
                <p className="nb-pay-warning">Para reservar debe ser mínimo la mitad (Bs {minPago.toFixed(0)})</p>
              )}
            </div>

            {/* Observaciones */}
            <div className="nb-pay-section">
              <p className="nb-pay-label">Observaciones <span className="nb-muted">(opcional)</span></p>
              <textarea
                rows={3}
                placeholder="Alguna nota para la cancha..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            {error && <p className="nb-error">{error}</p>}

            {amountOk && (
              <button className="nb-btn nb-btn--qr" onClick={handleGenerateQR} disabled={submitting}>
                Generar QR →
              </button>
            )}
          </div>
        )}

      </div>

      {/* QR Popup */}
      {qrOpen && (
        <QRPopup
          onDone={() => { setQrOpen(false); setSuccess(true); }}
          onError={(msg) => { setQrOpen(false); setError(msg); }}
        />
      )}
    </main>
  );
}
