# FleetOps-SaaS — System Architecture

## 1. High-Level Topology

FleetOps-SaaS is implemented as a strict Modular Monolith for the MVP.

The system has three primary runtime boundaries:

```text
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│                                                             │
│                    React SPA + Tailwind                     │
│              TanStack Query + Redux Toolkit                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                         HTTPS / REST
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Application Layer                     │
│                                                             │
│                  Node.js + Express REST API                 │
│                                                             │
│  Auth → Tenant → Validation → Authorization → Controllers   │
│                              │                              │
│                           Services                          │
│                              │                              │
│                           Models                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                         Mongoose ODM
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         Data Layer                          │
│                                                             │
│                       MongoDB Atlas                         │
└─────────────────────────────────────────────────────────────┘

```
## Architectural Principles

The MVP MUST follow these principles:

* The React client is an untrusted client.
* All persistent application state is owned by the backend.
* REST APIs are the primary communication boundary between frontend and backend.
* Authentication and authorization are enforced server-side.
* Organization membership is the fundamental tenant boundary.
* Business logic belongs in services, not route handlers or controllers.
* Database queries involving tenant-scoped resources MUST enforce organizationId.
* The application remains a single deployable backend while maintaining clear internal modules.
* Infrastructure complexity MUST NOT be introduced without a concrete product requirement.
* The MVP does not require a microservices architecture.

## 2. Frontend Architecture

The frontend is a React single-page application responsible for presentation, user interaction, local UI state, and communication with the REST API.

It MUST NOT become the source of truth for authorization or persistent business state.

### 2.1 Frontend Responsibilities
---

The React application is responsible for:

* Rendering application views.
* Handling navigation.
* Collecting and validating user input.
* Managing UI state.
* Requesting server data.
* Displaying loading, success, and error states.
* Sending mutations to the backend.
* Providing a usable representation of backend authorization outcomes.

The frontend MUST NOT:

* Enforce tenant isolation as a security mechanism.
* Assume that hidden UI controls provide authorization.
* Treat Redux state as authoritative user permissions.
* Directly access MongoDB.
* Contain duplicated business rules that belong on the backend.

### 2.2 Server State — TanStack Query
---

TanStack Query is the authoritative client-side mechanism for server state.

Server state includes data that originates from or is persisted by the backend, such as:

* Current user information.
* Organization membership.
* Projects.
* Tasks.
* Comments.
* Attachments metadata.
* Activity records.
* Invitation-related state.

TanStack Query SHOULD handle:

* Fetching.
* Caching.
* Request lifecycle state.
* Mutations.
* Query invalidation.
* Refetching.
* Synchronization of server-owned data.

Conceptually:

```text

React Component
      │
      ▼
TanStack Query
      │
      ▼
REST API
      │
      ▼
Express Backend
      │
      ▼
MongoDB

```


Server data MUST NOT be unnecessarily copied into Redux merely to make it accessible to components.

### 2.3 Client/UI State — Redux Toolkit
---

Redux Toolkit is reserved for client-owned application/UI state.

Appropriate examples include:

* Sidebar state.
* Modal visibility.
* UI preferences.
* Temporary client workflow state.
* Active UI selections where the state is not itself server data.
* Cross-component UI state that benefits from centralized management.

Redux Toolkit MUST NOT become a second server-state cache.

The architectural boundary is:

```text
+-------------------------------+--------------------+
| State Type                    | Primary Tool       |
+-------------------------------+--------------------+
| Projects from API             | TanStack Query     |
+-------------------------------+--------------------+
| Tasks from API                | TanStack Query     |
+-------------------------------+--------------------+
| Activity feed                 | TanStack Query     |
+-------------------------------+--------------------+
| Current UI modal              | Redux Toolkit      |
+-------------------------------+--------------------+
| Sidebar state                 | Redux Toolkit      |
+-------------------------------+--------------------+
| Temporary UI preferences      | Redux Toolkit      |
+-------------------------------+--------------------+
| Server mutation lifecycle     | TanStack Query     |
+-------------------------------+--------------------+
```

This separation MUST remain consistent as the application grows.

### 2.4 Component Composition
---

The frontend SHOULD follow a layered component structure rather than placing application logic inside large page components.

Conceptually:

```text

App
├── Router
├── Layouts
│   ├── Public Layout
│   └── Application Layout
├── Pages
│   ├── Authentication
│   ├── Organization
│   ├── Projects
│   ├── Tasks
│   └── Activity
└── Shared Components
    ├── Forms
    ├── Modals
    ├── Tables
    ├── Cards
    ├── Feedback
    └── Navigation

```

Components SHOULD have focused responsibilities.  
Pages compose application-level UI.  
Reusable components handle presentation and interaction.  
Query/mutation logic SHOULD remain close to the relevant feature while maintaining a clear separation from purely presentational components.

### 2.5 Routing
---

The application MUST use client-side routing for navigation within the SPA.  
Routes SHOULD be organized around application domains rather than individual components.

Conceptually:

```text

/
├── /login
├── /register
├── /invite/:token
└── /app
├── /dashboard
├── /projects
├── /projects/:projectId
├── /tasks/:taskId
├── /members
└── /activity

```


Frontend route protection exists primarily to improve user experience.  
A protected frontend route MUST NOT be considered an authorization mechanism.  
The backend MUST independently authorize every API request.

### 2.6 Forms & Boundary Validation
---

Forms SHOULD use:

- React Hook Form for form state and submission handling.
- Zod for client-side schema validation.

The intended flow is:

```text

User Input
    ↓
React Hook Form
    ↓
Zod Validation
    ↓
API Request
    ↓
Backend Validation
    ↓
Business Logic

```


Client-side validation improves usability and provides immediate feedback.  
It MUST NOT replace backend validation.  
All API boundaries MUST assume that client-provided data can be malformed or malicious.

## 3. Backend Architecture — Layered Design

The backend is a Node.js + Express Modular Monolith.  
The application remains one deployable backend process, but its internal code MUST be organized into well-defined modules and layers.

### 3.1 Architectural Layers
---

The primary request flow is:

```text

HTTP Request
│
▼
Routes
│
▼
Middleware Pipeline
│
▼
Controllers
│
▼
Services
│
▼
Models
│
▼
MongoDB

```


Each layer has a defined responsibility.

### 3.2 Routes
---

Routes define the HTTP interface exposed by the application.

**Responsibilities:**

- Define HTTP methods and paths.
- Connect endpoints to middleware.
- Connect endpoints to controllers.
- Remain thin.

Routes MUST NOT contain business logic.

Conceptually:

```text
POST /projects
↓
authenticate
↓
resolveTenant
↓
validateRequest
↓
authorize
↓
projectController.create
```


### 3.3 Controllers
---

Controllers translate HTTP requests into application operations and translate service results into HTTP responses.

**Responsibilities include:**

- Reading request parameters/body/context.
- Passing validated input to services.
- Calling the appropriate service operation.
- Returning the appropriate response.
- Delegating errors to centralized error handling.

Controllers MUST remain thin.

**Critical Rule:**  
Business logic MUST live in the Service layer, not in Controllers.

Controllers MUST NOT contain substantial:

- Authorization algorithms.
- Database queries.
- Business rules.
- Multi-step domain workflows.
- Resource relationship validation logic.

A controller should coordinate the HTTP boundary rather than implement the domain itself.

### 3.4 Services
---

Services contain the application's business logic.  
They are responsible for:

- Business rules.
- Authorization decisions requiring domain context.
- Organization/resource relationship validation.
- Coordinating multiple model operations.
- Creating and updating domain resources.
- Recording relevant activity.
- Enforcing domain invariants.

**Examples:**

- authService
- organizationService
- membershipService
- projectService
- taskService
- commentService
- attachmentService
- activityService

A service MUST NOT blindly trust values supplied by the controller.  
It MUST operate using authenticated and validated application context.

### 3.5 Models
---

Models define persistence structures through Mongoose.

**Responsibilities include:**

- Schema definitions.
- Field constraints.
- Data types.
- Indexes.
- Model-level validation.
- Persistence interaction.

Models MUST NOT become the primary location for application workflows.  
Complex operations spanning multiple resources belong in services.

## 3.4 Services Services contain the application's business logic. They are responsible for:
---

Business rules. Authorization decisions requiring domain context. Organization/resource relationship validation. Coordinating multiple model operations. Creating and updating domain resources. Recording relevant activity. Enforcing domain invariants. Examples:

authService organizationService membershipService projectService taskService commentService attachmentService activityService A service **MUST** **NOT** blindly trust values supplied by the controller. It **MUST** operate using authenticated and validated application context.

## 3.5 Models Models define persistence structures through Mongoose. Responsibilities include:
---

Schema definitions. Field constraints. Data types. Indexes. Model-level validation. Persistence interaction. Models **MUST** **NOT** become the primary location for application workflows. Complex operations spanning multiple resources belong in services.

## 4. Backend Middleware Pipeline

The middleware pipeline establishes the security and validation boundary before business logic executes. A protected request SHOULD conceptually pass through:

```text
Incoming Request
       │
       ▼
Security / HTTP Middleware
       │
       ▼
Authentication
       │
       ▼
Tenant Resolution
       │
       ▼
Request Validation
       │
       ▼
Authorization
       │
       ▼
Controller
       │
       ▼
Service
       │
       ▼
Model
       │
       ▼
Database
       │
       ▼
Centralized Error Handler
```

The exact Express middleware ordering may vary by endpoint, but the resulting security guarantees MUST remain intact.

### 4.1 Authentication Middleware
---

Authentication middleware establishes the identity of the requester. It MUST:

*   Extract the access token from the defined authentication mechanism.
*   Validate the JWT.
*   Verify relevant claims.
*   Establish authenticated user context.
*   Reject invalid or missing credentials for protected routes.

Authentication establishes "Who is making the request?". It does **not** establish whether that user is allowed to access the requested resource.

### 4.2 Tenant Resolution
---

Tenant resolution establishes the organization context for an organization-scoped request. It MUST:

*   Determine the target organization.
*   Verify that the authenticated user has membership in that organization.
*   Resolve the user's membership and role.
*   Attach trusted tenant context to the request/application context.

Client-provided `organizationId` values MUST NOT automatically be trusted. Where possible, tenant context SHOULD be derived from authenticated membership and validated resource relationships.

### 4.3 Authorization
---

- Authorization determines whether the authenticated user can perform the requested operation. It MUST consider:

- **User Identity + Organization Membership + Organization Role + Resource Relationship + Requested Action**

- The authorization layer MUST implement the rules defined in `docs/05-roles-and-permissions.md`.

### 4.4 Request Validation
---

Request validation MUST occur before business operations execute. Validation SHOULD cover:

*   Request body.
*   Route parameters.
*   Query parameters.
*   File metadata where applicable.

Invalid input MUST be rejected with a consistent client-safe error response. Mongoose validation remains an additional persistence-level safeguard.

### 4.5 Centralized Error Handling
---

Errors MUST be handled through a centralized Express error-handling mechanism. The error layer MUST:

*   Normalize application errors.
*   Return appropriate HTTP status codes.
*   Prevent sensitive internal details from leaking.
*   Log unexpected server-side failures.
*   Provide consistent API error structures.

Business logic MUST NOT independently implement inconsistent error-response formats across controllers.

---

## 5. Data Layer

MongoDB Atlas is the persistent database for the MVP. Mongoose acts as the application's ODM and provides the schema/model boundary.

### 5.1 Mongoose Schemas
---

Every domain entity MUST have an explicit Mongoose schema. Schemas SHOULD define:

*   Field types.
*   Required fields.
*   Allowed values/enums.
*   Defaults.
*   References where appropriate.
*   Timestamps.
*   Indexes.
*   Validation constraints.

The database model MUST reflect the application's domain rather than accepting arbitrary document structures.

### 5.2 Core Domain Relationships
---

The primary relationships are:

```text
User
  │
  ├── OrganizationMembership ──► Organization
  │
  └── OrganizationMembership ──► Organization
                                  │
                                  ├── Projects
                                  │      │
                                  │      └── Tasks
                                  │             ├── Comments
                                  │             ├── Attachments
                                  │             └── Activity
                                  │
                                  └── Members
```

* A user may belong to multiple organizations.

* Membership determines the user's role within each organization.

* Projects, tasks, comments, attachments, and activity records MUST remain associated with their organization.

## 6. Tenant Isolation at the Data Layer
Tenant isolation is enforced at multiple layers, with the database query boundary being critical.

### 6.1 organizationId
---
Every organization-scoped resource MUST contain an organizationId or an equivalent unambiguous tenant relationship. For example:

```text
Project
├── _id
├── organizationId
├── name
└── description
```

and:

```text
Task
├── _id
├── organizationId
├── projectId
├── assignedTo
├── status
└── priority
```

This allows tenant boundaries to be enforced directly when querying resources.

### 6.2 Query-Level Tenant Enforcement
---
A resource query MUST NOT rely solely on its _id.

Unsafe conceptual query:

```js
Project.findById(projectId)
```

**Preferred tenant-scoped pattern:**


```js
Project.findOne({
    _id: projectId,
    organizationId: authorizedOrganizationId
})
```

The same principle applies to:

* Projects.

* Tasks.

* Comments.

* Attachments.

* Activity records.

* Other organization-owned resources.

For nested resources, the backend MUST also verify the relationship between the child and its parent.

### 6.3 Tenant Context Must Be Trusted Internally
---
Once the backend has authenticated the user and resolved their authorized organization context, downstream services SHOULD use that trusted context rather than repeatedly accepting raw organization IDs from request bodies. Conceptually:

```text
Request
  ↓
Authentication
  ↓
Membership Resolution
  ↓
Trusted organizationId
  ↓
Service
  ↓
Tenant-scoped query
```

This reduces the possibility of accidental cross-tenant access.

### 6.4 Database Indexing
Indexes SHOULD be designed around common tenant-scoped access patterns. Examples may include compound indexes involving:

* organizationId + projectId

* organizationId + status

* organizationId + createdAt

* organizationId + assignedTo

Exact indexes MUST be derived from actual query patterns rather than created indiscriminately.

## 7. Infrastructure & Deployment — MVP
The MVP is designed for containerized deployment with automated validation and deployment workflows.

### 7.1 Docker
---
The application MUST support Docker-based builds. Where a build step is required, Docker images SHOULD use multi-stage builds:

```text
Stage 1 — Build
    ↓
Install dependencies
    ↓
Build application
    ↓
Stage 2 — Runtime
    ↓
Production dependencies/runtime only
```

* The final production image SHOULD exclude unnecessary development tooling and source artifacts.

* Secrets MUST NOT be baked into Docker images.

### 7.2 Environment Configuration
---
Environment-specific configuration MUST be supplied through environment variables or an equivalent secure runtime configuration mechanism. Examples include:

* NODE_ENV

* PORT

* MONGODB_URI

* JWT_ACCESS_SECRET

* JWT_REFRESH_SECRET

* JWT_ACCESS_EXPIRES_IN

* JWT_REFRESH_EXPIRES_IN

Actual secret values MUST NOT be committed to Git. A committed example configuration MAY document required variable names without containing real credentials. Production secrets MUST be managed by the deployment environment or secure secret-management mechanism.

### 7.3 Configuration Validation
---
The application SHOULD validate required environment variables during startup.

* A missing critical configuration value SHOULD cause a controlled startup failure rather than allowing the application to run in an invalid security or persistence state.

* Configuration access SHOULD be centralized rather than reading raw environment variables throughout arbitrary business logic.

## 8. GitHub Actions CI/CD
GitHub Actions will provide the MVP's automated CI/CD foundation. The pipeline SHOULD be divided into clear stages:

```text
Pull Request / Push
        │
        ▼
   Install Dependencies
        │
        ▼
      Lint
        │
        ▼
      Tests
        │
        ▼
     Build
        │
        ▼
  Docker Build
        │
        ▼
 Deployment
```

### 8.1 Continuous Integration
---
* Every relevant pull request SHOULD automatically validate:

* Dependency installation.

* Code quality/linting.

* Automated tests.

* Frontend build.

* Backend build/startup validation where applicable.

* Docker image build.

A pull request SHOULD NOT be considered ready to merge when required CI checks fail.

### 8.2 Continuous Deployment
---
* The deployment workflow SHOULD be separated from basic CI validation.

* A production deployment MUST only occur after the required validation stages have succeeded.

* The exact hosting provider is an infrastructure decision and does not change the application's architectural boundaries.

* CI/CD MUST NOT contain hardcoded production credentials.

* Secrets required by deployment workflows MUST be supplied through GitHub Actions secrets or the target deployment platform's secure configuration mechanism.

## 9. Architectural Boundaries

The following boundaries are mandatory for the MVP.

```text
+-------------------------------------------+--------------------------------------+
| Boundary                                  | Rule                                 |
+-------------------------------------------+--------------------------------------+
| React -> API                              | Communicate through REST APIs        |
+-------------------------------------------+--------------------------------------+
| React -> Database                         | Forbidden                            |
+-------------------------------------------+--------------------------------------+
| Redux -> Server State                     | Forbidden as the primary cache       |
+-------------------------------------------+--------------------------------------+
| TanStack Query -> UI State                | Not its responsibility               |
+-------------------------------------------+--------------------------------------+
| Routes -> Business Logic                  | Forbidden                            |
+-------------------------------------------+--------------------------------------+
| Controllers -> Complex Business Logic     | Forbidden                            |
+-------------------------------------------+--------------------------------------+
| Services -> Business Logic                | Required                             |
+-------------------------------------------+--------------------------------------+
| Models -> Cross-domain Workflows          | Avoid; use Services                  |
+-------------------------------------------+--------------------------------------+
| Client -> Authorization                   | UX only                              |
+-------------------------------------------+--------------------------------------+
| Backend -> Authorization                  | Mandatory                            |
+-------------------------------------------+--------------------------------------+
| Database Query -> Tenant Scope            | Mandatory for organization resources |
+-------------------------------------------+--------------------------------------+
| Secrets -> Git Repository                 | Forbidden                            |
+-------------------------------------------+--------------------------------------+
| Production Image -> Development Secrets   | Forbidden                            |
+-------------------------------------------+--------------------------------------+
```

## 10. Architectural Goa

The FleetOps-SaaS **MVP** intentionally uses a Modular Monolith, not because architectural boundaries are unimportant, but because the system should establish those boundaries before introducing distributed infrastructure. The target structure is:

```text

                            FleetOps SaaS
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        React SPA                         Express API
             │                                 │
     ┌───────┴────────┐              ┌─────────┴──────────┐
     │                │              │                    │
TanStack Query   Redux Toolkit   Middleware           Modules
     │                │              │                    │
 Server State      UI State      Auth/Tenant       Controllers
                                                │
                                                ▼
                                             Services
                                                │
                                                ▼
                                             Models
                                                │
                                                ▼
                                           MongoDB Atlas                

```

 The architecture must remain simple enough to operate as one application, but disciplined enough that individual modules can evolve independently. Future infrastructure such as Redis, background workers, WebSockets, or service decomposition **MUST** be introduced only when justified by a concrete product or operational requirement. For the **MVP**, the priority is a secure, maintainable, testable, and strictly tenant-isolated modular monolith.