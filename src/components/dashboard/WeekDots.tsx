"use client";

import { memo } from "react";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export default memo(function WeekDots() {
  const todayIdx = getDayIndex();

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: "22px 24px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 18 }}
      >
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "var(--text-muted)",
          }}
        >
          Cette semaine
        </span>
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--green)",
          }}
        >
          {todayIdx} jours
        </span>
      </div>

      <div className="flex justify-between items-center">
        {JOURS.map((jour, i) => {
          const isPast = i < todayIdx;
          const isToday = i === todayIdx;
          const isDone = isPast;

          const dotStyle: React.CSSProperties = {
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          };

          if (isDone) {
            dotStyle.background = "var(--green)";
          } else if (isToday) {
            dotStyle.border = "2px solid var(--text-primary)";
            dotStyle.background = "transparent";
          } else {
            dotStyle.background = "rgba(0,0,0,0.06)";
          }

          return (
            <div key={jour} className="flex flex-col items-center gap-2">
              <span
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: isToday ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {jour}
              </span>
              <div style={dotStyle}>
                {isDone && (
                  <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
