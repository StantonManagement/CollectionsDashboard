import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AiApprovalsTab from "./ai-approvals-tab";
import PaymentPlansTab from "./payment-plans-tab";
import ConversationsTab from "./conversations-tab";
import EscalationsTab from "./escalations-tab";

type TabType = "approvals" | "plans" | "conversations" | "escalations";

export default function TabbedInterface() {
  const [activeTab, setActiveTab] = useState<TabType>("approvals");

  const tabs = [
    { id: "approvals", label: "AI Approvals", badge: 12, badgeColor: "bg-primary text-primary-foreground" },
    { id: "plans", label: "Payment Plans", badge: 3, badgeColor: "bg-orange-500 text-white" },
    { id: "conversations", label: "Conversations", badge: null, badgeColor: "" },
    { id: "escalations", label: "Escalations", badge: 2, badgeColor: "bg-red-500 text-white" },
  ];

  return (
    <section className="w-1/2 bg-background" data-testid="section-tabbed-interface">
      {/* Tab Navigation */}
      <div className="border-b border-border bg-card">
        <nav className="flex" data-testid="nav-tabs">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`px-6 py-4 text-sm font-medium border-b-2 rounded-none ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id as TabType)}
              data-testid={`button-tab-${tab.id}`}
            >
              {tab.label}
              {tab.badge && (
                <Badge className={`ml-2 ${tab.badgeColor} text-xs`} data-testid={`badge-tab-${tab.id}`}>
                  {tab.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="h-[calc(100vh-140px)] overflow-hidden">
        {activeTab === "approvals" && <AiApprovalsTab />}
        {activeTab === "plans" && <PaymentPlansTab />}
        {activeTab === "conversations" && <ConversationsTab />}
        {activeTab === "escalations" && <EscalationsTab />}
      </div>
    </section>
  );
}
