"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DashboardView } from "@/features/appointments/components/DashboardView";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
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
  } = useAppointments();
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

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
      ) : (
        <section className="rounded-2xl border bg-popover p-6 shadow-sm">
          <h2 className="text-xl font-bold">{viewTitles[currentView]}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta vista se migrará en su PR correspondiente.
          </p>
        </section>
      )}
    </AppLayout>
  );
}
