"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, ZapOff, Loader2, Zap } from "lucide-react";

interface Props {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

const QUAGGA_CDN =
  "https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.4/dist/quagga.min.js";

const BARCODE_FORMATS = [
  "ean_reader",
  "ean_8_reader",
  "upc_reader",
  "upc_e_reader",
  "code_128_reader",
];

interface QuaggaInstance {
  init(config: Record<string, unknown>, cb: (err: Error | null) => void): void;
  start(): void;
  stop(): void;
  onDetected(cb: (result: { codeResult?: { code?: string } }) => void): void;
  offDetected(cb: (result: { codeResult?: { code?: string } }) => void): void;
}

/** Charge Quagga2 depuis le CDN (une seule fois, promise partagée) */
let quaggaPromise: Promise<QuaggaInstance> | null = null;

function loadQuagga(): Promise<QuaggaInstance> {
  const w = window as unknown as { Quagga?: QuaggaInstance };
  if (w.Quagga) return Promise.resolve(w.Quagga);
  if (quaggaPromise) return quaggaPromise;

  quaggaPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = QUAGGA_CDN;
    script.async = true;
    script.onload = () =>
      w.Quagga ? resolve(w.Quagga) : reject(new Error("Quagga non chargé"));
    script.onerror = () => {
      quaggaPromise = null;
      reject(new Error("Échec chargement Quagga CDN"));
    };
    document.head.appendChild(script);
  });
  return quaggaPromise;
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [torch, setTorch] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const detectedRef = useRef(false);
  const lastCodeRef = useRef<string | null>(null);

  const stableOnDetected = useCallback(
    (code: string) => {
      if (detectedRef.current) return;
      detectedRef.current = true;
      navigator.vibrate?.(100);
      onDetected(code);
    },
    [onDetected],
  );

  const toggleTorch = useCallback(async () => {
    const track = trackRef.current;
    if (!track) return;
    const next = !torch;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorch(next);
    } catch (e) {
      console.warn("Torch non disponible:", e);
    }
  }, [torch]);

  useEffect(() => {
    let stopped = false;
    let Q: QuaggaInstance | null = null;
    let detectionHandler:
      | ((result: { codeResult?: { code?: string } }) => void)
      | null = null;

    async function start() {
      try {
        Q = await loadQuagga();
        if (stopped || !scannerRef.current) return;

        await new Promise<void>((resolve, reject) => {
          Q!.init(
            {
              inputStream: {
                type: "LiveStream",
                target: scannerRef.current!,
                constraints: {
                  facingMode: "environment",
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                },
                area: {
                  top: "20%",
                  right: "5%",
                  bottom: "20%",
                  left: "5%",
                },
              },
              decoder: { readers: BARCODE_FORMATS },
              locate: true,
              frequency: 10,
            },
            (err: Error | null) => (err ? reject(err) : resolve()),
          );
        });

        if (stopped) {
          Q.stop();
          return;
        }

        // Récupérer le track pour la lampe torche
        const video = scannerRef.current?.querySelector("video");
        if (video?.srcObject) {
          const track = (video.srcObject as MediaStream).getVideoTracks()[0];
          trackRef.current = track;
          const caps = track?.getCapabilities?.() as
            | { torch?: boolean }
            | undefined;
          if (caps?.torch) setHasTorch(true);
        }

        Q.start();
        setLoading(false);

        // 2 lectures identiques consécutives avant validation
        detectionHandler = (result: { codeResult?: { code?: string } }) => {
          if (stopped || detectedRef.current) return;
          const code = result?.codeResult?.code;
          if (!code) return;

          if (lastCodeRef.current === code) {
            stableOnDetected(code);
          } else {
            lastCodeRef.current = code;
          }
        };
        Q.onDetected(detectionHandler);
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
      try {
        if (Q && detectionHandler) Q.offDetected(detectionHandler);
        Q?.stop();
      } catch (e) {
        console.warn("Quagga stop échoué:", e);
      }
      // Arrêter le stream vidéo pour libérer la caméra
      if (trackRef.current) {
        trackRef.current.stop();
        trackRef.current = null;
      }
    };
  }, [stableOnDetected]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-black"
      style={{ aspectRatio: "4/3" }}
    >
      {/* Conteneur Quagga — le <video> est injecté ici */}
      <div
        ref={scannerRef}
        className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>canvas]:hidden"
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

      {/* Boutons overlay */}
      <div className="absolute top-2 right-2 flex gap-2 z-20">
        {hasTorch && (
          <button
            onClick={toggleTorch}
            className="p-1.5 rounded-full"
            style={{ background: torch ? "var(--accent)" : "rgba(0,0,0,0.55)" }}
          >
            <Zap size={15} className="text-white" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <X size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}
