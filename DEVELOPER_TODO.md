# DEVELOPER TODO LIST - Collections Dashboard Backend APIs

## 🚀 PRIORITY 1: PHONE INTEGRATION APIs (PARTIALLY COMPLETE)

### Phone System Integration (5+ remaining instances)
**Status:** ✅ Basic phone calling now works with system default app
**Remaining APIs needed for:** Call logging, alternative numbers, manual call tracking

- **~~Phone Call Initiation API~~** ✅ **COMPLETE**
  - **Implementation:** Now uses `tel:` protocol to open system default phone app
  - **Status:** All phone buttons (`button-call-{id}`, `button-call-tenant-{id}`, etc.) now functional

- **Alternative Phone API**
  - Endpoint: `POST /api/phone/try-alternative`
  - Purpose: Try alternative phone numbers when primary fails
  - Parameters: `{tenantId, escalationId}`
  - Required by button: `button-try-alt-phone-{id}`

- **Manual Call Logging API**
  - Endpoint: `POST /api/phone/log-manual-call`
  - Purpose: Log manual call attempts by staff
  - Parameters: `{tenantId, escalationId, notes, outcome}`
  - Required by button: `button-manual-call-{id}`

---

## 🚀 PRIORITY 2: MODAL & DETAIL VIEW SYSTEMS

### Conversation Modal System (8+ instances)
**Required for:** All tabs that show conversation data

- **Full Conversation Modal API**
  - Endpoint: `GET /api/conversations/{id}/full`
  - Purpose: Display complete conversation history with formatting
  - Returns: Full message thread, metadata, translation options
  - Required by buttons: `button-view-conversation-{id}`, `button-open-chat-{id}`

### Tenant Profile Modal System (6+ instances)
**Required for:** Multiple tabs showing tenant information

- **Tenant Profile Modal API**
  - Endpoint: `GET /api/tenants/{id}/profile`
  - Purpose: Display complete tenant profile, history, and account details
  - Returns: Contact info, payment history, notes, related conversations
  - Required by buttons: `button-tenant-profile-{id}`

---

## 🚀 PRIORITY 3: BULK OPERATIONS

### Bulk Processing APIs (5+ instances)
**Required for:** Efficient workflow management

- **Bulk Tenant Processing API**
  - Endpoint: `POST /api/tenants/bulk-start`
  - Purpose: Start collection processes for multiple selected tenants
  - Parameters: `{tenantIds: string[], processType: string}`
  - Required by button: `button-start-selected`

- **Bulk Approval API**
  - Endpoint: `POST /api/ai-responses/bulk-approve`
  - Purpose: Approve multiple high-confidence AI responses at once
  - Parameters: `{conversationIds: string[], minConfidence: number}`
  - Required by button: `button-approve-all`

---

## 🚀 PRIORITY 4: SETTINGS PERSISTENCE

### Settings Management APIs (10+ instances)
**Required for:** Settings page functionality

- **Settings Save API**
  - Endpoint: `PUT /api/settings`
  - Purpose: Save all user/system settings to database
  - Parameters: Complete settings object with all form values
  - Required by button: `button-save-settings`

- **Settings Reset API**
  - Endpoint: `POST /api/settings/reset`
  - Purpose: Reset all settings to default values
  - Required by button: `button-reset-settings`

- **Settings Load API**
  - Endpoint: `GET /api/settings`
  - Purpose: Load current settings for populating forms
  - Required for: Settings page initialization

---

## 🚀 PRIORITY 5: FILTERING & SORTING APIs

### Enhanced Filtering (6+ instances)
**Required for:** Better data organization and user efficiency

- **Property Filtering API**
  - Endpoint: `GET /api/tenants?property={propertyId}`
  - Purpose: Filter tenants by property
  - Required by dropdown: `select-property-filter`

- **Language Filtering API**
  - Endpoint: `GET /api/conversations?language={language}`
  - Purpose: Filter conversations by tenant language
  - Required by dropdown: `select-language-filter`

- **Risk Level Filtering API**
  - Endpoint: `GET /api/payment-plans?riskLevel={level}`
  - Purpose: Filter payment plans by risk assessment
  - Required by dropdown: `select-risk-filter`

- **Confidence Filtering API**
  - Endpoint: `GET /api/ai-responses?confidence={level}`
  - Purpose: Filter AI responses by confidence level
  - Required by dropdown: `select-confidence-filter`

### Sorting APIs
- **Dynamic Sorting API**
  - Endpoint: `GET /api/tenants?sortBy={field}&order={asc|desc}`
  - Purpose: Sort tenant list by priority, amount, or days late
  - Required by dropdown: `select-sort`

---

## 🚀 PRIORITY 6: RESPONSE MODIFICATION SYSTEMS

### AI Response Management (3+ instances)
**Required for:** AI response quality control

- **Response Modification API**
  - Endpoint: `PUT /api/ai-responses/{id}/modify`
  - Purpose: Allow manual editing of AI-generated responses
  - Parameters: `{newContent, reason, approverNotes}`
  - Required by buttons: `button-modify-{id}`

- **Counter-Offer Creation API**
  - Endpoint: `POST /api/payment-plans/{id}/counter-offer`
  - Purpose: Create counter-offers for payment plans
  - Parameters: `{newTerms, reason, expirationDate}`
  - Required by button: `button-counter-offer-{id}`

---

## 🚀 PRIORITY 7: ESCALATION MANAGEMENT

### Escalation Workflows (4+ instances)
**Required for:** Escalation tab functionality

- **Escalation Creation API**
  - Endpoint: `POST /api/escalations`
  - Purpose: Create new escalations from conversations
  - Parameters: `{conversationId, priority, type, description}`
  - Required by button: `button-escalate-{id}`

- **Assignment API**
  - Endpoint: `PUT /api/escalations/{id}/assign`
  - Purpose: Assign escalations to staff members
  - Parameters: `{assigneeId, notes}`
  - Required by button: `button-assign-{id}`

- **Message Review System**
  - Endpoint: `GET /api/escalations/{id}/messages`
  - Purpose: Review threatening or concerning messages
  - Required by button: `button-review-messages-{id}`

- **Legal Consultation API**
  - Endpoint: `POST /api/escalations/{id}/legal-consult`
  - Purpose: Request legal consultation for complex cases
  - Required by button: `button-legal-consult-{id}`

---

## 🚀 PRIORITY 8: SPECIALIZED WORKFLOWS

### Email Generation
- **Bookkeeper Email API**
  - Endpoint: `POST /api/payment-plans/generate-bookkeeper-email`
  - Purpose: Generate summary emails for bookkeeping team
  - Required by button: `button-generate-bookkeeper-email`

### Account Management
- **Account Review API**
  - Endpoint: `GET /api/tenants/{id}/account-review`
  - Purpose: Open detailed account review interface
  - Required by button: `button-review-account-{id}`

### Plan Modification
- **Payment Plan Terms Modification API**
  - Endpoint: `PUT /api/payment-plans/{id}/modify-terms`
  - Purpose: Modify payment plan terms and conditions
  - Required by button: `button-modify-terms-{id}`

### Individual Processing
- **Single Tenant Processing API**
  - Endpoint: `POST /api/tenants/{id}/start-collection`
  - Purpose: Start collection process for individual tenant
  - Required by button: `button-start-{id}`

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Core Infrastructure (Week 1)
- [ ] Phone integration system setup
- [ ] Modal component system for conversations and profiles
- [ ] Settings persistence layer

### Phase 2: Bulk Operations (Week 2)
- [ ] Bulk processing APIs
- [ ] Filtering and sorting endpoints
- [ ] Enhanced data queries

### Phase 3: Advanced Features (Week 3)
- [ ] Response modification systems
- [ ] Escalation workflows
- [ ] Specialized business logic

### Phase 4: Polish & Integration (Week 4)
- [ ] Error handling and validation
- [ ] Performance optimization
- [ ] Full integration testing

---

## 🔧 TECHNICAL NOTES

### Database Schema Updates Needed:
- Settings table for user preferences
- Phone call logs table
- Escalation assignment tracking
- AI response modification history

### Security Considerations:
- Phone integration requires secure credential storage
- Legal consultation logs need audit trails
- Settings changes should be logged for compliance

### Performance Considerations:
- Bulk operations need proper queuing
- Large conversation histories need pagination
- Filtering should use database indexes

---

**Total APIs to Implement: 25+ endpoints**
**Total Interactive Elements Fixed: 60+ buttons and inputs**
**All elements have proper `data-testid` attributes for testing**

This comprehensive list provides clear, prioritized direction for backend development while maintaining the existing frontend functionality.