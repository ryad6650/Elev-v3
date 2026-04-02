"use client";

import { useEffect, useRef, useState } from "react";
import { X, ZapOff, Loader2 } from "lucide-react";
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
  NotFoundException,
} from "@zxing/library";

interface Props {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

const HINTS = new Map();
HINTS.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
]);
HINTS.set(DecodeHintType.TRY_HARDER, true);

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader(HINTS);
    let stopped = false;
    let stream: MediaStream | null = null;

    async function start() {
      try {
        if (stopped || !videoRef.current) return;

        // Contraintes caméra optimisées pour scanner de code-barres
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            // @ts-expect-error – focusMode supporté sur mobile mais pas typé
            focusMode: { ideal: "continuous" },
          },
          audio: false,
        });

        if (stopped || !videoRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // Désactiver le zoom si possible
        const track = stream.getVideoTracks()[0];
        const caps = track.getCapabilities?.() as
          | Record<string, unknown>
          | undefined;
        if (caps?.zoom) {
          const zoomRange = caps.zoom as { min: number };
          await track.applyConstraints({
            // @ts-expect-error – zoom supporté sur mobile mais pas typé
            advanced: [{ zoom: zoomRange.min }],
          });
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if (stopped) return;

        setLoading(false);

        reader.decodeFromVideoElementContinuously(
          videoRef.current,
          (
            result: ReturnType<BrowserMultiFormatReader["decode"]> | null,
            err?: Error,
          ) => {
            if (result) {
              onDetected(result.getText());
              return;
            }
            if (err && !(err instanceof NotFoundException)) {
              console.warn("Scanner:", err);
            }
          },
        );
      } catch (err) {
        if (stopped) return;
        if (err instanceof Error && err.name === "NotAllowedError") {
          setError(
            "Accès caméra refusé. Allez dans Réglages → Safari → Caméra.",
          );
        } else {
          setError("Impossible d'accéder à la caméra.");
        }
        setLoading(false);
      }
    }

    start();

    return () => {
      stopped = true;
      reader.reset();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-black"
      style={{ aspectRatio: "4/3" }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Chargement */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "var(--accent)" }}
          />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            Activation de la caméra…
          </p>
        </div>
      )}

      {/* Viseur */}
      {!loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.35)" }}
          />
          <div className="relative z-10 w-64 h-40">
            <span
              className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2"
              style={{
                borderColor: "var(--accent)",
                borderRadius: "4px 0 0 0",
              }}
            />
            <span
              className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2"
              style={{
                borderColor: "var(--accent)",
                borderRadius: "0 4px 0 0",
              }}
            />
            <span
              className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2"
              style={{
                borderColor: "var(--accent)",
                borderRadius: "0 0 0 4px",
              }}
            />
            <span
              className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2"
              style={{
                borderColor: "var(--accent)",
                borderRadius: "0 0 4px 0",
              }}
            />
            <div
              className="absolute left-2 right-2 h-px animate-scan-line"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 6px var(--accent)",
              }}
            />
            <p
              className="absolute -bottom-7 left-0 right-0 text-center text-xs"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Centrez le code-barres
            </p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-black/80">
          <ZapOff size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>
        </div>
      )}

      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1.5 rounded-full z-20"
        style={{ background: "rgba(0,0,0,0.55)" }}
      >
        <X size={15} className="text-white" />
      </button>
    </div>
  );
}
