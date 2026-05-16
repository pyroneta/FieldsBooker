import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFields } from "../api/axios";
import "../css/Home.css";

const SPORT_COLORS = {
  futbol:     "#66ba51",
  volleyball: "#eef442",
  basketball: "#ff9d42",
  tenis:      "#d7e9ff",
  padel:      "#ddb1f0",
  futsal:     "#4c3eeb",
};

export default function Home() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef(null);
  const dragStart = useRef(null);

  useEffect(() => {
    getFields()
      .then((f) => setFields(f))
      .finally(() => setLoading(false));
  }, []);

  const sports = useMemo(() => {
    const seen = new Map();
    fields.forEach((f) => {
      const id   = f.sport?.idSport;
      const name = f.sport?.name;
      const img  = f.sport?.imageUrlSport;
      if (id && !seen.has(id)) {
        seen.set(id, {
  idSport: id,
  name,
  imageUrlSport: img,
  accent: SPORT_COLORS[name?.toLowerCase()] || "#a3e635",
  count: 0,

});
      }
    });
    fields.forEach((f) => {
      const id = f.sport?.idSport;
      if (id && seen.has(id)) seen.get(id).count++;
    });
    return Array.from(seen.values());
  }, [fields]);

  const total = sports.length;
  const activeSport   = sports[current];
  const nextSport     = sports[(current + 1) % total];

  const goTo = useCallback((i) => {
    setCurrent((total + i) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  const startAutoplay = useCallback(() => {
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(next, 4000);
  }, [next]);

  useEffect(() => {
    if (total === 0) return;
    startAutoplay();
    return () => clearInterval(autoplayRef.current);
  }, [total, startAutoplay]);

  const onDragStart = (e) => {
    clearInterval(autoplayRef.current);
    dragStart.current = e.touches ? e.touches[0].clientX : e.clientX;
  };
  const onDragEnd = (e) => {
    if (dragStart.current === null) return;
    const end = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const delta = end - dragStart.current;
    if (delta < -50) next();
    else if (delta > 50) prev();
    dragStart.current = null;
    startAutoplay();
  };

  return (
    <div
      className="home-fullscreen"
      onMouseDown={onDragStart}
      onMouseUp={onDragEnd}
      onTouchStart={onDragStart}
      onTouchEnd={onDragEnd}
    >
      {/* Fondos dinámicos */}
      {sports.map((s, i) => (
        <div
          key={s.idSport}
          className={`home-bg ${i === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${s.imageUrlSport})` }}
        />
      ))}
      <div className="home-bg-overlay" />

      

      <main className="home-layout">
        {/* ── Izquierda: texto pegado abajo ── */}
        <div className="home-left">
          <p className="hero-eyebrow">Santa Cruz de la Sierra</p>

          <h1 className="hero-title">
  RESERVÁ TU CANCHA<br />
  <span
    className="hero-accent"
    style={{ color: activeSport?.accent }}
  >
    {activeSport?.name?.toUpperCase() || "CANCHA"}
  </span>
</h1>

          <p className="hero-sub">
            Elegí tu cancha, seleccioná el horario disponible y reservá al instante.
            Sin llamadas, sin esperas.
          </p>

          <div className="hero-actions">
            <Link to="/fields" className="btn-primary" style={{ background: activeSport?.accent }}>
              EXPLORAR CANCHAS
            </Link>
            <Link to="/bookings" className="btn-ghost">Mis reservas</Link>
          </div>

          {/* Flechas + dots abajo a la izquierda */}
          <div className="hero-nav">
            <button className="nav-arrow" onClick={() => { clearInterval(autoplayRef.current); prev(); startAutoplay(); }}>‹</button>
            <button className="nav-arrow" onClick={() => { clearInterval(autoplayRef.current); next(); startAutoplay(); }}>›</button>
            <div className="carousel-dots">
              {sports.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot ${i === current ? "active" : ""}`}
                  style={i === current ? { background: activeSport?.accent, width: 24 } : {}}
                  onClick={() => { clearInterval(autoplayRef.current); goTo(i); startAutoplay(); }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Derecha: tarjeta principal + secundaria asomándose ── */}
        {!loading && total > 0 && (
          <div className="home-right">
            {/* Tarjeta principal (deporte activo) */}
            <div
              className="main-card"
              style={{ "--accent": activeSport?.accent }}
              onClick={() => navigate(`/fields?sport=${activeSport?.idSport}`)}
            >
              <img
                className="main-card-bg"
                src={activeSport?.imageUrlSport}
                alt={activeSport?.name}
                draggable={false}
              />
              <div className="main-card-overlay" />
              
              <div className="main-card-glass">
                <p className="main-card-eyebrow">{activeSport?.count} canchas disponibles</p>
                <h2 className="main-card-title">{activeSport?.name?.toUpperCase()}</h2>
                <span className="main-card-cta">Explorar canchas →</span>
              </div>
            </div>

            {/* Tarjeta secundaria (siguiente deporte, asomándose) */}
            {nextSport && nextSport.idSport !== activeSport?.idSport && (
              <div
                className="peek-card"
                style={{ "--accent": nextSport?.accent }}
                onClick={() => { clearInterval(autoplayRef.current); next(); startAutoplay(); }}
              >
                <img
                  className="peek-card-bg"
                  src={nextSport?.imageUrlSport}
                  alt={nextSport?.name}
                  draggable={false}
                />
                <div className="peek-card-overlay" />
                <div className="peek-card-info">
                  <p className="peek-card-sport">{nextSport?.name?.toUpperCase()}</p>
                  <p className="peek-card-name">{nextSport?.count} canchas</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
