import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Eye, CheckCircle2, XCircle, ShieldOff } from 'lucide-react';
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminTabs,
  statusToBadgeVariant,
} from '../../components/admin/AdminUI';
import { useFeedback } from '../../contexts/FeedbackContext';

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
  const { alert, confirm } = useFeedback();
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`${API_URL}/api/admin/claims${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    const ok = await confirm({
      title: 'Approve Claim',
      message: 'Are you sure you want to approve this claim? This will transfer project ownership.',
    });
    if (!ok) return;

    setActionLoading(claimId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/claims/${claimId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await alert({ message: 'Claim approved and ownership transferred!', variant: 'success' });
        fetchClaims();
      } else {
        const data = await response.json();
        await alert({ message: data.error?.message || 'Failed to approve claim', variant: 'error' });
      }
    } catch (error) {
      console.error('Error approving claim:', error);
      await alert({ message: 'An error occurred', variant: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowRejectModal(true);
  };

  const handleRevoke = (claim: Claim) => {
    setSelectedClaim(claim);
    setRevokeReason('');
    setShowRevokeModal(true);
  };

  const submitRevoke = async () => {
    if (!selectedClaim) return;

    setActionLoading(selectedClaim.id);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/claims/${selectedClaim.id}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: revokeReason.trim() || undefined }),
      });

      if (response.ok) {
        await alert({ message: 'Ownership claim revoked', variant: 'success' });
        setShowRevokeModal(false);
        setRevokeReason('');
        setSelectedClaim(null);
        fetchClaims();
      } else {
        const data = await response.json();
        await alert({ message: data.error?.message || 'Failed to revoke claim', variant: 'error' });
      }
    } catch (error) {
      console.error('Error revoking claim:', error);
      await alert({ message: 'An error occurred', variant: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const submitRejection = async () => {
    if (!selectedClaim || !rejectionReason.trim()) {
      await alert({ message: 'Please provide a rejection reason', variant: 'warning' });
      return;
    }

    setActionLoading(selectedClaim.id);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/claims/${selectedClaim.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        await alert({ message: 'Claim rejected', variant: 'success' });
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedClaim(null);
        fetchClaims();
      } else {
        const data = await response.json();
        await alert({ message: data.error?.message || 'Failed to reject claim', variant: 'error' });
      }
    } catch (error) {
      console.error('Error rejecting claim:', error);
      await alert({ message: 'An error occurred', variant: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingCount = claims.filter((c) => c.status === 'pending').length;

  if (loading) {
    return <AdminLoading message="Loading claims..." />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Ownership Claims"
        subtitle="Review and manage project ownership claim requests"
      />

      <AdminTabs
        tabs={[
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'Pending', badge: pendingCount },
          { id: 'approved', label: 'Approved' },
          { id: 'rejected', label: 'Rejected' },
        ]}
        active={filter}
        onChange={setFilter}
      />

      {claims.length === 0 ? (
        <AdminEmptyState
          icon={ClipboardList}
          title={`No ${filter !== 'all' ? filter : ''} claims`.trim()}
          description={`There are no ${filter !== 'all' ? filter : ''} ownership claims at the moment.`}
        />
      ) : (
        <div className="admin-list">
          {claims.map((claim) => {
            const busy = actionLoading === claim.id;
            return (
              <div key={claim.id} className="admin-list-card">
                <div className="admin-list-card-inner">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <h2 className="admin-list-card-title">{claim.project.name}</h2>
                      <AdminBadge variant={statusToBadgeVariant(claim.status)}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </AdminBadge>
                    </div>

                    <div className="admin-list-card-meta" style={{ marginBottom: '1rem' }}>
                      <span><strong>Claimant:</strong> {claim.user.name || claim.user.email}</span>
                      <span><strong>Email:</strong> {claim.user.email}</span>
                      <span><strong>Submitted:</strong> {formatDate(claim.createdAt)}</span>
                    </div>

                    <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6b7280', margin: '0 0 0.375rem' }}>
                      Proof of Ownership
                    </p>
                    <p className="admin-proof-box">{claim.proofOfOwnership || 'No proof provided'}</p>

                    {claim.status === 'rejected' && claim.rejectionReason && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6b7280', margin: '0 0 0.375rem' }}>
                          Rejection Reason
                        </p>
                        <p className="admin-proof-box" style={{ color: '#991b1b', background: '#fef2f2', borderColor: '#fecaca' }}>
                          {claim.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="admin-actions-col">
                    <Link
                      to={`/project/${claim.project.slug}`}
                      target="_blank"
                      className="admin-btn admin-btn-ghost admin-btn-block"
                    >
                      <Eye size={15} strokeWidth={1.75} />
                      View Project
                    </Link>

                    {claim.status === 'pending' && (
                      <>
                        <AdminButton
                          variant="success"
                          block
                          icon={CheckCircle2}
                          onClick={() => handleApprove(claim.id)}
                          disabled={busy}
                        >
                          Approve Claim
                        </AdminButton>

                        <AdminButton
                          variant="danger"
                          block
                          icon={XCircle}
                          onClick={() => handleReject(claim)}
                          disabled={busy}
                        >
                          Reject Claim
                        </AdminButton>
                      </>
                    )}

                    {claim.status === 'approved' && (
                      <AdminButton
                        variant="danger"
                        block
                        icon={ShieldOff}
                        onClick={() => handleRevoke(claim)}
                        disabled={busy}
                      >
                        Revoke Claim
                      </AdminButton>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showRejectModal && selectedClaim && (
        <AdminModal
          title="Reject Claim"
          description={`Provide a reason for rejecting ${selectedClaim.user.name || selectedClaim.user.email}'s claim for ${selectedClaim.project.name}.`}
          onClose={() => {
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedClaim(null);
          }}
        >
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Insufficient proof of ownership. Please provide additional verification..."
            rows={6}
            className="admin-textarea"
          />

          <div className="admin-form-actions">
            <AdminButton
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedClaim(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={submitRejection}
              disabled={actionLoading === selectedClaim.id}
            >
              {actionLoading === selectedClaim.id ? 'Rejecting...' : 'Reject Claim'}
            </AdminButton>
          </div>
        </AdminModal>
      )}

      {showRevokeModal && selectedClaim && (
        <AdminModal
          title="Revoke Claim"
          description={`Are you sure? This will remove ${selectedClaim.user.name || selectedClaim.user.email}'s ownership of ${selectedClaim.project.name}.`}
          onClose={() => {
            setShowRevokeModal(false);
            setRevokeReason('');
            setSelectedClaim(null);
          }}
        >
          <label htmlFor="revoke-reason" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            Reason (optional)
          </label>
          <textarea
            id="revoke-reason"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="e.g. Ownership could not be verified..."
            rows={6}
            className="admin-textarea"
          />

          <div className="admin-form-actions">
            <AdminButton
              variant="ghost"
              onClick={() => {
                setShowRevokeModal(false);
                setRevokeReason('');
                setSelectedClaim(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={submitRevoke}
              disabled={actionLoading === selectedClaim.id}
            >
              {actionLoading === selectedClaim.id ? 'Revoking...' : 'Revoke Claim'}
            </AdminButton>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
