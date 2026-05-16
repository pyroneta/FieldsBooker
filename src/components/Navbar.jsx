import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css";
import UserPopup from "./UserPopup";

const links = [
  { to: "/",           label: "Explorar"     },
  { to: "/fields",     label: "Canchas"      },
  { to: "/mybookings", label: "Mis Reservas" },
  { to: "/bookings",   label: "Reservas"     },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);

  const hamburgerBtn = (
    <button
      className={`hamburger ${open ? "open" : ""}`}
      onClick={() => setOpen(!open)}
      aria-label="Menú"
    >
      <span />
      <span />
      <span />
    </button>
  );

  return (
    <>
      {isHome ? (
        <nav className="navbar navbar-home">
          <Link to="/" className="navbar-logo">
            <span className="logo-bracket">[</span>OLÉ<span className="logo-bracket">]</span>
          </Link>
          <ul className="navbar-links">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={pathname === l.to ? "active" : ""}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="navbar-home-actions">
            <Link to="/bookings/new" className="navbar-cta">+ Reservar</Link>
            <UserPopup />
            {hamburgerBtn}
          </div>
        </nav>
      ) : (
        <nav className="navbar navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="logo-bracket">[</span>OLE<span className="logo-bracket">]</span>
          </Link>
          <div className="navbar-inner-right">
            <Link to="/bookings/new" className="navbar-cta">+ Reservar</Link>
            <UserPopup />
            {hamburgerBtn}
          </div>
        </nav>
      )}

      {/* Drawer compartido */}
      <div className={`nav-drawer ${open ? "open" : ""}`}>
        <div className="nav-drawer-overlay" onClick={() => setOpen(false)} />
        <div className="nav-drawer-panel">
          <div className="nav-drawer-header">
            <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
              <span className="logo-bracket">[</span>OLE<span className="logo-bracket">]</span>
            </Link>
            <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <ul className="nav-drawer-links">
            {links.map((l, i) => (
              <li key={l.to} style={{ animationDelay: `${i * 60}ms` }}>
                <Link
                  to={l.to}
                  className={pathname === l.to ? "active" : ""}
                  onClick={() => setOpen(false)}
                >
                  <span className="drawer-link-num">0{i + 1}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/bookings/new" className="drawer-cta" onClick={() => setOpen(false)}>
            + Reservar cancha
          </Link>
        </div>
      </div>
    </>
  );
}
