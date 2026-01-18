import { create } from "zustand";
import type { Tenant } from "agentvm/client";

export type ActiveTab = "sessions" | "agents" | "settings";

interface AppState {
  // Current tab
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Current tenant
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;

  // Tenant switcher modal
  tenantSwitcherOpen: boolean;
  openTenantSwitcher: () => void;
  closeTenantSwitcher: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "sessions",
  setActiveTab: (tab) => set({ activeTab: tab }),

  currentTenant: null,
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),

  tenantSwitcherOpen: false,
  openTenantSwitcher: () => set({ tenantSwitcherOpen: true }),
  closeTenantSwitcher: () => set({ tenantSwitcherOpen: false }),
}));
