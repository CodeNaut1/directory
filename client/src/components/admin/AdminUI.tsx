import type { ReactNode, ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

export const ICON_STROKE = 1.75;

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const BADGE_CLASS: Record<BadgeVariant, string> = {
  neutral: 'admin-badge-neutral',
  success: 'admin-badge-success',
  warning: 'admin-badge-warning',
  danger: 'admin-badge-danger',
  info: 'admin-badge-info',
};

type ButtonVariant = 'ghost' | 'primary' | 'success' | 'danger' | 'warning';

const BUTTON_CLASS: Record<ButtonVariant, string> = {
  ghost: 'admin-btn-ghost',
  primary: 'admin-btn-primary',
  success: 'admin-btn-success',
  danger: 'admin-btn-danger',
  warning: 'admin-btn-warning',
};

export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  if (action) {
    return (
      <div className="admin-page-header-row">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className="admin-page-header">
      <h1 className="admin-page-title">{title}</h1>
      {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
    </div>
  );
}

export function AdminLoading({ message = 'Loading...' }: { message?: string }) {
  return <div className="admin-loading">{message}</div>;
}

export function AdminBadge({
  children,
  variant = 'neutral',
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return <span className={`admin-badge ${BADGE_CLASS[variant]}`}>{children}</span>;
}

type AdminButtonProps = {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: LucideIcon;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function AdminButton({
  variant = 'ghost',
  size = 'md',
  block = false,
  icon: Icon,
  children,
  className = '',
  ...props
}: AdminButtonProps) {
  const sizeClass = size === 'sm' ? 'admin-btn-sm' : size === 'lg' ? 'admin-btn-lg' : '';
  const blockClass = block ? 'admin-btn-block' : '';

  return (
    <button
      type="button"
      className={`admin-btn ${BUTTON_CLASS[variant]} ${sizeClass} ${blockClass} ${className}`.trim()}
      {...props}
    >
      {Icon && <Icon size={15} strokeWidth={ICON_STROKE} />}
      {children}
    </button>
  );
}

export function AdminTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; badge?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="admin-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`admin-tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className="admin-tab-badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="admin-empty">
      <div className="admin-empty-icon">
        <Icon size={22} strokeWidth={ICON_STROKE} />
      </div>
      <h2 className="admin-empty-title">{title}</h2>
      <p className="admin-empty-text">{description}</p>
    </div>
  );
}

export function AdminModal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="admin-modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="presentation"
    >
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <h2 id="admin-modal-title" className="admin-modal-title">
          {title}
        </h2>
        {description && <p className="admin-modal-text">{description}</p>}
        {children}
      </div>
    </div>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
    case 'unpublished':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function roleToBadgeVariant(role: string): BadgeVariant {
  switch (role) {
    case 'admin':
      return 'danger';
    case 'moderator':
      return 'warning';
    case 'builder':
      return 'info';
    default:
      return 'neutral';
  }
}
