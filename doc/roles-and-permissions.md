# FleetOps-SaaS — Roles & Permissions

## 1. Core Roles
FleetOps-SaaS utilizes a static, three-role RBAC (Role-Based Access Control) model for the MVP. Roles are assigned at the organization membership level, not globally at the user level. A single user may belong to multiple organizations and hold a different role in each.

### Owner
* **Primary Intent:** Organization-level authority and control.
* **Capabilities:** The Owner is the creator of the organization. They have ultimate administrative control over membership, billing (post-MVP), settings, and all operational resources.
* **Restriction:** The Owner is the only role with organization-level destructive authority (e.g., deleting the organization).

### Admin
* **Primary Intent:** Day-to-day organization and project management.
* **Capabilities:** Admins support the Owner by scaffolding projects, managing tasks, assigning work, and inviting/removing standard Members.
* **Restriction:** Admins CANNOT delete the organization, transfer ownership, or modify the Owner's access.

### Member
* **Primary Intent:** Execution and collaboration.
* **Capabilities:** Standard team users focused on completing assigned work. They can view projects, create tasks, update statuses, and collaborate via comments and attachments.
* **Restriction:** Members CANNOT invite users, change roles, delete projects, or perform administrative operations.

---

## 2. Permission Matrix
*All permissions are evaluated strictly within the user's authorized organization.*

**Legend:**
* **Full** — Can perform the operation.
* **Limited** — Can perform the operation subject to stated resource/ownership rules.
* **Own** — Applies only to resources created by the authenticated user.
* **None** — Operation is strictly forbidden.

### 2.1 Organization Management
| Operation | Owner | Admin | Member |
| :--- | :--- | :--- | :--- |
| View organization details | Full | Full | Full |
| Read organization settings | Full | Limited | None |
| Edit organization settings | Full | Limited | None |
| Delete organization | Full | None | None |

### 2.2 Member Management
| Operation | Owner | Admin | Member |
| :--- | :--- | :--- | :--- |
| View members | Full | Full | Full |
| Invite members | Full | Full | None |
| Remove members | Full | Full | None |
| Change member roles | Full | Limited | None |
| Manage Owner role | None* | None | None |

> *\* Ownership transfer is intentionally excluded from the MVP.*

### 2.3 Projects
| Operation | Owner | Admin | Member |
| :--- | :--- | :--- | :--- |
| View project | Full | Full | Full |
| Create project | Full | Full | Limited |
| Edit project | Full | Full | Limited |
| Delete project | Full | Full | None |

> *Note: For MVP simplicity, Members may create/edit project work where the product UX exposes those operations to them, but they cannot delete the project itself.*

### 2.4 Tasks
| Operation | Owner | Admin | Member |
| :--- | :--- | :--- | :--- |
| View task | Full | Full | Full |
| Create task | Full | Full | Full |
| Edit task | Full | Full | Full |
| Assign task | Full | Full | Limited |
| Change status/priority/date | Full | Full | Full |
| Delete task | Full | Full | None |

### 2.5 Collaboration
| Operation | Owner | Admin | Member |
| :--- | :--- | :--- | :--- |
| View comments/attachments | Full | Full | Full |
| Create comment | Full | Full | Full |
| Delete own comment | Full | Full | Full |
| Delete others' comments | Full | Full | None |
| Add attachment | Full | Full | Full |
| Delete own attachment | Full | Full | Limited |
| Delete others' attachments| Full | Full | None |

---

## 3. Implicit vs. Explicit Permissions

### 3.1 Organization Membership Is the Primary Boundary
A user's organization membership acts as the absolute boundary. The backend MUST establish:
`Authenticated User -> Org Membership -> Org Role -> Resource Relationship -> Requested Action`

### 3.2 Task Assignment Is NOT an Access-Control Boundary
Task assignment represents **responsibility**, not **authorization**. 
* For the MVP, a Member can edit *any* task within a project they have access to, even if that task is not assigned to them. 
* *Why?* This avoids unnecessary per-task ACL (Access Control List) complexity. The assigned user represents work ownership, not a security wall.

### 3.3 Role Does Not Transfer Across Organizations
A role is meaningful ONLY within its specific organization. Being an `Owner` in Organization A grants zero privileges in Organization B. Every API request MUST resolve the user's role for the specific target organization.

---

## 4. Backend Enforcement Rules (Zero-Trust)

FleetOps-SaaS follows a strict Zero-Trust authorization model.

### 4.1 Frontend Is NOT a Security Boundary
Frontend behavior (hiding a 'Delete' button, disabling a form, or React Router guards) is strictly a UX mechanism. **It provides zero security.** A malicious client can bypass the UI and directly call the API. The backend remains the final authority.

### 4.2 Tenant Isolation (Database Level)
All organization-scoped database operations MUST include the appropriate tenant boundary. 
Client-provided organization identifiers in request bodies must be treated as untrusted. For resource access, the backend SHOULD resolve resources using BOTH the resource identifier and the authorized tenant context:

```javascript
// Correct Implementation Pattern
const task = await Task.findOne({
    _id: requestedTaskId,
    organizationId: verifiedUserOrganizationId 
});
```

This prevents a valid resource ID from becoming a cross-tenant data leakage vector (Insecure Direct Object Reference / IDOR).

## 4.3 Resource Relationship Validation

Nested resources MUST be validated against their parent relationships. When creating a task, the backend MUST verify:

1. The Project belongs to the Organization.
2. The Assignee belongs to the Organization.
3. The Authenticated User belongs to the Organization.

## 4.4 Deny by Default

If the backend cannot explicitly establish that a user is authorized to perform an operation, the operation MUST be rejected with a 403 Forbidden or 404 Not Found (to obscure resource existence). Missing identity, membership, or role must result in immediate denial.