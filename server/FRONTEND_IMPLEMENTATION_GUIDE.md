# Project Claim Feature - Frontend Implementation Guide

## Overview

This guide outlines all frontend changes needed to complete the Project Claim feature. The backend is already implemented and ready to use.

---

## 📋 Required Frontend Changes

### 1. **Update `ViewProject.tsx` - Add "Update Project" Button**

**Location:** `client/src/pages/ViewProject.tsx`

**Changes Needed:**

1. **Import Auth Context:**
   ```typescript
   import { useAuth } from '../contexts/AuthContext';
   import { useNavigate } from 'react-router-dom';
   ```

2. **Add State for Claim Status:**
   ```typescript
   const { user } = useAuth();
   const navigate = useNavigate();
   const [claimStatus, setClaimStatus] = useState<{
     status: 'pending' | 'approved' | 'rejected' | null;
     rejectionReason?: string;
   } | null>(null);
   const [isOwner, setIsOwner] = useState(false);
   const [checkingOwnership, setCheckingOwnership] = useState(false);
   ```

3. **Add Function to Check Ownership & Claim Status:**
   ```typescript
   useEffect(() => {
     const checkOwnershipAndClaim = async () => {
       if (!user || !project?.id) return;
       
       setCheckingOwnership(true);
       try {
         const token = localStorage.getItem('access_token');
         
         // Check if user owns the project (via my-projects endpoint)
         const myProjectsRes = await fetch(`${API_URL}/api/projects/my-projects`, {
           headers: { 'Authorization': `Bearer ${token}` },
         });
         
         if (myProjectsRes.ok) {
           const myProjectsData = await myProjectsRes.json();
           const ownsProject = myProjectsData.data?.some((p: any) => p.id === project.id);
           setIsOwner(ownsProject);
           
           // If not owner, check claim status
           if (!ownsProject) {
             const claimRes = await fetch(`${API_URL}/api/projects/${project.id}/claim/status`, {
               headers: { 'Authorization': `Bearer ${token}` },
             });
             
             if (claimRes.ok) {
               const claimData = await claimRes.json();
               if (claimData.success && claimData.data) {
                 setClaimStatus({
                   status: claimData.data.status,
                   rejectionReason: claimData.data.rejectionReason || undefined,
                 });
               }
             }
           }
         }
       } catch (error) {
         console.error('Error checking ownership:', error);
       } finally {
         setCheckingOwnership(false);
       }
     };
     
     checkOwnershipAndClaim();
   }, [user, project?.id]);
   ```

4. **Add "Update Project" Button in Action Buttons Section:**
   ```typescript
   {/* Add after existing action buttons, around line 309 */}
   {user && (
     <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
       {isOwner ? (
         <button
           onClick={() => navigate(`/edit-project/${project.id}`)}
           style={{
             display: 'inline-flex',
             alignItems: 'center',
             gap: '0.5rem',
             padding: '0.75rem 1.5rem',
             background: '#FD5A47',
             color: '#FFFFFF',
             borderRadius: '8px',
             fontSize: '0.9375rem',
             fontWeight: 600,
             border: 'none',
             cursor: 'pointer',
             transition: 'background 0.2s',
           }}
         >
           Update Project
         </button>
       ) : claimStatus?.status === 'pending' ? (
         <div style={{ padding: '1rem', background: '#FFF4E6', borderRadius: '8px', color: '#B54708' }}>
           <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
             ⏳ Your claim is pending review
           </p>
         </div>
       ) : claimStatus?.status === 'rejected' ? (
         <div>
           <div style={{ padding: '1rem', background: '#FEF3F2', borderRadius: '8px', color: '#B42318', marginBottom: '0.5rem' }}>
             <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
               ❌ Your claim was rejected
             </p>
             {claimStatus.rejectionReason && (
               <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem' }}>
                 Reason: {claimStatus.rejectionReason}
               </p>
             )}
           </div>
           <button
             onClick={() => navigate(`/claim-project/${project.id}`)}
             style={{
               padding: '0.75rem 1.5rem',
               background: '#FD5A47',
               color: '#FFFFFF',
               borderRadius: '8px',
               fontSize: '0.9375rem',
               fontWeight: 600,
               border: 'none',
               cursor: 'pointer',
             }}
           >
             Submit New Claim
           </button>
         </div>
       ) : (
         <button
           onClick={() => navigate(`/claim-project/${project.id}`)}
           style={{
             padding: '0.75rem 1.5rem',
             background: '#FD5A47',
             color: '#FFFFFF',
             borderRadius: '8px',
             fontSize: '0.9375rem',
             fontWeight: 600,
             border: 'none',
             cursor: 'pointer',
           }}
         >
           Claim & Update Project
         </button>
       )}
     </div>
   )}
   ```

---

### 2. **Create `ClaimProject.tsx` Page**

**Location:** `client/src/pages/ClaimProject.tsx`

**New File - Complete Implementation:**

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ClaimProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [project, setProject] = useState<any>(null);
  const [proofOfOwnership, setProofOfOwnership] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Claim Project - African Bitcoin Directory";
    
    // Redirect if not logged in
    if (!user) {
      navigate('/login', { state: { from: `/claim-project/${id}` } });
      return;
    }

    // Fetch project details
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setProject(data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/projects/${id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          proofOfOwnership: proofOfOwnership.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/project/${id}`);
        }, 2000);
      } else {
        setError(data.error?.message || data.error || 'Failed to submit claim');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1>Project Not Found</h1>
          <Link to="/">Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link
          to={`/project/${id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#FD5A47',
            textDecoration: 'none',
            marginBottom: '2rem',
            fontSize: '0.9375rem',
          }}
        >
          ← Back to Project
        </Link>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.5rem' }}>
            Claim Project: {project.name}
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
            Provide proof of ownership to claim and manage this project listing.
          </p>

          {success ? (
            <div style={{ padding: '1.5rem', background: '#ECFDF3', borderRadius: '8px', color: '#027A48' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>✅ Claim submitted successfully!</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                Your claim is pending admin review. You'll be redirected shortly...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="proofOfOwnership"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1F2937',
                    marginBottom: '0.5rem',
                  }}
                >
                  Proof of Ownership <span style={{ color: '#6B7280', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  id="proofOfOwnership"
                  value={proofOfOwnership}
                  onChange={(e) => setProofOfOwnership(e.target.value)}
                  placeholder="Provide evidence that you own or represent this project. For example: your role, website ownership, social media accounts, etc."
                  rows={6}
                  maxLength={5000}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.9375rem',
                    border: error ? '2px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FD5A47';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? '#EF4444' : '#D1D5DB';
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>
                  {proofOfOwnership.length} / 5000 characters
                </p>
              </div>

              {error && (
                <div
                  style={{
                    padding: '0.75rem',
                    background: '#FEF3F2',
                    color: '#B42318',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: submitting ? '#D1D5DB' : '#FD5A47',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </button>
                <Link
                  to={`/project/${id}`}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#FFFFFF',
                    color: '#1F2937',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
```

---

### 3. **Create `PendingClaims.tsx` Admin Page**

**Location:** `client/src/pages/admin/PendingClaims.tsx`

**New File - Complete Implementation:**

```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Claim {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  proofOfOwnership: string | null;
  rejectionReason: string | null;
  createdAt: string;
  moderatedAt: string | null;
  project: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function PendingClaims() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const statusParam = statusFilter === 'all' ? '' : `status=${statusFilter}`;
      const response = await fetch(`${API_URL}/api/admin/claims?${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setClaims(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId: string) => {
    if (!confirm('Are you sure you want to approve this claim? This will transfer project ownership.')) return;

    setActionLoading(claimId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/claims/${claimId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        alert('Claim approved successfully!');
        fetchClaims();
      } else {
        const data = await response.json();
        alert(data.error?.message || 'Failed to approve claim');
      }
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim || !rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(selectedClaim.id);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/claims/${selectedClaim.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (response.ok) {
        alert('Claim rejected');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedClaim(null);
        fetchClaims();
      } else {
        const data = await response.json();
        alert(data.error?.message || 'Failed to reject claim');
      }
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937' }}>Project Claims</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.5rem 1rem',
                background: statusFilter === status ? '#FD5A47' : '#FFFFFF',
                color: statusFilter === status ? '#FFFFFF' : '#1F2937',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading claims...</p>
      ) : claims.length === 0 ? (
        <div style={{ background: '#FFFFFF', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: '#6B7280' }}>No claims found</p>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>
                  Project
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>
                  Claimant
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>
                  Submitted
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '1rem' }}>
                    <Link
                      to={`/project/${claim.project.id}`}
                      style={{ color: '#FD5A47', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {claim.project.name}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{claim.user.name || 'No name'}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{claim.user.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background:
                          claim.status === 'approved'
                            ? '#ECFDF3'
                            : claim.status === 'rejected'
                            ? '#FEF3F2'
                            : '#FFF4E6',
                        color:
                          claim.status === 'approved'
                            ? '#027A48'
                            : claim.status === 'rejected'
                            ? '#B42318'
                            : '#B54708',
                      }}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                    {formatDate(claim.createdAt)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {claim.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApprove(claim.id)}
                          disabled={actionLoading === claim.id}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#10B981',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: actionLoading === claim.id ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowRejectModal(true);
                          }}
                          disabled={actionLoading === claim.id}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#EF4444',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: actionLoading === claim.id ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {claim.proofOfOwnership && (
                      <button
                        onClick={() => alert(claim.proofOfOwnership)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#FFFFFF',
                          color: '#1F2937',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          marginTop: '0.5rem',
                          cursor: 'pointer',
                        }}
                      >
                        View Proof
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedClaim && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowRejectModal(false);
            setRejectReason('');
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Reject Claim</h2>
            <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
              Please provide a reason for rejecting this claim:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                marginBottom: '1rem',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#FFFFFF',
                  color: '#1F2937',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === selectedClaim.id || !rejectReason.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: actionLoading === selectedClaim.id ? '#D1D5DB' : '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: actionLoading === selectedClaim.id ? 'not-allowed' : 'pointer',
                }}
              >
                {actionLoading === selectedClaim.id ? 'Rejecting...' : 'Reject Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 4. **Update `App.tsx` - Add Routes**

**Location:** `client/src/App.tsx`

**Add New Routes:**

```typescript
// Add imports at the top
import ClaimProject from './pages/ClaimProject';
import PendingClaims from './pages/admin/PendingClaims';

// Add route in protected routes section (around line 45)
<Route path="/claim-project/:id" element={<ProtectedRoute><ClaimProject /></ProtectedRoute>} />

// Add route in admin routes section (around line 53, inside AdminLayout)
<Route path="claims" element={<PendingClaims />} />
```

**Complete updated App.tsx routes section:**
```typescript
{/* Protected routes */}
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
<Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
<Route path="/project-submitted" element={<ProtectedRoute><SubmitSuccess /></ProtectedRoute>} />
<Route path="/edit-project/:id" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
<Route path="/claim-project/:id" element={<ProtectedRoute><ClaimProject /></ProtectedRoute>} />

{/* Admin routes */}
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="projects/pending" element={<PendingProjects />} />
  <Route path="claims" element={<PendingClaims />} />
</Route>
```

---

### 5. **Update `AdminLayout.tsx` - Add Claims Menu Item**

**Location:** `client/src/components/AdminLayout.tsx`

**Add Navigation Link:**

```typescript
// Add in the navigation menu (around where other admin links are)
<Link
  to="/admin/claims"
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    color: location.pathname === '/admin/claims' ? '#FD5A47' : '#1F2937',
    textDecoration: 'none',
    borderRadius: '6px',
    background: location.pathname === '/admin/claims' ? '#FEF3F2' : 'transparent',
  }}
>
  <span>📋</span>
  <span>Project Claims</span>
</Link>
```

---

### 6. **Optional: Create API Helper Functions**

**Location:** `client/src/utils/api.ts` (or create new `claimApi.ts`)

**Add Helper Functions:**

```typescript
export async function submitClaim(projectId: string, proofOfOwnership?: string) {
  const token = localStorage.getItem('access_token');
  const API_URL = import.meta.env.VITE_API_URL || '';
  
  const response = await fetch(`${API_URL}/api/projects/${projectId}/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ proofOfOwnership }),
  });
  
  return response.json();
}

export async function getClaimStatus(projectId: string) {
  const token = localStorage.getItem('access_token');
  const API_URL = import.meta.env.VITE_API_URL || '';
  
  const response = await fetch(`${API_URL}/api/projects/${projectId}/claim/status`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

---

## ✅ Testing Checklist

After implementing all changes, test:

- [ ] **ViewProject Page:**
  - [ ] "Update Project" button shows for logged-in users
  - [ ] Button redirects to claim form if user doesn't own project
  - [ ] Pending claim status displays correctly
  - [ ] Rejected claim shows rejection reason
  - [ ] Owner can click "Update Project" to edit

- [ ] **ClaimProject Page:**
  - [ ] Form loads project details
  - [ ] Submission works with/without proof
  - [ ] Error handling works
  - [ ] Success message and redirect work
  - [ ] Redirects to login if not authenticated

- [ ] **PendingClaims Admin Page:**
  - [ ] Lists claims with correct filters
  - [ ] Approve button works
  - [ ] Reject modal works
  - [ ] Status badges display correctly
  - [ ] View proof button works

- [ ] **Integration:**
  - [ ] After claim approval, project appears in user dashboard
  - [ ] User can update project after claim approval
  - [ ] User can submit updates for review after claim approval

---

## 📝 Notes

1. **Authentication**: All claim-related endpoints require authentication
2. **Admin Access**: Claims review page requires admin/moderator role
3. **Error Handling**: Implement proper error messages for all API calls
4. **Loading States**: Show loading indicators during API calls
5. **Responsive Design**: Ensure all new pages work on mobile devices

---

## 🎨 Styling Consistency

- Use existing color scheme: `#FD5A47` for primary actions
- Match existing button styles and spacing
- Follow existing card/container patterns
- Use consistent typography (font sizes, weights)

---

This completes all frontend changes needed for the Project Claim feature!

