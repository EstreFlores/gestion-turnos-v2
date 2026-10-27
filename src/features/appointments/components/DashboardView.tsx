import { format, parseISO } from "date-fns";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";
import type {
  Appointment,
  Service,
} from "@/features/appointments/types/appointment";
import { StatsCards } from "@/features/appointments/components/StatsCards";

interface DashboardViewProps {
  appointments: Appointment[];
  services: Service[];
  loading: boolean;
  error?: Error | null;
  onRetry: () => void;
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

export function DashboardView({
  appointments,
  services,
  loading,
  error,
  onRetry,
}: DashboardViewProps) {
  if (loading) {
    return (
      <div className="space-y-6" aria-label="Cargando el dashboard">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-destructive/30 bg-popover p-6 shadow-sm"
      >
        <h2 className="font-semibold">No se pudo cargar el dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          Reintentar
        </Button>
      </section>
    );
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments
    .filter(
      (appointment) =>
        appointment.date === today && appointment.status !== "cancelled",
    )
    .toSorted((first, second) =>
      first.startTime.localeCompare(second.startTime),
    )
    .slice(0, 5);
  const servicesById = new Map(
    services.map((service) => [service.id, service.name]),
  );
  const professionalsById = new Map(
    PROFESSIONALS.map((professional) => [professional.id, professional.name]),
  );

  return (
    <div className="space-y-6">
      <StatsCards appointments={appointments} services={services} />

      <section
        aria-labelledby="today-appointments-title"
        className="rounded-2xl border bg-popover p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary/10 p-2 text-primary">
            <CalendarClock size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="today-appointments-title" className="font-bold">
              Citas de hoy
            </h2>
            <p className="text-sm text-muted-foreground">
              Próximas citas programadas para el día
            </p>
          </div>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">No hay citas programadas para hoy.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando registres citas, aparecerán aquí.
            </p>
          </div>
        ) : (
          <ul className="mt-5 divide-y">
            {todayAppointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <time
                  dateTime={`${appointment.date}T${appointment.startTime}`}
                  className="w-16 shrink-0 text-sm font-bold tabular-nums"
                >
                  {appointment.startTime}
                </time>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {appointment.clientName}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {servicesById.get(appointment.serviceId) ??
                      "Servicio general"}
                    {" · "}
                    {professionalsById.get(appointment.professionalId) ??
                      "Profesional"}
                    {" · "}
                    {format(parseISO(appointment.date), "dd/MM/yyyy")}
                  </p>
                </div>
                <Badge variant={statusVariants[appointment.status]}>
                  {statusLabels[appointment.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
