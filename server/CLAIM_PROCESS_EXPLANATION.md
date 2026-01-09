# Project Claim Process - Complete Explanation

## Overview

The Project Claim feature allows legitimate owners of **already listed projects** (that were bulk-imported or created without owners) to claim ownership and manage their project listings.

---

## 🎯 User Journey Flow

### Step 1: User Discovers Project
- User visits a public project page (`/project/:id`)
- Project is visible because it's `published: true` and `status: 'approved'`
- Project has no owner (`userId: null`)

### Step 2: User Clicks "Update Project" Button
- If user is **not logged in**: Redirected to login page
- If user is **logged in but not owner**: Redirected to claim form
- If user **already owns project**: Can directly edit

### Step 3: Submit Claim
- User fills out claim form with optional proof of ownership
- Submits claim via `POST /api/projects/:id/claim`
- Claim is created with status: `pending`

### Step 4: Wait for Admin Review
- Claim appears in admin panel
- User sees "Pending" status on project page
- User cannot update project yet

### Step 5: Admin Reviews
- Admin views claim details and proof
- Admin either:
  - **Approves**: Ownership transferred to user
  - **Rejects**: Claim denied with reason

### Step 6: Post-Approval
- If **approved**: 
  - Project `userId` is set to claimer
  - Project appears in user's dashboard
  - User can now update project
  - Other pending claims for same project are auto-rejected
- If **rejected**:
  - User sees rejection reason
  - User can submit a new claim (re-submission allowed)

---

## 🔄 Technical Process Flow

### 1. Claim Submission (`submitClaim`)

**Endpoint:** `POST /api/projects/:id/claim`

**Validation Checks (in order):**
1. ✅ User is authenticated
2. ✅ Project exists
3. ✅ Project is `published: true` AND `status: 'approved'`
4. ✅ Project has no owner (`userId === null`)
5. ✅ User doesn't already own the project
6. ✅ User doesn't have a pending claim for this project
7. ✅ If previous claim was rejected, allow re-submission

**What Happens:**
```typescript
// Creates a new ProjectClaim record
{
  projectId: "...",
  userId: "...",
  status: "pending",
  proofOfOwnership: "optional text",
  createdAt: new Date()
}
```

**Database State:**
- `project_claims` table: New row created
- `projects` table: Unchanged (still `userId: null`)

---

### 2. Check Claim Status

**Endpoint:** `GET /api/projects/:id/claim/status`

**What It Returns:**
- `null` if no claim exists
- Claim object with:
  - `status`: `'pending' | 'approved' | 'rejected'`
  - `rejectionReason`: Only if rejected
  - `createdAt`, `moderatedAt`

---

### 3. Admin Lists Claims

**Endpoint:** `GET /api/admin/claims?status=pending`

**What Admins See:**
- List of all claims (filterable by status)
- For each claim:
  - Project name and details
  - Claimant name and email
  - Proof of ownership (if provided)
  - Submission date
  - Current status

---

### 4. Admin Approves Claim

**Endpoint:** `POST /api/admin/claims/:id/approve`

**What Happens (Atomic Transaction):**

```typescript
// All happens in a single database transaction
1. Update claim status to 'approved'
   - Set moderatedBy = admin.id
   - Set moderatedAt = now()

2. Transfer project ownership
   - Set project.userId = claim.userId

3. Reject all other pending claims for this project
   - Set status = 'rejected'
   - Set rejectionReason = "Another claim was approved"
```

**Database State After Approval:**
- `project_claims` table:
  - Approved claim: `status: 'approved'`
  - Other claims: `status: 'rejected'`
- `projects` table:
  - `userId` is now set to claimer's ID

**Why Transaction?**
- Ensures data consistency
- Prevents race conditions
- Either all changes succeed or none do

---

### 5. Admin Rejects Claim

**Endpoint:** `POST /api/admin/claims/:id/reject`

**What Happens:**
```typescript
1. Update claim status to 'rejected'
   - Set moderatedBy = admin.id
   - Set moderatedAt = now()
   - Set rejectionReason = input.reason
```

**Database State After Rejection:**
- `project_claims` table: Claim status = `'rejected'`
- `projects` table: Unchanged (still `userId: null`)

---

## 📊 Data State Changes

### Before Claim Submission
```
Project:
  id: "proj123"
  name: "Bitcoin Exchange"
  userId: null          ← No owner
  published: true
  status: "approved"

ProjectClaims: []      ← No claims
```

### After Claim Submission
```
Project:
  id: "proj123"
  userId: null          ← Still no owner (not transferred yet)
  ...

ProjectClaims:
  - id: "claim456"
    projectId: "proj123"
    userId: "user789"
    status: "pending"   ← Waiting for review
    proofOfOwnership: "I am the founder..."
```

### After Admin Approval
```
Project:
  id: "proj123"
  userId: "user789"     ← Ownership transferred!
  ...

ProjectClaims:
  - id: "claim456"
    status: "approved"  ← Approved
    moderatedBy: "admin123"
    moderatedAt: "2024-01-15T10:30:00Z"
```

### After Admin Rejection
```
Project:
  id: "proj123"
  userId: null          ← Still no owner
  ...

ProjectClaims:
  - id: "claim456"
    status: "rejected"  ← Rejected
    rejectionReason: "Insufficient proof"
    moderatedBy: "admin123"
```

---

## 🔒 Validation Rules & Constraints

### Who Can Submit Claims?
- ✅ Any authenticated user (role: `user`, `builder`, `moderator`, or `admin`)
- ❌ Unauthenticated users

### Which Projects Can Be Claimed?
- ✅ Projects that are `published: true` AND `status: 'approved'`
- ✅ Projects with `userId: null` (no current owner)
- ❌ Draft projects (`status: 'draft'`)
- ❌ Unpublished projects (`published: false`)
- ❌ Projects that already have an owner (`userId !== null`)

### Claim Submission Rules
- ✅ One claim per user per project (enforced by unique constraint)
- ✅ Can re-submit if previous claim was rejected
- ❌ Cannot submit if you have a pending claim
- ❌ Cannot submit if you already own the project

### Multiple Claims for Same Project
- ✅ Multiple users CAN claim the same project
- ✅ All claims start as `pending`
- ⚠️ When one is approved, others are automatically rejected
- ⚠️ Only ONE user can own a project at a time

---

## 👨‍💼 Admin Review Process

### Admin Capabilities
- ✅ View all claims (with filters)
- ✅ View claim details (project, user, proof)
- ✅ Approve claims (transfers ownership)
- ✅ Reject claims (with required reason)
- ✅ See claim history

### Admin Requirements
- Must have role: `admin` or `moderator`
- Must provide rejection reason when rejecting

### What Admins See
```
Claim List View:
┌─────────────────────────────────────────────┐
│ Project: Bitcoin Exchange                   │
│ Claimant: john@example.com                   │
│ Status: Pending                              │
│ Submitted: Jan 15, 2024                      │
│ Proof: "I am the founder..."                │
│ [Approve] [Reject] [View Details]           │
└─────────────────────────────────────────────┘
```

---

## 🎯 Post-Approval Behavior

### For the Claimer (New Owner)

**Immediate Changes:**
1. Project appears in their dashboard (`GET /api/projects/my-projects`)
2. Can update project (`PATCH /api/projects/:id`)
3. Can submit updates for review (`POST /api/projects/:id/submit`)
4. "Update Project" button works on project page

**What They Can Do:**
- ✅ Edit project details
- ✅ Update description, images, links
- ✅ Submit changes for admin review
- ✅ Manage their project listing

**What They Cannot Do:**
- ❌ Delete project (unless they're admin)
- ❌ Bypass review process for updates

### For Other Claimants

**If Their Claim Was Rejected:**
- Claim status: `'rejected'`
- Rejection reason: "Another claim for this project was approved"
- Can see this in their claim status
- Cannot re-submit (project now has owner)

---

## 🔄 Re-Submission After Rejection

### Scenario: User's Claim Was Rejected

1. **User sees rejection:**
   - Status: `'rejected'`
   - Rejection reason displayed

2. **User can submit new claim:**
   - Previous rejected claim doesn't block new submission
   - Can provide better proof
   - New claim starts fresh as `pending`

3. **Why allow re-submission?**
   - User might have better proof
   - Admin might have made mistake
   - Fair to give second chance

---

## 🛡️ Security & Data Integrity

### Atomic Operations
- Approval uses database transaction
- Either all changes succeed or none do
- Prevents partial updates

### Race Condition Protection
- Transaction ensures only one claim can be approved
- Checks project ownership before approval
- Rejects other claims atomically

### Data Consistency
- Unique constraint: `[projectId, userId]` prevents duplicates
- Foreign keys ensure referential integrity
- Cascade deletes maintain data cleanliness

---

## 📝 Example Flow Diagram

```
User Journey:
┌─────────────────┐
│ View Project    │
│ (no owner)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "Update   │
│ Project"        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Not Logged In?  │ YES  │ Redirect Login  │
└────────┬────────┘      └─────────────────┘
         │ NO
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Own Project?    │ YES  │ Edit Project     │
└────────┬────────┘      └─────────────────┘
         │ NO
         ▼
┌─────────────────┐
│ Submit Claim    │
│ Form            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Claim: Pending  │
│ (waiting)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Admin Reviews   │─────▶│ Approve/Reject  │
└────────┬────────┘      └─────────────────┘
         │
         ▼
    ┌────────┐
    │Approved│ ───▶ Project Owned ───▶ Can Update
    └────────┘
    ┌────────┐
    │Rejected│ ───▶ Can Re-submit
    └────────┘
```

---

## 🎯 Key Design Decisions

### Why Require Admin Approval?
- **Security**: Prevents unauthorized ownership claims
- **Verification**: Admins verify proof of ownership
- **Quality**: Ensures legitimate owners only

### Why Allow Multiple Claims?
- **Fairness**: Multiple legitimate owners might exist
- **Competition**: Best proof wins
- **Transparency**: All claims visible to admin

### Why Auto-Reject Others on Approval?
- **Data Integrity**: Only one owner per project
- **Clarity**: Clear ownership transfer
- **Efficiency**: No manual cleanup needed

### Why Allow Re-Submission?
- **Fairness**: Users can improve their proof
- **Flexibility**: Admin might have made mistake
- **User Experience**: Second chances

---

## 📋 Summary

**The claim process is:**
1. **User-initiated**: Users submit claims for unowned projects
2. **Admin-reviewed**: All claims require admin approval/rejection
3. **Atomic**: Ownership transfer happens in single transaction
4. **Secure**: Multiple validation checks prevent abuse
5. **Fair**: Multiple users can claim, best proof wins
6. **Reversible**: Users can re-submit after rejection

**The result:**
- Legitimate owners can claim and manage their projects
- Existing project submission/update flows remain unchanged
- System maintains data integrity and security

