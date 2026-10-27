import { format } from "date-fns";
import { CheckCircle2, Clock3, DollarSign, Users } from "lucide-react";
import type {
  Appointment,
  Service,
} from "@/features/appointments/types/appointment";

interface StatsCardsProps {
  appointments: Appointment[];
  services: Service[];
}

export function StatsCards({ appointments, services }: StatsCardsProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments.filter(
    (appointment) =>
      appointment.date === today && appointment.status !== "cancelled",
  );
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending",
  );
  const completedToday = appointments.filter(
    (appointment) =>
      appointment.date === today && appointment.status === "completed",
  );
  const servicePrices = new Map(
    services.map((service) => [service.id, service.price]),
  );
  const estimatedRevenue = todayAppointments.reduce(
    (total, appointment) =>
      total + (servicePrices.get(appointment.serviceId) ?? 0),
    0,
  );
  const currencyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const cards = [
    {
      label: "Citas de hoy",
      value: todayAppointments.length.toString(),
      description: "Programadas, sin contar canceladas",
      icon: Users,
      iconClass: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    },
    {
      label: "Pendientes de confirmar",
      value: pendingAppointments.length.toString(),
      description: "Citas pendientes de confirmación",
      icon: Clock3,
      iconClass:
        "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      label: "Completadas hoy",
      value: completedToday.length.toString(),
      description: "Citas completadas durante el día",
      icon: CheckCircle2,
      iconClass: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    },
    {
      label: "Ingresos estimados",
      value: currencyFormatter.format(estimatedRevenue),
      description: "Valor de los servicios agendados para hoy",
      icon: DollarSign,
      iconClass:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
  ];

  return (
    <section
      aria-label="Resumen de hoy"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map(({ label, value, description, icon: Icon, iconClass }) => (
        <article
          key={label}
          className="flex min-h-40 flex-col justify-between rounded-2xl border bg-popover p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </h2>
            <span className={`rounded-xl p-2 ${iconClass}`}>
              <Icon size={18} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </article>
      ))}
    </section>
  );
}
