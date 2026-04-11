"use client";

import { ArrowUpDown, RefreshCw, Plus, X } from "lucide-react";

interface Props {
  onReorganize: () => void;
  onReplace: () => void;
  onAddSuperset: () => void;
  onAddWarmup: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ExerciseMenuSheet({
  onReorganize,
  onReplace,
  onAddSuperset,
  onAddWarmup,
  onDelete,
  onClose,
}: Props) {
  const handle = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative rounded-t-[28px] pb-8 px-4"
        style={{ background: "#161618" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div
            className="w-10 h-[5px] rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          />
        </div>

        {/* Actions group */}
        <div
          className="rounded-2xl overflow-hidden mb-3"
          style={{ background: "#1C1C1E" }}
        >
          <MenuItem
            icon={<ArrowUpDown size={22} />}
            label="Réorganiser"
            onClick={handle(onReorganize)}
          />
          <Divider />
          <MenuItem
            icon={<RefreshCw size={22} />}
            label="Remplacer l'Exercice"
            onClick={handle(onReplace)}
          />
          <Divider />
          <MenuItem
            icon={<Plus size={22} />}
            label="Ajouter au Superset"
            onClick={handle(onAddSuperset)}
          />
          <Divider />
          <MenuItem
            icon={<WarmupIcon />}
            label="Ajouter des séries d'échauffement"
            onClick={handle(onAddWarmup)}
          />
        </div>

        {/* Delete — isolated */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#1C1C1E" }}
        >
          <button
            onClick={handle(onDelete)}
            className="w-full flex items-center gap-5 px-5 py-4 active:opacity-60 transition-opacity"
          >
            <X size={22} style={{ color: "#EF4444" }} />
            <span
              className="text-[17px] font-normal"
              style={{ color: "#EF4444" }}
            >
              Retirer l&apos;Exercice
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-5 px-5 py-4 active:opacity-60 transition-opacity"
    >
      <span style={{ color: "var(--text-primary)" }}>{icon}</span>
      <span
        className="text-[17px] font-normal"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </span>
    </button>
  );
}

function Divider() {
  return (
    <div
      className="mx-5 h-px"
      style={{ background: "rgba(255,255,255,0.08)" }}
    />
  );
}

function WarmupIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <text
        x="1"
        y="14"
        fontSize="13"
        fontWeight="700"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        W
      </text>
      <text
        x="13"
        y="19"
        fontSize="9"
        fontWeight="600"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        x
      </text>
    </svg>
  );
}
