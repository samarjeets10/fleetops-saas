# FleetOps-SaaS — Database Design

## 1. Database Principles
FleetOps-SaaS uses MongoDB with Mongoose as the persistence layer.
The database design is centered around strict multi-tenant isolation. Organization boundaries are a security boundary and MUST be represented explicitly in persisted organization-scoped resources.

### 1.1 Tenant Isolation
The fundamental rule is:

Every organization-scoped document MUST contain `organizationId`. Global `User` documents are the only core domain documents that are not directly tenant-scoped.
Tenant-scoped collections include:
* `Organization`
* `OrganizationMembership`
* `Project`
* `Task`
* `Comment`
* `Attachment`
* `Activity`
* `Invitation`

The User collection is global because a single user may belong to multiple organizations.
Conceptually:
```text
User
  ├── Membership → Organization A
  └── Membership → Organization B
```

The user's role and access are therefore determined through OrganizationMembership, not stored globally on the User document.

### 1.2 Mongoose Timestamps
All operational schemas MUST use Mongoose timestamps:
```javascript
{ timestamps: true }
```

**This automatically maintains:**

* createdAt

* updatedAt

These timestamps MUST be used instead of manually maintaining equivalent fields.
Activity records additionally contain their own event timestamp where required for explicit audit semantics.

### 1.3 ObjectId References
MongoDB ObjectId references MUST be used for relationships between persisted entities.
References MUST NOT be treated as authorization by themselves.
For example:
task.projectId
identifies a project relationship, but the backend MUST still verify that the project belongs to the same authorized organization.

### 1.4 Enumerated Domain Values
Finite domain states MUST use Mongoose enums.
This prevents arbitrary status/role/priority values from entering the database.
Initial MVP enums are intentionally small and should not be expanded without a documented product decision.

## 2. Entity Relationship Diagram — Conceptual
```text
                              ┌──────────────┐
                              │     User     │
                              │              │
                              │ _id          │
                              │ email        │
                              │ passwordHash │
                              └──────┬───────┘
                                     │
                                     │ userId
                                     ▼
                        ┌──────────────────────────┐
                        │ OrganizationMembership   │
                        │                          │
                        │ userId                   │
                        │ organizationId           │
                        │ role                     │
                        └────────────┬─────────────┘
                                     │
                                     │ organizationId
                                     ▼
                           ┌────────────────────┐
                           │   Organization     │
                           │                    │
                           │ _id                │
                           │ name               │
                           │ ownerId            │
                           └─────────┬──────────┘
                                     │
                                     │ organizationId
                                     ▼
                           ┌────────────────────┐
                           │      Project       │
                           │                    │
                           │ organizationId     │
                           │ name               │
                           │ description        │
                           │ status             │
                           └─────────┬──────────┘
                                     │
                                     │ projectId
                                     ▼
                           ┌────────────────────┐
                           │       Task         │
                           │                    │
                           │ organizationId     │
                           │ projectId          │
                           │ title              │
                           │ description        │
                           │ status             │
                           │ priority           │
                           │ dueDate            │
                           │ assignedTo ────────┼──────► User
                           └──────┬─────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    │ taskId                     │ resourceId
                    ▼                            ▼
           ┌─────────────────┐          ┌─────────────────┐
           │     Comment     │          │    Activity     │
           │                 │          │                 │
           │ organizationId  │          │ organizationId  │
           │ taskId          │          │ actorId ────────┼──► User
           │ createdBy ──────┼──► User  │ action          │
           │ content         │          │ resourceType    │
           └─────────────────┘          │ resourceId      │
                                        │ metadata        │
                                        └─────────────────┘
```
| Relationship | Cardinality |
| :--- | :--- |
| User → OrganizationMembership | One-to-Many |
| Organization → OrganizationMembership | One-to-Many |
| Organization → Project | One-to-Many |
| Project → Task | One-to-Many |
| User → assigned Tasks | One-to-Many |
| Task → Comment | One-to-Many |
| User → Comment | One-to-Many |
| Organization → Activity | One-to-Many |
| User → Activity | One-to-Many |
| Organization → Attachment | One-to-Many |
| Task → Attachment | One-to-Many |



## 3. Mongoose Schema Definitions
The following definitions represent the authoritative MVP data model.
The examples use JavaScript and Mongoose, consistent with the FleetOps-SaaS implementation stack.

### 3.1 User
User is a global identity entity.
It MUST NOT contain a global organization role because users can belong to multiple organizations with different roles.

Fields

| Field | Type | Required | Default / Constraints |
| :--- | :--- | :--- | :--- |
| **email** | String | Yes | Lowercase, trimmed, unique |
| **passwordHash** | String | Yes | Password hash only |
| **firstName** | String | Yes | Trimmed |
| **lastName** | String | Yes | Trimmed |
| **isActive** | Boolean | Yes | `true` |
| **lastLoginAt** | Date | No | `null` |
| **createdAt** | Date | Auto | Mongoose timestamp |
| **updatedAt** | Date | Auto | Mongoose timestamp |

**Schema**

```javascript
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
```

**Security Rules**

* Plaintext passwords MUST never be persisted.

* passwordHash MUST never be returned in normal API responses.

* Email uniqueness is global at the User level.

* Organization roles MUST NOT be stored on User.

### 3.2 Organization
An Organization represents a tenant.

Fields

| Field | Type | Required | Default / Constraints |
| :--- | :--- | :--- | :--- |
| **name** | String | Yes | Trimmed |
| **ownerId** | ObjectId → User | Yes | Organization creator |
| **createdAt** | Date | Auto | Mongoose timestamp |
| **updatedAt** | Date | Auto | Mongoose timestamp |

**Schema**

```javascript
const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
```

**Ownership Rule**
* The ownerId identifies the organization's current Owner.
* The corresponding OrganizationMembership MUST also contain:
* role = "Owner"
for that user within the organization.
The service layer MUST maintain this invariant.

### 3.3 OrganizationMembership
Membership is the authorization bridge between global users and organizations.

**Fields**

| Field | Type | Required | Default / Constraints |
| :--- | :--- | :--- | :--- |
| **userId** | ObjectId → User | Yes | Member identity |
| **organizationId** | ObjectId → Organization | Yes | Tenant |
| **role** | String | Yes | Owner, Admin, Member |
| **createdAt** | Date | Auto | Mongoose timestamp |
| **updatedAt** | Date | Auto | Mongoose timestamp |


```javascript
const organizationMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["Owner", "Admin", "Member"],
    },
  },
  {
    timestamps: true,
  }
);
```

### Membership Invariants
* A user **MUST NOT** have duplicate membership records for the same organization.
* Therefore: `(userId, organizationId) = unique` must be enforced through a compound unique index.
* An organization **MUST** have exactly one Owner in the MVP.

### 3.4 Project
Projects are organization-scoped units of work.

#### Fields

| Field | Type | Required | Default / Constraints |
| :--- | :--- | :--- | :--- |
| **organizationId** | ObjectId → Organization | Yes | Tenant |
| **name** | String | Yes | Trimmed |
| **description** | String | No | `""` |
| **status** | String | Yes | PLANNED |
| **createdAt** | Date | Auto | Mongoose timestamp |
| **updatedAt** | Date | Auto | Mongoose timestamp |

#### Schema

```javascript
const projectSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["PLANNED", "IN_PROGRESS", "COMPLETED"],
      default: "PLANNED",
    },
  },
  {
    timestamps: true,
  }
);
```

The project status enum is intentionally small for the MVP.

### 3.5 Task
Tasks represent executable units of work within a project.

#### Fields

| Field | Type | Required | Default / Constraints |
| :--- | :--- | :--- | :--- |
| **organizationId** | ObjectId → Organization | Yes | Tenant |
| **projectId** | ObjectId → Project | Yes | Parent project |
| **title** | String | Yes | Trimmed |
| **description** | String | No | `""` |
| **status** | String | Yes | TODO |
| **priority** | String | Yes | MEDIUM |
| **dueDate** | Date | No | `null` |
| **assignedTo** | ObjectId → User | No | `null` |
| **createdAt** | Date | Auto | Mongoose timestamp |
| **updatedAt** | Date | Auto | Mongoose timestamp |

#### Schema :

```javascript
const taskSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["TODO", "IN_PROGRESS", "COMPLETED"],
      default: "TODO",
    },

    priority: {
      type: String,
      required: true,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    dueDate: {
      type: Date,
      default: null,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
```

### Task Relationship Rules
* The schema alone does not guarantee valid relationships.
* The service layer **MUST** verify that: `Task.organizationId = Project.organizationId` and, when assigned: `assignedTo $\rightarrow$ OrganizationMembership $\rightarrow$ same organizationId`.
* A task **MUST NOT** reference a project or assignee belonging to another organization.

### 3.6 Comment
Comments are task-scoped collaboration records.

#### Fields
| Field | Type | Required | Default / Constraints |
| :--- | :--- | :--- | :--- |
| **organizationId** | ObjectId → Organization | Yes | Tenant |
| **taskId** | ObjectId → Task | Yes | Parent task |
| **createdBy** | ObjectId → User | Yes | Comment author |
| **content** | String | Yes | Trimmed |
| **parentCommentId** | ObjectId → Comment | No | `null`, enables basic threading |
| **createdAt** | Date | Auto | Mongoose timestamp |
| **updatedAt** | Date | Auto | Mongoose timestamp |

Although the minimum entity definition requires `organizationId`, `taskId`, `createdBy`, and `content`, the MVP's threaded comment requirement requires `parentCommentId`.

#### Schema
```javascript
const commentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
```

### Comment Relationship Rules
* The service layer **MUST** verify: `Comment.organizationId = Task.organizationId` and: `Comment.taskId $\rightarrow$ Task belonging to authorized organization`.
* For a threaded reply, `parentCommentId` **MUST** reference a comment belonging to the same task and organization.

### 3.7 Activity
Activity provides the MVP audit trail for meaningful state-changing operations.

#### Fields
| Field | Type | Required | Default / Constraints |
| :--- | :--- | :--- | :--- |
| **organizationId** | ObjectId → Organization | Yes | Tenant |
| **actorId** | ObjectId → User | Yes | User performing action |
| **action** | String | Yes | Controlled action value |
| **resourceType** | String | Yes | Controlled resource type |
| **resourceId** | ObjectId | Yes | Affected resource |
| **metadata** | Mixed/Object | No | `{}` |
| **createdAt** | Date | Auto | Event timestamp |
| **updatedAt** | Date | Auto | Mongoose timestamp |

#### Schema
```javascript
const activitySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "PROJECT_CREATED",
        "PROJECT_UPDATED",
        "PROJECT_DELETED",
        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_DELETED",
        "TASK_ASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_PRIORITY_CHANGED",
        "COMMENT_CREATED",
        "COMMENT_DELETED",
        "ATTACHMENT_ADDED",
        "ATTACHMENT_DELETED",
      ],
    },

    resourceType: {
      type: String,
      required: true,
      enum: [
        "Organization",
        "Project",
        "Task",
        "Comment",
        "Attachment",
      ],
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
```

### Activity Rules
* Activity records **MUST** be created by trusted backend services.
* Clients **MUST NOT** be allowed to arbitrarily submit:
  * `actorId`
  * `organizationId`
  for audit records.
* These values **MUST** be derived from authenticated/trusted backend context.

### 3.8 Attachment
Attachments are required by the MVP collaboration specification even though they are not part of the minimum entity list above.
The database stores attachment metadata, not necessarily the binary file itself.

#### Fields
| Field | Type | Required | Default / Constraints |
| :--- | :--- | :--- | :--- |
| **organizationId** | ObjectId → Organization | Yes | Tenant |
| **taskId** | ObjectId → Task | Yes | Parent task |
| **uploadedBy** | ObjectId → User | Yes | Uploading user |
| **fileName** | String | Yes | Original/display name |
| **storageKey** | String | Yes | Storage identifier |
| **mimeType** | String | Yes | Validated file type |
| **size** | Number | Yes | Positive file size |
| **createdAt** | Date | Auto | Mongoose timestamp |
| **updatedAt** | Date | Auto | Mongoose timestamp |

#### Schema
```javascript
const attachmentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    storageKey: {
      type: String,
      required: true,
      unique: true,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);
```

### Attachment Security
* The `storageKey` **MUST NOT** itself grant unauthorized access.
* Before retrieving an attachment, the backend **MUST**:
  * Authenticate the requester.
  * Resolve organization membership.
  * Verify the attachment's `organizationId`.
  * Verify access to the parent task/project.
* Only then provide the permitted file access mechanism.

### 3.9 Invitation
Invitations are required by the MVP organization onboarding flow.
They are organization-scoped temporary records.

#### Fields
| Field | Type | Required | Default / Constraints |
| :--- | :--- | :--- | :--- |
| **organizationId** | ObjectId → Organization | Yes | Tenant |
| **email** | String | Yes | Lowercase, trimmed |
| **role** | String | Yes | Admin or Member |
| **tokenHash** | String | Yes | Hashed invitation token |
| **expiresAt** | Date | Yes | Expiration timestamp |
| **acceptedAt** | Date | No | `null` |
| **invitedBy** | ObjectId → User | Yes | Inviting user |
| **createdAt** | Date | Auto | Mongoose timestamp |
| **updatedAt** | Date | Auto | Mongoose timestamp |

#### Schema
```javascript
const invitationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["Admin", "Member"],
      default: "Member",
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
``` 

### Invitation Security
* The raw invitation token **SHOULD NOT** be stored in MongoDB.
* The system **SHOULD**:
  * Generate random token.
  * Send raw token through invitation link.
  * Hash token.
  * Store `tokenHash`.
* When the recipient accepts the invitation, the supplied token is hashed and compared against the stored hash.
* Invitations **MUST** be:
  * Organization-specific.
  * Time-limited.
  * Single-use.
  * Invalid after acceptance.
* The Owner/Admin initiating the invitation **MUST** be authorized to perform the operation.

## 4. Indexing Strategy
Indexes are required for both performance and reliable tenant-scoped access patterns.
Indexes **MUST** be designed around actual application queries and access patterns.

### 4.1 User
* Unique Email

```javascript
userSchema.index(
  { email: 1 },
  { unique: true }
);
```

* Prevent duplicate accounts.
* Accelerate authentication lookup by email.

### 4.2 OrganizationMembership
#### Unique Membership

```javascript
organizationMembershipSchema.index(
  {
    userId: 1,
    organizationId: 1,
  },
  {
    unique: true,
  }
);
```

* Prevent duplicate memberships.
* Quickly determine whether a user belongs to an organization.

### Organization Member Lookup

```javascript
organizationMembershipSchema.index({
  organizationId: 1,
  role: 1,
});
```

* Efficient organization member listing.
* Role-based organization queries.

### 4.3 Organization
#### Owner lookup:

```javascript

```

* Efficient lookup of organizations owned by a user.

### 4.4 Project
#### Primary tenant query:

```javascript
projectSchema.index({
  organizationId: 1,
  createdAt: -1,
});
```

* Efficient organization project listing.
* Chronological project retrieval.

#### Optional project status filtering:

```javascript
projectSchema.index({
  organizationId: 1,
  status: 1,
});
```

* Efficient filtering of projects by status within a tenant.

### 4.5 Task
#### Organization + Project

```javascript
taskSchema.index({
  organizationId: 1,
  projectId: 1,
});
```

* This is a critical tenant-aware index.
* It supports:
  * Listing tasks for a project.
  * Verifying project/task tenant relationships.
  * Organization-scoped project task queries.

#### Organization + Assignee

```javascript
taskSchema.index({
  organizationId: 1,
  assignedTo: 1,
});
```
* Efficient retrieval of tasks assigned to a member.
* Organization-scoped task dashboards.

#### Organization + Status

```javascript
taskSchema.index({
  organizationId: 1,
  status: 1,
});
```

* Status filtering.
* Operational task views.

#### Organization + Due Date

```javascript
taskSchema.index({
  organizationId: 1,
  dueDate: 1,
});
```

* Efficient deadline/overdue queries.

### 4.6 Comment
#### Task Comments

```javascript
commentSchema.index({
  organizationId: 1,
  taskId: 1,
  createdAt: 1,
});
```
* Efficient retrieval of a task's comment thread.
* Maintains tenant scope in the primary query pattern.

#### Author Lookup

```javascript
commentSchema.index({
  organizationId: 1,
  createdBy: 1,
});
```

* Efficient organization-scoped lookup of comments created by a user.

### 4.7 Activity
Activity feeds are primarily queried by organization and recency.

```javascript
activitySchema.index({
  organizationId: 1,
  createdAt: -1,
});
```

* This is one of the most important indexes for the activity feed.
* It supports:
  * Organization $\rightarrow$ Recent activity $\rightarrow$ Newest first

#### Resource-specific activity lookup:

```javascript
activitySchema.index({
  organizationId: 1,
  resourceType: 1,
  resourceId: 1,
  createdAt: -1,
});
```

### Purpose:
* Retrieve activity for a specific resource.
* Maintain tenant isolation.

### 4.8 Attachment
#### Task Attachments

```javascript
attachmentSchema.index({
  organizationId: 1,
  taskId: 1,
  createdAt: 1,
});
```
### Purpose:
* Efficient task attachment listing.
* Tenant-scoped attachment retrieval.

#### `storageKey` MUST be unique:

```javascript
attachmentSchema.index(
  { storageKey: 1 },
  { unique: true }
);
```

### 4.9 Invitation
#### Token Lookup

```javascript
invitationSchema.index(
  { tokenHash: 1 },
  { unique: true }
);
```

### Purpose:
* Efficient invitation-token resolution.
* Prevent duplicate token hashes.

#### Organization Invitations

```javascript
invitationSchema.index({
  organizationId: 1,
  email: 1,
});
```

### Purpose:
* Efficient organization-specific invitation lookup.

#### Expiration

```javascript
invitationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
```

This TTL index allows MongoDB to automatically remove expired invitations.
The application MUST still validate invitation expiration explicitly during acceptance. TTL deletion is asynchronous and MUST NOT be treated as the authorization mechanism.

## 5. Index Summary

| Collection | Index | Purpose |
| :--- | :--- | :--- |
| **User** | `email` (unique) | Authentication / identity uniqueness |
| **Organization** | `ownerId` | Owner lookup |
| **Membership** | `userId + organizationId` (unique) | Tenant membership integrity |
| **Membership** | `organizationId + role` | Member/role queries |
| **Project** | `organizationId + createdAt` | Tenant project listing |
| **Project** | `organizationId + status` | Project filtering |
| **Task** | `organizationId + projectId` | Project task queries |
| **Task** | `organizationId + assignedTo` | Assigned-task queries |
| **Task** | `organizationId + status` | Status filtering |
| **Task** | `organizationId + dueDate` | Deadline queries |
| **Comment** | `organizationId + taskId + createdAt` | Task comment threads |
| **Comment** | `organizationId + createdBy` | Author queries |
| **Activity** | `organizationId + createdAt` | Activity feed |
| **Activity** | `organizationId + resourceType + resourceId + createdAt` | Resource audit history |
| **Attachment** | `organizationId + taskId + createdAt` | Task attachment listing |
| **Attachment** | `storageKey` (unique) | Storage identity |
| **Invitation** | `tokenHash` (unique) | Invitation lookup |
| **Invitation** | `organizationId + email` | Organization invitations |
| **Invitation** | `expiresAt` (TTL) | Expired invitation cleanup |

## 6. Database-Level Security Invariants

The following invariants are mandatory:

* **Tenant Invariant:** Every organization-scoped resource MUST have `organizationId`.
* **Project Invariant:** `Project.organizationId` MUST identify the authorized tenant.
* **Task Invariant:** `Task.organizationId == Project.organizationId`.
* **Assignment Invariant:** `Task.assignedTo` MUST belong to `Task.organizationId` when an assignee exists.
* **Comment Invariant:** `Comment.organizationId == Task.organizationId`.
* **Attachment Invariant:** `Attachment.organizationId == Task.organizationId`.
* **Activity Invariant:** `Activity.organizationId ==` the organization containing the affected resource.
* **Membership Invariant:** `(userId, organizationId)` MUST be unique.
* **Ownership Invariant:** `Organization.ownerId` MUST correspond to exactly one `OrganizationMembership` with `role = "Owner"`.

> These relationships MUST be validated by application services. Mongoose schema validation and indexes provide important safeguards, but they do not replace service-level relationship validation.

## 7. Data Access Rule
The database layer MUST never be treated as a generic ID-based lookup layer for tenant resources.
The preferred access pattern is:

```text
Authenticated Request
        ↓
Resolve Membership
        ↓
Obtain Trusted organizationId
        ↓
Service Operation
        ↓
Tenant-Scoped Query
        ↓
Mongoose
        ↓
MongoDB
```

For Example :

```javascript
const task = await Task.findOne({
  _id: taskId,
  organizationId: authorizedOrganizationId,
});
```

rather than:

```javascript
const task = await Task.findById(taskId);
```

for organization-scoped access.
This database-level query discipline is a core part of FleetOps-SaaS's multi-tenant security model.

## 8. MVP Data Model Boundary
The MVP database intentionally models the minimum domain required to support:

```text
Identity
   ↓
Organization
   ↓
Membership / RBAC
   ↓
Projects
   ↓
Tasks
   ├── Comments
   ├── Attachments
   └── Activity
```

## 7. Out-of-Scope / Non-MVP Entities

The following are intentionally not part of the MVP data model:

* Subscription/billing entities.
* Payment records.
* WebSocket/presence state.
* Redis cache/queue state.
* AI-generated records.
* Notification/digest infrastructure.
* Advanced workflow configuration.
* Custom roles and permissions.

> **Note:** These entities MUST NOT be introduced merely in anticipation of future functionality. They should be added only when the corresponding product capability enters the approved scope.




