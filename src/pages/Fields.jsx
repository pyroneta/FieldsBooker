import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import FieldCard from "../components/FieldCard";
import { getFields } from "../api/axios";
import "../css/Fields.css";

export default function Fields() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSport = searchParams.get("sport") || "all";

  const [fields, setFields] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFields()
      .then((f) => setFields(f))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return fields.filter((f) => {

      const matchSport =
        activeSport === "all" || f.sport?.idSport === activeSport;

      const matchSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.ubication.toLowerCase().includes(search.toLowerCase());

      return matchSport && matchSearch;
    });
  }, [fields, activeSport, search]);

  const grouped = useMemo(() => {

    if (activeSport !== "all") return null;

    const map = {};

    filtered.forEach((f) => {

      const sportId = f.sport?.idSport;

      if (!sportId) return;

      if (!map[sportId]) {
        map[sportId] = {
          sport: f.sport,
          fields: [],
        };
      }

      map[sportId].fields.push(f);
    });

    return map;

  }, [filtered, activeSport]);

  const activeSportObj =
    fields.find((f) => f.sport?.idSport === activeSport)?.sport;

  const setSport = (id) => {
    if (id === "all") setSearchParams({});
    else setSearchParams({ sport: id });
  };

  return (
    <main className="fields-page">

      <div className="fields-toolbar">

        <div className="fields-filters">

          <button
            className={`filter-pill ${
              activeSport === "all" ? "active" : ""
            }`}
            onClick={() => setSport("all")}
          >
            Todos
          </button>

          {Object.values(grouped || {}).map(({ sport }) => (
            <button
              key={sport.idSport}
              className={`filter-pill ${
                activeSport === sport.idSport ? "active" : ""
              }`}
              onClick={() => setSport(sport.idSport)}
            >
              {sport.name}
            </button>
          ))}

        </div>

        <input
          className="fields-search"
          placeholder="Buscar cancha o ubicación…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="fields-header">

        {activeSport === "all" ? (
          <h1 className="fields-title">
            TODAS LAS <span>CANCHAS</span>
          </h1>
        ) : (
          <h1 className="fields-title">
            {activeSportObj?.name?.toUpperCase()}
          </h1>
        )}

        <p className="fields-count">
          {filtered.length} canchas encontradas
        </p>

      </div>

      {loading ? (

        <p className="loading">Cargando canchas...</p>

      ) : activeSport === "all" && grouped ? (

        Object.values(grouped).map(({ sport, fields: sf }) => (

          <section key={sport.idSport} className="sport-section">

            <div className="sport-section-header">

              <h2 className="sport-section-title">
                {sport.name}
              </h2>

              <button
                className="sport-section-link"
                onClick={() => setSport(sport.idSport)}
              >
                Ver todas →
              </button>

            </div>

            <div className="fields-grid">

              {sf.map((f, i) => (
                <FieldCard
                  key={f.idField}
                  field={f}
                  sportName={sport.name}
                  delay={i * 50}
                />
              ))}

            </div>

          </section>
        ))

      ) : (

        <div className="fields-grid fields-grid--flat">

          {filtered.length === 0 ? (

            <p className="fields-empty">
              No hay canchas que coincidan.
            </p>

          ) : (

            filtered.map((f, i) => (
              <FieldCard
                key={f.idField}
                field={f}
                sportName={f.sport?.name}
                delay={i * 50}
              />
            ))

          )}

        </div>

      )}

    </main>
  );
}