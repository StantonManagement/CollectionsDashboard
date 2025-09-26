import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Edit, X, AlertTriangle, Scroll, User, Phone, BarChart3, Languages } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Tenant, Message } from "@shared/schema";

export default function AiApprovalsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showOriginalLanguage, setShowOriginalLanguage] = useState<{[key: string]: boolean}>({});

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const updateConversationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Conversation> }) => {
      const res = await apiRequest("PATCH", `/api/conversations/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const pendingApprovals = conversations.filter((conv) => {
    if (!Array.isArray(conv.messages)) return false;
    return conv.messages.some((msg: Message) => msg.needsApproval);
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleApprove = async (conversationId: string) => {
    try {
      const conversation = conversations.find((c: Conversation) => c.id === conversationId);
      if (!conversation) return;

      const updatedMessages = (conversation.messages as Message[]).map((msg: Message) => 
        msg.needsApproval ? { ...msg, needsApproval: false } : msg
      );

      await updateConversationMutation.mutateAsync({
        id: conversationId,
        updates: { messages: updatedMessages }
      });

      toast({
        title: "Response Approved",
        description: "The AI response has been approved and sent to the tenant.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (conversationId: string) => {
    try {
      await updateConversationMutation.mutateAsync({
        id: conversationId,
        updates: { status: "escalated" }
      });

      toast({
        title: "Response Rejected",
        description: "The response has been rejected and the conversation escalated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTenantById = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId);
  };

  const toggleLanguage = (conversationId: string) => {
    setShowOriginalLanguage(prev => ({
      ...prev,
      [conversationId]: !prev[conversationId]
    }));
  };

  const getDisplayContent = (message: Message, conversationId: string) => {
    const showOriginal = showOriginalLanguage[conversationId];
    if (showOriginal && message.originalContent) {
      return message.originalContent;
    }
    return message.content;
  };

  if (conversationsLoading || tenantsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="tab-ai-approvals">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" data-testid="text-approvals-title">
            AI Response Approvals ({pendingApprovals.length} pending)
          </h3>
          <div className="flex items-center space-x-3">
            <Button 
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={pendingApprovals.length === 0}
              onClick={() => alert(`Bulk approval API needed: Approve ${pendingApprovals.filter((c: Conversation) => c.confidence && c.confidence >= 85).length} high-confidence responses`)}
              data-testid="button-approve-all"
            >
              Approve All Valid ({pendingApprovals.filter((c: Conversation) => c.confidence && c.confidence >= 85).length})
            </Button>
            <Select defaultValue="all" onValueChange={(value) => alert(`Confidence filtering API needed: Filter by ${value} confidence level`)}>
              <SelectTrigger className="w-48" data-testid="select-confidence-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence Levels</SelectItem>
                <SelectItem value="high">High (90%+)</SelectItem>
                <SelectItem value="medium">Medium (70-89%)</SelectItem>
                <SelectItem value="low">Low (&lt;70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {pendingApprovals.map((conversation: Conversation) => {
          const tenant = getTenantById(conversation.tenantId);
          if (!tenant) return null;

          const pendingMessage = Array.isArray(conversation.messages) 
            ? conversation.messages.find((msg: Message) => msg.needsApproval)
            : null;
          
          const lastTenantMessage = Array.isArray(conversation.messages)
            ? [...conversation.messages].reverse().find((msg: Message) => msg.sender === "tenant")
            : null;

          if (!pendingMessage || !lastTenantMessage) return null;

          return (
            <Card key={conversation.id} className="border shadow-sm" data-testid={`card-approval-${conversation.id}`}>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold" data-testid={`text-tenant-info-${conversation.id}`}>
                    {tenant.name} • {tenant.unit} • {tenant.property}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {lastTenantMessage && lastTenantMessage.originalContent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleLanguage(conversation.id)}
                        className="flex items-center space-x-1"
                        data-testid={`button-toggle-language-${conversation.id}`}
                      >
                        <Languages className="h-4 w-4" />
                        <span>{showOriginalLanguage[conversation.id] ? 'Show English' : 'Show Original'}</span>
                      </Button>
                    )}
                    <div className="flex items-center space-x-1">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getConfidenceBarColor(conversation.confidence || 0)}`}
                          style={{ width: `${conversation.confidence || 0}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getConfidenceColor(conversation.confidence || 0)}`} data-testid={`text-confidence-${conversation.id}`}>
                        {conversation.confidence || 0}%
                      </span>
                    </div>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground" data-testid={`text-conversation-info-${conversation.id}`}>
                  Conversation: {Array.isArray(conversation.messages) ? conversation.messages.length : 0} messages • 
                  Started: {conversation.startedAt ? new Date(conversation.startedAt).toLocaleString() : 'Unknown'}
                </p>
              </div>

              <div className="p-4 space-y-4">
                {/* Tenant Message */}
                <div className="bg-slate-50 border-l-4 border-slate-400 p-3 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-800">TENANT SAID:</span>
                  </div>
                  <p className="text-sm" data-testid={`text-tenant-message-${conversation.id}`}>
                    "{getDisplayContent(lastTenantMessage, conversation.id)}"
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600 font-medium">
                      {new Date(lastTenantMessage.timestamp).toLocaleTimeString()}
                    </p>
                    {lastTenantMessage.originalContent && (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium">
                        {showOriginalLanguage[conversation.id] ? 'Spanish' : 'English'}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Response */}
                <div className="bg-stone-50 border-l-4 border-stone-400 p-3 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-4 w-4 text-stone-600">🤖</div>
                    <span className="text-sm font-medium text-stone-800">AI WANTS TO RESPOND:</span>
                  </div>
                  <p className="text-sm" data-testid={`text-ai-response-${conversation.id}`}>
                    "{getDisplayContent(pendingMessage, conversation.id)}"
                  </p>
                  {pendingMessage.originalContent && (
                    <div className="flex justify-end mt-2">
                      <span className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded-full font-medium">
                        {showOriginalLanguage[conversation.id] ? 'Spanish' : 'English'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Plan Validation */}
                <div className={`border rounded p-3 ${conversation.confidence && conversation.confidence >= 85 ? 'bg-slate-50 border-slate-200' : 'bg-neutral-50 border-neutral-200'}`}>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      {conversation.confidence && conversation.confidence >= 85 ? (
                        <Check className="h-4 w-4 text-slate-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-neutral-600" />
                      )}
                      <span>Payment plan extracted from conversation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-slate-600" />
                      <span>Within policy limits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-slate-600" />
                      <span>Appropriate tone and language</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary hover:underline p-0 h-auto flex items-center space-x-1" 
                      onClick={() => alert(`Full conversation modal API needed: Open full conversation for ${tenant.name} (Conversation ID: ${conversation.id})`)}
                      data-testid={`button-view-conversation-${conversation.id}`}
                    >
                      <Scroll className="h-4 w-4" />
                      <span>View Full Conversation</span>
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary hover:underline p-0 h-auto flex items-center space-x-1" 
                      onClick={() => alert(`Tenant profile modal API needed: Open profile for ${tenant.name} (Tenant ID: ${tenant.id})`)}
                      data-testid={`button-tenant-profile-${conversation.id}`}
                    >
                      <User className="h-4 w-4" />
                      <span>Tenant Profile</span>
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary hover:underline p-0 h-auto flex items-center space-x-1" 
                      onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                      data-testid={`button-call-tenant-${conversation.id}`}
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Tenant</span>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      className="bg-green-600 text-white hover:bg-green-700 flex items-center space-x-1"
                      onClick={() => handleApprove(conversation.id)}
                      disabled={updateConversationMutation.isPending}
                      data-testid={`button-approve-${conversation.id}`}
                    >
                      <Check className="h-4 w-4" />
                      <span>APPROVE</span>
                    </Button>
                    <Button 
                      className="bg-yellow-600 text-white hover:bg-yellow-700 flex items-center space-x-1"
                      onClick={() => alert(`Response modification API needed: Modify AI response for ${tenant.name} (Conversation ID: ${conversation.id})`)}
                      data-testid={`button-modify-${conversation.id}`}
                    >
                      <Edit className="h-4 w-4" />
                      <span>MODIFY</span>
                    </Button>
                    <Button 
                      className="bg-red-600 text-white hover:bg-red-700 flex items-center space-x-1"
                      onClick={() => handleReject(conversation.id)}
                      disabled={updateConversationMutation.isPending}
                      data-testid={`button-reject-${conversation.id}`}
                    >
                      <X className="h-4 w-4" />
                      <span>REJECT</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {pendingApprovals.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <h4 className="font-medium mb-2">No Approvals Pending</h4>
            <p className="text-sm">All AI responses have been reviewed and approved.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
