# FleetOps-SaaS — MVP Requirements

## 1. Functional Requirements

The FleetOps-SaaS MVP establishes the minimum production-capable foundation for a multi-tenant team operations platform. Features not explicitly defined below are not part of the MVP.

### 1.1 Identity & Authentication
The system MUST provide secure user authentication and session management.
* **Registration & Login:** Users MUST be able to register and authenticate using an email and password.
* **Tokens:** Authentication MUST use short-lived JWT access tokens and secure, HTTP-only refresh tokens for session renewal. Access tokens MUST NOT be used as long-lived session credentials.
* **Statelessness:** The backend MUST remain stateless with respect to access-token authentication.
* **Security:** Passwords MUST never be stored in plaintext (must use secure hashing like Argon2 or bcrypt). Token validation MUST occur on the backend for every protected request.

### 1.2 Multi-Tenancy & Organizations
FleetOps MUST be organization-centric. Organization boundaries are a fundamental security boundary and MUST be enforced by the backend.
* **Creation:** An authenticated user MUST be able to create an organization and automatically become the initial Owner.
* **Membership & Invitations:** Organization Owners/Admins MUST be able to invite users. A user MUST explicitly accept an invitation. A user MAY belong to multiple organizations, but membership in one MUST NOT grant access to another.
* **Strict Tenant Isolation:** Every organization-scoped resource MUST be associated with an `organizationId`. Backend authorization MUST verify organization membership before accessing resources. Cross-tenant access MUST be rejected consistently. The frontend MUST be treated as an untrusted client.

### 1.3 Role-Based Access Control (RBAC)
The MVP uses a static organization-level RBAC model. Permissions MUST be enforced on the backend.
* **Owner:** Has absolute organization-level control (member management, settings, full resource access). The Owner role MUST NOT be removable without explicit ownership transfer.
* **Admin:** Supports operations. MAY manage projects, tasks, and invite/remove Members. MUST NOT automatically receive Owner-only privileges.
* **Member:** Regular team users. MAY view authorized projects, create/update assigned tasks, and participate in collaboration features. MUST NOT perform organization-management operations.

### 1.4 Projects
Authorized organization users MUST be able to manage projects.
* **Properties:** Belong to exactly one organization, have a unique identifier, name, description, status, and track timestamps.
* **Operations:** Create, Read, Update, and Delete (CRUD) where permitted by RBAC.
* **Isolation:** A project from Organization A MUST never be accessible through Organization B.

### 1.5 Tasks
Tasks are the primary unit of executable work within FleetOps.
* **Properties:** Belong to one organization and one project. Support a title, description, assigned user, status, priority, due date, and timestamps.
* **Status Model:** `TODO`, `IN_PROGRESS`, `COMPLETED`.
* **Priority Model:** `LOW`, `MEDIUM`, `HIGH`.
* **Operations:** CRUD operations, assignment to valid organization members, and updates to status/priority/due date. 

### 1.6 Collaboration
The MVP MUST provide lightweight collaboration directly around work items.
* **Threaded Comments:** Users MUST be able to add, view, and reply to comments on tasks. Comments MUST remain organization-scoped.
* **File Attachments:** Support simple file attachments with strict backend validation for file-size and file-type.
* **Activity Audit Trail:** The system MUST maintain a simple activity log capturing Actor, Organization, Action, Resource, and Timestamp (e.g., "User A moved Task B to Done").

---

## 2. Non-Functional Requirements (Production Engineering)

The MVP MUST be engineered as a production-minded application. Architectural shortcuts that compromise security, tenant isolation, or maintainability are prohibited.

### 2.1 Frontend
* **Stack:** React (JavaScript) and Tailwind CSS.
* **State Management:** 
  * **TanStack Query:** Exclusively for server state (API data, caching, loading states, mutations, synchronization).
  * **Redux Toolkit:** Exclusively for client/UI state (sidebar, modals). 
  * *Rule:* Server-owned data MUST NOT be duplicated unnecessarily into Redux.
* **Forms & Validation:** User-facing forms MUST use React Hook Form. Complex schemas MUST be validated client-side with Zod (Note: Client validation MUST NOT replace backend validation).

### 2.2 Backend
* **Stack:** Node.js, Express, MongoDB, Mongoose.
* **Architecture:** Modular monolith separating Routes, Controllers, Services, Models, and Middleware. Business logic MUST NOT be unnecessarily embedded directly inside route handlers.
* **Validation:** Mongoose schemas MUST define database-level validation. API inputs MUST be validated at the boundary using Zod before business operations execute.
* **Error Handling:** Centralized Express error-handling middleware. Consistent API responses, appropriate HTTP status codes, and NO leakage of sensitive internal details (stack traces) in production.

### 2.3 Security & Infrastructure
* **Rate Limiting:** Protect public and sensitive API endpoints (especially authentication routes) from abuse.
* **Security Headers:** Use Helmet or equivalent middleware for HTTP header hardening. Configure strict CORS policies.
* **Logging:** Implement structured logging for auth failures, API errors, and critical state changes. Logs MUST NOT expose plain-text passwords or active tokens.
* **Docker & CI/CD:** Support containerized deployment via multi-stage Dockerfiles. Use GitHub Actions for automated linting and testing.

---

## 3. Explicitly Out of Scope
To protect the core product scope, the following capabilities are deliberately excluded from the MVP:
* **Payments & Subscriptions:** Stripe integration, tiered plans, invoicing, usage limits.
* **Real-Time Communication:** WebSockets, Socket.IO, live typing indicators, real-time chat. (Updates will rely on TanStack Query polling/refetching).
* **Redis & Background Processing:** Redis caching, BullMQ, background workers, scheduled jobs.
* **AI Integrations:** LLMs, automated workflow summaries, AI task generation.
* **Advanced Notifications:** General email digests, task assignment emails, or deadline reminders (email is reserved solely for organization invitations).

---

## 4. MVP Scope Boundary
The FleetOps-SaaS MVP is considered complete ONLY when the following core loop works reliably:

**Authenticate $\rightarrow$ Create/Join Organization $\rightarrow$ Manage Members $\rightarrow$ Create Project $\rightarrow$ Create & Assign Tasks $\rightarrow$ Track Status/Priority/Due Dates $\rightarrow$ Collaborate (Comments/Attachments) $\rightarrow$ Review Activity**

Every step in this loop MUST respect backend authorization and strict tenant isolation.