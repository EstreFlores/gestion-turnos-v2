import { describe, expect, it } from "vitest";
import {
  appointmentApiSchema,
  serviceApiSchema,
} from "@/features/appointments/schemas/appointmentApiSchema";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";

describe("appointmentApiSchema", () => {
  const rawAppointment = {
    id: "appointment-1",
    clientName: "Ana López",
    clientPhone: null,
    serviceId: "service-1",
    professionalId: null,
    date: "2026-11-10",
    startTime: "10:00",
    durationMinutes: "45",
    status: "confirmed",
    notes: null,
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
  };

  it("normaliza los campos nulos y convierte la duración numérica", () => {
    const result = appointmentApiSchema.parse(rawAppointment);

    expect(result.clientPhone).toBeUndefined();
    expect(result.professionalId).toBe(PROFESSIONALS[0].id);
    expect(result.durationMinutes).toBe(45);
    expect(result.notes).toBeUndefined();
  });

  it("rechaza estados que no pertenecen al dominio", () => {
    const result = appointmentApiSchema.safeParse({
      ...rawAppointment,
      status: "booked",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza duración no positiva", () => {
    const result = appointmentApiSchema.safeParse({
      ...rawAppointment,
      durationMinutes: "-5",
    });

    expect(result.success).toBe(false);
  });
});

describe("serviceApiSchema", () => {
  it("coacciona precio y duración enviados como texto por la API", () => {
    const result = serviceApiSchema.parse({
      id: "service-1",
      name: "Limpieza facial",
      durationMinutes: "45",
      price: "85000",
    });

    expect(result.durationMinutes).toBe(45);
    expect(result.price).toBe(85000);
  });

  it("rechaza valores de precio inválidos", () => {
    const result = serviceApiSchema.safeParse({
      id: "service-1",
      name: "Limpieza facial",
      durationMinutes: "45",
      price: "-1",
    });

    expect(result.success).toBe(false);
  });
});
