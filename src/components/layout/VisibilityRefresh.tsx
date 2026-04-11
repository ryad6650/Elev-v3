"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNutritionStore } from "@/store/nutritionStore";

const DEBOUNCE_MS = 2000;

export default function VisibilityRefresh() {
  const router = useRouter();
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRefreshRef.current < DEBOUNCE_MS) return;
      lastRefreshRef.current = now;

      router.refresh();
      const { hasFetched, date } = useNutritionStore.getState();
      if (hasFetched && date) {
        useNutritionStore.getState().fetchDay(date);
      }
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);

  return null;
}
