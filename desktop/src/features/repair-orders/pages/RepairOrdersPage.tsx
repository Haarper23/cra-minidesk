import React from 'react';
import { Wrench, Clock } from 'lucide-react';
import styles from '../../../components/feedback/PlaceholderPage.module.css';

export const RepairOrdersPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <Wrench size={36} aria-hidden="true" />
        </div>
        <h2 className={styles.title}>Servis Kayıtları Modülü</h2>
        <p className={styles.description}>
          Servis emri oluşturma, durum güncelleme ve servis geçmişi zaman çizelgesi{' '}
          <strong>Sprint 5B</strong> kapsamında masaüstü uygulamasına entegre edilecektir.
        </p>
        <div className={styles.badge}>
          <Clock size={14} aria-hidden="true" />
          <span>Gelecek Sprintte Kullanıma Açılacaktır</span>
        </div>
      </div>
    </div>
  );
};
