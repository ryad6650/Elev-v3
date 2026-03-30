'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ZapOff } from 'lucide-react';

// BarcodeDetector n'est pas encore dans les types TS standard
declare class BarcodeDetector {
  constructor(options?: { formats?: string[] });
  detect(image: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
  static getSupportedFormats(): Promise<string[]>;
}

interface Props {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

const PERM_KEY = 'elev_camera_granted';

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      setError('Scanner non supporté. Essayez Chrome ou Safari 17+.');
      return;
    }

    let stream: MediaStream | null = null;
    let frameId: number;
    let stopped = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
        });
        if (stopped || !videoRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        localStorage.setItem(PERM_KEY, '1');
        setActive(true);

        const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });

        async function tick() {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) { onDetected(codes[0].rawValue); return; }
          } catch { /* frame invalide */ }
          frameId = requestAnimationFrame(tick);
        }
        tick();
      } catch (err) {
        if (err instanceof Error && err.name === 'NotAllowedError') {
          localStorage.removeItem(PERM_KEY);
          setError('Accès caméra refusé. Autorisez-le dans les réglages de votre navigateur.');
        } else {
          setError('Impossible d\'accéder à la caméra.');
        }
      }
    }

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(frameId);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '4/3' }}>
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

      {/* Viseur */}
      {active && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-60 h-36">
            <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2" style={{ borderColor: 'var(--accent)', borderRadius: '4px 0 0 0' }} />
            <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2" style={{ borderColor: 'var(--accent)', borderRadius: '0 4px 0 0' }} />
            <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2" style={{ borderColor: 'var(--accent)', borderRadius: '0 0 0 4px' }} />
            <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2" style={{ borderColor: 'var(--accent)', borderRadius: '0 0 4px 0' }} />
            <p className="absolute -bottom-7 left-0 right-0 text-center text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Centrez le code-barres
            </p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-black/80">
          <ZapOff size={28} style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      )}

      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1.5 rounded-full"
        style={{ background: 'rgba(0,0,0,0.55)' }}
      >
        <X size={15} className="text-white" />
      </button>
    </div>
  );
}
