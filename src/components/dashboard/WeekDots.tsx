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
    <div className="mt-8">
      <p
        className="uppercase"
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#A8A29E",
          marginBottom: 14,
        }}
      >
        Cette semaine
      </p>

      <div className="flex justify-between items-center">
        {JOURS.map((jour, i) => {
          const isPast = i < todayIdx;
          const isToday = i === todayIdx;
          const isDone = isPast && i < 2;

          const dotStyle: React.CSSProperties = {
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          };

          if (isDone) {
            dotStyle.background = "linear-gradient(135deg, #c4a882, #a0785c)";
          } else if (isToday) {
            dotStyle.border = "2px solid #4A3728";
            dotStyle.background = "transparent";
          } else {
            dotStyle.background = "rgba(74,55,40,0.07)";
          }

          return (
            <div key={jour} className="flex flex-col items-center gap-2">
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: isToday ? "#4A3728" : "#A8A29E",
                  letterSpacing: "0.02em",
                }}
              >
                {jour}
              </span>
              <div style={dotStyle}>
                {isDone && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
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
