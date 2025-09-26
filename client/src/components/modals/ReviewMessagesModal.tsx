import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertTriangle, User, Languages, Flag } from "lucide-react";
import type { Conversation, Tenant, Message } from "@shared/schema";

interface ReviewMessagesModalProps {
  conversation: Conversation | null;
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewMessagesModal({ conversation, tenant, isOpen, onClose }: ReviewMessagesModalProps) {
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

  // Filter for potentially concerning messages
  const concerningMessages = Array.isArray(conversation.messages) 
    ? conversation.messages.filter((msg: Message) => 
        msg.sender === "tenant" && (
          msg.content.toLowerCase().includes("threat") ||
          msg.content.toLowerCase().includes("lawyer") ||
          msg.content.toLowerCase().includes("sue") ||
          msg.content.toLowerCase().includes("legal") ||
          msg.content.toLowerCase().includes("angry") ||
          msg.content.includes("!!!") ||
          msg.content.includes("!!!")
        )
      )
    : [];

  const hasTranslations = Array.isArray(conversation.messages) && 
    conversation.messages.some((msg: Message) => msg.originalContent);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="modal-review-messages">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="text-review-messages-title">
              Message Review: {tenant.name} - Escalation Required
            </DialogTitle>
            {hasTranslations && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center space-x-1"
                data-testid="button-toggle-language-review"
              >
                <Languages className="h-4 w-4" />
                <span>{showOriginalLanguage ? 'Show English' : 'Show Original'}</span>
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Alert Summary */}
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Review Required</h3>
            </div>
            <p className="text-sm text-red-700">
              This conversation has been flagged for containing potentially threatening or concerning language. 
              Please review all messages and determine appropriate next steps.
            </p>
            <div className="mt-2 text-sm text-red-600">
              • Tenant: {tenant.name} ({tenant.unit})
              • Total Messages: {Array.isArray(conversation.messages) ? conversation.messages.length : 0}
              • Flagged Messages: {concerningMessages.length}
            </div>
          </Card>

          {/* Flagged Messages */}
          {concerningMessages.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <Flag className="h-4 w-4 text-red-600" />
                <span>Flagged Messages ({concerningMessages.length})</span>
              </h3>
              <div className="space-y-3">
                {concerningMessages.map((message: Message) => (
                  <div
                    key={message.id}
                    className="p-3 rounded-lg bg-red-50 border-l-4 border-red-400"
                    data-testid={`flagged-message-${message.id}`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-medium text-red-600">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                      {message.originalContent && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          {showOriginalLanguage ? 'Spanish' : 'English'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-red-800">{getDisplayContent(message)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Full Message Thread */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Complete Message Thread</h3>
            <ScrollArea className="h-64 border rounded-md p-4">
              <div className="space-y-4">
                {Array.isArray(conversation.messages) && conversation.messages.map((message: Message) => {
                  const isFlagged = concerningMessages.some(cm => cm.id === message.id);
                  
                  return (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        isFlagged 
                          ? "bg-red-50 border-l-4 border-red-400"
                          : message.sender === "tenant" 
                          ? "bg-slate-50 border-l-4 border-slate-400" 
                          : message.sender === "ai" 
                          ? "bg-stone-50 border-l-4 border-stone-400"
                          : "bg-gray-50 border-l-4 border-gray-400"
                      }`}
                      data-testid={`review-message-${message.id}`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender === "tenant" ? (
                          <User className={`h-4 w-4 ${isFlagged ? 'text-red-600' : 'text-slate-600'}`} />
                        ) : message.sender === "ai" ? (
                          <span className="text-stone-600">🤖</span>
                        ) : (
                          <span className="text-gray-600">👤</span>
                        )}
                        <span className={`text-xs font-medium ${isFlagged ? 'text-red-600' : 'text-gray-600'}`}>
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                        {isFlagged && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            FLAGGED
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
                  );
                })}
              </div>
            </ScrollArea>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Review complete. Choose appropriate action:
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => alert("Legal consultation API needed")}
                data-testid="button-escalate-legal"
              >
                Escalate to Legal
              </Button>
              <Button 
                variant="outline"
                onClick={() => alert("Manager notification API needed")}
                data-testid="button-notify-manager"
              >
                Notify Manager
              </Button>
              <Button 
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => alert("Mark as reviewed API needed")}
                data-testid="button-mark-reviewed"
              >
                Mark as Reviewed
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}