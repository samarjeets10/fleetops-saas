### The project is a Monorepo containing:
- `client/`: React (JavaScript) + Vite + Tailwind CSS + TanStack Query + Redux Toolkit.
- `server/`: Node.js + Express + MongoDB/Mongoose (Modular Monolith architecture with strict separation: routes -> controllers -> services -> models -> validation).
- `docs/`: All specification markdown files.
- `.github/`: Copilot instructions and CI/CD workflows.

### Structure the document with:
1. **Root Directory Layout:** Overview of `.github/`, `docs/`, `client/`, `server/`, Docker, and root configuration.
2. **Client Folder Structure (`client/src/`):**
   - Feature-based / modular layout (`features/` for auth, orgs, projects, tasks, collaboration).
   - Component organization (`components/ui/`, `layouts/`).
   - Server state vs Client state separation (`store/` for Redux UI state, hooks/services for TanStack Query).
   - API client with Axios interceptors (JWT refresh token rotation).
3. **Backend Folder Structure (`server/src/`):**
   - Modular Monolith domain folders under `modules/` (auth, organizations, projects, tasks, collaboration, activity).
   - Each module containing: `*.routes.js`, `*.controller.js`, `*.service.js`, `*.validation.js`, `*.model.js`.
   - Core layers: `config/`, `middlewares/` (auth, tenantResolver, rbac, errorHandler, validator), `utils/` (AppError, ApiResponse, asyncHandler, logger).
   - Entry points: `app.js` (Express configuration) and `server.js` (DB connection and HTTP server bootstrap).
4. **File Naming & Architectural Conventions:** Strict rules on naming, file placement, and boundaries.


```text
fleetops-saas/
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── 00-project-context.md
│   ├── 01-product-vision.md
│   ├── 02-problem-and-users.md
│   ├── 03-mvp-requirements.md
│   ├── 04-user-flows.md
│   ├── 05-roles-and-permissions.md
│   ├── 06-system-architecture.md
│   ├── 06-folder-structure.md          <-- NEW FILE
│   ├── 07-database-design.md
│   └── 15-progress.md
│
├── client/                              <-- FRONTEND (React + Vite + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/                 <-- Reusable base UI (Buttons, Modals, Inputs)
│   │   ├── features/                   <-- Feature modules
│   │   │   ├── auth/                   <-- Auth components, hooks, api calls
│   │   │   ├── organizations/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   └── activity/
│   │   ├── hooks/                      <-- Shared custom hooks
│   │   ├── layouts/                    <-- AppLayout, AuthLayout, DashboardLayout
│   │   ├── pages/                      <-- Top-level route pages
│   │   ├── routes/                     <-- React Router config & ProtectedRoute
│   │   ├── services/                   <-- Axios instance with JWT interceptors
│   │   ├── store/                      <-- Redux Toolkit (UI state only: modals, sidebar)
│   │   ├── utils/                      <-- Formatters, constants, helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                              <-- BACKEND (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/                     <-- db.js, env.js (Zod validation), logger.js
│   │   ├── constants/                  <-- roles.js, statusCodes.js, events.js
│   │   ├── middlewares/                <-- auth.middleware.js, tenant.middleware.js,
│   │   │                                   rbac.middleware.js, error.middleware.js,
│   │   │                                   validate.middleware.js, rateLimiter.js
│   │   ├── modules/                    <-- Modular Monolith Domain Modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.validation.js
│   │   │   ├── organizations/
│   │   │   │   ├── organization.routes.js
│   │   │   │   ├── organization.controller.js
│   │   │   │   ├── organization.service.js
│   │   │   │   ├── organization.model.js
│   │   │   │   ├── membership.model.js
│   │   │   │   ├── invitation.model.js
│   │   │   │   └── organization.validation.js
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── comments/
│   │   │   ├── attachments/
│   │   │   └── activity/
│   │   ├── utils/                      <-- ApiError.js, ApiResponse.js, asyncHandler.js
│   │   ├── app.js                      <-- Express app & middleware pipeline configuration
│   │   └── server.js                   <-- DB connection & HTTP server bootstrap
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── .gitignore
├── docker-compose.yml
└── README.md
```