import { create } from "zustand";

interface UiStore {
  fullscreenModal: boolean;
  _fullscreenCount: number;
  setFullscreenModal: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  fullscreenModal: false,
  _fullscreenCount: 0,
  setFullscreenModal: (open) =>
    set((s) => {
      const next = s._fullscreenCount + (open ? 1 : -1);
      if (next < 0 && process.env.NODE_ENV === "development") {
        console.warn(
          "uiStore: fullscreenCount négatif — appel close sans open correspondant",
        );
      }
      if (next > 5 && process.env.NODE_ENV === "development") {
        console.warn(
          `uiStore: fullscreenCount anormalement élevé (${next}) — probable leak d'un composant qui ne close pas`,
        );
      }
      const count = Math.max(0, next);
      return { _fullscreenCount: count, fullscreenModal: count > 0 };
    }),
}));
