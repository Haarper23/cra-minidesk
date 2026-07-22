import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useRepairOrders } from '../hooks/useRepairOrders';
import { useCreateRepairOrder } from '../hooks/useCreateRepairOrder';
import { useUpdateRepairOrder } from '../hooks/useUpdateRepairOrder';
import { useUpdateRepairOrderStatus } from '../hooks/useUpdateRepairOrderStatus';
import { useDeleteRepairOrder } from '../hooks/useDeleteRepairOrder';
import { RepairOrderToolbar } from '../components/RepairOrderToolbar';
import { RepairOrderTable } from '../components/RepairOrderTable';
import { RepairOrderPagination } from '../components/RepairOrderPagination';
import { RepairOrderFormDialog } from '../components/RepairOrderFormDialog';
import { RepairOrderDetailsDialog } from '../components/RepairOrderDetailsDialog';
import { StatusChangeDialog } from '../components/StatusChangeDialog';
import { DeleteRepairOrderDialog } from '../components/DeleteRepairOrderDialog';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import {
  RepairOrder,
  CreateRepairOrderInput,
  UpdateRepairOrderInput,
  RepairOrderStatus,
} from '../types/repairOrderTypes';
import { ApiError } from '../../../lib/api/apiError';
import styles from './RepairOrdersPage.module.css';

export const RepairOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    queryParams,
    handlePageChange,
    handleSizeChange,
    handleSortChange,
    handleSearchChange,
    handleStatusFilterChange,
    handlePriorityFilterChange,
    handleCustomerFilterChange,
    handleDeviceFilterChange,
    clearFilters,
  } = useRepairOrders();

  const createMutation = useCreateRepairOrder();
  const updateMutation = useUpdateRepairOrder();
  const statusMutation = useUpdateRepairOrderStatus();
  const deleteMutation = useDeleteRepairOrder();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<RepairOrder | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [orderToView, setOrderToView] = useState<RepairOrder | null>(null);

  useEffect(() => {
    const locState = location.state as { selectedId?: number } | null;
    const selectedIdParam = searchParams.get('selectedId') || locState?.selectedId;
    if (selectedIdParam && data?.content) {
      const selectedId = Number(selectedIdParam);
      const matchedOrder = data.content.find((item) => item.id === selectedId);
      if (matchedOrder) {
        setOrderToView(matchedOrder);
        setIsDetailsOpen(true);
      }
    }
  }, [searchParams, location.state, data]);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [orderToStatusChange, setOrderToStatusChange] = useState<RepairOrder | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<RepairOrder | null>(null);

  // Error and Toast states
  const [dialogServerError, setDialogServerError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handlers
  const handleOpenCreate = () => {
    setOrderToEdit(null);
    setDialogServerError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (order: RepairOrder) => {
    setOrderToEdit(order);
    setDialogServerError(null);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (order: RepairOrder) => {
    setOrderToView(order);
    setIsDetailsOpen(true);
  };

  const handleOpenStatusChange = (order: RepairOrder) => {
    setOrderToStatusChange(order);
    setDialogServerError(null);
    setIsStatusOpen(true);
  };

  const handleOpenDelete = (order: RepairOrder) => {
    setOrderToDelete(order);
    setDialogServerError(null);
    setIsDeleteOpen(true);
  };

  const handleSubmitCreate = (input: CreateRepairOrderInput) => {
    setDialogServerError(null);
    createMutation.mutate(input, {
      onSuccess: () => {
        setIsFormOpen(false);
        showToast('Servis kaydı başarıyla oluşturuldu.');
      },
      onError: (err) => {
        const msg =
          (err as ApiError)?.userMessage ||
          (err as Error)?.message ||
          'Servis kaydı oluşturulurken hata oluştu.';
        setDialogServerError(msg);
      },
    });
  };

  const handleSubmitUpdate = (id: number, input: UpdateRepairOrderInput) => {
    setDialogServerError(null);
    updateMutation.mutate(
      { id, data: input },
      {
        onSuccess: () => {
          setIsFormOpen(false);
          showToast('Servis kaydı başarıyla güncellendi.');
        },
        onError: (err) => {
          const msg =
            (err as ApiError)?.userMessage ||
            (err as Error)?.message ||
            'Servis kaydı güncellenirken hata oluştu.';
          setDialogServerError(msg);
        },
      }
    );
  };

  const handleSubmitStatus = (id: number, status: RepairOrderStatus) => {
    setDialogServerError(null);
    statusMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          setIsStatusOpen(false);
          showToast('Servis kaydı durumu başarıyla güncellendi.');
        },
        onError: (err) => {
          const msg =
            (err as ApiError)?.userMessage ||
            (err as Error)?.message ||
            'Servis kaydı durumu güncellenirken hata oluştu.';
          setDialogServerError(msg);
        },
      }
    );
  };

  const handleConfirmDelete = (id: number) => {
    setDialogServerError(null);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        showToast('Servis kaydı başarıyla silindi.');
      },
      onError: (err) => {
        const msg =
          (err as ApiError)?.userMessage ||
          (err as Error)?.message ||
          'Servis kaydı silinirken hata oluştu.';
        setDialogServerError(msg);
      },
    });
  };

  const hasActiveFilters = Boolean(queryParams.query || queryParams.status || queryParams.priority);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Servis Kayıtları</h1>
        <p className={styles.description}>
          Müşteri ve cihazlara ait servis takip kayıtlarını yönetin.
        </p>
      </div>

      <RepairOrderToolbar
        searchValue={queryParams.query || ''}
        selectedStatus={queryParams.status}
        selectedPriority={queryParams.priority}
        selectedCustomerId={queryParams.customerId}
        selectedDeviceId={queryParams.deviceId}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusFilterChange}
        onPriorityChange={handlePriorityFilterChange}
        onCustomerChange={handleCustomerFilterChange}
        onDeviceChange={handleDeviceFilterChange}
        onClearFilters={clearFilters}
        onCreateClick={handleOpenCreate}
      />

      {isLoading ? (
        <LoadingState message="Servis kayıtları yükleniyor..." />
      ) : isError ? (
        <ErrorState
          title="Servis kayıtları yüklenemedi"
          message={
            error instanceof ApiError
              ? error.userMessage
              : error instanceof Error
                ? error.message
                : 'Servis kayıtları alınırken bir hata oluştu.'
          }
          onRetry={() => refetch()}
        />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'Kayıt bulunamadı' : 'Henüz servis kaydı yok'}
          message={
            hasActiveFilters
              ? 'Arama ve filtreleme kriterlerinize uygun servis kaydı bulunamadı.'
              : 'Sistemde henüz kayıtlı servis emri yok. Yeni servis kaydı oluşturarak başlayabilirsiniz.'
          }
        />
      ) : (
        <>
          <RepairOrderTable
            repairOrders={data.content}
            sortBy={queryParams.sortBy}
            sortDirection={sortDirectionToTableDir(queryParams.sortDirection)}
            onSortChange={handleSortChange}
            onViewDetails={handleOpenDetails}
            onEditOrder={handleOpenEdit}
            onStatusChangeClick={handleOpenStatusChange}
            onDeleteOrder={handleOpenDelete}
          />

          <RepairOrderPagination
            page={data.page}
            size={data.size}
            totalElements={data.totalElements}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            onSizeChange={handleSizeChange}
          />
        </>
      )}

      {/* Modals */}
      <RepairOrderFormDialog
        isOpen={isFormOpen}
        orderToEdit={orderToEdit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        serverError={dialogServerError}
        onClose={() => setIsFormOpen(false)}
        onSubmitCreate={handleSubmitCreate}
        onSubmitUpdate={handleSubmitUpdate}
      />

      <RepairOrderDetailsDialog
        isOpen={isDetailsOpen}
        order={orderToView}
        onClose={() => setIsDetailsOpen(false)}
      />

      <StatusChangeDialog
        isOpen={isStatusOpen}
        order={orderToStatusChange}
        isLoading={statusMutation.isPending}
        serverError={dialogServerError}
        onClose={() => setIsStatusOpen(false)}
        onSubmitStatus={handleSubmitStatus}
      />

      <DeleteRepairOrderDialog
        isOpen={isDeleteOpen}
        order={orderToDelete}
        isLoading={deleteMutation.isPending}
        serverError={dialogServerError}
        onClose={() => setIsDeleteOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === 'success' ? styles.toastSuccess : styles.toastError
          }`}
          role="status"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} color="var(--color-success)" aria-hidden="true" />
          ) : (
            <AlertCircle size={18} color="var(--color-danger)" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => setToast(null)}
            aria-label="Kapat"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

function sortDirectionToTableDir(dir?: string): 'asc' | 'desc' {
  return dir === 'asc' ? 'asc' : 'desc';
}
