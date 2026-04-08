"use client";

import { memo } from "react";

interface Props {
  count: number;
}

export default memo(function SeancesWeekCard({ count }: Props) {
  return (
    <div
      className="flex-1 rounded-[16px] py-5 px-3.5 flex flex-col items-center justify-center gap-1.5"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        minHeight: 110,
      }}
    >
      <span className="text-[20px]">🏋️</span>
      <span
        className="text-[28px] font-bold leading-none"
        style={{ color: "#74BF7A" }}
      >
        {count}
      </span>
      <span
        className="text-[10px] font-semibold tracking-[0.04em]"
        style={{ color: "var(--text-muted)" }}
      >
        séance{count !== 1 ? "s" : ""} / sem
      </span>
    </div>
  );
});
