import { useState } from "react";
import { ResourceNav, type ResourceSection } from "./ResourceNav";
import { LocalView } from "./LocalView";
import { MarketView } from "./MarketView";
import { PublishView } from "./PublishView";

function ResourcesPage() {
  const [activeSection, setActiveSection] = useState<ResourceSection>("local");

  const renderContent = () => {
    switch (activeSection) {
      case "local":
        return <LocalView />;
      case "market":
        return <MarketView />;
      case "publish":
        return <PublishView />;
      default:
        return <LocalView />;
    }
  };

  return (
    <div className="h-full flex">
      <ResourceNav activeSection={activeSection} onSectionChange={setActiveSection} />
      {renderContent()}
    </div>
  );
}

export default ResourcesPage;
