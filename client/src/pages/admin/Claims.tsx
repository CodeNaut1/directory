import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Claim {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  proofOfOwnership: string;
  createdAt: string;
  moderatedAt: string | null;
  rejectionReason: string | null;
  project: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function Claims() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`${API_URL}/api/admin/claims${statusParam}`, {
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
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Claim approved and ownership transferred!');
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

  const handleReject = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!selectedClaim || !rejectionReason.trim()) {
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
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        alert('Claim rejected');
        setShowRejectModal(false);
        setRejectionReason('');
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', color: '#92400E', text: 'Pending' };
      case 'approved':
        return { bg: '#D1FAE5', color: '#065F46', text: 'Approved' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B', text: 'Rejected' };
      default:
        return { bg: '#F3F4F6', color: '#1F2937', text: status };
    }
  };

  const pendingCount = claims.filter(c => c.status === 'pending').length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6B7280' }}>Loading claims...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0' }}>
          Project Ownership Claims
        </h1>
        <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0 }}>
          Review and manage project ownership claim requests
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #E5E7EB' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: filter === tab ? '2px solid #FD5A47' : '2px solid transparent',
              color: filter === tab ? '#FD5A47' : '#6B7280',
              fontSize: '0.9375rem',
              fontWeight: filter === tab ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'pending' && pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '3rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
            No {filter !== 'all' ? filter : ''} claims
          </h2>
          <p style={{ color: '#6B7280' }}>There are no {filter !== 'all' ? filter : ''} ownership claims at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {claims.map((claim) => {
            const statusBadge = getStatusBadge(claim.status);
            return (
              <div key={claim.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  {/* Claim Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                        {claim.project.name}
                      </h2>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: statusBadge.bg,
                        color: statusBadge.color,
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {statusBadge.text}
                      </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 0.5rem 0' }}>
                        <strong style={{ color: '#1F2937' }}>Claimant:</strong> {claim.user.name || claim.user.email}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 0.5rem 0' }}>
                        <strong style={{ color: '#1F2937' }}>Email:</strong> {claim.user.email}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                        <strong style={{ color: '#1F2937' }}>Submitted:</strong> {formatDate(claim.createdAt)}
                      </p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                        Proof of Ownership:
                      </p>
                      <p style={{ fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.6, background: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}>
                        {claim.proofOfOwnership || 'No proof provided'}
                      </p>
                    </div>

                    {claim.status === 'rejected' && claim.rejectionReason && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                          Rejection Reason:
                        </p>
                        <p style={{ fontSize: '0.9375rem', color: '#991B1B', lineHeight: 1.6, background: '#FEE2E2', padding: '1rem', borderRadius: '8px' }}>
                          {claim.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
                    <Link
                      to={`/project/${claim.project.slug}`}
                      target="_blank"
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#F3F4F6',
                        color: '#1F2937',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    >
                      👁️ View Project
                    </Link>

                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(claim.id)}
                          disabled={actionLoading === claim.id}
                          style={{
                            padding: '0.75rem 1rem',
                            background: actionLoading === claim.id ? '#D1D5DB' : '#10B981',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: actionLoading === claim.id ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (actionLoading !== claim.id) e.currentTarget.style.background = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            if (actionLoading !== claim.id) e.currentTarget.style.background = '#10B981';
                          }}
                        >
                          ✅ Approve Claim
                        </button>

                        <button
                          onClick={() => handleReject(claim)}
                          disabled={actionLoading === claim.id}
                          style={{
                            padding: '0.75rem 1rem',
                            background: actionLoading === claim.id ? '#D1D5DB' : '#EF4444',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: actionLoading === claim.id ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (actionLoading !== claim.id) e.currentTarget.style.background = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            if (actionLoading !== claim.id) e.currentTarget.style.background = '#EF4444';
                          }}
                        >
                          ❌ Reject Claim
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedClaim && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
              Reject Claim
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#6B7280', marginBottom: '1.5rem' }}>
              Provide a reason for rejecting <strong>{selectedClaim.user.name || selectedClaim.user.email}</strong>'s claim for <strong>{selectedClaim.project.name}</strong>.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Insufficient proof of ownership. Please provide additional verification..."
              rows={6}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '0.9375rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '1.5rem',
              }}
            />

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedClaim(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#FFFFFF',
                  color: '#1F2937',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={actionLoading === selectedClaim.id}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: actionLoading === selectedClaim.id ? '#D1D5DB' : '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
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