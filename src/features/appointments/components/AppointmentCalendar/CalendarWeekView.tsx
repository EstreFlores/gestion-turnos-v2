"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getProfessionalId,
  toDateKey,
} from "@/features/appointments/components/AppointmentCalendar/calendarUtils";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";
import type {
  Appointment,
  Service,
} from "@/features/appointments/types/appointment";

interface CalendarWeekViewProps {
  appointments: Appointment[];
  services: Service[];
  days: string[];
  timeSlots: string[];
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

export function CalendarWeekView({
  appointments,
  services,
  days,
  timeSlots,
  onSelectAppointment,
}: CalendarWeekViewProps) {
  const serviceNames = new Map(
    services.map((service) => [service.id, service.name]),
  );
  const professionalNames = new Map(
    PROFESSIONALS.map((professional) => [professional.id, professional.name]),
  );

  return (
    <div className="overflow-x-auto rounded-2xl border bg-popover shadow-sm">
      <div className="min-w-[980px]">
        <div className="grid grid-cols-[68px_repeat(7,minmax(130px,1fr))] border-b bg-muted/60">
          <div className="sticky left-0 z-10 flex items-center justify-center gap-1 border-r bg-muted p-2 text-[10px] font-semibold text-muted-foreground">
            <Clock3 size={12} aria-hidden="true" />
            Hora
          </div>
          {days.map((day) => {
            const date = parseISO(day);
            const isToday = day === toDateKey(new Date());

            return (
              <div
                key={day}
                className={`border-r p-2 text-center last:border-r-0 ${
                  isToday ? "bg-primary/10" : ""
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {format(date, "EEE", { locale: es })}
                </p>
                <p
                  className={`text-sm font-extrabold ${isToday ? "text-primary" : ""}`}
                >
                  {format(date, "d")}
                </p>
              </div>
            );
          })}
        </div>

        {timeSlots.map((time) => (
          <div
            key={time}
            className="grid grid-cols-[68px_repeat(7,minmax(130px,1fr))] border-b last:border-b-0"
          >
            <div className="sticky left-0 z-10 border-r bg-muted/20 p-2 text-center text-[10px] font-semibold text-muted-foreground">
              {time}
            </div>
            {days.map((day) => {
              const slotAppointments = appointments.filter(
                (appointment) =>
                  appointment.date === day && appointment.startTime === time,
              );

              return (
                <div
                  key={`${day}-${time}`}
                  className="min-h-24 space-y-1.5 border-r p-1.5 last:border-r-0"
                >
                  {slotAppointments.map((appointment) => (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => onSelectAppointment(appointment)}
                      className="w-full rounded-lg border border-primary/20 bg-primary/5 p-2 text-left transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="block truncate text-[11px] font-bold">
                        {appointment.clientName}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                        {serviceNames.get(appointment.serviceId) ??
                          "Servicio general"}
                      </span>
                      <span className="mt-1 flex items-center justify-between gap-1">
                        <span className="truncate text-[9px] text-muted-foreground">
                          {professionalNames.get(
                            getProfessionalId(appointment),
                          ) ?? "Profesional"}
                        </span>
                        <Badge
                          variant={statusVariants[appointment.status]}
                          className="px-1 py-0 text-[8px]"
                        >
                          {statusLabels[appointment.status]}
                        </Badge>
                      </span>
                    </button>
                  ))}
                  {slotAppointments.length === 0 && (
                    <div className="flex min-h-20 items-center justify-center text-[9px] text-muted-foreground/50">
                      Libre
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
