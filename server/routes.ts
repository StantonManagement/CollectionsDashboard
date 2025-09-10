import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tenants routes
  app.get("/api/tenants", async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });

  app.get("/api/tenants/:id", async (req, res) => {
    try {
      const tenant = await storage.getTenant(req.params.id);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenant" });
    }
  });

  app.patch("/api/tenants/:id", async (req, res) => {
    try {
      const updated = await storage.updateTenant(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update tenant" });
    }
  });

  // Conversations routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/tenant/:tenantId", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByTenant(req.params.tenantId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.patch("/api/conversations/:id", async (req, res) => {
    try {
      const updated = await storage.updateConversation(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update conversation" });
    }
  });

  // Payment Plans routes
  app.get("/api/payment-plans", async (req, res) => {
    try {
      const plans = await storage.getPaymentPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment plans" });
    }
  });

  app.patch("/api/payment-plans/:id", async (req, res) => {
    try {
      const updated = await storage.updatePaymentPlan(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Payment plan not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment plan" });
    }
  });

  // Escalations routes
  app.get("/api/escalations", async (req, res) => {
    try {
      const escalations = await storage.getEscalations();
      res.json(escalations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch escalations" });
    }
  });

  app.patch("/api/escalations/:id", async (req, res) => {
    try {
      const updated = await storage.updateEscalation(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Escalation not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update escalation" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      const conversations = await storage.getConversations();
      const paymentPlans = await storage.getPaymentPlans();
      const escalations = await storage.getEscalations();

      const stats = {
        pending: tenants.filter(t => t.status === "pending").length,
        active: tenants.filter(t => t.status === "in_progress").length,
        approval: conversations.filter(c => 
          Array.isArray(c.messages) && 
          c.messages.some((msg: any) => msg.needsApproval)
        ).length,
        escalated: escalations.filter(e => e.status === "open").length,
        totalTenants: tenants.length,
        totalOwed: tenants.reduce((sum, t) => sum + parseFloat(t.amountOwed), 0)
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
