"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CalendarStatusFilter,
  CalendarViewMode,
} from "@/features/appointments/components/AppointmentCalendar/calendarUtils";
import type { AppointmentStatus } from "@/features/appointments/types/appointment";

interface CalendarToolbarProps {
  viewMode: CalendarViewMode;
  selectedDate: string;
  statusFilter: CalendarStatusFilter;
  statusCounts: Record<AppointmentStatus, number>;
  periodTitle: string;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onDateChange: (date: string) => void;
  onStatusFilterChange: (status: CalendarStatusFilter) => void;
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
  onNewAppointment: () => void;
}

const viewOptions: { value: CalendarViewMode; label: string }[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

const statusOptions: {
  value: AppointmentStatus;
  label: string;
  color: string;
}[] = [
  { value: "pending", label: "Pendientes", color: "text-amber-700" },
  { value: "confirmed", label: "Confirmadas", color: "text-sky-700" },
  { value: "completed", label: "Completadas", color: "text-emerald-700" },
  { value: "cancelled", label: "Canceladas", color: "text-rose-700" },
];

export function CalendarToolbar({
  viewMode,
  selectedDate,
  statusFilter,
  statusCounts,
  periodTitle,
  onViewModeChange,
  onDateChange,
  onStatusFilterChange,
  onPrevious,
  onToday,
  onNext,
  onNewAppointment,
}: CalendarToolbarProps) {
  const periodLabel =
    viewMode === "month" ? "mes" : viewMode === "week" ? "semana" : "día";

  return (
    <section className="space-y-4 rounded-2xl border bg-popover p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div
            aria-label="Cambiar vista del calendario"
            className="flex rounded-xl bg-muted p-1"
          >
            {viewOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={viewMode === option.value}
                onClick={() => onViewModeChange(option.value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  viewMode === option.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Ver ${periodLabel} anterior`}
              onClick={onPrevious}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onToday}>
              <RotateCcw aria-hidden="true" />
              Hoy
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Ver ${periodLabel} siguiente`}
              onClick={onNext}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>

          <label className="flex h-10 items-center gap-2 rounded-xl border bg-background px-3">
            <CalendarDays
              size={16}
              aria-hidden="true"
              className="text-muted-foreground"
            />
            <span className="sr-only">Seleccionar fecha</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
              className="min-w-0 bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        <Button type="button" onClick={onNewAppointment}>
          <Plus aria-hidden="true" />
          Nueva cita
        </Button>
      </div>

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold capitalize">{periodTitle}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={statusFilter === "all"}
            onClick={() => onStatusFilterChange("all")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              statusFilter === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            Todos
          </button>
          {statusOptions.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              aria-pressed={statusFilter === value}
              onClick={() =>
                onStatusFilterChange(statusFilter === value ? "all" : value)
              }
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                statusFilter === value
                  ? "border-current bg-muted"
                  : "text-muted-foreground hover:bg-muted"
              } ${statusFilter === value ? color : ""}`}
            >
              {label} ({statusCounts[value]})
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
