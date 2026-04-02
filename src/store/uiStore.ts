import { create } from "zustand";

interface UiStore {
  fullscreenModal: boolean;
  setFullscreenModal: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  fullscreenModal: false,
  setFullscreenModal: (open) => set({ fullscreenModal: open }),
}));
