"use client";

import {
  Calendar,
  CalendarDays,
  LayoutDashboard,
  Moon,
  Scissors,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type AppView = "dashboard" | "appointments" | "calendar" | "services";

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isDarkMode: boolean;
  onThemeChange: () => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "appointments", label: "Citas y turnos", icon: CalendarDays },
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "services", label: "Servicios", icon: Scissors },
] as const satisfies ReadonlyArray<{
  id: AppView;
  label: string;
  icon: typeof LayoutDashboard;
}>;

export function Sidebar({
  currentView,
  onViewChange,
  isDarkMode,
  onThemeChange,
}: SidebarProps) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-background md:flex">
        <div className="flex items-center gap-3 border-b p-6">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
            E
          </div>
          <div>
            <h2 className="text-sm font-bold">Glow by Estrella</h2>
            <span className="text-xs text-muted-foreground">
              GESTIÓN DE TURNOS
            </span>
          </div>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 space-y-1 p-4">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={currentView === id ? "page" : undefined}
              onClick={() => onViewChange(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                currentView === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-4 p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            onClick={onThemeChange}
            aria-label={
              isDarkMode ? "Activar modo claro" : "Activar modo oscuro"
            }
          >
            {isDarkMode ? "Modo claro" : "Modo oscuro"}
            {isDarkMode ? (
              <Sun aria-hidden="true" />
            ) : (
              <Moon aria-hidden="true" />
            )}
          </Button>
          <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3 text-xs">
            <span className="flex items-center gap-2 font-medium">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              ESTADO SALA
            </span>
            <span className="text-muted-foreground">4 en atención</span>
          </div>
        </div>
      </aside>

      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur md:hidden"
      >
        {navigationItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={currentView === id ? "page" : undefined}
            onClick={() => onViewChange(id)}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium ${
              currentView === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
