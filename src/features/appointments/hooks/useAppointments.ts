"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../api/appointmentService";
import type { Appointment, Service } from "../types/appointment";

const APPOINTMENTS_QUERY_KEY = ["appointments"] as const;
const SERVICES_QUERY_KEY = ["services"] as const;
const EMPTY_APPOINTMENTS: Appointment[] = [];
const EMPTY_SERVICES: Service[] = [];

export function useAppointments() {
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: appointmentService.getAppointments,
  });
  const servicesQuery = useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: appointmentService.getServices,
  });

  const createMutation = useMutation({
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

  const updateMutation = useMutation({
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

  const updateStatusMutation = useMutation({
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

  const deleteMutation = useMutation({
    mutationFn: (appointment: Appointment) =>
      appointmentService.deleteAppointment(appointment.id),
    onMutate: async (appointment) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
      );
      queryClient.setQueryData<Appointment[]>(
        APPOINTMENTS_QUERY_KEY,
        (current) => current?.filter((item) => item.id !== appointment.id),
      );
      return { previousAppointments };
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

  return {
    appointments: appointmentsQuery.data ?? EMPTY_APPOINTMENTS,
    services: servicesQuery.data ?? EMPTY_SERVICES,
    loading: appointmentsQuery.isLoading || servicesQuery.isLoading,
    appointmentsError: appointmentsQuery.error,
    servicesError: servicesQuery.error,
    retry: () => {
      void Promise.all([appointmentsQuery.refetch(), servicesQuery.refetch()]);
    },
    create: createMutation,
    update: updateMutation,
    updateStatus: updateStatusMutation,
    remove: deleteMutation,
  };
}
