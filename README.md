# FleetOps-SaaS

A production-minded multi-tenant SaaS platform built for small teams to seamlessly manage projects, tasks, collaboration, and team activity from a single, unified workspace.

---

## Portfolio Project #1 — Full-Stack SaaS Foundation

### Overview
FleetOps-SaaS is engineered as a real-world, production-ready SaaS product rather than a superficial, feature-heavy demo project. The primary objective is to deliver a complete, highly secure, maintainable, and deployable full-stack application that explicitly showcases the high-level engineering standards and responsibilities expected of a modern full-stack developer.

The initial milestone centers entirely around a robust MVP incorporating:
* Secure authentication & refresh token rotation
* Multi-tenant organization scoping
* Role-Based Access Control (RBAC)
* Granular team and member management
* Project workspaces and hierarchical task tracking
* Discussion comments & historical team audit trails
* Contextual file attachments
* Advanced search, filtering, and pagination
* Production-oriented API design & robust validation (Zod)
* Comprehensive testing suites & automated CI/CD pipelines
* Containerization (Docker), structured logging, health checks, and cloud deployment

> **Note:** Advanced features such as tiered subscription plans, automated payment gateways, background worker queues, real-time collaboration web sockets, and intelligent AI workflows will be integrated strictly after the core MVP achieves absolute stability.

---

## Product Goal

Small teams frequently struggle with fragmented workflows scattered across spreadsheets, chat apps, unorganized documents, and disconnected utilities. FleetOps-SaaS resolves this friction by offering a centralized workspace where teams can:

* Provision and manage independent organizations.
* Invite, onboard, and manage team members securely.
* Group initiatives into distinct projects.
* Create, delegate, and track task lifecycles.
* Discuss project updates directly within tasks.
* Audit real-time team and system activity.
* Enforce strict security boundaries based on user roles and organization boundaries.

The ultimate vision is a resilient product capable of servicing real-world team operational demands.

---

## Core Engineering Philosophy

> **Projects should prove engineering responsibilities, not just features.**

Core architectural pillars:
* **Correctness & Data Integrity:** Ensuring transactional safety and reliable state synchronization.
* **Security & Defense-in-Depth:** Implementing proper sanitization, authorization layers, rate limiting, and token management.
* **Maintainability & Architecture:** Sticking to clean, modular separations of concerns across client and server layers.
* **Observability & Testing:** Prioritizing structured server logging, request tracing, and automated test coverage.
* **Pragmatic Technology Choices:** Avoiding bloatware stacks; every integrated technology must solve a specific architectural or developer-experience challenge.

---

## Technology Stack

### Frontend Architecture
* **React:** Core component library for reactive user interfaces.
* **JavaScript:** Primary language implementation.
* **Tailwind CSS:** Utility-first styling framework for rapid, accessible, and responsive UI design.
* **Redux Toolkit:** Predictable state container strictly allocated for client-side UI states, modals, and preferences.
* **TanStack Query:** Powerful data-fetching and caching layer dedicated to managing all server-state.
* **React Hook Form & Zod:** Type-safe form handling combined with strict runtime validation schemas.

### Backend Architecture
* **Node.js & Express.js:** Fast, scalable, non-blocking asynchronous server runtime and web framework.
* **MongoDB & Mongoose:** Flexible NoSQL document database configured with robust schema validations.
* **JWT & Refresh Tokens:** Stateless access control paired with secure token rotation mechanisms.
* **Zod:** Enterprise-grade environment and request payload validation.

### Development & DevOps Tooling
* **Git & GitHub:** Version control and remote repository management.
* **Docker:** Multi-stage containerization ensuring identical parity between development and production environments.
* **GitHub Actions:** Automated continuous integration and continuous deployment (CI/CD) pipelines.

---

## State Management Philosophy

### TanStack Query (Server State)
Exclusively dedicated to caching, synchronization, and background updates for remote resources:
* Projects, tasks, and sub-items
* Organization member lists
* Comment threads and activity streams
* Authenticated user profile data

### Redux Toolkit (Client & UI State)
Dedicated strictly to local application states that do not originate directly from backend database persistence:
* Client-side session and auth states where appropriate
* Active organization selector state
* UI states (Sidebar collapse state, active modals, toast notifications, application preferences)

> Strict separation is enforced to avoid data duplication or sync anomalies between client cache and server state.

---

## Development With AI

Artificial intelligence utilities (such as Claude and ChatGPT) serve strictly as assistive engineering multipliers rather than cognitive replacements.

**Approved AI Integrations:**
* High-level system architecture discussions and validation
* Code reviews and syntax optimization suggestions
* Targeted debugging and performance refactoring
* Security vulnerability analysis and auditing
* Boilerplate test generation and documentation structuring
* Technical research and UI design exploration

> **Rule:** All AI-generated code must be fully comprehended, rigorously code-reviewed, and tested locally before integration into the master codebase.

---

## Project Documentation

The `docs/` repository directory acts as the absolute source of truth. Architectural decisions, roadmap milestones, and technical trade-offs are explicitly written down to preserve context across multiple sessions.

Referenced documentation modules:
* `docs/00-project-context.md`
* `docs/13-decisions.md`
* `docs/14-roadmap.md`
* `docs/15-progress.md`
* `docs/16-changelog.md`

---

## Project Roadmap

* **Phase 1 — Product Foundation:** Core specifications, domain modeling, user stories, security boundaries, database relational mapping, and REST API contracts.
* **Phase 2 — Backend Foundation:** Environment provisioning, database connection pooling, user authentication workflows, RBAC middleware, organization scoping, and core CRUD endpoints.
* **Phase 3 — Frontend Application:** Routing setup, layout shells, authentication forms, organization switcher dashboard, and dynamic project/task modules.
* **Phase 4 — Collaboration Layer:** Invitation token dispatching, nested comment threads, file upload integrations, audit history tracking, and optimistic UI mutations.
* **Phase 5 — Production Hardening:** Input sanitization, global rate-limiting, request-ID tracing, structured Winston/Pino logging, health check endpoints, and integration tests.
* **Phase 6 — Deployment & Infrastructure:** Dockerfile optimization, multi-container compose orchestration, GitHub Actions CI/CD workflows, environment variable hardening, and cloud host deployment.
* **Phase 7 — SaaS Evolution (Post-MVP):** Integration of stripe subscriptions, usage volume limits, webhooks, feature flagging, trial life-cycles, and advanced billing logic.

---

## Current Status

* **Stage:** Project setup, architectural design, and specification documentation.
* **MVP Status:** Not started (Planning & Blueprinting phase).
* **Current Objective:** Finalize end-to-end product design, database schematics, and engineering parameters before executing initial codebase scaffolding.

---

## Documentation Index

| Document | Purpose & Scope |
| :--- | :--- |
| `00-project-context.md` | Master project context and core directives |
| `01-product-vision.md` | Strategic product vision and long-term targets |
| `02-problem-and-users.md` | Target user personas, pain points, and use-case scenarios |
| `03-mvp-requirements.md` | Detailed functional checklist for the initial MVP release |
| `04-user-flows.md` | Step-by-step user journey maps across the application |
| `05-roles-and-permissions.md` | Comprehensive authorization matrices and RBAC models |
| `06-system-architecture.md` | High-level system design and component topology |
| `07-database-design.md` | MongoDB schema design, relationships, and indexing strategy |
| `08-api-design.md` | RESTful architectural guidelines, endpoints, and response formats |
| `09-security.md` | Threat modeling, data protection, and security compliance rules |
| `10-testing-strategy.md` | Unit, integration, and end-to-end testing approaches |
| `11-devops.md` | Containerization protocols, CI/CD setup, and deployment guides |
| `12-ai-development.md` | Structured guidelines for leveraging AI assistance safely |
| `13-decisions.md` | Architectural Decision Records (ADRs) tracking major choices |
| `14-roadmap.md` | Chronological milestone schedule and timeline breakdown |
| `15-progress.md` | Live tracking board of implementation tasks and statuses |
| `16-changelog.md` | Historical ledger of modifications, updates, and releases |

---

## Long-Term Vision

FleetOps-SaaS is designed to transition smoothly from an elite developer portfolio piece into a commercially viable operational tool.

**Evolution Pathway:**
MVP $\rightarrow$ Production SaaS $\rightarrow$ Monetization $\rightarrow$ Real Users $\rightarrow$ Advanced Workflows $\rightarrow$ AI-Assisted Team Operations

> The core MVP foundation must be completed and hardened first.

---

## License

Copyright © FleetOps-SaaS. Proprietary license terms to be determined prior to public code release.