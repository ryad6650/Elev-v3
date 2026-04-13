"use client";

export default function ProfilPreferences() {
  return (
    <section
      className="p-5 mb-4"
      style={{
        background: "#262220",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
      }}
    >
      <h2
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        Preferences
      </h2>

      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Aucune préférence configurable pour le moment.
      </p>
    </section>
  );
}
