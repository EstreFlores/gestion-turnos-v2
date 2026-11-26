"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DashboardView } from "@/features/appointments/components/DashboardView";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import type { Appointment } from "@/features/appointments/types/appointment";
import type { AppView } from "@/components/Sidebar";

const AppointmentWorkspace = dynamic(
  () =>
    import("@/features/appointments/components/AppointmentWorkspace").then(
      (module) => module.AppointmentWorkspace,
    ),
  { loading: () => <ViewLoadingState /> },
);

function ViewLoadingState() {
  return (
    <section
      aria-label="Cargando vista"
      className="h-80 animate-pulse rounded-2xl bg-muted"
    />
  );
}

export default function Home() {
  const {
    appointments,
    services,
    loading,
    appointmentsError,
    servicesError,
    retry,
  } = useAppointments();
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] =
    useState<Appointment | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

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

  return (
    <AppLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      isDarkMode={isDarkMode}
      onThemeChange={() => setIsDarkMode((current) => !current)}
      onNewAppointment={openNewAppointment}
    >
      {currentView === "dashboard" && (
        <DashboardView
          appointments={appointments}
          services={services}
          loading={loading}
          error={appointmentsError ?? servicesError}
          onRetry={retry}
        />
      )}
      {(currentView !== "dashboard" || appointmentModalOpen) && (
        <AppointmentWorkspace
          currentView={currentView}
          appointments={appointments}
          services={services}
          loading={loading}
          appointmentsError={appointmentsError}
          servicesError={servicesError}
          retry={retry}
          appointmentModalOpen={appointmentModalOpen}
          appointmentToEdit={appointmentToEdit}
          onNewAppointment={openNewAppointment}
          onEditAppointment={openAppointmentToEdit}
          onCloseAppointmentModal={closeAppointmentModal}
        />
      )}
    </AppLayout>
  );
}
