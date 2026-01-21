import { useState } from "react";
import { ResourceNav, type ResourceSection } from "./ResourceNav";
import { LocalView } from "./LocalView";
import { MarketView } from "./MarketView";
import { PublishView } from "./PublishView";
import { ResourceDetail } from "./ResourceDetail";

function ResourcesPage() {
  const [activeSection, setActiveSection] = useState<ResourceSection>("local");
  const [selectedLocator, setSelectedLocator] = useState<string | null>(null);

  // If a resource is selected, show detail page
  if (selectedLocator) {
    return (
      <ResourceDetail
        locator={selectedLocator}
        onBack={() => setSelectedLocator(null)}
      />
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "local":
        return <LocalView onResourceSelect={setSelectedLocator} />;
      case "market":
        return <MarketView />;
      case "publish":
        return <PublishView />;
      default:
        return <LocalView onResourceSelect={setSelectedLocator} />;
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
