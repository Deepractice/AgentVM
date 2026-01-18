import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/tenants", label: "Tenants" },
  { to: "/resources", label: "Resources" },
  { to: "/agents", label: "Agents" },
  { to: "/settings", label: "Settings" },
];

export function PrimarySidebar() {
  return (
    <div className="h-full bg-[#252526] text-[#CCCCCC]">
      <div className="p-4 border-b border-[#1E1E1E]">
        <h2 className="text-sm font-semibold text-white">Navigation</h2>
      </div>
      <nav className="p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 text-sm rounded transition-colors ${
                isActive
                  ? "bg-[#37373D] text-white"
                  : "text-[#CCCCCC] hover:bg-[#2A2D2E]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
