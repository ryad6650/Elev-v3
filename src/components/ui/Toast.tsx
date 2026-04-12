"use client";

import { useEffect, useState } from "react";
import { useToastStore, type ToastType } from "@/store/toastStore";
import { Check, X, AlertTriangle, Info } from "lucide-react";

const icons: Record<ToastType, typeof Check> = {
  success: Check,
  error: AlertTriangle,
  info: Info,
};

const colors: Record<ToastType, string> = {
  success: "#74BF7A",
  error: "#ef4444",
  info: "var(--accent)",
};

function ToastItem({
  id,
  message,
  type,
}: {
  id: string;
  message: string;
  type: ToastType;
}) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, []);

  const Icon = icons[type];
  const color = colors[type];

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => removeToast(id)}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
      style={{
        background: "rgba(30, 27, 24, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transform: visible ? "translateY(0)" : "translateY(16px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
        maxWidth: 360,
        width: "100%",
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 28,
          height: 28,
          background: `${color}18`,
        }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <p
        className="flex-1 text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {message}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeToast(id);
        }}
        className="shrink-0 p-1 rounded-full"
        style={{ color: "var(--text-muted)" }}
        aria-label="Fermer"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  if (!toasts.length) return null;

  return (
    <div
      className="fixed z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
      style={{ bottom: 88, left: 0, right: 0 }}
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} />
        </div>
      ))}
    </div>
  );
}
