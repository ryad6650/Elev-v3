"use client";

export default function ProfilPreferences() {
  return (
    <section
      className="rounded-2xl p-5 mb-4"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
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
