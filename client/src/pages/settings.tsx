import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Home, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";

export default function SettingsPage() {
  const [location] = useLocation();
  
  const { data: stats, isLoading: statsLoading } = useQuery<{
    pending: number;
    active: number;
    approval: number;
    escalated: number;
    totalTenants: number;
    totalOwed: number;
  }>({
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
                Stanton Management - Settings
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative" 
                  onClick={() => alert("Notifications panel would open here")}
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 bg-neutral-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
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
          <Link href="/">
            <Button 
              size="icon" 
              className={`${location === "/" ? "bg-primary text-primary-foreground" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`}
              data-testid="button-nav-home"
            >
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/collections">
            <Button 
              size="icon" 
              className={`${location === "/collections" ? "bg-primary text-primary-foreground" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`}
              data-testid="button-nav-queue"
            >
              <List className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/settings">
            <Button 
              size="icon" 
              className={`${location === "/settings" ? "bg-primary text-primary-foreground" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`}
              data-testid="button-nav-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          
          <div className="mt-auto space-y-4 text-center">
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold text-foreground" data-testid="text-total-count">{stats?.totalTenants ?? 0}</div>
              <div>Total</div>
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold text-foreground" data-testid="text-total-owed">
                ${Math.round((stats?.totalOwed ?? 0) / 1000)}k
              </div>
              <div>Owed</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Settings</h2>
            
            {/* Collections Settings */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Collections Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="auto-escalation">Auto-escalation threshold (days)</Label>
                    <Input id="auto-escalation" type="number" defaultValue="30" />
                  </div>
                  <div>
                    <Label htmlFor="ai-confidence">AI confidence threshold (%)</Label>
                    <Input id="ai-confidence" type="number" defaultValue="85" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-approve" />
                  <Label htmlFor="auto-approve">Auto-approve high confidence AI responses</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="sms-enabled" defaultChecked />
                  <Label htmlFor="sms-enabled">Enable SMS communications</Label>
                </div>
              </div>
            </Card>

            {/* Payment Plan Settings */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Payment Plan Defaults</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-duration">Maximum duration (weeks)</Label>
                    <Input id="max-duration" type="number" defaultValue="12" />
                  </div>
                  <div>
                    <Label htmlFor="min-payment">Minimum weekly payment</Label>
                    <Input id="min-payment" type="number" defaultValue="25" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-fees" defaultChecked />
                  <Label htmlFor="include-fees">Include late fees in payment plans by default</Label>
                </div>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="email-notifications" defaultChecked />
                  <Label htmlFor="email-notifications">Email notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="browser-notifications" />
                  <Label htmlFor="browser-notifications">Browser notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="escalation-alerts" defaultChecked />
                  <Label htmlFor="escalation-alerts">Immediate escalation alerts</Label>
                </div>
              </div>
            </Card>

            {/* User Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Preferences</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="EST">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">Eastern Standard Time</SelectItem>
                      <SelectItem value="CST">Central Standard Time</SelectItem>
                      <SelectItem value="MST">Mountain Standard Time</SelectItem>
                      <SelectItem value="PST">Pacific Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Default Language</Label>
                  <Select defaultValue="English">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <div className="flex space-x-4 pt-6">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Changes
              </Button>
              <Button variant="outline">
                Reset to Defaults
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}