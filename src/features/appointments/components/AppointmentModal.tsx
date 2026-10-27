"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";
import { appointmentFormSchema } from "@/features/appointments/schemas/appointmentSchema";
import type {
  Appointment,
  AppointmentFormInput,
  AppointmentFormValues,
  Service,
} from "@/features/appointments/types/appointment";

interface AppointmentModalProps {
  open: boolean;
  appointment: Appointment | null;
  services: Service[];
  existingAppointments: Appointment[];
  saving: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
}

const fieldClassName =
  "mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AppointmentModal({
  open,
  appointment,
  services,
  existingAppointments,
  saving,
  onClose,
  onSave,
}: AppointmentModalProps) {
  const defaultValues = useMemo<AppointmentFormInput>(
    () => ({
      clientName: "",
      clientPhone: "",
      serviceId: services[0]?.id ?? "",
      professionalId: PROFESSIONALS[0]?.id ?? "",
      date: "",
      startTime: "",
      durationMinutes: services[0]?.durationMinutes ?? 45,
      notes: "",
      status: "pending",
    }),
    [services],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormInput, undefined, AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (appointment) {
      reset({
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone ?? "",
        serviceId: appointment.serviceId,
        professionalId: appointment.professionalId,
        date: appointment.date,
        startTime: appointment.startTime,
        durationMinutes: appointment.durationMinutes,
        notes: appointment.notes ?? "",
        status: appointment.status,
      });
      return;
    }

    reset(defaultValues);
  }, [appointment, defaultValues, open, reset]);

  const [serviceId, professionalId, date, startTime, durationMinutes] =
    useWatch({
      control,
      name: [
        "serviceId",
        "professionalId",
        "date",
        "startTime",
        "durationMinutes",
      ],
    });
  const selectedService = services.find((service) => service.id === serviceId);
  const endTime = useMemo(() => {
    if (!startTime || !durationMinutes) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const total = hours * 60 + minutes + Number(durationMinutes);
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }, [durationMinutes, startTime]);

  const overlapConflict = useMemo(() => {
    if (!date || !startTime || !professionalId || !durationMinutes) return null;
    const [hours, minutes] = startTime.split(":").map(Number);
    const start = hours * 60 + minutes;
    const end = start + Number(durationMinutes);

    return existingAppointments.find((existing) => {
      if (existing.id === appointment?.id) return false;
      if (existing.date !== date || existing.status === "cancelled")
        return false;
      if (existing.professionalId !== professionalId) return false;

      const [existingHours, existingMinutes] = existing.startTime
        .split(":")
        .map(Number);
      const existingStart = existingHours * 60 + existingMinutes;
      const existingEnd = existingStart + existing.durationMinutes;

      return start < existingEnd && end > existingStart;
    });
  }, [
    appointment?.id,
    date,
    durationMinutes,
    existingAppointments,
    professionalId,
    startTime,
  ]);

  const onSubmit = (values: AppointmentFormValues) => {
    if (overlapConflict) return;

    const now = new Date().toISOString();
    onSave({
      ...(appointment ?? {
        id: `optimistic-${crypto.randomUUID()}`,
        createdAt: now,
      }),
      ...values,
      durationMinutes: Number(values.durationMinutes),
      notes: values.notes?.trim() || undefined,
      status: appointment?.status ?? values.status,
      updatedAt: now,
    });
  };

  const selectedServiceField = register("serviceId");
  const minDate = format(new Date(), "yyyy-MM-dd");

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editar cita" : "Nueva cita"}
          </DialogTitle>
          <DialogDescription>
            Completa los datos de la clienta y el horario del servicio.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Nombre de la clienta
              <input
                {...register("clientName")}
                autoComplete="name"
                className={fieldClassName}
                aria-invalid={Boolean(errors.clientName)}
              />
              {errors.clientName?.message && (
                <span className="mt-1 block text-xs text-destructive">
                  {errors.clientName.message}
                </span>
              )}
            </label>
            <label className="text-sm font-medium">
              Teléfono
              <input
                {...register("clientPhone")}
                type="tel"
                autoComplete="tel"
                className={fieldClassName}
                aria-invalid={Boolean(errors.clientPhone)}
              />
              {errors.clientPhone?.message && (
                <span className="mt-1 block text-xs text-destructive">
                  {errors.clientPhone.message}
                </span>
              )}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Servicio
              <select
                {...selectedServiceField}
                className={fieldClassName}
                aria-invalid={Boolean(errors.serviceId)}
                onChange={(event) => {
                  selectedServiceField.onChange(event);
                  const service = services.find(
                    (item) => item.id === event.target.value,
                  );
                  if (service) {
                    setValue("durationMinutes", service.durationMinutes, {
                      shouldValidate: true,
                    });
                  }
                }}
              >
                <option value="">Selecciona un servicio</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} · {service.durationMinutes} min
                  </option>
                ))}
              </select>
              {errors.serviceId?.message && (
                <span className="mt-1 block text-xs text-destructive">
                  {errors.serviceId.message}
                </span>
              )}
            </label>
            <label className="text-sm font-medium">
              Profesional
              <select
                {...register("professionalId")}
                className={fieldClassName}
                aria-invalid={Boolean(errors.professionalId)}
              >
                {PROFESSIONALS.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name} · {professional.specialty}
                  </option>
                ))}
              </select>
              {errors.professionalId?.message && (
                <span className="mt-1 block text-xs text-destructive">
                  {errors.professionalId.message}
                </span>
              )}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium">
              Fecha
              <input
                {...register("date")}
                type="date"
                min={minDate}
                className={fieldClassName}
                aria-invalid={Boolean(errors.date)}
              />
              {errors.date?.message && (
                <span className="mt-1 block text-xs text-destructive">
                  {errors.date.message}
                </span>
              )}
            </label>
            <label className="text-sm font-medium">
              Hora de inicio
              <input
                {...register("startTime")}
                type="time"
                className={fieldClassName}
                aria-invalid={Boolean(errors.startTime || overlapConflict)}
              />
              {errors.startTime?.message && (
                <span className="mt-1 block text-xs text-destructive">
                  {errors.startTime.message}
                </span>
              )}
            </label>
            <div className="text-sm font-medium">
              Duración estimada
              <div className={`${fieldClassName} text-muted-foreground`}>
                {selectedService?.durationMinutes ??
                  Number(durationMinutes) ??
                  45}{" "}
                min {endTime && `· Fin ${endTime}`}
              </div>
            </div>
          </div>

          {overlapConflict && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
            >
              {professionalsName(professionalId)} ya tiene una cita con{" "}
              {overlapConflict.clientName} a las {overlapConflict.startTime}.
            </p>
          )}

          <label className="block text-sm font-medium">
            Notas{" "}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
            <textarea
              {...register("notes")}
              rows={3}
              className={fieldClassName}
              placeholder="Preferencias o información adicional"
            />
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Volver
            </Button>
            <Button
              type="submit"
              disabled={saving || Boolean(overlapConflict) || !selectedService}
            >
              {saving
                ? "Guardando..."
                : appointment
                  ? "Guardar cambios"
                  : "Crear cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function professionalsName(professionalId: string) {
  return (
    PROFESSIONALS.find((professional) => professional.id === professionalId)
      ?.name ?? "La profesional seleccionada"
  );
}
