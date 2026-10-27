"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toDateKey } from "@/features/appointments/components/AppointmentCalendar/calendarUtils";
import type {
  Appointment,
  Service,
} from "@/features/appointments/types/appointment";

interface CalendarMonthViewProps {
  appointmentsByDate: Map<string, Appointment[]>;
  statusFilter: Appointment["status"] | "all";
  services: Service[];
  days: Date[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

const statusLabels: Record<Appointment["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusVariants: Record<
  Appointment["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  completed: "outline",
  cancelled: "destructive",
};

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function CalendarMonthView({
  appointmentsByDate,
  statusFilter,
  services,
  days,
  selectedDate,
  onSelectDate,
  onSelectAppointment,
}: CalendarMonthViewProps) {
  const selectedMonth = new Date(`${selectedDate}T00:00:00`).getMonth();
  const serviceNames = new Map(
    services.map((service) => [service.id, service.name]),
  );

  return (
    <div className="overflow-hidden rounded-2xl border bg-popover shadow-sm">
      <div className="grid grid-cols-7 border-b bg-muted/60">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="border-r p-2 text-center text-[10px] font-bold uppercase text-muted-foreground last:border-r-0 sm:p-3 sm:text-xs"
          >
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const isToday = dateKey === toDateKey(new Date());
          const isCurrentMonth = day.getMonth() === selectedMonth;
          const dayAppointments = (appointmentsByDate.get(dateKey) ?? [])
            .filter(
              (appointment) =>
                statusFilter === "all" || appointment.status === statusFilter,
            )
            .toSorted((first, second) =>
              first.startTime.localeCompare(second.startTime),
            );

          return (
            <div
              key={dateKey}
              className={`min-h-28 border-b border-r p-1.5 last:border-r-0 sm:min-h-36 sm:p-2 ${
                isCurrentMonth
                  ? "bg-popover"
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectDate(dateKey)}
                aria-label={`Ver citas del ${format(day, "d 'de' MMMM", {
                  locale: es,
                })}`}
                aria-current={isToday ? "date" : undefined}
                className={`mb-1 flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {format(day, "d")}
              </button>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => onSelectAppointment(appointment)}
                    title={`${appointment.startTime} · ${appointment.clientName} · ${serviceNames.get(appointment.serviceId) ?? "Servicio general"}`}
                    className="block w-full truncate rounded-md border border-primary/20 bg-primary/5 px-1.5 py-1 text-left text-[9px] leading-tight transition hover:border-primary/50 sm:text-[11px]"
                  >
                    <span className="font-semibold">
                      {appointment.startTime}
                    </span>{" "}
                    {appointment.clientName}
                  </button>
                ))}
                {dayAppointments.length > 3 && (
                  <button
                    type="button"
                    onClick={() => onSelectDate(dateKey)}
                    className="px-1 text-[9px] font-semibold text-primary hover:underline sm:text-[10px]"
                  >
                    +{dayAppointments.length - 3} más
                  </button>
                )}
                {dayAppointments.length > 0 && (
                  <div className="hidden flex-wrap gap-0.5 lg:flex">
                    {(
                      [
                        "pending",
                        "confirmed",
                        "completed",
                        "cancelled",
                      ] as const
                    )
                      .filter((status) =>
                        dayAppointments.some(
                          (appointment) => appointment.status === status,
                        ),
                      )
                      .map((status) => (
                        <Badge
                          key={status}
                          variant={statusVariants[status]}
                          className="px-1 py-0 text-[8px]"
                        >
                          {
                            dayAppointments.filter(
                              (appointment) => appointment.status === status,
                            ).length
                          }{" "}
                          {statusLabels[status]}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
