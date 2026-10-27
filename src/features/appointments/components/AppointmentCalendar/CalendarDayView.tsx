"use client";

import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";
import { getProfessionalId } from "@/features/appointments/components/AppointmentCalendar/calendarUtils";
import type {
  Appointment,
  Service,
} from "@/features/appointments/types/appointment";

interface CalendarDayViewProps {
  appointments: Appointment[];
  services: Service[];
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

export function CalendarDayView({
  appointments,
  services,
  timeSlots,
  onSelectAppointment,
}: CalendarDayViewProps) {
  const serviceNames = new Map(
    services.map((service) => [service.id, service.name]),
  );

  return (
    <div className="overflow-x-auto rounded-2xl border bg-popover shadow-sm">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[76px_repeat(4,minmax(0,1fr))] border-b bg-muted/60">
          <div className="flex items-center justify-center gap-1 border-r p-3 text-xs font-semibold text-muted-foreground">
            <Clock3 size={14} aria-hidden="true" />
            Hora
          </div>
          {PROFESSIONALS.map((professional) => (
            <div
              key={professional.id}
              className="min-w-0 border-r p-3 text-center last:border-r-0"
            >
              <p className="truncate text-xs font-bold">{professional.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {professional.specialty}
              </p>
            </div>
          ))}
        </div>

        <div>
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid min-h-24 grid-cols-[76px_repeat(4,minmax(0,1fr))] border-b last:border-b-0"
            >
              <div className="border-r bg-muted/20 p-3 text-center text-xs font-semibold text-muted-foreground">
                {time}
              </div>
              {PROFESSIONALS.map((professional) => {
                const slotAppointments = appointments.filter(
                  (appointment) =>
                    appointment.startTime === time &&
                    getProfessionalId(appointment) === professional.id,
                );

                return (
                  <div
                    key={professional.id}
                    className="min-w-0 border-r p-2 last:border-r-0"
                  >
                    {slotAppointments.length > 0 ? (
                      <div className="space-y-2">
                        {slotAppointments.map((appointment) => (
                          <button
                            key={appointment.id}
                            type="button"
                            onClick={() => onSelectAppointment(appointment)}
                            className="w-full rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-left transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <span className="block truncate text-xs font-bold">
                              {appointment.clientName}
                            </span>
                            <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                              {serviceNames.get(appointment.serviceId) ??
                                "Servicio general"}
                            </span>
                            <span className="mt-1.5 flex flex-wrap items-center justify-between gap-1">
                              <span className="text-[10px] text-muted-foreground">
                                {appointment.startTime} ·{" "}
                                {appointment.durationMinutes} min
                              </span>
                              <Badge
                                variant={statusVariants[appointment.status]}
                                className="px-1.5 py-0 text-[9px]"
                              >
                                {statusLabels[appointment.status]}
                              </Badge>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full min-h-20 items-center justify-center text-[10px] text-muted-foreground/60">
                        Disponible
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
