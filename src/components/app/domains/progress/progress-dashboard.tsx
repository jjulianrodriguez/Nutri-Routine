import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import type { ProgressPageData, ProgressTab } from "@/lib/progress/data";
import { EmptyState } from "@/components/ui/feedback/state-block";

import { ProgressClientSelector } from "./progress-dashboard/ProgressClientSelector";
import { ProgressTabContent } from "./progress-dashboard/ProgressTabContent";
import { ProgressTabs } from "./progress-dashboard/ProgressTabs";
import { useProgressDashboardState } from "./progress-dashboard/hooks";

export function ProgressDashboard({
 access,
 activeTab,
 data,
}: {
 access: CurrentUserAccess;
 activeTab: ProgressTab;
 data: ProgressPageData;
}) {
 const {
 clientSelectorEmptyState,
 selectedClientEmptyState,
 selectedClientId,
 shouldShowClientSelector,
 } = useProgressDashboardState({ access, data });

 return (
 <div className="space-y-5">
 {shouldShowClientSelector ? (
 <ProgressClientSelector
 clients={data.clientOptions}
 invalidClientSelection={data.invalidClientSelection}
 selectedClient={data.selectedClient}
 />
 ) : null}

 {clientSelectorEmptyState ? (
 <EmptyState
 description={clientSelectorEmptyState.description}
 title={clientSelectorEmptyState.title}
 />
 ) : null}

 {selectedClientEmptyState ? (
 <EmptyState
 description={selectedClientEmptyState.description}
 title={selectedClientEmptyState.title}
 />
 ) : (
 <>
 <ProgressTabs activeTab={activeTab} selectedClientId={selectedClientId} />
 <ProgressTabContent access={access} activeTab={activeTab} data={data} />
 </>
 )}
 </div>
 );
}
