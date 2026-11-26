"use client";

import { useQuery } from "@tanstack/react-query";
import { appointmentService } from "../api/appointmentService";
import type { Appointment, Service } from "../types/appointment";

const APPOINTMENTS_QUERY_KEY = ["appointments"] as const;
const SERVICES_QUERY_KEY = ["services"] as const;
const EMPTY_APPOINTMENTS: Appointment[] = [];
const EMPTY_SERVICES: Service[] = [];

export function useAppointments() {
  const appointmentsQuery = useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: appointmentService.getAppointments,
  });
  const servicesQuery = useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: appointmentService.getServices,
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
  };
}
