import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Edit, Scroll, User, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PaymentPlan, Tenant } from "@shared/schema";

export default function PaymentPlansTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: paymentPlans = [], isLoading: plansLoading } = useQuery<PaymentPlan[]>({
    queryKey: ["/api/payment-plans"],
  });

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const updatePaymentPlanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PaymentPlan> }) => {
      const res = await apiRequest("PATCH", `/api/payment-plans/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-plans"] });
    },
  });

  const pendingPlans = paymentPlans.filter((plan) => plan.status === "proposed");

  const getTenantById = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId);
  };

  const getRiskLevel = (coverage: number, tenant: Tenant) => {
    if (coverage >= 95 && tenant.reliability >= 7) return "low";
    if (coverage >= 80 && tenant.reliability >= 5) return "medium";
    return "high";
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "medium": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "high": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return "Auto-Approvable";
      case "medium": return "Review";
      case "high": return "High Risk";
      default: return "Unknown";
    }
  };

  const handleApprovePlan = async (planId: string) => {
    try {
      await updatePaymentPlanMutation.mutateAsync({
        id: planId,
        updates: { status: "approved" }
      });

      toast({
        title: "Payment Plan Approved",
        description: "The payment plan has been approved and is now active.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve payment plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDenyPlan = async (planId: string) => {
    try {
      await updatePaymentPlanMutation.mutateAsync({
        id: planId,
        updates: { status: "denied" }
      });

      toast({
        title: "Payment Plan Denied",
        description: "The payment plan has been denied.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deny payment plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (plansLoading || tenantsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="tab-payment-plans">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" data-testid="text-plans-title">
            Payment Plans for Approval ({pendingPlans.length} pending)
          </h3>
          <div className="flex items-center space-x-3">
            <Button 
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={pendingPlans.length === 0}
              onClick={() => alert(`Email generation API needed: Generate bookkeeper email for ${pendingPlans.length} pending payment plans`)}
              data-testid="button-generate-bookkeeper-email"
            >
              Generate Bookkeeper Email
            </Button>
            <Select defaultValue="all" onValueChange={(value) => alert(`Risk filtering API needed: Filter payment plans by ${value} risk level`)}>
              <SelectTrigger className="w-40" data-testid="select-risk-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {pendingPlans.map((plan: PaymentPlan) => {
          const tenant = getTenantById(plan.tenantId);
          if (!tenant) return null;

          const riskLevel = getRiskLevel(plan.coverage, tenant);

          return (
            <Card key={plan.id} className="border shadow-sm" data-testid={`card-plan-${plan.id}`}>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold" data-testid={`text-plan-tenant-${plan.id}`}>
                    {tenant.name} • {tenant.unit} • {tenant.property}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {getRiskIcon(riskLevel)}
                    <span className={`text-sm font-medium ${
                      riskLevel === "low" ? "text-green-600" : 
                      riskLevel === "medium" ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {getRiskLabel(riskLevel)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground" data-testid={`text-plan-summary-${plan.id}`}>
                  ${tenant.amountOwed} owed • {tenant.daysLate} days late • Reliability: {tenant.reliability}/10 • AI Proposed
                </p>
              </div>

              <div className="p-4 space-y-4">
                {/* Proposed Payment Plan */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <Scroll className="h-4 w-4 mr-2" />
                    PROPOSED PAYMENT PLAN:
                  </h5>
                  <div className="space-y-1 text-sm" data-testid={`text-plan-details-${plan.id}`}>
                    <p>• Weekly Payment: ${plan.weeklyAmount}</p>
                    <p>• Duration: {plan.duration} weeks</p>
                    <p>• Total Plan Amount: ${plan.totalAmount}</p>
                    <p>• Coverage: {plan.coverage}% of debt {plan.coverage >= 100 ? '✅' : '⚠️'}</p>
                    <p>• Start Date: {plan.startDate}</p>
                    <p>• Includes Late Fees: {plan.includesLateFees ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Tenant Payment History */}
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <h5 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    TENANT PAYMENT HISTORY:
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p>• Successful Plans: 2/2 completed on time</p>
                    <p>• Average Completion Rate: 95%</p>
                    <p>• Last Plan: Sep 2024 - $450, completed successfully</p>
                    <p>• Response Time: Usually responds within 4 hours</p>
                  </div>
                </div>

                {/* Conversation Context */}
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h5 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
                    💬 CONVERSATION CONTEXT:
                  </h5>
                  <p className="text-sm italic" data-testid={`text-plan-context-${plan.id}`}>
                    "I can do ${plan.weeklyAmount} per week starting Friday. I get paid Fridays so that works best for me. Can we set this up?"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary hover:underline p-0 h-auto flex items-center space-x-1" 
                      onClick={() => alert(`Full conversation modal API needed: Open conversation for payment plan discussion with ${tenant.name} (Plan ID: ${plan.id})`)}
                      data-testid={`button-view-conversation-${plan.id}`}
                    >
                      <Scroll className="h-4 w-4" />
                      <span>View Full Conversation</span>
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary hover:underline p-0 h-auto flex items-center space-x-1" 
                      onClick={() => alert(`Tenant profile modal API needed: Open profile for ${tenant.name} (Tenant ID: ${tenant.id})`)}
                      data-testid={`button-tenant-profile-${plan.id}`}
                    >
                      <User className="h-4 w-4" />
                      <span>Tenant Profile</span>
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary hover:underline p-0 h-auto flex items-center space-x-1" 
                      onClick={() => alert(`Plan modification API needed: Modify payment plan terms for ${tenant.name} (Plan ID: ${plan.id})`)}
                      data-testid={`button-modify-terms-${plan.id}`}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modify Terms</span>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      className="bg-green-600 text-white hover:bg-green-700 flex items-center space-x-1"
                      onClick={() => handleApprovePlan(plan.id)}
                      disabled={updatePaymentPlanMutation.isPending}
                      data-testid={`button-approve-plan-${plan.id}`}
                    >
                      <Check className="h-4 w-4" />
                      <span>APPROVE PLAN</span>
                    </Button>
                    <Button 
                      className="bg-yellow-600 text-white hover:bg-yellow-700 flex items-center space-x-1"
                      onClick={() => alert(`Counter-offer API needed: Create counter-offer for payment plan with ${tenant.name} (Plan ID: ${plan.id})`)}
                      data-testid={`button-counter-offer-${plan.id}`}
                    >
                      <Edit className="h-4 w-4" />
                      <span>COUNTER-OFFER</span>
                    </Button>
                    <Button 
                      className="bg-red-600 text-white hover:bg-red-700 flex items-center space-x-1"
                      onClick={() => handleDenyPlan(plan.id)}
                      disabled={updatePaymentPlanMutation.isPending}
                      data-testid={`button-deny-plan-${plan.id}`}
                    >
                      <X className="h-4 w-4" />
                      <span>DENY PLAN</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {pendingPlans.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <h4 className="font-medium mb-2">No Payment Plans Pending</h4>
            <p className="text-sm">All payment plans have been reviewed and processed.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
