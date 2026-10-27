"use client";

import { useState } from "react";
import { CalendarPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentTable } from "@/features/appointments/components/AppointmentTable";
import { AppointmentModal } from "@/features/appointments/components/AppointmentModal";
import { CancelAppointmentDialog } from "@/features/appointments/components/CancelAppointmentDialog";
import { useAppointmentFilters } from "@/features/appointments/hooks/useAppointmentFilters";
import type {
  Appointment,
  Service,
} from "@/features/appointments/types/appointment";

interface AppointmentsViewProps {
  appointments: Appointment[];
  services: Service[];
  loading: boolean;
  error?: Error | null;
  savingAppointment: boolean;
  updatingStatus: boolean;
  onRetry: () => void;
  onCreate: (appointment: Appointment) => void;
  onUpdate: (appointment: Appointment) => void;
  onStatusChange: (
    appointmentId: string,
    status: Appointment["status"],
  ) => void;
}

const inputClassName =
  "h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AppointmentsView({
  appointments,
  services,
  loading,
  error,
  savingAppointment,
  updatingStatus,
  onRetry,
  onCreate,
  onUpdate,
  onStatusChange,
}: AppointmentsViewProps) {
  const filters = useAppointmentFilters(appointments);
  const [modalOpen, setModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] =
    useState<Appointment | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);

  const openNewAppointment = () => {
    setAppointmentToEdit(null);
    setModalOpen(true);
  };
  const closeAppointmentModal = () => {
    setModalOpen(false);
    setAppointmentToEdit(null);
  };
  const saveAppointment = (appointment: Appointment) => {
    if (appointmentToEdit) onUpdate(appointment);
    else onCreate(appointment);
    closeAppointmentModal();
  };
  const confirmCancellation = () => {
    if (!appointmentToCancel) return;
    onStatusChange(appointmentToCancel.id, "cancelled");
    setAppointmentToCancel(null);
  };

  const hasFilters = Boolean(
    filters.searchTerm ||
    filters.selectedDate ||
    filters.selectedStatus !== "all",
  );

  if (loading) {
    return (
      <section aria-label="Cargando citas" className="space-y-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </section>
    );
  }

  if (error) {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-destructive/30 bg-popover p-6 shadow-sm"
      >
        <h2 className="font-semibold">No se pudieron cargar las citas</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          Reintentar
        </Button>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-5 rounded-2xl border bg-popover p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Citas y turnos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Busca, filtra y administra las citas de tus clientas.
            </p>
          </div>
          <Button type="button" onClick={openNewAppointment}>
            <CalendarPlus aria-hidden="true" />
            Nueva cita
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_210px]">
          <label className="relative block">
            <span className="sr-only">Buscar por nombre o teléfono</span>
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={filters.searchTerm}
              onChange={(event) => filters.updateSearchTerm(event.target.value)}
              placeholder="Buscar por nombre o teléfono"
              className={`${inputClassName} pl-9`}
            />
          </label>

          <label>
            <span className="sr-only">Filtrar por fecha</span>
            <input
              type="date"
              value={filters.selectedDate}
              onChange={(event) =>
                filters.updateSelectedDate(event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              value={filters.selectedStatus}
              onChange={(event) =>
                filters.updateSelectedStatus(
                  event.target.value as Appointment["status"] | "all",
                )
              }
              className={inputClassName}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </label>
        </div>

        <AppointmentTable
          appointments={filters.paginatedAppointments}
          services={services}
          totalAppointments={filters.totalFilteredAppointments}
          searchTerm={filters.searchTerm}
          hasFilters={hasFilters}
          currentPage={filters.currentPage}
          totalPages={filters.totalPages}
          onEdit={(appointment) => {
            setAppointmentToEdit(appointment);
            setModalOpen(true);
          }}
          onCancel={setAppointmentToCancel}
          onStatusChange={onStatusChange}
          onPageChange={filters.setCurrentPage}
        />
      </section>

      <AppointmentModal
        open={modalOpen}
        appointment={appointmentToEdit}
        services={services}
        existingAppointments={appointments}
        saving={savingAppointment}
        onClose={closeAppointmentModal}
        onSave={saveAppointment}
      />

      <CancelAppointmentDialog
        appointment={appointmentToCancel}
        saving={updatingStatus}
        onClose={() => setAppointmentToCancel(null)}
        onConfirm={confirmCancellation}
      />
    </>
  );
}
