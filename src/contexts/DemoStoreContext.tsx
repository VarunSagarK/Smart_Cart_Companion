/**
 * DemoStoreContext — single shared instance of the demo store.
 *
 * Wraps the app so every component (BottomTabs, WalmartHeader, Results,
 * Basket, etc.) reads from and writes to the same state, fixing:
 *   1. Cart badge not updating dynamically
 *   2. "Add all to cart" → empty cart page
 */

import { createContext, useContext, ReactNode } from "react";
import { useDemoStore } from "@/hooks/useDemoStore";

type StoreValue = ReturnType<typeof useDemoStore>;

const DemoStoreContext = createContext<StoreValue | null>(null);

export const DemoStoreProvider = ({ children }: { children: ReactNode }) => {
  const store = useDemoStore();
  return <DemoStoreContext.Provider value={store}>{children}</DemoStoreContext.Provider>;
};

export const useStore = (): StoreValue => {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useStore must be used inside <DemoStoreProvider>");
  return ctx;
};
