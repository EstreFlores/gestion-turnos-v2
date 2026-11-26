"use client";

import { toast } from "@/components/ui/toastManager";
import { AppointmentModal } from "@/features/appointments/components/AppointmentModal";
import { AppointmentsView } from "@/features/appointments/components/AppointmentsView";
import { AppointmentCalendar } from "@/features/appointments/components/AppointmentCalendar";
import { ServicesView } from "@/features/appointments/components/ServicesView";
import { useAppointmentMutations } from "@/features/appointments/hooks/useAppointmentMutations";
import type { AppView } from "@/components/Sidebar";
import type {
  Appointment,
  Service,
} from "@/features/appointments/types/appointment";

interface AppointmentWorkspaceProps {
  currentView: AppView;
  appointments: Appointment[];
  services: Service[];
  loading: boolean;
  appointmentsError?: Error | null;
  servicesError?: Error | null;
  retry: () => void;
  appointmentModalOpen: boolean;
  appointmentToEdit: Appointment | null;
  onNewAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onCloseAppointmentModal: () => void;
}

export function AppointmentWorkspace({
  currentView,
  appointments,
  services,
  loading,
  appointmentsError,
  servicesError,
  retry,
  appointmentModalOpen,
  appointmentToEdit,
  onNewAppointment,
  onEditAppointment,
  onCloseAppointmentModal,
}: AppointmentWorkspaceProps) {
  const { create, update, updateStatus } = useAppointmentMutations();

  const notifyError = (title: string, error: Error) => {
    toast.add({
      title,
      description: error.message,
      type: "error",
    });
  };

  const handleCreate = (appointment: Appointment) => {
    create.mutate(appointment, {
      onSuccess: () =>
        toast.add({
          title: "Cita creada",
          description: "La cita se registró correctamente.",
          type: "success",
        }),
      onError: (error) => notifyError("No se pudo crear la cita", error),
    });
  };

  const handleUpdate = (appointment: Appointment) => {
    update.mutate(appointment, {
      onSuccess: () =>
        toast.add({
          title: "Cita actualizada",
          description: "Los datos se guardaron correctamente.",
          type: "success",
        }),
      onError: (error) => notifyError("No se pudo actualizar la cita", error),
    });
  };

  const handleStatusChange = (
    appointmentId: string,
    status: Appointment["status"],
  ) => {
    updateStatus.mutate(
      { id: appointmentId, status },
      {
        onSuccess: () =>
          toast.add({
            title:
              status === "cancelled" ? "Cita cancelada" : "Estado actualizado",
            description:
              status === "cancelled"
                ? "La cita se canceló correctamente."
                : "El estado de la cita se actualizó.",
            type: "success",
          }),
        onError: (error) =>
          notifyError("No se pudo actualizar el estado", error),
      },
    );
  };

  const handleSaveAppointment = (appointment: Appointment) => {
    if (appointmentToEdit) handleUpdate(appointment);
    else handleCreate(appointment);
    onCloseAppointmentModal();
  };

  return (
    <>
      {currentView === "appointments" && (
        <AppointmentsView
          appointments={appointments}
          services={services}
          loading={loading}
          error={appointmentsError ?? servicesError}
          updatingStatus={updateStatus.isPending}
          onRetry={retry}
          onNewAppointment={onNewAppointment}
          onEditAppointment={onEditAppointment}
          onStatusChange={handleStatusChange}
        />
      )}
      {currentView === "calendar" && (
        <AppointmentCalendar
          appointments={appointments}
          services={services}
          loading={loading}
          error={appointmentsError ?? servicesError}
          onRetry={retry}
          onNewAppointment={onNewAppointment}
          onSelectAppointment={onEditAppointment}
        />
      )}
      {currentView === "services" && (
        <ServicesView
          services={services}
          loading={loading}
          error={servicesError}
          onRetry={retry}
        />
      )}
      {appointmentModalOpen && (
        <AppointmentModal
          open={appointmentModalOpen}
          appointment={appointmentToEdit}
          services={services}
          existingAppointments={appointments}
          saving={create.isPending || update.isPending}
          onClose={onCloseAppointmentModal}
          onSave={handleSaveAppointment}
        />
      )}
    </>
  );
}
