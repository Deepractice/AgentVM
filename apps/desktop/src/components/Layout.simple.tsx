import { Outlet } from "react-router-dom";

function LayoutSimple() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Activity Bar */}
      <div className="w-12 bg-[#2C2C2C]">
        <div className="text-white p-2">AB</div>
      </div>

      {/* Primary Sidebar */}
      <div className="w-64 bg-[#252526] text-white">
        <div className="p-4">Primary Sidebar</div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white">
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutSimple;
