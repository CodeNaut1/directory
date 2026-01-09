# Project Claim Feature - Backend Implementation Summary

## ✅ Implementation Complete

The Project Claim feature has been successfully implemented on the backend. All code follows existing patterns and maintains backward compatibility with the current system.

---

## 📋 What Was Implemented

### 1. Database Schema (Prisma)

**New Enum:**
- `ClaimStatus`: `pending`, `approved`, `rejected`

**New Model: `ProjectClaim`**
- Tracks ownership claims for projects
- Fields:
  - `id`, `projectId`, `userId`
  - `status` (ClaimStatus)
  - `proofOfOwnership` (optional text)
  - `moderatedBy`, `moderatedAt`, `rejectionReason`
  - Timestamps
- Unique constraint: `[projectId, userId]` (one claim per user per project)
- Relations: Cascade delete on project/user deletion

**Updated Models:**
- `User`: Added `claims ProjectClaim[]` relation
- `Project`: Added `claims ProjectClaim[]` relation

**Migration Required:**
Run `npx prisma migrate dev --name add_project_claims` to create the migration.

---

### 2. Validators (`lib/validators/claim.ts`)

- `submitClaimSchema`: Validates claim submission (proofOfOwnership optional, 10-5000 chars)
- `approveClaimSchema`: Validates claim approval (optional notes)
- `rejectClaimSchema`: Validates claim rejection (required reason, 10-1000 chars)
- `claimListQuerySchema`: Validates admin claim list query params

---

### 3. Service Layer (`lib/services/claim.service.ts`)

**Functions Implemented:**

1. **`submitClaim(user, projectId, input)`**
   - Validates project exists and is claimable (published + approved)
   - Ensures project has no owner (`userId === null`)
   - Prevents duplicate pending claims
   - Allows re-submission if previous claim was rejected
   - Creates claim with status `pending`

2. **`getClaimStatus(userId, projectId)`**
   - Returns claim status for a user and project
   - Returns `null` if no claim exists

3. **`listClaims(query)`** (Admin only)
   - Lists claims with filtering (status, projectId, userId)
   - Supports pagination
   - Returns claims with project and user details

4. **`approveClaim(admin, claimId, input)`**
   - Validates claim is pending
   - Uses transaction to ensure atomicity:
     - Updates claim status to `approved`
     - Transfers project ownership (`project.userId = claim.userId`)
     - Rejects all other pending claims for the same project
   - Records moderator info

5. **`rejectClaim(admin, claimId, input)`**
   - Validates claim is pending
   - Updates claim status to `rejected`
   - Records rejection reason and moderator info

6. **`getClaimById(claimId)`** (Admin only)
   - Returns full claim details with project and user info

---

### 4. API Routes

**User Routes:**

1. **`POST /api/projects/:id/claim`**
   - Submit a claim for a project
   - Requires: Authentication
   - Body: `{ proofOfOwnership?: string }`
   - Returns: Created claim

2. **`GET /api/projects/:id/claim/status`**
   - Check claim status for current user and project
   - Requires: Authentication
   - Returns: Claim object or null

**Admin Routes:**

3. **`GET /api/admin/claims`**
   - List all claims (with filters)
   - Requires: Admin or Moderator role
   - Query params: `status`, `projectId`, `userId`, `page`, `limit`
   - Returns: Paginated list of claims

4. **`GET /api/admin/claims/:id`**
   - Get claim details by ID
   - Requires: Admin or Moderator role
   - Returns: Full claim details

5. **`POST /api/admin/claims/:id/approve`**
   - Approve a claim
   - Requires: Admin or Moderator role
   - Body: `{ notes?: string }`
   - Returns: Approved claim
   - **Side effect**: Transfers project ownership

6. **`POST /api/admin/claims/:id/reject`**
   - Reject a claim
   - Requires: Admin or Moderator role
   - Body: `{ reason: string }`
   - Returns: Rejected claim

---

## 🔒 Security & Permissions

- **Claim Submission**: Any authenticated user
- **Claim Approval/Rejection**: Admin or Moderator only
- **Ownership Transfer**: Only happens on admin approval (atomic transaction)
- **Duplicate Prevention**: Unique constraint prevents multiple claims from same user
- **Race Condition Protection**: Transaction ensures only one claim can be approved per project

---

## 🔄 Integration with Existing System

### ✅ No Breaking Changes

1. **Project Update Flow** (`PATCH /api/projects/:id`)
   - **Unchanged**: Still checks `project.userId === user.id`
   - **Works with claims**: Once claim is approved, `project.userId` is set, so existing logic works

2. **Project Submit for Review** (`POST /api/projects/:id/submit`)
   - **Unchanged**: Still checks `project.userId === user.id`
   - **Works with claims**: Claimed projects have `userId` set, so existing logic works

3. **User Dashboard** (`GET /api/projects/my-projects`)
   - **Unchanged**: Filters by `userId`
   - **Works with claims**: Claimed projects appear automatically (no code changes needed)

4. **Project Creation Flow**
   - **Unchanged**: New projects still work as before

---

## 📝 Next Steps (Frontend)

1. **Run Migration**: `npx prisma migrate dev --name add_project_claims`
2. **Generate Prisma Client**: `npx prisma generate`
3. **Frontend Implementation**:
   - Add "Update Project" button on public project page
   - Create claim form component
   - Create admin claims review page
   - Handle claim status display

---

## 🧪 Testing Checklist

Before deploying, test:

- [ ] Submit claim for unowned project (should succeed)
- [ ] Submit claim for owned project (should fail)
- [ ] Submit duplicate claim (should fail)
- [ ] Admin approves claim (should transfer ownership)
- [ ] Admin rejects claim (should not transfer ownership)
- [ ] After approval, user can update project
- [ ] After approval, user can submit project for review
- [ ] After approval, project appears in user dashboard
- [ ] Multiple pending claims for same project (only one can be approved)
- [ ] Re-submit claim after rejection (should succeed)

---

## 📚 API Examples

### Submit Claim
```bash
POST /api/projects/{projectId}/claim
Authorization: Bearer {token}
Content-Type: application/json

{
  "proofOfOwnership": "I am the founder of this project. Here's my proof..."
}
```

### Check Claim Status
```bash
GET /api/projects/{projectId}/claim/status
Authorization: Bearer {token}
```

### List Claims (Admin)
```bash
GET /api/admin/claims?status=pending&page=1&limit=20
Authorization: Bearer {adminToken}
```

### Approve Claim (Admin)
```bash
POST /api/admin/claims/{claimId}/approve
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "notes": "Verified ownership via email confirmation"
}
```

### Reject Claim (Admin)
```bash
POST /api/admin/claims/{claimId}/reject
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "reason": "Insufficient proof of ownership provided"
}
```

---

## ⚠️ Important Notes

1. **Migration Required**: The Prisma schema has been updated but the migration needs to be created and run.

2. **No Changes to Existing Flows**: All existing project submission, update, and review flows remain completely unchanged.

3. **Ownership Transfer**: Only happens when an admin explicitly approves a claim. No automatic transfers.

4. **Re-submission**: Users can re-submit claims after rejection (no permanent ban).

5. **Multiple Claims**: Multiple users can claim the same project, but only one can be approved. Other pending claims are automatically rejected when one is approved.

---

## 🎯 Design Principles Followed

✅ **Defensive Programming**: Extensive validation and error handling  
✅ **Atomic Operations**: Transactions ensure data consistency  
✅ **Backward Compatibility**: Zero breaking changes  
✅ **Security First**: Proper authorization checks at every level  
✅ **Clean Architecture**: Separation of concerns (validators, services, routes)  
✅ **Existing Patterns**: Follows same patterns as existing codebase

