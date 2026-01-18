import { Outlet } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ActivityBar } from "./layout/ActivityBar";
import { PrimarySidebar } from "./layout/PrimarySidebar";

function Layout() {
  return (
    <div className="h-screen bg-gray-100">
      <ResizablePanelGroup orientation="horizontal">
        {/* Activity Bar - Fixed width */}
        <ResizablePanel defaultSize={3} minSize={3} maxSize={3}>
          <ActivityBar />
        </ResizablePanel>

        <ResizableHandle />

        {/* Primary Sidebar - Resizable */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <PrimarySidebar />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content Area - Flexible */}
        <ResizablePanel defaultSize={77}>
          <div className="h-full bg-white">
            <Outlet />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Layout;
