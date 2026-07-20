import React from 'react';
import { RepairStatusCount, RepairOrderStatus } from '../types/dashboardTypes';
import styles from './StatusBreakdown.module.css';

interface StatusBreakdownProps {
  statusCounts: RepairStatusCount[];
}

const STATUS_LABELS: Record<RepairOrderStatus, { label: string; badgeClass: string }> = {
  RECEIVED: { label: 'Kabul Edildi', badgeClass: 'info' },
  DIAGNOSING: { label: 'Teşhis Ediliyor', badgeClass: 'info' },
  WAITING_FOR_CUSTOMER_APPROVAL: { label: 'Müşteri Onayı Bekleniyor', badgeClass: 'warning' },
  APPROVED: { label: 'Onaylandı', badgeClass: 'primary' },
  IN_REPAIR: { label: 'Tamirde', badgeClass: 'primary' },
  WAITING_FOR_PART: { label: 'Parça Bekleniyor', badgeClass: 'warning' },
  COMPLETED: { label: 'Tamamlandı', badgeClass: 'success' },
  READY_FOR_DELIVERY: { label: 'Teslimata Hazır', badgeClass: 'success' },
  DELIVERED: { label: 'Teslim Edildi', badgeClass: 'neutral' },
  CANCELLED: { label: 'İptal Edildi', badgeClass: 'danger' },
};

export const StatusBreakdown: React.FC<StatusBreakdownProps> = ({ statusCounts }) => {
  const total = statusCounts.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Servis Kayıtları Durum Dağılımı</h3>
        <span className={styles.totalBadge}>{total} Toplam Kayıt</span>
      </div>

      <div className={styles.grid}>
        {statusCounts.map((item) => {
          const config = STATUS_LABELS[item.status] || {
            label: item.status,
            badgeClass: 'neutral',
          };
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <div key={item.status} className={styles.item}>
              <div className={styles.itemMeta}>
                <span className={`${styles.badge} ${styles[config.badgeClass]}`}>
                  {config.label}
                </span>
                <span className={styles.count}>{item.count} adet</span>
              </div>
              <div
                className={styles.barBackground}
                role="progressbar"
                aria-valuenow={item.count}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={`${config.label}: ${item.count} kayıt (%${percentage})`}
              >
                <div
                  className={`${styles.barFill} ${styles[`fill_${config.badgeClass}`]}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
