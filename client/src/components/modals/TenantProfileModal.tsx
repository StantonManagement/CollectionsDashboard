import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Calendar, DollarSign } from "lucide-react";
import type { Tenant } from "@shared/schema";

interface TenantProfileModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantProfileModal({ tenant, isOpen, onClose }: TenantProfileModalProps) {
  if (!tenant) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-slate-100 text-slate-800";
      case "in_progress": return "bg-stone-100 text-stone-800";
      case "awaiting_approval": return "bg-neutral-100 text-neutral-800";
      case "negotiating": return "bg-zinc-100 text-zinc-800";
      case "escalated": return "bg-gray-200 text-gray-900";
      case "completed": return "bg-slate-200 text-slate-900";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Mock payment history data
  const paymentHistory = [
    { date: "2024-09-15", amount: 450, status: "paid", method: "bank_transfer" },
    { date: "2024-08-15", amount: 450, status: "paid", method: "check" },
    { date: "2024-07-15", amount: 450, status: "paid", method: "bank_transfer" },
    { date: "2024-06-15", amount: 450, status: "late", method: "bank_transfer", daysLate: 5 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="modal-tenant-profile">
        <DialogHeader>
          <DialogTitle data-testid="text-tenant-profile-title">
            Tenant Profile: {tenant.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.phone}</span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-primary"
                  onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                  data-testid="button-call-from-profile"
                >
                  Call
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>No email on file</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.unit}, {tenant.property}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Language: {tenant.language}</span>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <h3 className="font-semibold mb-3">Account Status</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className={getPriorityColor(tenant.priority)}>
                  {tenant.priority.toUpperCase()} PRIORITY
                </Badge>
                <Badge className={getStatusColor(tenant.status)}>
                  {tenant.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-red-600">${tenant.amountOwed} owed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.daysLate} days late</span>
              </div>
              <div>
                <span>Reliability Score: {tenant.reliability}/10</span>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Payment History</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {paymentHistory.map((payment, index) => (
                <div key={index} className="border rounded p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">${payment.amount}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {payment.status.toUpperCase()}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {payment.method.replace('_', ' ')}
                      </div>
                      {payment.daysLate && (
                        <div className="text-xs text-red-600">
                          {payment.daysLate} days late
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Notes Section */}
        {tenant.notes && (
          <Card className="p-4 mt-4">
            <h3 className="font-semibold mb-3">Notes</h3>
            <p className="text-sm text-muted-foreground">{tenant.notes}</p>
          </Card>
        )}

        {/* Last Contact */}
        <div className="mt-4 text-sm text-muted-foreground">
          Last Contact: {tenant.lastContact ? new Date(tenant.lastContact).toLocaleString() : 'Never'}
        </div>
      </DialogContent>
    </Dialog>
  );
}