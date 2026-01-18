import { useEffect } from "react";
import { useAppStore } from "@/stores/app";
import { useTenants } from "@/hooks/useTenants";
import { ActivityBar } from "@/components/layout/ActivityBar";
import { TenantSwitcher } from "@/components/shared/TenantSwitcher";
import SessionsPage from "@/pages/Sessions";
import AgentsPage from "@/pages/Agents";
import ResourcesPage from "@/pages/Resources";
import SettingsPage from "@/pages/Settings";

function App() {
  const { activeTab, currentTenant, setCurrentTenant, tenantSwitcherOpen } = useAppStore();
  const { data: tenants } = useTenants();

  // Auto-select first tenant if none selected
  useEffect(() => {
    if (!currentTenant && tenants && tenants.length > 0) {
      setCurrentTenant(tenants[0]);
    }
  }, [currentTenant, tenants, setCurrentTenant]);

  const renderContent = () => {
    switch (activeTab) {
      case "sessions":
        return <SessionsPage />;
      case "agents":
        return <AgentsPage />;
      case "resources":
        return <ResourcesPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <SessionsPage />;
    }
  };

  return (
    <div className="h-screen flex bg-[var(--bg-primary)]">
      {/* Activity Bar */}
      <ActivityBar />

      {/* Main Content */}
      <main className="flex-1">{renderContent()}</main>

      {/* Tenant Switcher Modal */}
      {tenantSwitcherOpen && <TenantSwitcher />}
    </div>
  );
}

export default App;
