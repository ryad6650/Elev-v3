import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useToastStore, toast } from "@/store/toastStore";

describe("toastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("addToast ajoute un toast avec le bon type", () => {
    useToastStore.getState().addToast("Test message", "success");
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("Test message");
    expect(toasts[0].type).toBe("success");
    expect(toasts[0].id).toMatch(/^toast-/);
  });

  it("removeToast supprime le toast par id", () => {
    useToastStore.getState().addToast("A");
    useToastStore.getState().addToast("B");
    const [a] = useToastStore.getState().toasts;
    useToastStore.getState().removeToast(a.id);
    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe("B");
  });

  it("auto-suppression après 3000ms", () => {
    useToastStore.getState().addToast("Ephemeral");
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(3000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("toast.success helper ajoute un toast success", () => {
    toast.success("Bravo");
    const t = useToastStore.getState().toasts;
    expect(t).toHaveLength(1);
    expect(t[0].type).toBe("success");
    expect(t[0].message).toBe("Bravo");
  });

  it("toast.error helper ajoute un toast error", () => {
    toast.error("Oops");
    expect(useToastStore.getState().toasts[0].type).toBe("error");
  });

  it("toast.info helper ajoute un toast info", () => {
    toast.info("Info");
    expect(useToastStore.getState().toasts[0].type).toBe("info");
  });

  it("type par défaut est success", () => {
    useToastStore.getState().addToast("Default");
    expect(useToastStore.getState().toasts[0].type).toBe("success");
  });
});
