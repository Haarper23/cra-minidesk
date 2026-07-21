import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import {
  RepairOrder,
  REPAIR_ORDER_STATUS_LABELS,
  REPAIR_PRIORITY_LABELS,
} from '../types/repairOrderTypes';
import styles from './RepairOrderDetailsDialog.module.css';

interface RepairOrderDetailsDialogProps {
  isOpen: boolean;
  order: RepairOrder | null;
  onClose: () => void;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

function formatCurrency(val?: number | null): string {
  if (val === undefined || val === null) return '-';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(val);
}

export const RepairOrderDetailsDialog: React.FC<RepairOrderDetailsDialogProps> = ({
  isOpen,
  order,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2 id="details-dialog-title" className={styles.title}>
              Servis Kaydı Detayları ({order.orderNumber})
            </h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Kapat">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.content}>
          {/* Summary Grid */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Genel Bilgiler</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Servis No</span>
                <span className={styles.infoValue}>{order.orderNumber}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Durum</span>
                <span className={styles.infoValue}>
                  {REPAIR_ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Öncelik</span>
                <span className={styles.infoValue}>
                  {REPAIR_PRIORITY_LABELS[order.priority] || order.priority}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Teslim Alma Tarihi</span>
                <span className={styles.infoValue}>{formatDate(order.receivedAt)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tamamlanma Tarihi</span>
                <span className={styles.infoValue}>{formatDate(order.completedAt)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Müşteriye Teslim Tarihi</span>
                <span className={styles.infoValue}>{formatDate(order.deliveredAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Device */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Müşteri ve Cihaz</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Müşteri</span>
                <span className={styles.infoValue}>{order.customerFullName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cihaz</span>
                <span className={styles.infoValue}>
                  {order.deviceBrand} {order.deviceModel}
                </span>
              </div>
            </div>
          </div>

          {/* Costs */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Maliyet</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tahmini Tutar</span>
                <span className={styles.infoValue}>{formatCurrency(order.estimatedCost)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nihai Tutar</span>
                <span className={styles.infoValue}>{formatCurrency(order.finalCost)}</span>
              </div>
            </div>
          </div>

          {/* Reported Issue */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Şikayet / Arıza Açıklaması</h3>
            <div className={styles.textBox}>{order.reportedIssue || '-'}</div>
          </div>

          {/* Diagnosis Notes */}
          {order.diagnosisNotes && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Teşhis Notları</h3>
              <div className={styles.textBox}>{order.diagnosisNotes}</div>
            </div>
          )}

          {/* Technician Notes */}
          {order.technicianNotes && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Teknisyen Notları</h3>
              <div className={styles.textBox}>{order.technicianNotes}</div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.closeFooterButton} onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
