import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Laptop,
  Wrench,
  Activity,
  PackageCheck,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Clock,
  Plus,
  History,
} from 'lucide-react';
import { useDashboard } from '../api/useDashboard';
import { StatCard } from '../components/StatCard';
import { StatusBreakdown } from '../components/StatusBreakdown';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { useBackendStatusContext } from '../../../app/useBackendStatusContext';

import { CustomerFormDialog } from '../../customers/components/CustomerFormDialog';
import { useCreateCustomer } from '../../customers/hooks/useCreateCustomer';

import { DeviceFormDialog } from '../../devices/components/DeviceFormDialog';
import { useCreateDevice } from '../../devices/hooks/useCreateDevice';

import { RepairOrderFormDialog } from '../../repair-orders/components/RepairOrderFormDialog';
import { useCreateRepairOrder } from '../../repair-orders/hooks/useCreateRepairOrder';

import { RepairOrderStatus, RepairPriority } from '../../repair-orders/types/repairOrderTypes';
import styles from './DashboardPage.module.css';

const STATUS_TR: Record<RepairOrderStatus, string> = {
  RECEIVED: 'Kabul Edildi',
  DIAGNOSING: 'Teşhis Ediliyor',
  WAITING_FOR_CUSTOMER_APPROVAL: 'Müşteri Onayı Bekleniyor',
  APPROVED: 'Onaylandı',
  IN_REPAIR: 'Tamirde',
  WAITING_FOR_PART: 'Parça Bekleniyor',
  COMPLETED: 'Tamamlandı',
  READY_FOR_DELIVERY: 'Teslimata Hazır',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
};

const PRIORITY_TR: Record<RepairPriority, { label: string; badgeClass: string }> = {
  LOW: { label: 'Düşük', badgeClass: 'badgeLow' },
  NORMAL: { label: 'Normal', badgeClass: 'badgeNormal' },
  HIGH: { label: 'Yüksek', badgeClass: 'badgeHigh' },
  URGENT: { label: 'Acil', badgeClass: 'badgeUrgent' },
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();
  const { updateStatusFromQuery } = useBackendStatusContext();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isRepairOrderModalOpen, setIsRepairOrderModalOpen] = useState(false);

  const createCustomerMutation = useCreateCustomer();
  const createDeviceMutation = useCreateDevice();
  const createRepairOrderMutation = useCreateRepairOrder();

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

  const isSystemEmpty =
    data.totals.customers === 0 && data.totals.devices === 0 && data.totals.repairOrders === 0;

  return (
    <div className={styles.container}>
      {/* Header & Quick Actions Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.meta}>
          <h2 className={styles.heading}>Genel Bakış</h2>
          {formattedGeneratedAt && (
            <span className={styles.refreshInfo}>
              Son Güncelleme: <strong>{formattedGeneratedAt}</strong>
            </span>
          )}
        </div>

        <div className={styles.actionControls}>
          <button
            type="button"
            className={styles.quickActionButtonSecondary}
            onClick={() => setIsCustomerModalOpen(true)}
          >
            <Plus size={14} aria-hidden="true" />
            <span>Yeni Müşteri</span>
          </button>
          <button
            type="button"
            className={styles.quickActionButtonSecondary}
            onClick={() => setIsDeviceModalOpen(true)}
          >
            <Plus size={14} aria-hidden="true" />
            <span>Yeni Cihaz</span>
          </button>
          <button
            type="button"
            className={styles.quickActionButton}
            onClick={() => setIsRepairOrderModalOpen(true)}
          >
            <Plus size={14} aria-hidden="true" />
            <span>Yeni Servis Kaydı</span>
          </button>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Gösterge paneli verilerini yenile"
          >
            <RefreshCw
              size={14}
              aria-hidden="true"
              className={isFetching ? styles.spin : undefined}
            />
            <span>{isFetching ? 'Yenileniyor...' : 'Yenile'}</span>
          </button>
        </div>
      </div>

      {isSystemEmpty && (
        <EmptyState
          title="Henüz Kayıt Bulunmuyor"
          message="Sistemde henüz müşteri, cihaz veya servis kaydı oluşturulmamıştır. Hızlı işlem butonlarını kullanarak yeni kayıtlar ekleyebilirsiniz."
        />
      )}

      {/* 6 Core Operational Summary Cards */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Toplam Müşteri"
          value={data.totals.customers}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Toplam Cihaz"
          value={data.totals.devices}
          icon={Laptop}
          variant="default"
        />
        <StatCard
          title="Aktif Servis"
          value={data.totals.activeRepairOrders}
          icon={Activity}
          variant="primary"
        />
        <StatCard
          title="Teslime Hazır"
          value={data.totals.readyForDelivery}
          icon={PackageCheck}
          variant="success"
        />
        <StatCard
          title="Bugün Açılan"
          value={data.totals.openedToday}
          icon={Wrench}
          variant="warning"
        />
        <StatCard
          title="Bugün Teslim Edilen"
          value={data.totals.deliveredToday}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Service Status Breakdown */}
      <div className={styles.breakdownSection}>
        <StatusBreakdown statusCounts={data.statusDistribution} />
      </div>

      {/* Two-Column Section Layout */}
      <div className={styles.mainGrid}>
        {/* Priority Queue Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <AlertTriangle size={18} color="#ea580c" aria-hidden="true" />
              <h3 className={styles.sectionTitle}>Öncelikli İşler (Acil & Yüksek)</h3>
            </div>
            <span className={styles.countBadge}>{data.priorityQueue.length} İş</span>
          </div>

          {data.priorityQueue.length === 0 ? (
            <div className={styles.emptySection}>Öncelikli servis kaydı bulunmuyor.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Öncelik</th>
                    <th>Takip No</th>
                    <th>Müşteri / Cihaz</th>
                    <th>Durum</th>
                    <th>Bekleme</th>
                  </tr>
                </thead>
                <tbody>
                  {data.priorityQueue.map((item) => {
                    const priorityMeta = PRIORITY_TR[item.priority] || {
                      label: item.priority,
                      badgeClass: 'badgeNormal',
                    };
                    return (
                      <tr
                        key={item.id}
                        className={styles.clickableRow}
                        onClick={() =>
                          navigate(`/repair-orders?selectedId=${item.id}`, {
                            state: { selectedId: item.id },
                          })
                        }
                      >
                        <td>
                          <span className={`${styles.badge} ${styles[priorityMeta.badgeClass]}`}>
                            {priorityMeta.label}
                          </span>
                        </td>
                        <td className={styles.orderNumber}>{item.orderNumber}</td>
                        <td>
                          <div>
                            <strong>{item.customerName}</strong>
                          </div>
                          <div style={{ fontSize: '11px', opacity: 0.8 }}>{item.deviceLabel}</div>
                        </td>
                        <td>{STATUS_TR[item.status] || item.status}</td>
                        <td>{item.ageInDays} gün</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ready For Delivery Queue Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <Clock size={18} color="#16a34a" aria-hidden="true" />
              <h3 className={styles.sectionTitle}>Teslim Bekleyen Cihazlar</h3>
            </div>
            <span className={styles.countBadge}>{data.readyForDeliveryQueue.length} Cihaz</span>
          </div>

          {data.readyForDeliveryQueue.length === 0 ? (
            <div className={styles.emptySection}>Teslim edilmeyi bekleyen cihaz bulunmuyor.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Takip No</th>
                    <th>Müşteri / Cihaz</th>
                    <th>Hazır Tarihi</th>
                    <th>Bekleme</th>
                  </tr>
                </thead>
                <tbody>
                  {data.readyForDeliveryQueue.map((item) => (
                    <tr
                      key={item.id}
                      className={styles.clickableRow}
                      onClick={() =>
                        navigate(`/repair-orders?selectedId=${item.id}`, {
                          state: { selectedId: item.id },
                        })
                      }
                    >
                      <td className={styles.orderNumber}>{item.orderNumber}</td>
                      <td>
                        <div>
                          <strong>{item.customerName}</strong>
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.8 }}>{item.deviceLabel}</div>
                      </td>
                      <td>
                        {new Date(item.readySince).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td>{item.waitingDays} gün</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Repair Orders Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <Wrench size={18} aria-hidden="true" />
              <h3 className={styles.sectionTitle}>Son Servis Kayıtları</h3>
            </div>
            <span className={styles.countBadge}>{data.recentRepairOrders.length} Kayıt</span>
          </div>

          {data.recentRepairOrders.length === 0 ? (
            <div className={styles.emptySection}>Son oluşturulan servis kaydı bulunmuyor.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Takip No</th>
                    <th>Müşteri</th>
                    <th>Cihaz</th>
                    <th>Durum</th>
                    <th>Öncelik</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentRepairOrders.map((item) => {
                    const priorityMeta = PRIORITY_TR[item.priority] || {
                      label: item.priority,
                      badgeClass: 'badgeNormal',
                    };
                    return (
                      <tr
                        key={item.id}
                        className={styles.clickableRow}
                        onClick={() =>
                          navigate(`/repair-orders?selectedId=${item.id}`, {
                            state: { selectedId: item.id },
                          })
                        }
                      >
                        <td className={styles.orderNumber}>{item.orderNumber}</td>
                        <td>{item.customerName}</td>
                        <td>{item.deviceLabel}</td>
                        <td>{STATUS_TR[item.status] || item.status}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[priorityMeta.badgeClass]}`}>
                            {priorityMeta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <History size={18} aria-hidden="true" />
              <h3 className={styles.sectionTitle}>Son Operasyonel Aktivite</h3>
            </div>
            <span className={styles.countBadge}>{data.recentActivity.length} Aktivite</span>
          </div>

          {data.recentActivity.length === 0 ? (
            <div className={styles.emptySection}>
              Son zamanlarda operasyonel hareket bulunmuyor.
            </div>
          ) : (
            <div className={styles.activityList}>
              {data.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.activityItem} ${item.repairOrderId ? styles.clickableRow : ''}`}
                  onClick={() => {
                    if (item.repairOrderId) {
                      navigate(`/repair-orders?selectedId=${item.repairOrderId}`, {
                        state: { selectedId: item.repairOrderId },
                      });
                    }
                  }}
                >
                  <History size={14} className={styles.activityIcon} aria-hidden="true" />
                  <div className={styles.activityBody}>
                    <span className={styles.activityDesc}>{item.description}</span>
                    <div className={styles.activityMeta}>
                      <span>
                        Kayıt: <strong>{item.orderNumber}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(item.createdAt).toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Production Dialog Reuses */}
      <CustomerFormDialog
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={async (formData) => {
          await createCustomerMutation.mutateAsync(formData);
          setIsCustomerModalOpen(false);
        }}
        isLoading={createCustomerMutation.isPending}
      />

      <DeviceFormDialog
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        onSubmit={async (formData) => {
          await createDeviceMutation.mutateAsync(formData);
          setIsDeviceModalOpen(false);
        }}
        isLoading={createDeviceMutation.isPending}
      />

      <RepairOrderFormDialog
        isOpen={isRepairOrderModalOpen}
        onClose={() => setIsRepairOrderModalOpen(false)}
        onSubmitCreate={async (formData) => {
          await createRepairOrderMutation.mutateAsync(formData);
          setIsRepairOrderModalOpen(false);
        }}
        onSubmitUpdate={() => {}}
        isLoading={createRepairOrderMutation.isPending}
      />
    </div>
  );
};
