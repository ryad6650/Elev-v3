"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, ZapOff, Loader2, Zap } from "lucide-react";

interface Props {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

interface DetectedBarcode {
  rawValue: string;
  format: string;
}
type BarcodeDetectorCtor = {
  new (opts: { formats: string[] }): {
    detect: (
      source: HTMLVideoElement | HTMLCanvasElement,
    ) => Promise<DetectedBarcode[]>;
  };
  getSupportedFormats?: () => Promise<string[]>;
};

const EAN_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];
const SCAN_INTERVAL_MS = 150; // ~6-7 fps, laisse le temps à detect()

/** Vérifie si l'API native supporte les formats EAN */
async function getNativeDetector(): Promise<BarcodeDetectorCtor | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BD = (globalThis as any).BarcodeDetector as
    | BarcodeDetectorCtor
    | undefined;
  if (!BD) return null;
  try {
    const supported = await BD.getSupportedFormats?.();
    if (supported && !supported.includes("ean_13")) return null;
  } catch {
    // getSupportedFormats pas dispo → on tente quand même
  }
  return BD;
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [torch, setTorch] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const detectedRef = useRef(false);

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
        // @ts-expect-error – torch pas typé mais supporté mobile
        advanced: [{ torch: next }],
      });
      setTorch(next);
    } catch {}
  }, [torch]);

  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | null = null;
    let timerId: ReturnType<typeof setTimeout>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let zxingReader: any = null;

    async function start() {
      try {
        if (stopped || !videoRef.current) return;

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            // @ts-expect-error – focusMode supporté mobile
            focusMode: { ideal: "continuous" },
          },
          audio: false,
        });

        if (stopped || !videoRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const track = stream.getVideoTracks()[0];
        trackRef.current = track;

        const caps = track.getCapabilities?.() as
          | Record<string, unknown>
          | undefined;
        if (caps?.torch) setHasTorch(true);

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if (stopped) return;
        setLoading(false);

        const BD = await getNativeDetector();
        if (BD) {
          scanWithNative(BD);
        } else {
          scanWithZxing();
        }
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

    /** Scan natif — passe le <video> directement (pas de canvas) */
    function scanWithNative(BD: BarcodeDetectorCtor) {
      const detector = new BD({ formats: EAN_FORMATS });
      const video = videoRef.current!;

      async function loop() {
        if (stopped || detectedRef.current) return;
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          try {
            const barcodes = await detector.detect(video);
            if (barcodes.length > 0 && !stopped) {
              stableOnDetected(barcodes[0].rawValue);
              return;
            }
          } catch (e) {
            console.warn("BarcodeDetector.detect():", e);
          }
        }
        // Attendre avant le prochain scan (évite d'empiler les appels)
        timerId = setTimeout(loop, SCAN_INTERVAL_MS);
      }
      loop();
    }

    /** Fallback ZXing avec scan canvas pour meilleure détection */
    async function scanWithZxing() {
      const {
        BrowserMultiFormatReader,
        DecodeHintType,
        BarcodeFormat,
        NotFoundException,
      } = await import("@zxing/library");

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      if (stopped) return;
      const reader = new BrowserMultiFormatReader(hints);
      zxingReader = reader;

      reader.decodeFromVideoElementContinuously(
        videoRef.current!,
        (result, err) => {
          if (stopped || detectedRef.current) return;
          if (result) {
            stableOnDetected(result.getText());
            reader.reset();
            return;
          }
          if (err && !(err instanceof NotFoundException)) {
            console.warn("Scanner ZXing:", err);
          }
        },
      );
    }

    start();

    return () => {
      stopped = true;
      clearTimeout(timerId);
      stream?.getTracks().forEach((t) => t.stop());
      trackRef.current = null;
      try {
        zxingReader?.reset();
      } catch {}
    };
  }, [stableOnDetected]);

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
        autoPlay
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
