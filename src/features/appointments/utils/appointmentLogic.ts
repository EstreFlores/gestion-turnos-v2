import type { Appointment } from "@/features/appointments/types/appointment";

type AppointmentOverlapCandidate = Pick<
  Appointment,
  "date" | "startTime" | "durationMinutes" | "professionalId"
> & {
  id?: Appointment["id"];
};

interface AppointmentFilters {
  searchTerm: string;
  selectedDate: string;
  selectedStatus: Appointment["status"] | "all";
}

function getMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function findAppointmentOverlap(
  appointments: Appointment[],
  candidate: AppointmentOverlapCandidate,
) {
  const candidateStart = getMinutes(candidate.startTime);
  const candidateEnd = candidateStart + candidate.durationMinutes;

  return (
    appointments.find((existing) => {
      if (existing.id === candidate.id) return false;
      if (existing.date !== candidate.date || existing.status === "cancelled")
        return false;
      if (existing.professionalId !== candidate.professionalId) return false;

      const existingStart = getMinutes(existing.startTime);
      const existingEnd = existingStart + existing.durationMinutes;

      return candidateStart < existingEnd && candidateEnd > existingStart;
    }) ?? null
  );
}

export function filterAppointments(
  appointments: Appointment[],
  { searchTerm, selectedDate, selectedStatus }: AppointmentFilters,
) {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  return appointments
    .filter((appointment) => {
      const matchesSearch =
        !normalizedSearch ||
        appointment.clientName.toLocaleLowerCase().includes(normalizedSearch) ||
        appointment.clientPhone?.includes(normalizedSearch);
      const matchesDate = !selectedDate || appointment.date === selectedDate;
      const matchesStatus =
        selectedStatus === "all" || appointment.status === selectedStatus;

      return matchesSearch && matchesDate && matchesStatus;
    })
    .toSorted(
      (first, second) =>
        first.date.localeCompare(second.date) ||
        first.startTime.localeCompare(second.startTime),
    );
}
