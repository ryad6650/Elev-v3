"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUiStore } from "@/store/uiStore";

export function useModalAnimation(onClose: () => void, duration = 320) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setFullscreenModal(true);
    const t = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = "";
      setFullscreenModal(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [setFullscreenModal]);

  const handleClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    timerRef.current = setTimeout(onClose, duration);
  }, [closing, onClose, duration]);

  return { visible, closing, handleClose };
}
