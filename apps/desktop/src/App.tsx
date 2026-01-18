import { Routes, Route } from "react-router-dom";
import LayoutSimple from "./components/Layout.simple";
import TenantsPage from "./pages/Tenants";
import ResourcesPage from "./pages/Resources";
import AgentsPage from "./pages/Agents";
import SettingsPage from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LayoutSimple />}>
        <Route index element={<TenantsPage />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
