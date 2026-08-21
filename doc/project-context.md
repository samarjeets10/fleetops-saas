# FleetOps-SaaS — Master Project Context

This document serves as the primary master context document for the **FleetOps-SaaS** project. It outlines the strategic direction, architecture, engineering responsibilities, and roadmap. It should be kept up to date whenever a major project decision, requirement change, architectural modification, or milestone occurs.

---

## 1. Project Identity
* **Project Name:** FleetOps-SaaS
* **Project Type:** Multi-tenant B2B SaaS
* **Portfolio Position:** Full-Stack Project #1
* **Primary Goal:** Build a production-minded SaaS application demonstrating real full-stack engineering responsibilities rather than a shallow CRUD demo.
* **Current Stage:** Pre-development / Product Foundation

---

## 2. What Are We Building?
FleetOps-SaaS is a team operations and work-management SaaS platform designed to give small teams a centralized workspace for managing:
* Organizations & Multi-tenancy boundaries
* Members & Role-Based Access Control (RBAC)
* Projects & Hierarchical Workspaces
* Tasks (assignment, prioritization, tracking)
* Comments & Contextual File Attachments
* Real-time Activity History and Audit Logs

---

## 3. Real-World Problem
Small teams frequently manage work using fragmented, disconnected systems such as messaging apps, spreadsheets, local documents, personal task lists, and email threads. This leads to:
* Lack of team-wide visibility
* Unclear task ownership and missed deadlines
* Poor accountability and scattered project details
* Difficulty tracking historical changes (who changed what and when)

FleetOps-SaaS provides a single, unified workspace to resolve this operational friction.

---

## 4. Product Value
FleetOps-SaaS empowers teams to instantly answer critical operational questions:
* What projects are currently active?
* What tasks are pending, in progress, or completed?
* Who owns each assigned task and what is overdue?
* What changes occurred recently, and who made them?
* Who has access to the organization, and what permissions do they hold?

---

## 5. Primary Users

### Organization Owner
* **Role:** Ultimate authority over the organization account.
* **Needs:** Full organization management, member provisioning, role configurations, project oversight, and complete visibility into team activity.

### Manager / Admin
* **Role:** Oversees daily team operations and project execution.
* **Needs:** Project creation, task delegation/assignment, member tracking, and activity monitoring.

### Team Member
* **Role:** Individual contributor executing assigned deliverables.
* **Needs:** Access to assigned projects/tasks, ability to update task status, leave comments, upload attachments, and view project scopes.

---

## 6. Core Product Model
The structural resource hierarchy is strictly modeled as:
$$\text{Organization} \rightarrow \text{Members} \rightarrow \text{Projects} \rightarrow \text{Tasks} \rightarrow \text{Comments / Attachments}$$

> **Security Rule:** The organization serves as the primary multi-tenant boundary. Users must never be able to access resources outside their authorized organization.

---

## 7. MVP Scope
The MVP encompasses a complete production-grade foundation:

* **Authentication:** Registration, login, logout, secure access tokens, refresh token rotation, password hashing, and protected API routes.
* **Organizations:** Organization creation, secure membership mapping, member listing, invitation flows, and role management.
* **Authorization:** Role-based access control (RBAC), organization-scoped access checks, and resource-level validation.
* **Projects:** Full CRUD operations, project member associations, and lifecycle status tracking.
* **Tasks:** Full CRUD operations, assignment mapping, status workflows, priorities, due dates, filtering, search, and pagination.
* **Collaboration:** Threaded comments, file attachments, and historical activity tracking.
* **Frontend Shell:** Protected routing, intuitive dashboard, project/task interfaces, member management, settings, loading/empty/error states, form validation, and optimistic updates.
* **Production Engineering:** Strict payload validation, rate-limiting, centralized error handling, structured logging, request-ID tracing, health checks, API documentation, automated tests, Dockerization, and CI/CD deployment pipelines.

---

## 8. Explicitly Out of MVP
To maintain focus and avoid scope creep, the following components are intentionally postponed until the MVP is fully hardened:
* Subscription plans, billing, payment processing (Stripe/Webhooks), trials, and usage limits
* Redis and background job queues
* Real-time WebSockets
* Microservices architecture, Kubernetes, and event-driven streaming
* Advanced AI features and complex workflow automation

---

## 9. Technology Decisions

### Frontend Stack
* **React + JavaScript:** Leverages existing developer expertise to focus on full-stack architecture without the friction of learning TypeScript simultaneously.
* **Tailwind CSS:** Enables rapid, consistent, and responsive UI design.
* **Redux Toolkit:** Dedicated strictly to client/application state (UI preferences, active modals, sidebar toggles).
* **TanStack Query:** Dedicated to managing server state (caching, synchronization, background refetching).
* **React Hook Form & Zod:** Provides high-performance form state management and robust runtime data validation.

### Backend Stack
* **Node.js + Express:** Matches the developer's core JavaScript ecosystem and backend learning curve.
* **MongoDB + Mongoose:** Utilizes familiar NoSQL document structures to prioritize shipping core full-stack architecture first (PostgreSQL is reserved for future projects).
* **JWT + Refresh Tokens:** Implements secure, production-grade stateless access control combined with token rotation.

---

## 10. Engineering Responsibilities
The project proves end-to-end engineering competence across multiple domains:

* **Backend:** Secure auth, token rotation, RBAC, scoped queries, resource authorization, data validation, transactions, file upload safety, rate-limiting, audit logging, and automated testing.
* **Frontend:** Protected layouts, form handling, validation schemas, optimistic UI updates, responsive design, accessibility, search/filtering/pagination, and robust error/loading states.
* **DevOps:** Containerization via Docker, environment hardening, GitHub Actions CI/CD, health/readiness checks, request tracing, and deployment runbooks.
* **Security:** Password hashing, input sanitization, secure headers, CORS policies, secret management, and strict resource isolation.

---

## 11. Architectural Principles
* Keep the system simple; prefer a modular monolith for the MVP.
* Never add technologies merely for portfolio aesthetics—every tool must solve a concrete problem.
* Backend authorization is the absolute source of truth; never trust the client.
* Maintain strict separation between server state and client/UI state.
* Design for failure, validate at system boundaries, and document major architectural decisions.

---

## 12. AI-Assisted Development
AI tools (such as Claude and ChatGPT) serve as engineering assistants for architecture review, debugging, refactoring, documentation, and test generation. 
> **Rule:** The developer must fully understand data flows, security implications, and code logic before committing any AI-generated code.

---

## 13. Development Workflow
The implementation follows a strict engineering lifecycle:
$$\text{Problem} \rightarrow \text{Requirements} \rightarrow \text{User Flows} \rightarrow \text{Architecture} \rightarrow \text{DB Design} \rightarrow \text{API Design} \rightarrow \text{Backend} \rightarrow \text{Frontend} \rightarrow \text{Testing} \rightarrow \text{Hardening} \rightarrow \text{Docker/CI-CD} \rightarrow \text{Deployment}$$

---

## 14. SaaS Evolution (Post-MVP Roadmap)
* **V1:** Introduction of tiered subscription plans (Free, Pro, Business) and usage boundaries (members, storage, projects).
* **V2:** Payment gateway integration (Stripe checkouts, webhooks, lifecycle management, upgrade/downgrade logic).
* **Future Work:** Redis caching, background job queues, realtime collaboration notifications, and intelligent AI workflows (summaries and project planning).

---

## 15. Current Development Target
* **Target MVP Duration:** ~6–8 weeks
* **Target Daily Effort:** 4–5 focused hours/day (~150–200 total hours)
* **Objective:** Produce a deployment-ready, testable SaaS platform capable of real-world usage and future commercial extension.

---

## 16. Context Preservation Rule
The repository acts as the permanent source of truth for code, architecture, and documentation, while chat sessions handle reasoning, debugging, and planning. Major design choices must be committed to the `docs/` directory to preserve context across multiple sessions and AI models.

---

## 17. Current State
* **Phase:** Phase 0 — Product Foundation
* **Status:** Repository initialized, documentation framework established.
* **Next Steps:** Complete system architecture documentation and finalize the backend API specification before writing application code.