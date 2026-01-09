# Project Claim Feature - Backend Testing Guide

## Prerequisites

### 1. Run Database Migration

First, create and run the migration for the new `ProjectClaim` model:

```bash
cd server
npx prisma migrate dev --name add_project_claims
npx prisma generate
```

This will:
- Create the `ClaimStatus` enum
- Create the `project_claims` table
- Add relations to `User` and `Project` models

### 2. Start the Development Server

```bash
npm run dev
```

The server should start on `http://localhost:3000` (or your configured port).

### 3. Get Authentication Tokens

You'll need tokens for:
- **Regular User**: To submit claims
- **Admin/Moderator User**: To approve/reject claims

---

## Testing Methods

### Method 1: Using VS Code REST Client (Recommended)

The project already has `test-api.http` file. Add these new endpoints:

**Add to `test-api.http`:**

```http
### ============================================
### Project Claim Endpoints
### ============================================

### Submit Claim
POST {{baseUrl}}/projects/{{projectId}}/claim
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "proofOfOwnership": "I am the founder of this project. I can verify ownership through our website admin panel and social media accounts."
}

### Get Claim Status
GET {{baseUrl}}/projects/{{projectId}}/claim/status
Authorization: Bearer {{accessToken}}

### List Claims (Admin)
GET {{baseUrl}}/admin/claims
Authorization: Bearer {{adminToken}}

### List Claims with Filters (Admin)
GET {{baseUrl}}/admin/claims?status=pending&page=1&limit=20
Authorization: Bearer {{adminToken}}

### Get Claim by ID (Admin)
GET {{baseUrl}}/admin/claims/{{claimId}}
Authorization: Bearer {{adminToken}}

### Approve Claim (Admin)
POST {{baseUrl}}/admin/claims/{{claimId}}/approve
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "notes": "Verified ownership via email confirmation"
}

### Reject Claim (Admin)
POST {{baseUrl}}/admin/claims/{{claimId}}/reject
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "reason": "Insufficient proof of ownership provided"
}
```

**To use:**
1. Install "REST Client" extension in VS Code
2. Set variables at the top of the file:
   - `@accessToken` - Regular user token
   - `@adminToken` - Admin user token
   - `@projectId` - ID of a project without owner
   - `@claimId` - ID of a claim (after creating one)
3. Click "Send Request" above each endpoint

---

### Method 2: Using cURL

#### Step 1: Get Authentication Tokens

```bash
# Register a regular user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'

# Login to get token (save the accessToken from response)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "Test123!@#"
  }'

# Register an admin user (or update existing user to admin in database)
# Then login to get admin token
```

#### Step 2: Find a Project Without Owner

```bash
# List projects and find one with userId: null
curl http://localhost:3000/api/projects?page=1&limit=10

# Or get a specific project
curl http://localhost:3000/api/projects/{projectId}
```

#### Step 3: Test Claim Submission

```bash
# Submit a claim
curl -X POST http://localhost:3000/api/projects/{projectId}/claim \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {userToken}" \
  -d '{
    "proofOfOwnership": "I am the owner of this project"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "Claim submitted successfully",
    "claim": {
      "id": "clx...",
      "status": "pending",
      "projectId": "...",
      "userId": "...",
      "createdAt": "2024-..."
    }
  }
}
```

#### Step 4: Check Claim Status

```bash
curl http://localhost:3000/api/projects/{projectId}/claim/status \
  -H "Authorization: Bearer {userToken}"
```

#### Step 5: Admin - List Claims

```bash
curl http://localhost:3000/api/admin/claims?status=pending \
  -H "Authorization: Bearer {adminToken}"
```

#### Step 6: Admin - Approve Claim

```bash
curl -X POST http://localhost:3000/api/admin/claims/{claimId}/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {adminToken}" \
  -d '{
    "notes": "Verified ownership"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Claim approved and project ownership transferred",
    "claim": {
      "id": "...",
      "status": "approved",
      ...
    }
  }
}
```

**Verify ownership transfer:**
```bash
# Check project now has userId set
curl http://localhost:3000/api/projects/{projectId}
```

#### Step 7: Admin - Reject Claim

```bash
curl -X POST http://localhost:3000/api/admin/claims/{claimId}/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {adminToken}" \
  -d '{
    "reason": "Insufficient proof of ownership"
  }'
```

---

## Complete Test Scenarios

### Scenario 1: Happy Path - Successful Claim

1. **Setup:**
   - Create a project without owner (or find existing one)
   - Register/login as regular user
   - Register/login as admin

2. **Steps:**
   ```bash
   # 1. Submit claim
   POST /api/projects/{projectId}/claim
   Body: { "proofOfOwnership": "I own this project" }
   
   # 2. Check claim status
   GET /api/projects/{projectId}/claim/status
   # Should return: { "status": "pending" }
   
   # 3. Admin lists claims
   GET /api/admin/claims?status=pending
   # Should see the claim
   
   # 4. Admin approves claim
   POST /api/admin/claims/{claimId}/approve
   
   # 5. Verify ownership transfer
   GET /api/projects/{projectId}
   # Should show userId is now set
   
   # 6. User can now update project
   PATCH /api/projects/{projectId}
   Authorization: Bearer {userToken}
   # Should succeed
   ```

### Scenario 2: Reject Claim

1. **Steps:**
   ```bash
   # 1. Submit claim
   POST /api/projects/{projectId}/claim
   
   # 2. Admin rejects claim
   POST /api/admin/claims/{claimId}/reject
   Body: { "reason": "Insufficient proof" }
   
   # 3. Check claim status
   GET /api/projects/{projectId}/claim/status
   # Should return: { "status": "rejected", "rejectionReason": "..." }
   
   # 4. Verify project still has no owner
   GET /api/projects/{projectId}
   # userId should still be null
   ```

### Scenario 3: Duplicate Claim Prevention

1. **Steps:**
   ```bash
   # 1. Submit first claim
   POST /api/projects/{projectId}/claim
   # Should succeed
   
   # 2. Try to submit another claim for same project
   POST /api/projects/{projectId}/claim
   # Should fail with: "You already have a pending claim for this project"
   ```

### Scenario 4: Claim Already Owned Project

1. **Steps:**
   ```bash
   # 1. Create project with owner
   POST /api/projects/submit
   # Creates project with userId set
   
   # 2. Try to claim it
   POST /api/projects/{projectId}/claim
   # Should fail with: "This project already has an owner"
   ```

### Scenario 5: Multiple Users Claim Same Project

1. **Steps:**
   ```bash
   # 1. User A submits claim
   POST /api/projects/{projectId}/claim
   Authorization: Bearer {userAToken}
   
   # 2. User B submits claim
   POST /api/projects/{projectId}/claim
   Authorization: Bearer {userBToken}
   # Should succeed (both can claim)
   
   # 3. Admin approves User A's claim
   POST /api/admin/claims/{claimAId}/approve
   
   # 4. Check User B's claim
   GET /api/admin/claims/{claimBId}
   # Should show status: "rejected"
   # rejectionReason: "Another claim for this project was approved"
   ```

### Scenario 6: Re-submit After Rejection

1. **Steps:**
   ```bash
   # 1. Submit claim
   POST /api/projects/{projectId}/claim
   
   # 2. Admin rejects it
   POST /api/admin/claims/{claimId}/reject
   
   # 3. User can submit new claim
   POST /api/projects/{projectId}/claim
   # Should succeed (re-submission allowed)
   ```

---

## Error Cases to Test

### 1. Unauthenticated Request
```bash
POST /api/projects/{projectId}/claim
# No Authorization header
# Expected: 401 Unauthorized
```

### 2. Invalid Project ID
```bash
POST /api/projects/invalid-id/claim
Authorization: Bearer {token}
# Expected: 404 Not Found
```

### 3. Project Not Claimable (not published/approved)
```bash
# Create draft project, then try to claim
POST /api/projects/{draftProjectId}/claim
# Expected: 400 "This project is not available for claiming"
```

### 4. Non-Admin Trying to Approve
```bash
POST /api/admin/claims/{claimId}/approve
Authorization: Bearer {regularUserToken}
# Expected: 403 Forbidden
```

### 5. Invalid Claim ID
```bash
GET /api/admin/claims/invalid-id
Authorization: Bearer {adminToken}
# Expected: 404 Not Found
```

### 6. Approve Already Approved Claim
```bash
POST /api/admin/claims/{approvedClaimId}/approve
# Expected: 400 "Cannot approve claim with status: approved"
```

### 7. Missing Rejection Reason
```bash
POST /api/admin/claims/{claimId}/reject
Body: {}
# Expected: 400 Validation Error
```

---

## Database Verification

### Check Claims in Database

```bash
# Using Prisma Studio
npm run db:studio

# Or using SQL
# Connect to your database and run:
SELECT * FROM project_claims;
SELECT * FROM project_claims WHERE status = 'pending';
```

### Verify Ownership Transfer

```sql
-- Before approval
SELECT id, name, "userId" FROM projects WHERE id = '{projectId}';
-- userId should be NULL

-- After approval
SELECT id, name, "userId" FROM projects WHERE id = '{projectId}';
-- userId should be set to claimer's user ID
```

---

## Automated Testing Script

Create `test-claims.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Testing Project Claim Feature..."

# Register users
echo "📝 Registering users..."
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"claimuser@test.com","password":"Test123!@#","name":"Claim User"}')
USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.data.accessToken')

ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Test123!@#","name":"Admin User"}')
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.accessToken')

# TODO: Update admin user role in database
echo "⚠️  Note: Update admin user role to 'admin' in database"

# Find a project without owner
echo "🔍 Finding project without owner..."
PROJECTS=$(curl -s "$BASE_URL/projects?page=1&limit=10")
PROJECT_ID=$(echo $PROJECTS | jq -r '.data[0].id')

# Submit claim
echo "📤 Submitting claim..."
CLAIM_RESPONSE=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/claim" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"proofOfOwnership":"Test proof"}')
CLAIM_ID=$(echo $CLAIM_RESPONSE | jq -r '.data.claim.id')

if [ "$CLAIM_ID" != "null" ] && [ ! -z "$CLAIM_ID" ]; then
  echo -e "${GREEN}✓${NC} Claim submitted: $CLAIM_ID"
else
  echo -e "${RED}✗${NC} Failed to submit claim"
  echo $CLAIM_RESPONSE
  exit 1
fi

# Check claim status
echo "🔍 Checking claim status..."
STATUS_RESPONSE=$(curl -s "$BASE_URL/projects/$PROJECT_ID/claim/status" \
  -H "Authorization: Bearer $USER_TOKEN")
STATUS=$(echo $STATUS_RESPONSE | jq -r '.data.status')

if [ "$STATUS" = "pending" ]; then
  echo -e "${GREEN}✓${NC} Claim status is pending"
else
  echo -e "${RED}✗${NC} Unexpected status: $STATUS"
fi

# Admin lists claims
echo "📋 Admin listing claims..."
ADMIN_LIST=$(curl -s "$BASE_URL/admin/claims?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "✅ Test completed!"
echo "Claim ID: $CLAIM_ID"
echo "Project ID: $PROJECT_ID"
echo ""
echo "Next steps:"
echo "1. Update admin user role in database"
echo "2. Approve claim: POST /api/admin/claims/$CLAIM_ID/approve"
```

Make it executable:
```bash
chmod +x test-claims.sh
./test-claims.sh
```

---

## Postman Collection

You can also create a Postman collection with these requests:

1. **Environment Variables:**
   - `baseUrl`: `http://localhost:3000/api`
   - `userToken`: (set after login)
   - `adminToken`: (set after login)
   - `projectId`: (set after finding project)
   - `claimId`: (set after submitting claim)

2. **Collection Structure:**
   ```
   Project Claims
   ├── Submit Claim
   ├── Get Claim Status
   ├── List Claims (Admin)
   ├── Get Claim by ID (Admin)
   ├── Approve Claim (Admin)
   └── Reject Claim (Admin)
   ```

---

## Testing Checklist

- [ ] **Migration runs successfully**
- [ ] **Submit claim** - Works for unowned project
- [ ] **Submit claim** - Fails for owned project
- [ ] **Submit claim** - Fails for draft/unpublished project
- [ ] **Get claim status** - Returns correct status
- [ ] **Duplicate claim** - Prevents multiple pending claims
- [ ] **List claims** - Admin can see all claims
- [ ] **Filter claims** - Status filter works
- [ ] **Approve claim** - Transfers ownership
- [ ] **Approve claim** - Rejects other pending claims
- [ ] **Reject claim** - Sets rejection reason
- [ ] **Re-submit claim** - Works after rejection
- [ ] **Authorization** - Non-admin can't approve/reject
- [ ] **After approval** - User can update project
- [ ] **After approval** - User can submit for review

---

## Common Issues & Solutions

### Issue: "Cannot find module '@prisma/client'"
**Solution:** Run `npx prisma generate`

### Issue: "Table 'project_claims' does not exist"
**Solution:** Run `npx prisma migrate dev`

### Issue: "Insufficient permissions" when approving
**Solution:** Ensure user role is 'admin' or 'moderator' in database

### Issue: "Project already has an owner"
**Solution:** Find a project with `userId: null` in database

### Issue: "This project is not available for claiming"
**Solution:** Ensure project has `published: true` and `status: 'approved'`

---

## Next Steps After Testing

Once backend testing is complete:

1. ✅ All endpoints work correctly
2. ✅ Error handling is proper
3. ✅ Authorization works
4. ✅ Database changes are correct
5. ✅ Edge cases are handled

Then proceed with frontend implementation using the `FRONTEND_IMPLEMENTATION_GUIDE.md`.

