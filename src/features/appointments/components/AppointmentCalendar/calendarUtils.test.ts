import { describe, expect, it } from "vitest";
import {
  changeCalendarDate,
  getMonthDays,
  getProfessionalId,
  getTimeSlots,
  getVisibleDateKeys,
  getWeekDays,
  parseDateKey,
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
    expect(toDateKey(parseDateKey("2026-10-28"))).toBe("2026-10-28");
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
    const slots = getTimeSlots([appointment]);

    expect(slots).toContain("08:30");
    expect(slots).toContain("08:00");
    expect(slots).toEqual([...slots].toSorted());
  });

  it("obtiene las fechas visibles según el modo de calendario", () => {
    const date = new Date(2026, 9, 28);

    expect(getVisibleDateKeys("day", date)).toEqual(["2026-10-28"]);
    expect(getVisibleDateKeys("week", date)).toHaveLength(7);
    expect(getVisibleDateKeys("month", date)).toHaveLength(35);
  });

  it("usa una profesional por defecto si la cita no tiene identificador", () => {
    expect(getProfessionalId({ ...appointment, professionalId: "" })).toBe(
      "camila-santos",
    );
  });

  it("avanza según el modo actual del calendario", () => {
    const date = new Date(2026, 9, 28);

    expect(toDateKey(changeCalendarDate(date, "day", 1))).toBe("2026-10-29");
    expect(toDateKey(changeCalendarDate(date, "week", -1))).toBe("2026-10-21");
    expect(toDateKey(changeCalendarDate(date, "month", 1))).toBe("2026-11-28");
  });
});
