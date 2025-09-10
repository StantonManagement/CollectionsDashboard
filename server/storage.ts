import { type Tenant, type InsertTenant, type Conversation, type InsertConversation, type PaymentPlan, type InsertPaymentPlan, type Escalation, type InsertEscalation, type Message } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Tenants
  getTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined>;

  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByTenant(tenantId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;

  // Payment Plans
  getPaymentPlans(): Promise<PaymentPlan[]>;
  getPaymentPlan(id: string): Promise<PaymentPlan | undefined>;
  getPaymentPlansByTenant(tenantId: string): Promise<PaymentPlan[]>;
  createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan>;
  updatePaymentPlan(id: string, updates: Partial<PaymentPlan>): Promise<PaymentPlan | undefined>;

  // Escalations
  getEscalations(): Promise<Escalation[]>;
  getEscalation(id: string): Promise<Escalation | undefined>;
  createEscalation(escalation: InsertEscalation): Promise<Escalation>;
  updateEscalation(id: string, updates: Partial<Escalation>): Promise<Escalation | undefined>;
}

export class MemStorage implements IStorage {
  private tenants: Map<string, Tenant>;
  private conversations: Map<string, Conversation>;
  private paymentPlans: Map<string, PaymentPlan>;
  private escalations: Map<string, Escalation>;

  constructor() {
    this.tenants = new Map();
    this.conversations = new Map();
    this.paymentPlans = new Map();
    this.escalations = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Create mock tenants
    const mockTenants: InsertTenant[] = [
      {
        name: "Maria Rodriguez",
        unit: "Unit 3A",
        property: "Oak Village",
        phone: "(555) 123-4567",
        language: "Spanish",
        amountOwed: "1247.00",
        daysLate: 47,
        reliability: 6,
        priority: "high",
        status: "awaiting_approval",
        notes: "Tenant requested Spanish communication, prefers Friday payment start dates"
      },
      {
        name: "James Wilson",
        unit: "Unit 1C",
        property: "Maple Commons",
        phone: "(555) 987-6543",
        language: "English",
        amountOwed: "890.00",
        daysLate: 34,
        reliability: 7,
        priority: "medium",
        status: "in_progress",
        notes: "Usually responds within 4 hours"
      },
      {
        name: "Sarah Johnson",
        unit: "Unit 2B",
        property: "Oak Village",
        phone: "(555) 456-7890",
        language: "English",
        amountOwed: "445.00",
        daysLate: 31,
        reliability: 8,
        priority: "low",
        status: "pending",
        notes: "Good payment history"
      },
      {
        name: "Michael Chen",
        unit: "Unit 4A",
        property: "Pine Heights",
        phone: "(555) 321-9876",
        language: "English",
        amountOwed: "1567.00",
        daysLate: 62,
        reliability: 4,
        priority: "high",
        status: "escalated",
        notes: "Multiple failed payment attempts"
      },
      {
        name: "James Thompson",
        unit: "Unit 1B",
        property: "Maple Commons",
        phone: "(555) 234-5678",
        language: "English",
        amountOwed: "890.00",
        daysLate: 34,
        reliability: 7,
        priority: "medium",
        status: "negotiating",
        notes: "Successful payment history, prefers Friday starts"
      }
    ];

    // Create tenants
    mockTenants.forEach(tenant => {
      const id = randomUUID();
      const fullTenant: Tenant = {
        ...tenant,
        id,
        lastContact: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };
      this.tenants.set(id, fullTenant);
    });

    // Create mock conversations
    const tenantIds = Array.from(this.tenants.keys());
    tenantIds.slice(0, 3).forEach((tenantId, index) => {
      const mockMessages: Message[] = [
        {
          id: randomUUID(),
          sender: "ai",
          content: index === 0 
            ? "Hola Maria, su renta de $567 está 47 días atrasada. ¿Podemos establecer un plan de pagos?"
            : "Hi, your rent payment of $890 is 34 days overdue. Can we set up a payment plan?",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: randomUUID(),
          sender: "tenant",
          content: index === 0
            ? "Hola, si puedo hacer plan de pagos. ¿Cuando puedo empezar?"
            : "Yes, I can do a payment plan. When can I start?",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: randomUUID(),
          sender: "ai",
          content: index === 0
            ? "Podemos empezar este viernes. ¿$75 por semana por 8 semanas?"
            : "We can start this Friday. How about $120 per week for 8 weeks?",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: randomUUID(),
          sender: "tenant",
          content: index === 0
            ? "Si, puedo pagar $75 por semana por 8 semanas empezando viernes"
            : "I can do $50 every two weeks starting next Friday, that should work for both of us",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: randomUUID(),
          sender: "ai",
          content: index === 0
            ? "¡Perfecto Maria! $75 por semana por 8 semanas cubre el total de $600. ¿Podemos confirmar que empezará este viernes 12 de enero? Te enviaré recordatorios cada jueves. - Stanton Management"
            : "Hi James! $50 every two weeks works great. That means $100 per month, so it would take about 9 payments to cover your balance of $890. Can we confirm the first payment for January 19th? - Stanton Management",
          timestamp: new Date().toISOString(),
          needsApproval: true
        }
      ];

      const conversationId = randomUUID();
      const conversation: Conversation = {
        id: conversationId,
        tenantId,
        messages: mockMessages,
        status: "active",
        confidence: index === 0 ? 85 : 72,
        startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        lastMessageAt: new Date()
      };
      this.conversations.set(conversationId, conversation);
    });

    // Create mock payment plans
    const conversationIds = Array.from(this.conversations.keys());
    conversationIds.slice(0, 2).forEach((conversationId, index) => {
      const conversation = this.conversations.get(conversationId)!;
      const tenant = this.tenants.get(conversation.tenantId)!;
      
      const planId = randomUUID();
      const paymentPlan: PaymentPlan = {
        id: planId,
        tenantId: conversation.tenantId,
        conversationId,
        weeklyAmount: index === 0 ? "75.00" : "50.00",
        duration: index === 0 ? 8 : 18,
        totalAmount: index === 0 ? "600.00" : "900.00",
        startDate: "2025-01-12",
        includesLateFees: true,
        status: "proposed",
        coverage: index === 0 ? 100 : 101,
        createdAt: new Date()
      };
      this.paymentPlans.set(planId, paymentPlan);
    });

    // Create mock escalations
    const escalatedTenantIds = tenantIds.slice(3, 5);
    escalatedTenantIds.forEach((tenantId, index) => {
      const escalationId = randomUUID();
      const escalation: Escalation = {
        id: escalationId,
        tenantId,
        conversationId: null,
        type: index === 0 ? "phone_failed" : "threatening",
        priority: index === 0 ? "immediate" : "same_day",
        description: index === 0 
          ? "Primary phone (555-321-9876) failed after 3 attempts"
          : "AI detected threatening language: 'I'm going to sue you people'",
        status: "open",
        createdAt: new Date(Date.now() - index * 60 * 60 * 1000)
      };
      this.escalations.set(escalationId, escalation);
    });
  }

  // Tenant methods
  async getTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const id = randomUUID();
    const tenant: Tenant = {
      ...insertTenant,
      id,
      createdAt: new Date()
    };
    this.tenants.set(id, tenant);
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    const tenant = this.tenants.get(id);
    if (!tenant) return undefined;
    
    const updated = { ...tenant, ...updates };
    this.tenants.set(id, updated);
    return updated;
  }

  // Conversation methods
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByTenant(tenantId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => c.tenantId === tenantId);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      startedAt: new Date()
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates };
    this.conversations.set(id, updated);
    return updated;
  }

  // Payment Plan methods
  async getPaymentPlans(): Promise<PaymentPlan[]> {
    return Array.from(this.paymentPlans.values());
  }

  async getPaymentPlan(id: string): Promise<PaymentPlan | undefined> {
    return this.paymentPlans.get(id);
  }

  async getPaymentPlansByTenant(tenantId: string): Promise<PaymentPlan[]> {
    return Array.from(this.paymentPlans.values()).filter(p => p.tenantId === tenantId);
  }

  async createPaymentPlan(insertPlan: InsertPaymentPlan): Promise<PaymentPlan> {
    const id = randomUUID();
    const plan: PaymentPlan = {
      ...insertPlan,
      id,
      createdAt: new Date()
    };
    this.paymentPlans.set(id, plan);
    return plan;
  }

  async updatePaymentPlan(id: string, updates: Partial<PaymentPlan>): Promise<PaymentPlan | undefined> {
    const plan = this.paymentPlans.get(id);
    if (!plan) return undefined;
    
    const updated = { ...plan, ...updates };
    this.paymentPlans.set(id, updated);
    return updated;
  }

  // Escalation methods
  async getEscalations(): Promise<Escalation[]> {
    return Array.from(this.escalations.values());
  }

  async getEscalation(id: string): Promise<Escalation | undefined> {
    return this.escalations.get(id);
  }

  async createEscalation(insertEscalation: InsertEscalation): Promise<Escalation> {
    const id = randomUUID();
    const escalation: Escalation = {
      ...insertEscalation,
      id,
      createdAt: new Date()
    };
    this.escalations.set(id, escalation);
    return escalation;
  }

  async updateEscalation(id: string, updates: Partial<Escalation>): Promise<Escalation | undefined> {
    const escalation = this.escalations.get(id);
    if (!escalation) return undefined;
    
    const updated = { ...escalation, ...updates };
    this.escalations.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
