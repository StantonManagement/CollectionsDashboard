import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Phone, FileText, AlertTriangle, AlertCircle, Info, UserCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Escalation, Tenant } from "@shared/schema";

export default function EscalationsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>(["immediate", "same_day"]);

  const { data: escalations = [], isLoading: escalationsLoading } = useQuery<Escalation[]>({
    queryKey: ["/api/escalations"],
  });

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const updateEscalationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Escalation> }) => {
      const res = await apiRequest("PATCH", `/api/escalations/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/escalations"] });
    },
  });

  const openEscalations = escalations.filter((esc) => esc.status === "open");

  const groupEscalationsByPriority = () => {
    return {
      immediate: openEscalations.filter((esc) => esc.priority === "immediate"),
      same_day: openEscalations.filter((esc) => esc.priority === "same_day"),
      next_business_day: openEscalations.filter((esc) => esc.priority === "next_business_day"),
    };
  };

  const getTenantById = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "immediate": return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "same_day": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "next_business_day": return <Info className="h-5 w-5 text-blue-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "immediate": return "text-red-600 bg-red-50 border-red-200";
      case "same_day": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "next_business_day": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "phone_failed": return "📞";
      case "threatening": return "🚨";
      case "amount_dispute": return "⚠️";
      case "complex_situation": return "🔄";
      case "no_response": return "ℹ️";
      default: return "❓";
    }
  };

  const formatPriorityLabel = (priority: string) => {
    switch (priority) {
      case "immediate": return "IMMEDIATE ATTENTION";
      case "same_day": return "SAME DAY RESPONSE";
      case "next_business_day": return "NEXT BUSINESS DAY";
      default: return priority.toUpperCase().replace(/_/g, ' ');
    }
  };

  const formatTypeLabel = (type: string) => {
    return type.toUpperCase().replace(/_/g, ' ');
  };

  const handleResolve = async (escalationId: string) => {
    try {
      await updateEscalationMutation.mutateAsync({
        id: escalationId,
        updates: { status: "resolved", resolvedAt: new Date() }
      });

      toast({
        title: "Escalation Resolved",
        description: "The escalation has been marked as resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve escalation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  if (escalationsLoading || tenantsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const groupedEscalations = groupEscalationsByPriority();

  return (
    <div className="p-6" data-testid="tab-escalations">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4" data-testid="text-escalations-title">
          Escalations ({openEscalations.length} open)
        </h3>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Immediate Attention */}
        <Collapsible open={expandedSections.includes("immediate")} onOpenChange={() => toggleSection("immediate")}>
          <Card className="border-red-200 bg-red-50">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-100 transition-colors" data-testid="section-immediate">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h4 className="text-red-600 font-semibold">
                    {formatPriorityLabel("immediate")} ({groupedEscalations.immediate.length} items)
                  </h4>
                </div>
                <Button variant="ghost" size="icon" className="text-red-600">
                  {expandedSections.includes("immediate") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-4">
                {groupedEscalations.immediate.map((escalation: Escalation) => {
                  const tenant = getTenantById(escalation.tenantId);
                  if (!tenant) return null;

                  return (
                    <Card key={escalation.id} className="bg-white border-neutral-200" data-testid={`card-escalation-${escalation.id}`}>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{getTypeIcon(escalation.type)}</span>
                            <div>
                              <h5 className="font-semibold text-neutral-700" data-testid={`text-escalation-title-${escalation.id}`}>
                                {formatTypeLabel(escalation.type)} - {tenant.name} - {tenant.unit}
                              </h5>
                              <p className="text-sm text-muted-foreground mt-1" data-testid={`text-escalation-description-${escalation.id}`}>
                                {escalation.description}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 font-medium">
                                Created: {escalation.createdAt ? new Date(escalation.createdAt).toLocaleString() : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {escalation.type === "phone_failed" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-slate-600 hover:text-slate-700" 
                                  onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                                  data-testid={`button-try-alt-phone-${escalation.id}`}
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Try Alt Phone
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-stone-600 hover:text-stone-700" 
                                  onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                                  data-testid={`button-manual-call-${escalation.id}`}
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Manual Call
                                </Button>
                              </>
                            )}
                            {escalation.type === "threatening" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-neutral-600 hover:text-neutral-700" 
                                  onClick={() => alert(`Message review API needed: Review threatening messages from ${tenant.name} (Escalation ID: ${escalation.id})`)}
                                  data-testid={`button-review-messages-${escalation.id}`}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Review Messages
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-zinc-600 hover:text-zinc-700" 
                                  onClick={() => alert(`Legal consultation API needed: Request legal consultation for ${tenant.name} (Escalation ID: ${escalation.id})`)}
                                  data-testid={`button-legal-consult-${escalation.id}`}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Legal Consult
                                </Button>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => alert(`Assignment API needed: Assign escalation for ${tenant.name} to current user (Escalation ID: ${escalation.id})`)}
                              data-testid={`button-assign-${escalation.id}`}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Assign to Me
                            </Button>
                            <Button 
                              className="bg-green-600 text-white hover:bg-green-700"
                              size="sm"
                              onClick={() => handleResolve(escalation.id)}
                              disabled={updateEscalationMutation.isPending}
                              data-testid={`button-resolve-${escalation.id}`}
                            >
                              Mark Resolved
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Same Day Response */}
        <Collapsible open={expandedSections.includes("same_day")} onOpenChange={() => toggleSection("same_day")}>
          <Card className="border-yellow-200 bg-yellow-50">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-yellow-100 transition-colors" data-testid="section-same-day">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h4 className="text-yellow-600 font-semibold">
                    {formatPriorityLabel("same_day")} ({groupedEscalations.same_day.length} items)
                  </h4>
                </div>
                <Button variant="ghost" size="icon" className="text-yellow-600">
                  {expandedSections.includes("same_day") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-4">
                {groupedEscalations.same_day.map((escalation: Escalation) => {
                  const tenant = getTenantById(escalation.tenantId);
                  if (!tenant) return null;

                  return (
                    <Card key={escalation.id} className="bg-white border-yellow-200" data-testid={`card-escalation-${escalation.id}`}>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{getTypeIcon(escalation.type)}</span>
                            <div>
                              <h5 className="font-semibold text-yellow-700" data-testid={`text-escalation-title-${escalation.id}`}>
                                {formatTypeLabel(escalation.type)} - {tenant.name} - {tenant.unit}
                              </h5>
                              <p className="text-sm text-muted-foreground mt-1" data-testid={`text-escalation-description-${escalation.id}`}>
                                {escalation.description}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 font-medium">
                                Created: {escalation.createdAt ? new Date(escalation.createdAt).toLocaleString() : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700" 
                              onClick={() => alert(`Account review API needed: Open account review for ${tenant.name} (Escalation ID: ${escalation.id})`)}
                              data-testid={`button-review-account-${escalation.id}`}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Review Account
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700" 
                              onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                              data-testid={`button-contact-tenant-${escalation.id}`}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Tenant
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => alert(`Assignment API needed: Assign escalation for ${tenant.name} to current user (Escalation ID: ${escalation.id})`)}
                              data-testid={`button-assign-${escalation.id}`}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Assign to Me
                            </Button>
                            <Button 
                              className="bg-green-600 text-white hover:bg-green-700"
                              size="sm"
                              onClick={() => handleResolve(escalation.id)}
                              disabled={updateEscalationMutation.isPending}
                              data-testid={`button-resolve-${escalation.id}`}
                            >
                              Mark Resolved
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Next Business Day */}
        <Collapsible open={expandedSections.includes("next_business_day")} onOpenChange={() => toggleSection("next_business_day")}>
          <Card className="border-blue-200 bg-blue-50">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-100 transition-colors" data-testid="section-next-business-day">
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <h4 className="text-blue-600 font-semibold">
                    {formatPriorityLabel("next_business_day")} ({groupedEscalations.next_business_day.length} items)
                  </h4>
                </div>
                <Button variant="ghost" size="icon" className="text-blue-600">
                  {expandedSections.includes("next_business_day") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-4">
                {groupedEscalations.next_business_day.map((escalation: Escalation) => {
                  const tenant = getTenantById(escalation.tenantId);
                  if (!tenant) return null;

                  return (
                    <Card key={escalation.id} className="bg-white border-blue-200" data-testid={`card-escalation-${escalation.id}`}>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{getTypeIcon(escalation.type)}</span>
                            <div>
                              <h5 className="font-semibold text-blue-700" data-testid={`text-escalation-title-${escalation.id}`}>
                                {formatTypeLabel(escalation.type)} - {tenant.name} - {tenant.unit}
                              </h5>
                              <p className="text-sm text-muted-foreground mt-1" data-testid={`text-escalation-description-${escalation.id}`}>
                                {escalation.description}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 font-medium">
                                Created: {escalation.createdAt ? new Date(escalation.createdAt).toLocaleString() : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700" data-testid={`button-send-followup-${escalation.id}`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Send Follow-up
                            </Button>
                            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700" data-testid={`button-try-phone-${escalation.id}`}>
                              <Phone className="h-4 w-4 mr-2" />
                              Try Phone Call
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" data-testid={`button-mark-no-contact-${escalation.id}`}>
                              Mark No Contact
                            </Button>
                            <Button 
                              className="bg-green-600 text-white hover:bg-green-700"
                              size="sm"
                              onClick={() => handleResolve(escalation.id)}
                              disabled={updateEscalationMutation.isPending}
                              data-testid={`button-resolve-${escalation.id}`}
                            >
                              Mark Resolved
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {openEscalations.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h4 className="font-medium mb-2">No Open Escalations</h4>
            <p className="text-sm">All escalations have been resolved.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
