import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Home, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CollectionsQueue from "@/components/collections-queue";
import TabbedInterface from "@/components/tabbed-interface";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm" data-testid="header-main">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-foreground" data-testid="text-company-name">
                Stanton Management
              </h1>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200" data-testid="badge-pending">
                  Pending: {stats?.pending || 0}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200" data-testid="badge-active">
                  Active: {stats?.active || 0}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200" data-testid="badge-approval">
                  Approval: {stats?.approval || 0}
                </Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200" data-testid="badge-escalated">
                  Escalated: {stats?.escalated || 0}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                    12
                  </Badge>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium" data-testid="avatar-user">
                  JD
                </div>
                <span className="text-sm font-medium" data-testid="text-user-name">John Davis</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-20 bg-card border-r border-border flex flex-col items-center py-6 space-y-6" data-testid="sidebar-navigation">
          <Button size="icon" className="bg-primary text-primary-foreground" data-testid="button-nav-home">
            <Home className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" data-testid="button-nav-queue">
            <List className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" data-testid="button-nav-settings">
            <Settings className="h-5 w-5" />
          </Button>
          
          <div className="mt-auto space-y-4 text-center">
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold text-foreground" data-testid="text-total-count">{stats?.totalTenants || 0}</div>
              <div>Total</div>
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold text-foreground" data-testid="text-total-owed">
                ${Math.round((stats?.totalOwed || 0) / 1000)}k
              </div>
              <div>Owed</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex">
          <CollectionsQueue />
          <TabbedInterface />
        </main>
      </div>
    </div>
  );
}
