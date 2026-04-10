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
      const count = Math.max(0, next);
      return { _fullscreenCount: count, fullscreenModal: count > 0 };
    }),
}));
