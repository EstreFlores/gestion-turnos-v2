"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "@/components/ui/toastManager";
import { AppointmentModal } from "@/features/appointments/components/AppointmentModal";
import { AppointmentsView } from "@/features/appointments/components/AppointmentsView";
import { AppointmentCalendar } from "@/features/appointments/components/AppointmentCalendar";
import { DashboardView } from "@/features/appointments/components/DashboardView";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import type { Appointment } from "@/features/appointments/types/appointment";
import type { AppView } from "@/components/Sidebar";

const viewTitles: Record<AppView, string> = {
  dashboard: "Dashboard",
  appointments: "Citas y turnos",
  calendar: "Calendario",
  services: "Servicios",
};

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
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarAppointmentToEdit, setCalendarAppointmentToEdit] =
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
      onNewAppointment={() => setCurrentView("appointments")}
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
          savingAppointment={create.isPending || update.isPending}
          updatingStatus={updateStatus.isPending}
          onRetry={retry}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onStatusChange={handleStatusChange}
        />
      ) : currentView === "calendar" ? (
        <AppointmentCalendar
          appointments={appointments}
          services={services}
          loading={loading}
          error={appointmentsError ?? servicesError}
          onRetry={retry}
          onNewAppointment={() => {
            setCalendarAppointmentToEdit(null);
            setCalendarModalOpen(true);
          }}
          onSelectAppointment={(appointment) => {
            setCalendarAppointmentToEdit(appointment);
            setCalendarModalOpen(true);
          }}
        />
      ) : (
        <section className="rounded-2xl border bg-popover p-6 shadow-sm">
          <h2 className="text-xl font-bold">{viewTitles[currentView]}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            llllllllllllllllllllllllll
          </p>
        </section>
      )}
      {currentView === "calendar" && (
        <AppointmentModal
          open={calendarModalOpen}
          appointment={calendarAppointmentToEdit}
          services={services}
          existingAppointments={appointments}
          saving={create.isPending || update.isPending}
          onClose={() => {
            setCalendarModalOpen(false);
            setCalendarAppointmentToEdit(null);
          }}
          onSave={(appointment) => {
            if (calendarAppointmentToEdit) handleUpdate(appointment);
            else handleCreate(appointment);
            setCalendarModalOpen(false);
            setCalendarAppointmentToEdit(null);
          }}
        />
      )}
    </AppLayout>
  );
}
