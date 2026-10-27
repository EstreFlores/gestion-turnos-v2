"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "@/components/ui/toastManager";
import { AppointmentModal } from "@/features/appointments/components/AppointmentModal";
import { AppointmentsView } from "@/features/appointments/components/AppointmentsView";
import { AppointmentCalendar } from "@/features/appointments/components/AppointmentCalendar";
import { DashboardView } from "@/features/appointments/components/DashboardView";
import { ServicesView } from "@/features/appointments/components/ServicesView";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import type { Appointment } from "@/features/appointments/types/appointment";
import type { AppView } from "@/components/Sidebar";

export default function Home() {
  const {
    appointments,
    services,
    loading,
    appointmentsError,
    servicesError,
    retry,
    create,
    update,
    updateStatus,
  } = useAppointments();
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] =
    useState<Appointment | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const notifyError = (title: string, error: Error) => {
    toast.add({
      title,
      description: error.message,
      type: "error",
    });
  };

  const openNewAppointment = () => {
    setAppointmentToEdit(null);
    setAppointmentModalOpen(true);
  };

  const openAppointmentToEdit = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setAppointmentModalOpen(true);
  };

  const closeAppointmentModal = () => {
    setAppointmentModalOpen(false);
    setAppointmentToEdit(null);
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

  return (
    <AppLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      isDarkMode={isDarkMode}
      onThemeChange={() => setIsDarkMode((current) => !current)}
      onNewAppointment={openNewAppointment}
    >
      {currentView === "dashboard" ? (
        <DashboardView
          appointments={appointments}
          services={services}
          loading={loading}
          error={appointmentsError ?? servicesError}
          onRetry={retry}
        />
      ) : currentView === "appointments" ? (
        <AppointmentsView
          appointments={appointments}
          services={services}
          loading={loading}
          error={appointmentsError ?? servicesError}
          updatingStatus={updateStatus.isPending}
          onRetry={retry}
          onNewAppointment={openNewAppointment}
          onEditAppointment={openAppointmentToEdit}
          onStatusChange={handleStatusChange}
        />
      ) : currentView === "calendar" ? (
        <AppointmentCalendar
          appointments={appointments}
          services={services}
          loading={loading}
          error={appointmentsError ?? servicesError}
          onRetry={retry}
          onNewAppointment={openNewAppointment}
          onSelectAppointment={openAppointmentToEdit}
        />
      ) : (
        <ServicesView
          services={services}
          loading={loading}
          error={servicesError}
          onRetry={retry}
        />
      )}
      <AppointmentModal
        open={appointmentModalOpen}
        appointment={appointmentToEdit}
        services={services}
        existingAppointments={appointments}
        saving={create.isPending || update.isPending}
        onClose={closeAppointmentModal}
        onSave={(appointment) => {
          if (appointmentToEdit) handleUpdate(appointment);
          else handleCreate(appointment);
          closeAppointmentModal();
        }}
      />
    </AppLayout>
  );
}
