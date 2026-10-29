import { describe, expect, it } from "vitest";
import { appointmentFormSchema } from "@/features/appointments/schemas/appointmentSchema";

const validAppointment = {
  clientName: "Cliente Prueba",
  clientPhone: "+57 3001234567",
  serviceId: "service-1",
  professionalId: "camila-santos",
  date: "2099-12-31",
  startTime: "09:30",
  durationMinutes: "45",
  notes: "",
  status: "pending",
};

describe("appointmentFormSchema", () => {
  it("acepta datos válidos y convierte la duración a número", () => {
    const result = appointmentFormSchema.safeParse(validAppointment);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMinutes).toBe(45);
    }
  });

  it("rechaza nombres que contienen caracteres no permitidos", () => {
    const result = appointmentFormSchema.safeParse({
      ...validAppointment,
      clientName: "Cliente123",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza fechas anteriores al día actual", () => {
    const result = appointmentFormSchema.safeParse({
      ...validAppointment,
      date: "2020-01-01",
    });

    expect(result.success).toBe(false);
  });
});
