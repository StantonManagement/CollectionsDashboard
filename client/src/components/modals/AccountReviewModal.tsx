import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Calendar, AlertTriangle, CheckCircle, XCircle, Clock, Phone } from "lucide-react";
import type { Tenant } from "@shared/schema";

interface AccountReviewModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountReviewModal({ tenant, isOpen, onClose }: AccountReviewModalProps) {
  if (!tenant) {
    return null;
  }

  // Mock additional account data
  const accountDetails = {
    leaseStart: "2024-01-15",
    leaseEnd: "2024-12-31",
    monthlyRent: 1450,
    securityDeposit: 1450,
    lateFeesAccrued: 75,
    totalBalance: parseFloat(tenant.amountOwed) + 75,
    paymentHistory: [
      { date: "2024-09-01", amount: 1450, status: "missed", dueDate: "2024-09-01" },
      { date: "2024-08-01", amount: 1450, status: "paid", dueDate: "2024-08-01", paidDate: "2024-08-03" },
      { date: "2024-07-01", amount: 1450, status: "paid", dueDate: "2024-07-01", paidDate: "2024-07-01" },
      { date: "2024-06-01", amount: 1450, status: "late", dueDate: "2024-06-01", paidDate: "2024-06-08" },
      { date: "2024-05-01", amount: 1450, status: "paid", dueDate: "2024-05-01", paidDate: "2024-04-30" }
    ],
    escalationHistory: [
      { date: "2024-09-20", action: "Initial contact", result: "No response" },
      { date: "2024-09-22", action: "Follow-up message", result: "Tenant promised payment" },
      { date: "2024-09-24", action: "Payment reminder", result: "No payment received" }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "late": return <Clock className="h-4 w-4 text-orange-600" />;
      case "missed": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "late": return "bg-orange-100 text-orange-800";
      case "missed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh]" data-testid="modal-account-review">
        <DialogHeader>
          <DialogTitle data-testid="text-account-review-title">
            Account Review: {tenant.name} - Unit {tenant.unit}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Account Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Account Summary</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Monthly Rent:</span>
                <span className="font-medium">${accountDetails.monthlyRent}</span>
              </div>
              <div className="flex justify-between">
                <span>Past Due Amount:</span>
                <span className="font-medium text-red-600">${tenant.amountOwed}</span>
              </div>
              <div className="flex justify-between">
                <span>Late Fees:</span>
                <span className="font-medium text-orange-600">${accountDetails.lateFeesAccrued}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Balance:</span>
                <span className="text-red-600">${accountDetails.totalBalance}</span>
              </div>
              <div className="flex justify-between">
                <span>Days Late:</span>
                <span className="font-medium">{tenant.daysLate} days</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit:</span>
                <span className="font-medium">${accountDetails.securityDeposit}</span>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Lease Period:</span>
                <span>{new Date(accountDetails.leaseStart).toLocaleDateString()} - {new Date(accountDetails.leaseEnd).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Reliability Score:</span>
                <span className="font-medium">{tenant.reliability}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Property:</span>
                <span>{tenant.property}</span>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Payment History</span>
            </h3>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {accountDetails.paymentHistory.map((payment, index) => (
                  <div key={index} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className="font-medium">${payment.amount}</span>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Due: {new Date(payment.dueDate).toLocaleDateString()}</div>
                      {payment.paidDate && (
                        <div>Paid: {new Date(payment.paidDate).toLocaleDateString()}</div>
                      )}
                      {payment.status === "late" && payment.paidDate && (
                        <div className="text-orange-600">
                          {Math.ceil((new Date(payment.paidDate).getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days late
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Actions & Escalation History */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Recent Actions</span>
              </h3>
              <div className="space-y-2">
                {accountDetails.escalationHistory.map((action, index) => (
                  <div key={index} className="text-sm border-l-2 border-blue-200 pl-3 py-1">
                    <div className="font-medium">{action.action}</div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(action.date).toLocaleDateString()} - {action.result}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                  data-testid="button-call-from-account-review"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Tenant
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => alert("Payment plan creation API needed")}
                  data-testid="button-create-payment-plan"
                >
                  Create Payment Plan
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => alert("Eviction process API needed")}
                  data-testid="button-start-eviction"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Start Eviction Process
                </Button>
                <Button 
                  className="w-full bg-red-600 text-white hover:bg-red-700" 
                  size="sm" 
                  onClick={() => alert("Account notes API needed")}
                  data-testid="button-add-note"
                >
                  Add Note to File
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Account Notes */}
        {tenant.notes && (
          <Card className="p-4 mt-4">
            <h3 className="font-semibold mb-2">Account Notes</h3>
            <p className="text-sm text-muted-foreground">{tenant.notes}</p>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}