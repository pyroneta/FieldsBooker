import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/SportCarousel.css";

export default function SportCarousel({ sports, fields }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const autoplayRef = useRef(null);
  const total = sports.length;

  const countBySport = (id) =>
  fields.filter((f) => f.sport?.idSport === id).length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  const startAutoplay = useCallback(() => {
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(next, 3500);
  }, [next]);

  const stopAutoplay = () => clearInterval(autoplayRef.current);

  useEffect(() => {
    if (total === 0) return;
    startAutoplay();
    return () => stopAutoplay();
  }, [total, startAutoplay]);

  // Drag / swipe handlers
  const onDragStart = (e) => {
    stopAutoplay();
    setIsDragging(true);
    setDragStart(e.touches ? e.touches[0].clientX : e.clientX);
    setDragDelta(0);
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setDragDelta(x - dragStart);
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDelta < -60) next();
    else if (dragDelta > 60) prev();
    setDragDelta(0);
    startAutoplay();
  };

  if (total === 0) return null;

  // Orden visual: prev, current, next (+ extras para 6 cards)
  const getPosition = (index) => {
    const diff = (index - current + total) % total;
    if (diff === 0) return "center";
    if (diff === 1) return "right1";
    if (diff === 2) return "right2";
    if (diff === total - 1) return "left1";
    if (diff === total - 2) return "left2";
    return "hidden";
  };

  return (
    <div className="carousel-wrapper">
      <div
        className="carousel-stage"
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        {sports.map((sport, i) => {
          const pos = getPosition(i);
          const count = countBySport(sport.idSport);
          return (
            <div
              key={sport.idSport}
              className={`carousel-card pos-${pos}`}
              style={{ "--accent": sport.accent || "#a3e635" }}
              onClick={() => {
                if (pos === "center") {
                  navigate(`/fields?sport=${sport.idSport}`);
                } else {
                  stopAutoplay();
                  setCurrent(i);
                  startAutoplay();
                }
              }}
            >
              {/* Imagen de fondo */}
              <img
                className="carousel-card-bg"
                src={sport.imageUrlSport}
                alt={sport.name}
                draggable={false}
              />

              {/* Overlay */}
              <div className="carousel-card-overlay" />

              {/* Badge */}
              <span className="carousel-card-badge">OLE</span>

              {/* Info con glass */}
              <div className="carousel-card-glass">
                <p className="carousel-card-count">
                  {count} cancha{count !== 1 ? "s" : ""}
                </p>
                <h3 className="carousel-card-name">{sport.name}</h3>
                {pos === "center" && (
                  <span className="carousel-card-cta">Ver canchas →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots de navegación */}
      <div className="carousel-dots">
        {sports.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === current ? "active" : ""}`}
            onClick={() => { stopAutoplay(); setCurrent(i); startAutoplay(); }}
          />
        ))}
      </div>

      {/* Flechas */}
      <button className="carousel-arrow left" onClick={() => { stopAutoplay(); prev(); startAutoplay(); }}>‹</button>
      <button className="carousel-arrow right" onClick={() => { stopAutoplay(); next(); startAutoplay(); }}>›</button>
    </div>
  );
}
