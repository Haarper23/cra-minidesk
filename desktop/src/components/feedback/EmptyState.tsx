import React from 'react';
import { Inbox } from 'lucide-react';
import styles from './FeedbackState.module.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Kayıt Bulunamadı',
  message = 'Henüz sistemde gösterilecek veri bulunmamaktadır. Yeni kayıt oluşturulduğunda veriler burada görüntülenecektir.',
}) => {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.emptyIcon}>
        <Inbox size={32} aria-hidden="true" />
      </div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyMessage}>{message}</p>
    </div>
  );
};
