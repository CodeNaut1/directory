# Project Claim Feature - Architecture Analysis & Design

## 1. Current Architecture Analysis

### 1.1 Project Model & Ownership
- **Project.userId**: Optional field (can be `null` for bulk-imported projects)
- **Ownership Check**: In `updateProject()` and `submitProjectForReview()`, ownership is verified by checking `project.userId === user.id`
- **Admin Override**: Admins and moderators can update any project, but regular users cannot

### 1.2 Project Submission Flow
1. **Create Project**: `POST /api/projects/submit`
   - Creates project with `userId` set to creator
   - Status: `draft` (not published)
   - Project is immediately associated with user

2. **Submit for Review**: `POST /api/projects/:id/submit`
   - Requires: User must be the project owner (`project.userId === user.id`)
   - Creates a `Submission` record with status `pending`
   - Project status remains unchanged (still `draft`)

3. **Admin Review**: (Currently handled via database or frontend calls to non-existent routes)
   - Admin approves/rejects `Submission`
   - On approval: Project status → `approved`, `published` → `true`
   - On rejection: Project status → `rejected`

### 1.3 Project Update Flow
- **Route**: `PATCH /api/projects/:id`
- **Permission Check**: 
  - User must be owner (`project.userId === user.id`) OR
  - User must be admin/moderator
- **Behavior**: Updates project directly (no automatic review)

### 1.4 Key Constraints Identified
- `submitProjectForReview()` enforces ownership: `if (project.userId !== user.id) throw AuthorizationError`
- `updateProject()` allows admin override but regular users must own the project
- Projects can exist without owners (`userId: null`)
- `getUserProjects()` only returns projects where `userId` matches

### 1.5 Current Routes
- `GET /api/projects/:id` - Public project view (only published + approved)
- `PATCH /api/projects/:id` - Update project (requires ownership or admin)
- `POST /api/projects/:id/submit` - Submit for review (requires ownership)
- `GET /api/projects/my-projects` - Get user's projects (where userId matches)

---

## 2. Project Claim Feature Design

### 2.1 Data Model

**New Model: `ProjectClaim`**
```prisma
model ProjectClaim {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status      ClaimStatus @default(pending) // pending, approved, rejected
  proofOfOwnership String? @db.Text // User-provided proof
  
  // Moderation
  moderatedBy     String?
  moderatedAt     DateTime?
  rejectionReason String?   @db.Text
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([projectId, userId]) // One claim per user per project
  @@index([projectId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("project_claims")
}

enum ClaimStatus {
  pending
  approved
  rejected
}
```

**Updates to Existing Models:**
- Add `ProjectClaim[]` relation to `Project` model
- Add `ProjectClaim[]` relation to `User` model

### 2.2 Business Logic Rules

1. **Claim Submission**:
   - User must be logged in
   - Project must exist and be published/approved (visible to public)
   - Project must NOT already have an owner (`userId === null`)
   - User cannot have a pending claim for the same project
   - User cannot claim a project they already own

2. **Claim Approval**:
   - Admin/moderator reviews claim
   - On approval:
     - Set `project.userId = claim.userId`
     - Set `claim.status = 'approved'`
     - Reject any other pending claims for the same project
   - On rejection:
     - Set `claim.status = 'rejected'`
     - User cannot re-submit (or can, depending on policy - we'll allow re-submission)

3. **Post-Approval Behavior**:
   - Project appears in user's dashboard (`GET /api/projects/my-projects`)
   - User can now update project (`PATCH /api/projects/:id`)
   - User can submit updates for review (`POST /api/projects/:id/submit`)
   - All existing flows work as-is

### 2.3 API Routes

**New Routes:**
1. `POST /api/projects/:id/claim`
   - Submit a claim request
   - Body: `{ proofOfOwnership: string }`
   - Returns: Created claim

2. `GET /api/projects/:id/claim/status`
   - Check if user has a claim for this project
   - Returns: Claim status or null

3. `GET /api/admin/claims` (Admin only)
   - List all claims (with filters: status, projectId, userId)
   - Query params: `status`, `page`, `limit`

4. `POST /api/admin/claims/:id/approve` (Admin only)
   - Approve a claim
   - Body: `{ notes?: string }`
   - Updates project ownership

5. `POST /api/admin/claims/:id/reject` (Admin only)
   - Reject a claim
   - Body: `{ reason: string }`

### 2.4 Permission Updates

**Update `updateProject()` service:**
- Keep existing logic (no changes needed)
- Already checks `project.userId === user.id`

**Update `submitProjectForReview()` service:**
- Keep existing logic (no changes needed)
- Already checks `project.userId === user.id`

**New Permission Checks:**
- Claim submission: Any authenticated user
- Claim approval/rejection: Admin/moderator only

### 2.5 Integration Points

1. **Frontend Integration** (Future):
   - Add "Update Project" button on public project page
   - If user not owner → redirect to claim form
   - If user has pending claim → show status
   - If claim approved → show "Update Project" button

2. **User Dashboard**:
   - `GET /api/projects/my-projects` will automatically include claimed projects
   - No changes needed (uses `userId` filter)

---

## 3. Implementation Plan

### Phase 1: Database Schema
1. Add `ClaimStatus` enum to Prisma schema
2. Add `ProjectClaim` model
3. Add relations to `Project` and `User`
4. Create and run migration

### Phase 2: Validators
1. Create `claim.ts` validator file
2. Define schemas for claim submission, approval, rejection

### Phase 3: Service Layer
1. Create `claim.service.ts`
2. Implement: `submitClaim()`, `getClaimStatus()`, `approveClaim()`, `rejectClaim()`, `listClaims()`

### Phase 4: API Routes
1. Create claim routes
2. Create admin claim routes
3. Add proper authentication/authorization

### Phase 5: Testing
1. Test claim submission
2. Test claim approval/rejection
3. Test ownership transfer
4. Test that existing flows remain intact

---

## 4. Critical Constraints to Maintain

✅ **DO NOT:**
- Modify `updateProject()` logic (except to ensure it works with claimed projects)
- Modify `submitProjectForReview()` logic
- Change existing project submission flow
- Allow non-owners to update projects (except admins)

✅ **DO:**
- Ensure claimed projects work with existing update/submit flows
- Maintain admin override capabilities
- Preserve all existing permission checks
- Add new functionality without breaking existing behavior

---

## 5. Edge Cases to Handle

1. **Multiple Claims**: Only one user can own a project. On approval, reject other pending claims.
2. **Project Already Has Owner**: Prevent claim submission if `project.userId !== null`
3. **User Already Owns Project**: Prevent claim if `project.userId === user.id`
4. **Claim Already Exists**: Use `@@unique([projectId, userId])` to prevent duplicates
5. **Project Deleted**: Cascade delete claims
6. **User Deleted**: Cascade delete claims

---

## 6. Security Considerations

1. **Rate Limiting**: Prevent spam claims (use existing rate limiting)
2. **Input Validation**: Sanitize `proofOfOwnership` text
3. **Authorization**: Strict admin-only for approval/rejection
4. **Audit Trail**: Consider logging claim actions (future enhancement)

