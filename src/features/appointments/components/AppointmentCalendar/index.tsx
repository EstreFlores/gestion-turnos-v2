"use client";

import { endOfWeek, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDayView } from "@/features/appointments/components/AppointmentCalendar/CalendarDayView";
import { CalendarMonthView } from "@/features/appointments/components/AppointmentCalendar/CalendarMonthView";
import { CalendarToolbar } from "@/features/appointments/components/AppointmentCalendar/CalendarToolbar";
import { CalendarWeekView } from "@/features/appointments/components/AppointmentCalendar/CalendarWeekView";
import {
  changeCalendarDate,
  getMonthDays,
  getTimeSlots,
  getVisibleDateKeys,
  getWeekDays,
  parseDateKey,
  toDateKey,
  type CalendarStatusFilter,
  type CalendarViewMode,
} from "@/features/appointments/components/AppointmentCalendar/calendarUtils";
import type {
  Appointment,
  AppointmentStatus,
  Service,
} from "@/features/appointments/types/appointment";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  services: Service[];
  loading: boolean;
  error?: Error | null;
  onRetry: () => void;
  onNewAppointment: () => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

const EMPTY_STATUS_COUNTS: Record<AppointmentStatus, number> = {
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0,
};

function getPeriodTitle(viewMode: CalendarViewMode, selectedDate: Date) {
  if (viewMode === "month") {
    return format(selectedDate, "MMMM yyyy", { locale: es });
  }

  if (viewMode === "week") {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, "d")} – ${format(end, "d 'de' MMMM yyyy", {
        locale: es,
      })}`;
    }
    return `${format(start, "d 'de' MMM", { locale: es })} – ${format(
      end,
      "d 'de' MMM yyyy",
      { locale: es },
    )}`;
  }

  return format(selectedDate, "EEEE d 'de' MMMM yyyy", { locale: es });
}

export function AppointmentCalendar({
  appointments,
  services,
  loading,
  error,
  onRetry,
  onNewAppointment,
  onSelectAppointment,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [statusFilter, setStatusFilter] = useState<CalendarStatusFilter>("all");
  const selectedDateValue = useMemo(
    () => parseDateKey(selectedDate),
    [selectedDate],
  );
  const weekDays = useMemo(
    () => getWeekDays(selectedDateValue),
    [selectedDateValue],
  );
  const monthDays = useMemo(
    () => getMonthDays(selectedDateValue),
    [selectedDateValue],
  );
  const appointmentsByDate = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      const current = grouped.get(appointment.date) ?? [];
      current.push(appointment);
      grouped.set(appointment.date, current);
    }
    return grouped;
  }, [appointments]);
  const visibleDateKeys = useMemo(
    () => getVisibleDateKeys(viewMode, selectedDateValue),
    [selectedDateValue, viewMode],
  );
  const visibleAppointments = useMemo(
    () => visibleDateKeys.flatMap((date) => appointmentsByDate.get(date) ?? []),
    [appointmentsByDate, visibleDateKeys],
  );
  const statusCounts = useMemo(
    () =>
      visibleAppointments.reduce(
        (counts, appointment) => {
          counts[appointment.status] += 1;
          return counts;
        },
        { ...EMPTY_STATUS_COUNTS },
      ),
    [visibleAppointments],
  );
  const filteredVisibleAppointments = useMemo(
    () =>
      visibleAppointments.filter(
        (appointment) =>
          statusFilter === "all" || appointment.status === statusFilter,
      ),
    [statusFilter, visibleAppointments],
  );
  const selectedDayAppointments = useMemo(
    () =>
      (appointmentsByDate.get(selectedDate) ?? []).filter(
        (appointment) =>
          statusFilter === "all" || appointment.status === statusFilter,
      ),
    [appointmentsByDate, selectedDate, statusFilter],
  );
  const weekTimeSlots = useMemo(
    () => getTimeSlots(filteredVisibleAppointments),
    [filteredVisibleAppointments],
  );
  const dayTimeSlots = useMemo(
    () => getTimeSlots(selectedDayAppointments),
    [selectedDayAppointments],
  );
  const periodTitle = getPeriodTitle(viewMode, selectedDateValue);

  if (loading) {
    return (
      <section aria-label="Cargando calendario" className="space-y-4">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-[32rem] rounded-2xl" />
      </section>
    );
  }

  if (error) {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-destructive/30 bg-popover p-6 shadow-sm"
      >
        <h2 className="font-semibold">No se pudo cargar el calendario</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Reintentar
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <CalendarToolbar
        viewMode={viewMode}
        selectedDate={selectedDate}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        periodTitle={periodTitle}
        onViewModeChange={setViewMode}
        onDateChange={(date) => {
          if (date) setSelectedDate(date);
        }}
        onStatusFilterChange={setStatusFilter}
        onPrevious={() =>
          setSelectedDate(
            toDateKey(changeCalendarDate(selectedDateValue, viewMode, -1)),
          )
        }
        onToday={() => setSelectedDate(toDateKey(new Date()))}
        onNext={() =>
          setSelectedDate(
            toDateKey(changeCalendarDate(selectedDateValue, viewMode, 1)),
          )
        }
        onNewAppointment={onNewAppointment}
      />

      {viewMode === "day" && (
        <CalendarDayView
          appointments={selectedDayAppointments}
          services={services}
          timeSlots={dayTimeSlots}
          onSelectAppointment={onSelectAppointment}
        />
      )}
      {viewMode === "week" && (
        <CalendarWeekView
          appointments={filteredVisibleAppointments}
          services={services}
          days={weekDays}
          timeSlots={weekTimeSlots}
          onSelectAppointment={onSelectAppointment}
        />
      )}
      {viewMode === "month" && (
        <CalendarMonthView
          appointmentsByDate={appointmentsByDate}
          statusFilter={statusFilter}
          services={services}
          days={monthDays}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setViewMode("day");
          }}
          onSelectAppointment={onSelectAppointment}
        />
      )}
    </div>
  );
}
