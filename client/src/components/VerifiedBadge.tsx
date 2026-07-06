import { BadgeCheck } from 'lucide-react';

export const VERIFIED_COLORS = {
  text: '#064E3B',
  background: '#ECFDF5',
  border: '#6EE7B7',
};

export default function VerifiedBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.625rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: VERIFIED_COLORS.text,
        background: VERIFIED_COLORS.background,
        padding: '0.25rem 0.75rem',
        borderRadius: 12,
        border: `1px solid ${VERIFIED_COLORS.border}`,
      }}
    >
      <BadgeCheck size={11} strokeWidth={2.25} />
      Verified
    </span>
  );
}
