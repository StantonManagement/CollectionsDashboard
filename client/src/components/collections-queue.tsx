import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import type { Tenant } from "@shared/schema";

export default function CollectionsQueue() {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const filteredTenants = tenants.filter((tenant) => {
    if (priorityFilter !== "all" && tenant.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && tenant.status !== statusFilter) return false;
    return true;
  });

  const priorityCounts = {
    high: tenants.filter((t) => t.priority === "high").length,
    medium: tenants.filter((t) => t.priority === "medium").length,
    low: tenants.filter((t) => t.priority === "low").length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-500";
      case "medium": return "border-yellow-500";
      case "low": return "border-green-500";
      default: return "border-gray-300";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "awaiting_approval": return "bg-orange-100 text-orange-800";
      case "negotiating": return "bg-purple-100 text-purple-800";
      case "escalated": return "bg-red-100 text-red-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleTenantSelect = (tenantId: string, checked: boolean) => {
    if (checked) {
      setSelectedTenants([...selectedTenants, tenantId]);
    } else {
      setSelectedTenants(selectedTenants.filter(id => id !== tenantId));
    }
  };

  const toggleExpanded = (tenantId: string) => {
    setExpandedTenant(expandedTenant === tenantId ? null : tenantId);
  };

  if (isLoading) {
    return (
      <section className="w-1/2 bg-background p-6 border-r border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-1/2 bg-background p-6 border-r border-border" data-testid="section-collections-queue">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4" data-testid="text-queue-title">
          Collections Queue ({tenants.length} total)
        </h2>
        
        {/* Priority Filters */}
        <div className="flex items-center space-x-3 mb-4">
          <Button
            variant={priorityFilter === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter(priorityFilter === "high" ? "all" : "high")}
            className={`${priorityFilter === "high" ? "" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
            data-testid="button-filter-high"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            High: {priorityCounts.high}
          </Button>
          <Button
            variant={priorityFilter === "medium" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter(priorityFilter === "medium" ? "all" : "medium")}
            className={`${priorityFilter === "medium" ? "" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}`}
            data-testid="button-filter-medium"
          >
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Medium: {priorityCounts.medium}
          </Button>
          <Button
            variant={priorityFilter === "low" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter(priorityFilter === "low" ? "all" : "low")}
            className={`${priorityFilter === "low" ? "" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
            data-testid="button-filter-low"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Low: {priorityCounts.low}
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40" data-testid="select-property-filter">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="oak_village">Oak Village</SelectItem>
                <SelectItem value="maple_commons">Maple Commons</SelectItem>
                <SelectItem value="pine_heights">Pine Heights</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="priority">
              <SelectTrigger className="w-40" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
                <SelectItem value="days_late">Sort by Days Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90" 
            disabled={selectedTenants.length === 0}
            data-testid="button-start-selected"
          >
            Start Selected ({selectedTenants.length})
          </Button>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className={`border-l-4 ${getPriorityColor(tenant.priority)} p-4 shadow-sm`} data-testid={`card-tenant-${tenant.id}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Checkbox
                  checked={selectedTenants.includes(tenant.id)}
                  onCheckedChange={(checked) => handleTenantSelect(tenant.id, checked as boolean)}
                  className="mt-1"
                  data-testid={`checkbox-tenant-${tenant.id}`}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${tenant.priority === "high" ? "bg-red-500" : tenant.priority === "medium" ? "bg-yellow-500" : "bg-green-500"}`}></span>
                    <h3 className="font-semibold" data-testid={`text-tenant-name-${tenant.id}`}>{tenant.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2" data-testid={`text-tenant-property-${tenant.id}`}>
                    {tenant.unit} • {tenant.property}
                  </p>
                  <div className="text-sm space-y-1">
                    <p data-testid={`text-tenant-details-${tenant.id}`}>
                      <span className={`font-medium ${tenant.priority === "high" ? "text-red-600" : tenant.priority === "medium" ? "text-yellow-600" : "text-green-600"}`}>
                        ${tenant.amountOwed}
                      </span> owed • {tenant.daysLate} days late • Reliability: {tenant.reliability}/10
                    </p>
                    {expandedTenant === tenant.id && (
                      <div className="mt-2 space-y-2">
                        <p className="text-muted-foreground">Phone: {tenant.phone} • Language: {tenant.language}</p>
                        <p className="text-muted-foreground">Last Contact: {tenant.lastContact ? new Date(tenant.lastContact).toLocaleDateString() : 'Never'}</p>
                        {tenant.notes && (
                          <div className="bg-muted/50 p-2 rounded text-sm">
                            <p className="font-medium mb-1">Notes:</p>
                            <p>{tenant.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <Badge className={getStatusBadgeColor(tenant.status)} data-testid={`badge-status-${tenant.id}`}>
                      {formatStatus(tenant.status)}
                    </Badge>
                    <Button variant="link" size="sm" className="text-primary hover:underline p-0 h-auto" data-testid={`button-view-conversation-${tenant.id}`}>
                      View Conversation
                    </Button>
                    <Button variant="link" size="sm" className="text-primary hover:underline p-0 h-auto" data-testid={`button-start-${tenant.id}`}>
                      Start
                    </Button>
                    <Button variant="link" size="sm" className="text-primary hover:underline p-0 h-auto flex items-center" data-testid={`button-call-${tenant.id}`}>
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleExpanded(tenant.id)}
                className="text-muted-foreground hover:text-foreground"
                data-testid={`button-toggle-details-${tenant.id}`}
              >
                {expandedTenant === tenant.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
