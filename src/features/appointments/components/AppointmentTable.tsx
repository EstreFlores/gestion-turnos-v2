"use client";

import { format, parseISO } from "date-fns";
import {
  Check,
  CheckCheck,
  Clock3,
  Pencil,
  Phone,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";
import type {
  Appointment,
  Service,
} from "@/features/appointments/types/appointment";

interface AppointmentTableProps {
  appointments: Appointment[];
  services: Service[];
  totalAppointments: number;
  searchTerm: string;
  hasFilters: boolean;
  currentPage: number;
  totalPages: number;
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onStatusChange: (
    appointmentId: string,
    status: Appointment["status"],
  ) => void;
  onPageChange: (page: number) => void;
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

export function AppointmentTable({
  appointments,
  services,
  totalAppointments,
  searchTerm,
  hasFilters,
  currentPage,
  totalPages,
  onEdit,
  onCancel,
  onStatusChange,
  onPageChange,
}: AppointmentTableProps) {
  const servicesById = new Map(
    services.map((service) => [service.id, service.name]),
  );
  const professionalsById = new Map(
    PROFESSIONALS.map((professional) => [professional.id, professional.name]),
  );

  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="font-medium">
          {hasFilters
            ? "No hay citas que coincidan con los filtros."
            : "Todavía no hay citas registradas."}
        </p>
        {searchTerm && (
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba con otro nombre o teléfono.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Servicio y profesional</TableHead>
              <TableHead>Fecha y hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="min-w-40">
                  <p className="font-semibold">{appointment.clientName}</p>
                  {appointment.clientPhone && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone size={12} aria-hidden="true" />
                      {appointment.clientPhone}
                    </p>
                  )}
                </TableCell>
                <TableCell className="min-w-44">
                  <p>
                    {servicesById.get(appointment.serviceId) ??
                      "Servicio general"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {professionalsById.get(appointment.professionalId) ??
                      "Profesional"}
                  </p>
                </TableCell>
                <TableCell className="min-w-36">
                  <time
                    dateTime={`${appointment.date}T${appointment.startTime}`}
                  >
                    {format(parseISO(appointment.date), "dd/MM/yyyy")}
                  </time>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 size={12} aria-hidden="true" />
                    {appointment.startTime} · {appointment.durationMinutes} min
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[appointment.status]}>
                    {statusLabels[appointment.status]}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-32 text-right">
                  <div className="flex justify-end gap-2">
                    {appointment.status === "pending" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Confirmar cita de ${appointment.clientName}`}
                        onClick={() =>
                          onStatusChange(appointment.id, "confirmed")
                        }
                      >
                        <Check aria-hidden="true" />
                        <span className="sr-only sm:not-sr-only">
                          Confirmar
                        </span>
                      </Button>
                    )}
                    {appointment.status === "confirmed" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Completar cita de ${appointment.clientName}`}
                        onClick={() =>
                          onStatusChange(appointment.id, "completed")
                        }
                      >
                        <CheckCheck aria-hidden="true" />
                        <span className="sr-only sm:not-sr-only">
                          Completar
                        </span>
                      </Button>
                    )}
                    {appointment.status !== "cancelled" &&
                      appointment.status !== "completed" && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={`Editar cita de ${appointment.clientName}`}
                            onClick={() => onEdit(appointment)}
                          >
                            <Pencil aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">
                              Editar
                            </span>
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            aria-label={`Cancelar cita de ${appointment.clientName}`}
                            onClick={() => onCancel(appointment)}
                          >
                            <XCircle aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">
                              Cancelar
                            </span>
                          </Button>
                        </>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Mostrando {appointments.length} de {totalAppointments} citas · Página{" "}
          {currentPage} de {totalPages}
        </p>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
