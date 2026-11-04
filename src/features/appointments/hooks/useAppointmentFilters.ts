"use client";

import { useMemo, useState } from "react";
import type { Appointment } from "@/features/appointments/types/appointment";
import { filterAppointments } from "@/features/appointments/utils/appointmentLogic";

export function useAppointmentFilters(appointments: Appointment[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    Appointment["status"] | "all"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredAppointments = useMemo(
    () =>
      filterAppointments(appointments, {
        searchTerm,
        selectedDate,
        selectedStatus,
      }),
    [appointments, searchTerm, selectedDate, selectedStatus],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAppointments.length / pageSize),
  );
  const displayedPage = Math.min(currentPage, totalPages);

  return {
    searchTerm,
    selectedDate,
    selectedStatus,
    currentPage: displayedPage,
    totalPages,
    totalFilteredAppointments: filteredAppointments.length,
    paginatedAppointments: filteredAppointments.slice(
      (displayedPage - 1) * pageSize,
      displayedPage * pageSize,
    ),
    updateSearchTerm: (value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
    },
    updateSelectedDate: (value: string) => {
      setSelectedDate(value);
      setCurrentPage(1);
    },
    updateSelectedStatus: (value: Appointment["status"] | "all") => {
      setSelectedStatus(value);
      setCurrentPage(1);
    },
    setCurrentPage,
  };
}
