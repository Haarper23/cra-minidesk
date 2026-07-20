import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';
import { useCreateCustomer } from '../hooks/useCreateCustomer';
import { useUpdateCustomer } from '../hooks/useUpdateCustomer';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import { CustomerToolbar } from '../components/CustomerToolbar';
import { CustomerTable } from '../components/CustomerTable';
import { CustomerPagination } from '../components/CustomerPagination';
import { CustomerFormDialog } from '../components/CustomerFormDialog';
import { DeleteCustomerDialog } from '../components/DeleteCustomerDialog';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { NotificationBanner } from '../../../components/feedback/NotificationBanner';
import { useBackendStatusContext } from '../../../app/useBackendStatusContext';
import {
  Customer,
  CustomerFormInput,
  CustomerSortField,
  SortDirection,
} from '../types/customerTypes';
import styles from './CustomersPage.module.css';

const ALLOWED_SORT_FIELDS: CustomerSortField[] = ['fullName', 'email', 'createdAt', 'updatedAt'];

export const CustomersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawQuery = searchParams.get('query') || '';
  const rawPage = parseInt(searchParams.get('page') || '0', 10);
  const page = isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;

  const rawSortBy = searchParams.get('sortBy') as CustomerSortField;
  const sortBy: CustomerSortField = ALLOWED_SORT_FIELDS.includes(rawSortBy)
    ? rawSortBy
    : 'createdAt';

  const rawSortDir = searchParams.get('sortDirection') as SortDirection;
  const sortDirection: SortDirection = rawSortDir === 'asc' ? 'asc' : 'desc';

  const updateUrlParams = useCallback(
    (newParams: {
      query?: string;
      page?: number;
      sortBy?: CustomerSortField;
      sortDirection?: SortDirection;
    }) => {
      setSearchParams((prev) => {
        const updated = new URLSearchParams(prev);

        if (newParams.query !== undefined) {
          if (newParams.query.trim().length > 0) {
            updated.set('query', newParams.query.trim());
          } else {
            updated.delete('query');
          }
        }

        if (newParams.page !== undefined) {
          if (newParams.page > 0) {
            updated.set('page', String(newParams.page));
          } else {
            updated.delete('page');
          }
        }

        if (newParams.sortBy !== undefined) {
          if (newParams.sortBy !== 'createdAt') {
            updated.set('sortBy', newParams.sortBy);
          } else {
            updated.delete('sortBy');
          }
        }

        if (newParams.sortDirection !== undefined) {
          if (newParams.sortDirection !== 'desc') {
            updated.set('sortDirection', newParams.sortDirection);
          } else {
            updated.delete('sortDirection');
          }
        }

        return updated;
      });
    },
    [setSearchParams]
  );

  const { data, isLoading, isError, error, refetch } = useCustomers({
    query: rawQuery,
    page,
    size: 20,
    sortBy,
    sortDirection,
  });

  const { updateStatusFromQuery } = useBackendStatusContext();

  useEffect(() => {
    updateStatusFromQuery(isLoading, isError, error?.category);
  }, [isLoading, isError, error, updateStatusFromQuery]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const handleSearchChange = (newQuery: string) => {
    if (newQuery !== rawQuery) {
      updateUrlParams({ query: newQuery, page: 0 });
    }
  };

  const handleSortChange = (field: CustomerSortField) => {
    if (sortBy === field) {
      const nextDir: SortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      updateUrlParams({ sortDirection: nextDir });
    } else {
      updateUrlParams({ sortBy: field, sortDirection: 'asc' });
    }
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handleCreateSubmit = async (formData: CustomerFormInput) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateOpen(false);
      setNotification('Müşteri başarıyla oluşturuldu.');
    } catch {
      // Mutation error is caught and passed to dialog serverError
    }
  };

  const handleUpdateSubmit = async (formData: CustomerFormInput) => {
    if (!customerToEdit) return;
    try {
      await updateMutation.mutateAsync({ id: customerToEdit.id, input: formData });
      setCustomerToEdit(null);
      setNotification('Müşteri başarıyla güncellendi.');
    } catch {
      // Mutation error is caught and passed to dialog serverError
    }
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    try {
      await deleteMutation.mutateAsync(customerToDelete.id);

      if (data && data.content.length === 1 && page > 0) {
        updateUrlParams({ page: page - 1 });
      }

      setCustomerToDelete(null);
      setNotification('Müşteri başarıyla silindi.');
    } catch {
      // Mutation error is caught and passed to dialog serverError
    }
  };

  return (
    <div className={styles.container}>
      <NotificationBanner message={notification} onClose={() => setNotification(null)} />

      <CustomerToolbar
        initialSearch={rawQuery}
        onSearchChange={handleSearchChange}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {isLoading && <LoadingState message="Müşteri verileri yükleniyor..." />}

      {isError && (
        <ErrorState
          title="Müşteriler Yüklenemedi"
          message={error?.userMessage || 'Müşteri verileri alınırken bir hata oluştu.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.totalElements === 0 ? (
            rawQuery.trim() ? (
              <EmptyState
                title="Arama Sonucu Bulunamadı"
                message={`"${rawQuery}" terimine uygun müşteri kaydı bulunamadı. Lütfen arama terimini değiştirip tekrar deneyin.`}
              />
            ) : (
              <EmptyState
                title="Henüz Müşteri Bulunmuyor"
                message="Sistemde henüz kayıtlı müşteri bulunmamaktadır. 'Yeni Müşteri' butonunu kullanarak ilk müşteriyi ekleyebilirsiniz."
              />
            )
          ) : (
            <>
              <CustomerTable
                customers={data.content}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                onEdit={(customer) => setCustomerToEdit(customer)}
                onDelete={(customer) => setCustomerToDelete(customer)}
              />

              <CustomerPagination
                page={data.page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                isFirst={data.first}
                isLast={data.last}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}

      {/* Create Customer Dialog */}
      <CustomerFormDialog
        isOpen={isCreateOpen}
        isLoading={createMutation.isPending}
        serverError={createMutation.error?.userMessage || null}
        onClose={() => {
          setIsCreateOpen(false);
          createMutation.reset();
        }}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Customer Dialog */}
      <CustomerFormDialog
        isOpen={Boolean(customerToEdit)}
        customerToEdit={customerToEdit}
        isLoading={updateMutation.isPending}
        serverError={updateMutation.error?.userMessage || null}
        onClose={() => {
          setCustomerToEdit(null);
          updateMutation.reset();
        }}
        onSubmit={handleUpdateSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCustomerDialog
        isOpen={Boolean(customerToDelete)}
        customerToDelete={customerToDelete}
        isLoading={deleteMutation.isPending}
        serverError={deleteMutation.error?.userMessage || null}
        onClose={() => {
          setCustomerToDelete(null);
          deleteMutation.reset();
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
