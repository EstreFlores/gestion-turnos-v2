"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../api/appointmentService";
import type { Appointment } from "../types/appointment";

const APPOINTMENTS_QUERY_KEY = ["appointments"] as const;

export function useAppointmentMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (appointment: Appointment) =>
      appointmentService.createAppointment({
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        serviceId: appointment.serviceId,
        professionalId: appointment.professionalId,
        date: appointment.date,
        startTime: appointment.startTime,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        notes: appointment.notes,
      }),
    onMutate: async (appointment) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
      );
      queryClient.setQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
        (current) => [...(current ?? []), appointment],
      );
      return { previousAppointments };
    },
    onSuccess: (createdAppointment, optimisticAppointment) => {
      queryClient.setQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
        (current) =>
          current?.map((appointment) =>
            appointment.id === optimisticAppointment.id
              ? createdAppointment
              : appointment,
          ),
      );
    },
    onError: (_error, _appointment, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(
          APPOINTMENTS_QUERY_KEY,
          context.previousAppointments,
        );
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
  });

  const update = useMutation({
    mutationFn: (appointment: Appointment) =>
      appointmentService.updateAppointment(appointment.id, {
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        serviceId: appointment.serviceId,
        professionalId: appointment.professionalId,
        date: appointment.date,
        startTime: appointment.startTime,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        notes: appointment.notes,
      }),
    onMutate: async (nextAppointment) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
      );
      queryClient.setQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
        (current) =>
          current?.map((appointment) =>
            appointment.id === nextAppointment.id
              ? nextAppointment
              : appointment,
          ),
      );
      return { previousAppointments };
    },
    onSuccess: (updatedAppointment) => {
      queryClient.setQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
        (current) =>
          current?.map((appointment) =>
            appointment.id === updatedAppointment.id
              ? updatedAppointment
              : appointment,
          ),
      );
    },
    onError: (_error, _appointment, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(
          APPOINTMENTS_QUERY_KEY,
          context.previousAppointments,
        );
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Appointment["status"];
    }) => appointmentService.updateAppointmentStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
      );
      queryClient.setQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
        (current) =>
          current?.map((appointment) =>
            appointment.id === id
              ? { ...appointment, status, updatedAt: new Date().toISOString() }
              : appointment,
          ),
      );
      return { previousAppointments };
    },
    onSuccess: (updatedAppointment) => {
      queryClient.setQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
        (current) =>
          current?.map((appointment) =>
            appointment.id === updatedAppointment.id
              ? updatedAppointment
              : appointment,
          ),
      );
    },
    onError: (_error, _variables, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(
          APPOINTMENTS_QUERY_KEY,
          context.previousAppointments,
        );
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
  });

  return { create, update, updateStatus };
}
