import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Device,
  DeviceFormInput,
  DeviceQueryParams,
  DeviceSortField,
  DeviceType,
} from '../types/deviceTypes';
import { useDevices } from '../hooks/useDevices';
import { useCreateDevice } from '../hooks/useCreateDevice';
import { useUpdateDevice } from '../hooks/useUpdateDevice';
import { useDeleteDevice } from '../hooks/useDeleteDevice';
import { DeviceToolbar } from '../components/DeviceToolbar';
import { DeviceTable } from '../components/DeviceTable';
import { DevicePagination } from '../components/DevicePagination';
import { DeviceFormDialog } from '../components/DeviceFormDialog';
import { DeleteDeviceDialog } from '../components/DeleteDeviceDialog';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { NotificationBanner } from '../../../components/feedback/NotificationBanner';
import { useBackendStatusContext } from '../../../app/useBackendStatusContext';
import { SortDirection } from '../../../lib/api/apiTypes';
import styles from './DevicesPage.module.css';

const ALLOWED_SORT_FIELDS: DeviceSortField[] = [
  'id',
  'brand',
  'model',
  'deviceType',
  'createdAt',
  'updatedAt',
];

const ALLOWED_DEVICE_TYPES: DeviceType[] = [
  'LAPTOP',
  'DESKTOP',
  'PHONE',
  'TABLET',
  'MONITOR',
  'PRINTER',
  'OTHER',
];

export const DevicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateStatusFromQuery } = useBackendStatusContext();

  // Read & sanitize URL parameters
  const query = searchParams.get('query') || '';
  const rawCustomerId = parseInt(searchParams.get('customerId') || '0', 10);
  const customerId = isNaN(rawCustomerId) || rawCustomerId <= 0 ? undefined : rawCustomerId;

  const rawDeviceType = searchParams.get('deviceType') as DeviceType;
  const deviceType = ALLOWED_DEVICE_TYPES.includes(rawDeviceType) ? rawDeviceType : undefined;

  const rawPage = parseInt(searchParams.get('page') || '0', 10);
  const page = isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;

  const rawSortBy = searchParams.get('sortBy') as DeviceSortField;
  const sortBy: DeviceSortField = ALLOWED_SORT_FIELDS.includes(rawSortBy) ? rawSortBy : 'createdAt';

  const rawSortDir = searchParams.get('sortDirection') as SortDirection;
  const sortDirection: SortDirection = rawSortDir === 'asc' ? 'asc' : 'desc';

  const queryParams: DeviceQueryParams = {
    query,
    customerId,
    deviceType,
    page,
    size: 20,
    sortBy,
    sortDirection,
  };

  // Queries & Mutations
  const { data, isLoading, isError, error, refetch } = useDevices(queryParams);
  const createDeviceMutation = useCreateDevice();
  const updateDeviceMutation = useUpdateDevice();
  const deleteDeviceMutation = useDeleteDevice();

  // Dialog & Banner state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Sync TopBar status
  useEffect(() => {
    updateStatusFromQuery(isLoading, isError, error?.category);
  }, [isLoading, isError, error?.category, updateStatusFromQuery]);

  // URL State updater
  const updateUrlParams = (newParams: Partial<DeviceQueryParams>) => {
    const nextParams = new URLSearchParams(searchParams);

    const merged = {
      query: newParams.query !== undefined ? newParams.query : query,
      customerId: newParams.customerId !== undefined ? newParams.customerId : customerId,
      deviceType: newParams.deviceType !== undefined ? newParams.deviceType : deviceType,
      page: newParams.page !== undefined ? newParams.page : page,
      sortBy: newParams.sortBy !== undefined ? newParams.sortBy : sortBy,
      sortDirection:
        newParams.sortDirection !== undefined ? newParams.sortDirection : sortDirection,
    };

    if (merged.query && merged.query.trim()) {
      nextParams.set('query', merged.query.trim());
    } else {
      nextParams.delete('query');
    }

    if (merged.customerId && merged.customerId > 0) {
      nextParams.set('customerId', merged.customerId.toString());
    } else {
      nextParams.delete('customerId');
    }

    if (merged.deviceType) {
      nextParams.set('deviceType', merged.deviceType);
    } else {
      nextParams.delete('deviceType');
    }

    if (merged.page > 0) {
      nextParams.set('page', merged.page.toString());
    } else {
      nextParams.delete('page');
    }

    if (merged.sortBy && merged.sortBy !== 'createdAt') {
      nextParams.set('sortBy', merged.sortBy);
    } else {
      nextParams.delete('sortBy');
    }

    if (merged.sortDirection && merged.sortDirection !== 'desc') {
      nextParams.set('sortDirection', merged.sortDirection);
    } else {
      nextParams.delete('sortDirection');
    }

    setSearchParams(nextParams);
  };

  // Handlers
  const handleSearchChange = (newQuery: string) => {
    updateUrlParams({ query: newQuery, page: 0 });
  };

  const handleDeviceTypeChange = (newType?: DeviceType) => {
    updateUrlParams({ deviceType: newType, page: 0 });
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleSortChange = (field: DeviceSortField) => {
    if (sortBy === field) {
      const nextDir: SortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      updateUrlParams({ sortDirection: nextDir, page: 0 });
    } else {
      updateUrlParams({ sortBy: field, sortDirection: 'asc', page: 0 });
    }
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  // Create & Edit workflows
  const handleOpenCreate = () => {
    setDeviceToEdit(null);
    createDeviceMutation.reset();
    setIsFormDialogOpen(true);
  };

  const handleOpenEdit = (device: Device) => {
    setDeviceToEdit(device);
    updateDeviceMutation.reset();
    setIsFormDialogOpen(true);
  };

  const handleFormSubmit = (input: DeviceFormInput) => {
    if (deviceToEdit) {
      updateDeviceMutation.mutate(
        { id: deviceToEdit.id, data: input },
        {
          onSuccess: () => {
            setIsFormDialogOpen(false);
            setDeviceToEdit(null);
            setNotification('Cihaz başarıyla güncellendi.');
          },
        }
      );
    } else {
      createDeviceMutation.mutate(input, {
        onSuccess: () => {
          setIsFormDialogOpen(false);
          setNotification('Cihaz başarıyla oluşturuldu.');
        },
      });
    }
  };

  // Delete workflow
  const handleOpenDelete = (device: Device) => {
    setDeviceToDelete(device);
    deleteDeviceMutation.reset();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deviceToDelete) return;

    deleteDeviceMutation.mutate(deviceToDelete.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setDeviceToDelete(null);

        // Page regression check
        if (data && data.content.length === 1 && page > 0) {
          updateUrlParams({ page: page - 1 });
        }

        setNotification('Cihaz başarıyla silindi.');
      },
    });
  };

  const formServerError =
    createDeviceMutation.error?.userMessage || updateDeviceMutation.error?.userMessage || null;

  const deleteServerError = deleteDeviceMutation.error?.userMessage || null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cihazlar</h1>
        <p className={styles.description}>Müşterilere ait cihazları yönetin.</p>
      </div>

      <NotificationBanner message={notification} onClose={() => setNotification(null)} />

      <DeviceToolbar
        initialSearch={query}
        initialDeviceType={deviceType}
        onSearchChange={handleSearchChange}
        onDeviceTypeChange={handleDeviceTypeChange}
        onClearFilters={handleClearFilters}
        onCreateClick={handleOpenCreate}
      />

      {isLoading ? (
        <LoadingState message="Cihaz verileri yükleniyor..." />
      ) : isError ? (
        <ErrorState
          title="Cihazlar Yüklenemedi"
          message={error?.userMessage || 'Bir hata oluştu.'}
          onRetry={() => refetch()}
        />
      ) : !data || data.totalElements === 0 ? (
        query || deviceType || customerId ? (
          <EmptyState
            title="Arama Sonucu Bulunamadı"
            message="Seçilen filtrelere uygun cihaz kaydı bulunamadı. Filtreleri temizleyip tekrar deneyebilirsiniz."
          />
        ) : (
          <EmptyState
            title="Henüz Cihaz Bulunmuyor"
            message="Sistemde henüz kayıtlı bir cihaz bulunmuyor. Yeni cihaz ekleyerek başlayabilirsiniz."
          />
        )
      ) : (
        <>
          <DeviceTable
            devices={data.content}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            onEditClick={handleOpenEdit}
            onDeleteClick={handleOpenDelete}
          />

          <DevicePagination
            currentPage={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            pageSize={data.size}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <DeviceFormDialog
        isOpen={isFormDialogOpen}
        deviceToEdit={deviceToEdit}
        isLoading={createDeviceMutation.isPending || updateDeviceMutation.isPending}
        serverError={formServerError}
        onClose={() => setIsFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteDeviceDialog
        isOpen={isDeleteDialogOpen}
        deviceToDelete={deviceToDelete}
        isLoading={deleteDeviceMutation.isPending}
        serverError={deleteServerError}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
