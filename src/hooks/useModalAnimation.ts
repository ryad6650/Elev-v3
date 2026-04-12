"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUiStore } from "@/store/uiStore";

export function useModalAnimation(onClose: () => void, duration = 320) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByButtonRef = useRef(false);
  const handleCloseRef = useRef<() => void>(() => {});
  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);

  const handleClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    if (!closedByButtonRef.current) {
      window.history.back();
    }
    timerRef.current = setTimeout(onClose, duration);
  }, [closing, onClose, duration]);

  useEffect(() => {
    handleCloseRef.current = handleClose;
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setFullscreenModal(true);
    window.history.pushState({ modal: true }, "");
    const t = requestAnimationFrame(() => setVisible(true));

    const onPopState = () => {
      closedByButtonRef.current = true;
      handleCloseRef.current();
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = "";
      setFullscreenModal(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("popstate", onPopState);
    };
  }, [setFullscreenModal]);

  return { visible, closing, handleClose };
}
