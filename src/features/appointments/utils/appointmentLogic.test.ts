import { describe, expect, it } from "vitest";
import type { Appointment } from "@/features/appointments/types/appointment";
import {
  filterAppointments,
  findAppointmentOverlap,
} from "@/features/appointments/utils/appointmentLogic";

function createAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "appointment-1",
    clientName: "Ana López",
    clientPhone: "3001234567",
    serviceId: "service-1",
    professionalId: "camila-santos",
    date: "2026-11-10",
    startTime: "10:00",
    durationMinutes: 45,
    status: "confirmed",
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("findAppointmentOverlap", () => {
  const candidate = {
    date: "2026-11-10",
    startTime: "10:00",
    durationMinutes: 45,
    professionalId: "camila-santos",
  };

  it("detecta una cita simultánea de la misma profesional", () => {
    const existing = createAppointment();

    expect(findAppointmentOverlap([existing], candidate)).toBe(existing);
  });

  it("permite citas simultáneas con profesionales distintas", () => {
    const existing = createAppointment({
      professionalId: "mariana-gaviria",
    });

    expect(findAppointmentOverlap([existing], candidate)).toBeNull();
  });

  it("ignora citas canceladas", () => {
    const existing = createAppointment({ status: "cancelled" });

    expect(findAppointmentOverlap([existing], candidate)).toBeNull();
  });

  it("no considera conflicto una cita que inicia cuando termina la otra", () => {
    const existing = createAppointment({
      startTime: "09:15",
      durationMinutes: 45,
    });

    expect(findAppointmentOverlap([existing], candidate)).toBeNull();
  });

  it("ignora la misma cita al editarla", () => {
    const existing = createAppointment();

    expect(
      findAppointmentOverlap([existing], { ...candidate, id: existing.id }),
    ).toBeNull();
  });
});

describe("filterAppointments", () => {
  const appointments = [
    createAppointment({
      id: "late",
      date: "2026-11-11",
      startTime: "11:00",
      clientName: "María Gómez",
      clientPhone: "3115551234",
      status: "pending",
    }),
    createAppointment({
      id: "early",
      date: "2026-11-10",
      startTime: "09:00",
      clientName: "Ana López",
      clientPhone: "3001234567",
      status: "confirmed",
    }),
    createAppointment({
      id: "same-day-late",
      date: "2026-11-10",
      startTime: "14:00",
      clientName: "Ana López",
      clientPhone: "3009876543",
      status: "confirmed",
    }),
  ];

  it("busca por nombre sin distinguir mayúsculas y espacios externos", () => {
    const result = filterAppointments(appointments, {
      searchTerm: "  ANA ",
      selectedDate: "",
      selectedStatus: "all",
    });

    expect(result.map(({ id }) => id)).toEqual(["early", "same-day-late"]);
  });

  it("busca por teléfono y filtra al mismo tiempo por fecha y estado", () => {
    const result = filterAppointments(appointments, {
      searchTerm: "3009",
      selectedDate: "2026-11-10",
      selectedStatus: "confirmed",
    });

    expect(result.map(({ id }) => id)).toEqual(["same-day-late"]);
  });

  it("ordena por fecha y hora sin modificar la lista original", () => {
    const result = filterAppointments(appointments, {
      searchTerm: "",
      selectedDate: "",
      selectedStatus: "all",
    });

    expect(result.map(({ id }) => id)).toEqual([
      "early",
      "same-day-late",
      "late",
    ]);
    expect(appointments[0].id).toBe("late");
  });
});
