import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import '../styles/feedback-modal.css';

type FeedbackVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
  title?: string;
  message: string;
  variant?: FeedbackVariant;
  confirmLabel?: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
}

interface FeedbackContextValue {
  alert: (options: AlertOptions | string) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

type ModalState =
  | { type: 'alert'; options: AlertOptions }
  | { type: 'confirm'; options: ConfirmOptions };

const VARIANT_ICON = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const DEFAULT_TITLES: Record<FeedbackVariant, string> = {
  success: 'Success',
  error: 'Something went wrong',
  warning: 'Please note',
  info: 'Notice',
};

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    setModal(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  useEffect(() => {
    if (!modal) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close(modal.type === 'confirm' ? false : true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal, close]);

  const alert = useCallback((options: AlertOptions | string) => {
    const normalized = typeof options === 'string' ? { message: options } : options;
    return new Promise<void>((resolve) => {
      resolveRef.current = () => resolve();
      setModal({ type: 'alert', options: normalized });
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setModal({ type: 'confirm', options });
    });
  }, []);

  const renderModal = () => {
    if (!modal) return null;

    if (modal.type === 'alert') {
      const variant = modal.options.variant ?? 'info';
      const Icon = VARIANT_ICON[variant];
      const title = modal.options.title ?? DEFAULT_TITLES[variant];

      return (
        <div
          className="feedback-modal-overlay"
          onClick={() => close(true)}
          role="presentation"
        >
          <div
            className="feedback-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`feedback-modal-icon ${variant}`}>
              <Icon size={24} strokeWidth={1.75} />
            </div>
            <h2 id="feedback-modal-title" className="feedback-modal-title">
              {title}
            </h2>
            <p className="feedback-modal-message">{modal.options.message}</p>
            <div className="feedback-modal-actions">
              <button
                type="button"
                className={`feedback-modal-btn feedback-modal-btn-${variant === 'error' ? 'primary' : variant === 'success' ? 'success' : 'primary'}`}
                onClick={() => close(true)}
                autoFocus
              >
                {modal.options.confirmLabel ?? 'OK'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    const { options } = modal;
    const variant = options.variant ?? 'primary';

    return (
      <div className="feedback-modal-overlay" role="presentation">
        <div
          className="feedback-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="feedback-modal-icon warning">
            <AlertTriangle size={24} strokeWidth={1.75} />
          </div>
          <h2 id="feedback-modal-title" className="feedback-modal-title">
            {options.title}
          </h2>
          <p className="feedback-modal-message">{options.message}</p>
          <div className="feedback-modal-actions">
            <button
              type="button"
              className="feedback-modal-btn feedback-modal-btn-cancel"
              onClick={() => close(false)}
            >
              {options.cancelLabel ?? 'Cancel'}
            </button>
            <button
              type="button"
              className={`feedback-modal-btn feedback-modal-btn-${variant}`}
              onClick={() => close(true)}
              autoFocus
            >
              {options.confirmLabel ?? 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <FeedbackContext.Provider value={{ alert, confirm }}>
      {children}
      {renderModal()}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}
