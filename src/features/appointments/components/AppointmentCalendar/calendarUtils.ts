import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import type { Appointment } from "@/features/appointments/types/appointment";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";

export type CalendarViewMode = "day" | "week" | "month";
export type CalendarStatusFilter = Appointment["status"] | "all";

const DEFAULT_TIME_SLOTS = Array.from(
  { length: 11 },
  (_, index) => `${String(index + 8).padStart(2, "0")}:00`,
);

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getTimeSlots(appointments: Appointment[]) {
  return [
    ...new Set([
      ...DEFAULT_TIME_SLOTS,
      ...appointments.map((appointment) => appointment.startTime),
    ]),
  ].toSorted();
}

export function getProfessionalId(appointment: Appointment) {
  return appointment.professionalId || PROFESSIONALS[0]?.id || "";
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end }).map(toDateKey);
}

export function getMonthDays(date: Date) {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });
}

export function changeCalendarDate(
  date: Date,
  viewMode: CalendarViewMode,
  direction: -1 | 1,
) {
  if (viewMode === "month") {
    return direction < 0 ? subMonths(date, 1) : addMonths(date, 1);
  }

  return direction < 0
    ? subDays(date, viewMode === "week" ? 7 : 1)
    : addDays(date, viewMode === "week" ? 7 : 1);
}

export function getVisibleDateKeys(
  viewMode: CalendarViewMode,
  selectedDate: Date,
) {
  if (viewMode === "day") return [toDateKey(selectedDate)];
  if (viewMode === "week") return getWeekDays(selectedDate);
  return getMonthDays(selectedDate).map(toDateKey);
}
