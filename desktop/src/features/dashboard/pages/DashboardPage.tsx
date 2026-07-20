import React, { useEffect } from 'react';
import {
  Users,
  Laptop,
  Wrench,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';
import { useDashboard } from '../api/useDashboard';
import { StatCard } from '../components/StatCard';
import { StatusBreakdown } from '../components/StatusBreakdown';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { useBackendStatusContext } from '../../../app/useBackendStatusContext';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();
  const { updateStatusFromQuery } = useBackendStatusContext();

  useEffect(() => {
    updateStatusFromQuery(isLoading, isError, error?.category);
  }, [isLoading, isError, error, updateStatusFromQuery]);

  if (isLoading) {
    return <LoadingState message="Gösterge paneli verileri yükleniyor..." />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Gösterge Paneli Yüklenemedi"
        message={error?.userMessage || 'Backend sunucusuyla iletişim kurulurken bir hata oluştu.'}
        onRetry={() => refetch()}
      />
    );
  }

  const formattedGeneratedAt = data.generatedAt
    ? new Date(data.generatedAt).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  const isEmpty =
    data.totalCustomers === 0 && data.totalDevices === 0 && data.totalRepairOrders === 0;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.meta}>
          <h2 className={styles.heading}>Genel Bakış</h2>
          {formattedGeneratedAt && (
            <span className={styles.refreshInfo}>
              Son Güncelleme: <strong>{formattedGeneratedAt}</strong>
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Gösterge paneli verilerini yenile"
        >
          <RefreshCw
            size={15}
            aria-hidden="true"
            className={isFetching ? styles.spin : undefined}
          />
          <span>{isFetching ? 'Yenileniyor...' : 'Yenile'}</span>
        </button>
      </div>

      {isEmpty && (
        <EmptyState
          title="Henüz Kayıt Bulunmuyor"
          message="Sistemde henüz müşteri, cihaz veya servis kaydı oluşturulmamıştır. Yeni veriler girildiğinde istatistikler burada görüntülenecektir."
        />
      )}

      <div className={styles.statsGrid}>
        <StatCard
          title="Toplam Müşteri"
          value={data.totalCustomers}
          icon={Users}
          variant="default"
        />
        <StatCard title="Kayıtlı Cihaz" value={data.totalDevices} icon={Laptop} variant="default" />
        <StatCard
          title="Toplam Servis Kaydı"
          value={data.totalRepairOrders}
          icon={Wrench}
          variant="default"
        />
        <StatCard
          title="Aktif Servis Kayıtları"
          value={data.activeRepairOrders}
          icon={Activity}
          variant="primary"
        />
        <StatCard
          title="Acil Servis Kayıtları"
          value={data.urgentRepairOrders}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Parça Bekleyenler"
          value={data.waitingForPart}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Teslimata Hazır"
          value={data.readyForDelivery}
          icon={PackageCheck}
          variant="success"
        />
        <StatCard
          title="Bugün Tamamlanan"
          value={data.completedToday}
          icon={CheckCircle2}
          variant="success"
          subtitle={`Teslim edilen: ${data.deliveredToday}`}
        />
      </div>

      <div className={styles.breakdownSection}>
        <StatusBreakdown statusCounts={data.repairOrdersByStatus} />
      </div>
    </div>
  );
};
