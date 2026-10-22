"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { CalendarDays, Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, type AppView } from "@/components/Sidebar";

interface AppLayoutProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isDarkMode: boolean;
  onThemeChange: () => void;
  onNewAppointment: () => void;
  children: ReactNode;
}

const subscribeToDate = () => () => {};
const getDateLabel = () =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
  }).format(new Date());
const getServerDateLabel = () => "";

const viewDescriptions: Record<AppView, string> = {
  dashboard: "Aquí tienes el resumen operativo y turnos programados para hoy.",
  appointments: "Consulta y administra las citas de tus clientas.",
  calendar: "Visualiza la agenda y disponibilidad horaria por profesional.",
  services: "Administra los servicios disponibles en el salón.",
};

export function AppLayout({
  currentView,
  onViewChange,
  isDarkMode,
  onThemeChange,
  onNewAppointment,
  children,
}: AppLayoutProps) {
  const todayLabel = useSyncExternalStore(
    subscribeToDate,
    getDateLabel,
    getServerDateLabel,
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        isDarkMode={isDarkMode}
        onThemeChange={onThemeChange}
      />
      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-5 sm:px-6 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="flex flex-col items-start justify-between gap-4 rounded-2xl border bg-popover p-5 shadow-sm sm:p-6 md:flex-row md:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <CalendarDays size={14} aria-hidden="true" />
                <span>Hoy, {todayLabel}</span>
              </div>
              <h1 className="text-2xl font-extrabold">¡Hola, Estre!</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {viewDescriptions[currentView]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" onClick={onNewAppointment}>
                <Plus aria-hidden="true" />
                Nueva cita
              </Button>
              <div
                aria-label="Perfil de usuario"
                className="flex size-10 items-center justify-center rounded-full border bg-muted"
              >
                <UserRound size={18} aria-hidden="true" />
              </div>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
