# FleetOps-SaaS — User Flows

## 1. Organization Onboarding & Invites

* **Actor:** Organization Owner (A newly registered user who creates and becomes the initial Owner of an organization).
* **Trigger:** The user has successfully registered and wants to establish their organization's workspace and invite a team member.
* **Success Outcome:** The organization exists with the creator assigned as Owner, and the invited user has a valid organization-specific invitation delivered via email.

### Step-by-Step Sequence
1. The Owner opens the registration page.
2. The Owner submits valid registration credentials.
3. The frontend validates the registration input (Zod schemas).
4. The backend validates the request, hashes the password, and creates the user account.
5. The backend authenticates the user and issues access/refresh tokens.
6. The Owner selects "Create Organization" and submits the organization name/details.
7. The backend validates the request, creates the organization, and creates a membership linking the user to the organization with the `Owner` role.
8. The frontend transitions the user into the newly created organization's workspace dashboard.
9. The Owner opens the organization member-management area, enters a team member's email address, and initiates an invitation.
10. The backend verifies the Owner's permissions, creates an invitation tied to the `organizationId`, and generates a secure invite token/link.
11. The invitation is delivered to the target email address.

---

## 2. Member Joining

* **Actor:** Team Member (A user who has received an invitation to join an existing organization).
* **Trigger:** The Team Member clicks the organization invitation link in their email.
* **Success Outcome:** The Team Member becomes a valid member of the invited organization and lands on the dashboard with access determined by their assigned role.

### Step-by-Step Sequence
1. The Team Member opens the invitation link.
2. The frontend extracts the invitation token from the URL.
3. If the user does not have an account, they proceed through registration. If they do, they proceed through login.
4. The backend authenticates the user.
5. The frontend submits the invitation acceptance request with the invite token.
6. The backend validates the token, ensuring it is active and associated with a valid organization.
7. The backend creates the user's organization membership with the role specified in the invite workflow.
8. The invitation is marked as accepted (consumed) to prevent reuse.
9. The backend returns the resulting organization context.
10. The frontend establishes the organization as the user's active workspace and navigates them to the dashboard.

---

## 3. Project Scaffolding

* **Actor:** Manager / Admin (An authorized organization user responsible for creating and organizing project work).
* **Trigger:** The Manager/Admin needs to establish a project and distribute its initial work among team members.
* **Success Outcome:** A project is created within the correct organization, its initial tasks are structured, and tasks are assigned only to valid members of that organization.

### Step-by-Step Sequence
1. The Manager/Admin opens the organization's project area and selects "Create Project".
2. The frontend displays the project creation form.
3. The Manager/Admin provides the project name, description, and required details.
4. The frontend validates the submitted data and submits the API request.
5. The backend authenticates the request, verifies the user's role, and creates the project scoped to the `organizationId`.
6. The frontend displays the newly created project workspace.
7. The Manager/Admin creates the required tasks, providing titles, descriptions, statuses, priorities, and due dates.
8. The backend validates each task and explicitly associates it with the correct organization and project.
9. The Manager/Admin assigns tasks to specific organization members.
10. The backend verifies that each assigned user actively belongs to the same organization.
11. The frontend updates the TanStack Query cache, rendering the new assignments.

---

## 4. Daily Task Execution

* **Actor:** Team Member (A member responsible for executing assigned project work).
* **Trigger:** The Team Member begins their work session and wants to review/update assigned tasks.
* **Success Outcome:** The task's current state is updated, relevant work context (attachments/comments) is added, and an accurate activity record is logged.

### Step-by-Step Sequence
1. The Team Member opens the organization workspace.
2. The frontend requests tasks accessible to the authenticated user.
3. The backend authenticates the request, verifies membership, and returns the filtered task list.
4. The Team Member views their assigned tasks and selects a specific task.
5. The frontend requests the detailed task view.
6. The backend verifies authorization and ensures the task belongs to the correct organization before returning data (comments, attachments, activity).
7. The Team Member updates the task status (e.g., `IN_PROGRESS` to `COMPLETED`).
8. The frontend submits the status update; the backend validates authorization and persists the change.
9. The Team Member uploads a file. The frontend submits the attachment; the backend validates the file constraints and associates it with the task.
10. The Team Member writes and submits a comment. The backend validates and links the comment to the task and user.
11. The frontend cache is invalidated/updated to reflect the new state immediately.

---

## 5. Activity Auditing

* **Actor:** Organization Owner / Admin (An authorized organization-level user reviewing recent work activity).
* **Trigger:** The Owner/Admin wants to understand recent changes across the organization's projects and tasks.
* **Success Outcome:** The Owner/Admin reviews a reliable, chronological, organization-scoped record of meaningful project and task changes.

### Step-by-Step Sequence
1. The Owner/Admin opens the organization's activity area.
2. The frontend requests recent activity records.
3. The backend authenticates the request, verifies the user's role, and retrieves activity records strictly scoped to the `organizationId`.
4. The frontend displays recent activity (e.g., Task Status changes, new comments, new assignments) in chronological order.
5. The Owner/Admin selects an activity item for more context.
6. The frontend navigates to the associated project or task.
7. The backend independently revalidates authorization for the requested resource upon navigation. *(Note: Real-time WebSockets are deliberately excluded; updates rely on standard API refetching).*

---

## 6. Cross-Flow Security Rules

All MVP user flows MUST adhere strictly to the following backend security principles:

* **Authentication:** Every protected request MUST establish the authenticated user's identity via valid JWT access tokens.
* **Organization Context:** Every organization-scoped operation MUST resolve and validate the user's membership in the target organization.
* **Tenant Isolation:** Every resource query MUST be constrained by the authorized `organizationId`. For example, `GET /tasks/:taskId` MUST NOT authorize access solely because the task ID exists; it must verify the task belongs to the user's authorized organization.
* **Resource Ownership Validation:** When creating/updating resources, related resources must be validated (e.g., assigning a task to a user requires proving the user belongs to the same organization).
* **Client Trust Boundary:** Frontend route guards, disabled buttons, and client-side role checks are UX conveniences ONLY. They MUST NOT be treated as security controls. **The backend remains the final, absolute authority.**