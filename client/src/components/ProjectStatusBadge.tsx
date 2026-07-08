import { BadgeCheck, Clock, XCircle, EyeOff, type LucideIcon } from 'lucide-react';

export type ProjectStatus = 'verified' | 'under_review' | 'needs_update' | 'rejected' | 'unpublished';

interface StatusConfig {
  label: string;
  color: string;
  background: string;
  border: string;
  icon: LucideIcon;
}

const STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  verified: {
    label: 'Verified',
    color: '#064E3B',
    background: '#ECFDF5',
    border: '#6EE7B7',
    icon: BadgeCheck,
  },
  under_review: {
    label: 'Under Review',
    color: '#92400E',
    background: '#FFFBEB',
    border: '#FDE68A',
    icon: Clock,
  },
  needs_update: {
    label: 'Needs Update',
    color: '#92400E',
    background: '#FFFBEB',
    border: '#FDE68A',
    icon: Clock,
  },
  rejected: {
    label: 'Rejected',
    color: '#991B1B',
    background: '#FEF2F2',
    border: '#FECACA',
    icon: XCircle,
  },
  unpublished: {
    label: 'Unpublished',
    color: '#374151',
    background: '#F3F4F6',
    border: '#D1D5DB',
    icon: EyeOff,
  },
};

const BADGE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.625rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  padding: '0.25rem 0.75rem',
  borderRadius: 12,
};

export default function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      style={{
        ...BADGE_STYLE,
        color: config.color,
        background: config.background,
        border: `1px solid ${config.border}`,
      }}
    >
      <Icon size={11} strokeWidth={2.25} />
      {config.label}
    </span>
  );
}
