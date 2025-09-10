import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  property: text("property").notNull(),
  phone: text("phone").notNull(),
  language: text("language").notNull().default("English"),
  amountOwed: decimal("amount_owed", { precision: 10, scale: 2 }).notNull(),
  daysLate: integer("days_late").notNull(),
  reliability: integer("reliability").notNull(), // 1-10 scale
  priority: text("priority").notNull(), // "high", "medium", "low"
  status: text("status").notNull(), // "pending", "in_progress", "awaiting_approval", etc.
  lastContact: timestamp("last_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  messages: jsonb("messages").notNull(), // Array of message objects
  status: text("status").notNull(), // "active", "completed", "escalated"
  confidence: integer("confidence"), // AI confidence score 0-100
  startedAt: timestamp("started_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at"),
});

export const paymentPlans = pgTable("payment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  weeklyAmount: decimal("weekly_amount", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // number of weeks
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  startDate: text("start_date").notNull(),
  includesLateFees: boolean("includes_late_fees").default(true),
  status: text("status").notNull(), // "proposed", "approved", "denied", "active", "completed"
  coverage: integer("coverage").notNull(), // percentage of debt covered
  createdAt: timestamp("created_at").defaultNow(),
});

export const escalations = pgTable("escalations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  type: text("type").notNull(), // "phone_failed", "threatening", "amount_dispute", etc.
  priority: text("priority").notNull(), // "immediate", "same_day", "next_business_day"
  description: text("description").notNull(),
  status: text("status").notNull(), // "open", "in_progress", "resolved"
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  startedAt: true,
});

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({
  id: true,
  createdAt: true,
});

export const insertEscalationSchema = createInsertSchema(escalations).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type Escalation = typeof escalations.$inferSelect;
export type InsertEscalation = z.infer<typeof insertEscalationSchema>;

// Message type for conversation messages
export type Message = {
  id: string;
  sender: "tenant" | "ai" | "manager";
  content: string;
  originalContent?: string; // For non-English messages
  language?: string; // Language of the original content
  timestamp: string;
  needsApproval?: boolean;
};
