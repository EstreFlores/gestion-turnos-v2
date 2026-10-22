"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "@/components/ui/toastManager";
import type { AppView } from "@/components/Sidebar";

const viewTitles: Record<AppView, string> = {
  dashboard: "Dashboard",
  appointments: "Citas y turnos",
  calendar: "Calendario",
  services: "Servicios",
};

export default function Home() {
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
      onNewAppointment={() =>
        toast.add({
          title: "ejemplo",
          description: "ejeejjeje.",
          type: "info",
        })
      }
    >
      <section
        aria-labelledby="view-title"
        className="rounded-2xl border bg-popover p-6 shadow-sm"
      >
        <p className="text-sm font-semibold text-primary">Prueba de la V2</p>
        <h2 id="view-title" className="mt-2 text-2xl font-bold">
          {viewTitles[currentView]}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          kalalalallaal
        </p>
      </section>
    </AppLayout>
  );
}
