"use client";

import { Clock3, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Service } from "@/features/appointments/types/appointment";

interface ServicesViewProps {
  services: Service[];
  loading: boolean;
  error?: Error | null;
  onRetry: () => void;
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function ServicesView({
  services,
  loading,
  error,
  onRetry,
}: ServicesViewProps) {
  if (loading) {
    return (
      <section aria-label="Cargando servicios">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-48 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-destructive/30 bg-popover p-6 shadow-sm"
      >
        <h2 className="font-semibold">No se pudieron cargar los servicios</h2>
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

  return (
    <section
      aria-labelledby="services-title"
      className="space-y-5 rounded-2xl border bg-popover p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 id="services-title" className="text-xl font-bold">
          Servicios
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Catálogo de tratamientos, duración y precios disponibles.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Scissors
            className="mx-auto size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-3 font-medium">
            Todavía no hay servicios registrados.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuando el catálogo esté disponible, aparecerá aquí.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {services.length}{" "}
            {services.length === 1
              ? "servicio disponible"
              : "servicios disponibles"}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex min-h-44 flex-col justify-between rounded-2xl border bg-background p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Scissors size={19} aria-hidden="true" />
                  </span>
                  <h3 className="pt-1 font-semibold">{service.name}</h3>
                </div>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <p className="text-xl font-extrabold">
                    {currencyFormatter.format(service.price)}
                  </p>
                  <p className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock3 size={15} aria-hidden="true" />
                    {service.durationMinutes} min
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
