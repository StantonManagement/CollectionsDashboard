import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Languages, AlertTriangle, Phone, User } from "lucide-react";
import type { Conversation, Tenant, Message } from "@shared/schema";

interface ConversationModalProps {
  conversation: Conversation | null;
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationModal({ conversation, tenant, isOpen, onClose }: ConversationModalProps) {
  const [showOriginalLanguage, setShowOriginalLanguage] = useState(false);

  if (!conversation || !tenant) {
    return null;
  }

  const getDisplayContent = (message: Message) => {
    if (showOriginalLanguage && message.originalContent) {
      return message.originalContent;
    }
    return message.content;
  };

  const toggleLanguage = () => {
    setShowOriginalLanguage(!showOriginalLanguage);
  };

  const hasTranslations = Array.isArray(conversation.messages) && 
    conversation.messages.some((msg: Message) => msg.originalContent);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="modal-conversation">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="text-conversation-modal-title">
              Conversation: {tenant.name} - {tenant.unit}
            </DialogTitle>
            {hasTranslations && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center space-x-1"
                data-testid="button-toggle-language-modal"
              >
                <Languages className="h-4 w-4" />
                <span>{showOriginalLanguage ? 'Show English' : 'Show Original'}</span>
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Tenant Info */}
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Tenant Info</h5>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>• Amount: ${tenant.amountOwed} + fees</p>
                <p>• Days Late: {tenant.daysLate}</p>
                <p>• Language: {tenant.language}</p>
                <p>• Reliability: {tenant.reliability}/10</p>
                <p>• Phone: {tenant.phone}</p>
                <p>• Property: {tenant.property}</p>
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-2">Quick Actions</h5>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => alert(`Escalation API needed: Escalate conversation for ${tenant.name}`)}
                  data-testid="button-escalate-modal"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                  data-testid="button-call-tenant-modal"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Tenant
                </Button>
              </div>
            </div>
          </div>
          
          {/* Message Thread */}
          <div className="col-span-2">
            <h5 className="font-medium mb-2">Message Thread</h5>
            <ScrollArea className="h-96 border rounded-md p-4">
              <div className="space-y-4">
                {Array.isArray(conversation.messages) && conversation.messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.sender === "tenant" 
                        ? "bg-slate-50 border-l-4 border-slate-400" 
                        : message.sender === "ai" 
                        ? "bg-stone-50 border-l-4 border-stone-400"
                        : "bg-gray-50 border-l-4 border-gray-400"
                    }`}
                    data-testid={`message-${message.id}`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.sender === "tenant" ? (
                        <User className="h-4 w-4 text-slate-600" />
                      ) : message.sender === "ai" ? (
                        <span className="text-stone-600">🤖</span>
                      ) : (
                        <span className="text-gray-600">👤</span>
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                      {message.needsApproval && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          AWAITING APPROVAL
                        </Badge>
                      )}
                      {message.originalContent && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium">
                          {showOriginalLanguage ? 'Spanish' : 'English'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{getDisplayContent(message)}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}