import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import styles from './NotificationBanner.module.css';

interface NotificationBannerProps {
  message: string | null;
  onClose: () => void;
  autoDismissMs?: number;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  onClose,
  autoDismissMs = 4000,
}) => {
  useEffect(() => {
    if (!message || autoDismissMs <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [message, autoDismissMs, onClose]);

  if (!message) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <CheckCircle2 size={18} className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Bildirimi kapat"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};
