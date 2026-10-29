import { describe, expect, it } from "vitest";
import {
  changeCalendarDate,
  getMonthDays,
  getTimeSlots,
  getWeekDays,
  toDateKey,
} from "@/features/appointments/components/AppointmentCalendar/calendarUtils";
import type { Appointment } from "@/features/appointments/types/appointment";

const appointment: Appointment = {
  id: "appointment-1",
  clientName: "Cliente de prueba",
  serviceId: "service-1",
  professionalId: "camila-santos",
  date: "2026-10-28",
  startTime: "08:30",
  durationMinutes: 45,
  status: "confirmed",
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
};

describe("calendarUtils", () => {
  it("convierte fechas a claves locales ISO", () => {
    expect(toDateKey(new Date(2026, 9, 28))).toBe("2026-10-28");
  });

  it("construye la semana empezando en lunes", () => {
    expect(getWeekDays(new Date(2026, 9, 28))).toEqual([
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
    ]);
  });

  it("incluye días adyacentes para completar las semanas del mes", () => {
    const days = getMonthDays(new Date(2026, 9, 28));

    expect(days).toHaveLength(35);
    expect(toDateKey(days[0])).toBe("2026-09-28");
    expect(toDateKey(days[days.length - 1])).toBe("2026-11-01");
  });

  it("combina los horarios estándar con horas específicas de citas", () => {
    expect(getTimeSlots([appointment])).toContain("08:30");
    expect(getTimeSlots([appointment])).toContain("08:00");
  });

  it("avanza según el modo actual del calendario", () => {
    const date = new Date(2026, 9, 28);

    expect(toDateKey(changeCalendarDate(date, "day", 1))).toBe("2026-10-29");
    expect(toDateKey(changeCalendarDate(date, "week", -1))).toBe("2026-10-21");
    expect(toDateKey(changeCalendarDate(date, "month", 1))).toBe("2026-11-28");
  });
});
