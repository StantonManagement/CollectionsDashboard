import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, User, Phone, AlertTriangle, Languages } from "lucide-react";
import type { Conversation, Tenant, Message } from "@shared/schema";

export default function ConversationsTab() {
  const [showOriginalLanguage, setShowOriginalLanguage] = useState<{[key: string]: boolean}>({});
  
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const activeConversations = conversations.filter((conv) => conv.status === "active");

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600";
      case "completed": return "text-blue-600";
      case "escalated": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return "🟢";
      case "completed": return "🔵";
      case "escalated": return "🔴";
      default: return "⚫";
    }
  };

  const getLastMessage = (messages: Message[]) => {
    if (!Array.isArray(messages) || messages.length === 0) return null;
    return messages[messages.length - 1];
  };

  const getMessageTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
  };

  if (conversationsLoading || tenantsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="tab-conversations">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold" data-testid="text-conversations-title">
              Active Conversations ({activeConversations.length} ongoing)
            </h3>
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-4 h-4 bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium">Live Updates</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select defaultValue="all" onValueChange={(value) => alert(`Language filtering API needed: Filter conversations by ${value} language`)}>
              <SelectTrigger className="w-40" data-testid="select-language-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="active" onValueChange={(value) => alert(`Status filtering API needed: Filter conversations by ${value} status`)}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {activeConversations.map((conversation: Conversation) => {
          const tenant = getTenantById(conversation.tenantId);
          if (!tenant) return null;

          const lastMessage = getLastMessage(conversation.messages as Message[]);
          if (!lastMessage) return null;

          return (
            <Card key={conversation.id} className="p-4 border shadow-sm hover:shadow-md transition-shadow" data-testid={`card-conversation-${conversation.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStatusIcon(conversation.status)}</span>
                      <h4 className="font-semibold" data-testid={`text-conversation-tenant-${conversation.id}`}>
                        {tenant.name} • {tenant.language} • {getMessageTimeAgo(lastMessage.timestamp)}
                      </h4>
                    </div>
                    {lastMessage && lastMessage.originalContent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleLanguage(conversation.id)}
                        className="flex items-center space-x-1"
                        data-testid={`button-toggle-language-${conversation.id}`}
                      >
                        <Languages className="h-4 w-4" />
                        <span>{showOriginalLanguage[conversation.id] ? 'EN' : 'ES'}</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2" data-testid={`text-last-message-${conversation.id}`}>
                    Last: "{getDisplayContent(lastMessage, conversation.id).substring(0, 80)}..."
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(conversation.status)}>
                      Status: {conversation.status.replace('_', ' ')}
                    </Badge>
                    {lastMessage.needsApproval && (
                      <Badge className="bg-orange-100 text-orange-800">
                        Awaiting Approval
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid={`button-open-chat-${conversation.id}`}>
                        Open Chat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <div className="flex items-center justify-between">
                          <DialogTitle data-testid={`text-chat-title-${conversation.id}`}>
                            Conversation: {tenant.name} - {tenant.unit}
                          </DialogTitle>
                          {Array.isArray(conversation.messages) && conversation.messages.some((msg: Message) => msg.originalContent) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleLanguage(conversation.id)}
                              className="flex items-center space-x-1"
                              data-testid={`button-toggle-language-modal-${conversation.id}`}
                            >
                              <Languages className="h-4 w-4" />
                              <span>{showOriginalLanguage[conversation.id] ? 'Show English' : 'Show Original'}</span>
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
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Quick Actions</h5>
                            <div className="space-y-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full" 
                                onClick={() => alert(`Escalation API needed: Escalate conversation for ${tenant.name} (Conversation ID: ${conversation.id})`)}
                                data-testid={`button-escalate-${conversation.id}`}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Escalate
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full" 
                                onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                                data-testid={`button-call-tenant-modal-${conversation.id}`}
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
                                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        message.sender === "tenant" 
                                          ? "bg-slate-100 text-slate-700" 
                                          : message.sender === "ai" 
                                          ? "bg-stone-100 text-stone-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}>
                                        {showOriginalLanguage[conversation.id] ? 'Spanish' : 'English'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm">{getDisplayContent(message, conversation.id)}</p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" data-testid={`button-escalate-conversation-${conversation.id}`}>
                    Escalate
                  </Button>
                  <Button variant="link" size="sm" className="text-primary" data-testid={`button-view-profile-${conversation.id}`}>
                    View Profile
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {activeConversations.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h4 className="font-medium mb-2">No Active Conversations</h4>
            <p className="text-sm">All conversations have been completed or escalated.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
