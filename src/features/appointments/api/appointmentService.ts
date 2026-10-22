import type { Appointment, Service } from "../types/appointment";
import type { z } from "zod";
import {
  appointmentApiSchema,
  appointmentsApiSchema,
  servicesApiSchema,
} from "../schemas/appointmentApiSchema";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(
  /\/+$/,
  "",
);

function getApiUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error(
      "Falta configurar NEXT_PUBLIC_API_URL. Revisa el archivo .env.example.",
    );
  }

  return `${API_BASE_URL}${path}`;
}

async function parseJsonResponse<Schema extends z.ZodType>(
  response: Response,
  schema: Schema,
  errorMessage: string,
): Promise<z.output<Schema>> {
  if (!response.ok) {
    throw new Error(`${errorMessage} (HTTP ${response.status})`);
  }

  return schema.parse(await response.json());
}

export const appointmentService = {
  getServices: async (): Promise<Service[]> => {
    const response = await fetch(getApiUrl("/services"));
    return parseJsonResponse(
      response,
      servicesApiSchema,
      "Error al obtener los servicios",
    );
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const response = await fetch(getApiUrl("/appointments"));
    return parseJsonResponse(
      response,
      appointmentsApiSchema,
      "Error al obtener las citas",
    );
  },

  createAppointment: async (
    appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Appointment> => {
    const now = new Date().toISOString();
    const response = await fetch(getApiUrl("/appointments"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...appointment,
        createdAt: now,
        updatedAt: now,
      }),
    });

    return parseJsonResponse(
      response,
      appointmentApiSchema,
      "Error al crear la cita",
    );
  },

  updateAppointment: async (
    id: string,
    appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Appointment> => {
    const response = await fetch(
      getApiUrl(`/appointments/${encodeURIComponent(id)}`),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...appointment,
          updatedAt: new Date().toISOString(),
        }),
      },
    );

    return parseJsonResponse(
      response,
      appointmentApiSchema,
      "Error al actualizar la cita",
    );
  },

  updateAppointmentStatus: async (
    id: string,
    status: Appointment["status"],
  ): Promise<Appointment> => {
    const response = await fetch(
      getApiUrl(`/appointments/${encodeURIComponent(id)}`),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, updatedAt: new Date().toISOString() }),
      },
    );

    return parseJsonResponse(
      response,
      appointmentApiSchema,
      "Error al actualizar el estado de la cita",
    );
  },

  deleteAppointment: async (id: string): Promise<void> => {
    const response = await fetch(
      getApiUrl(`/appointments/${encodeURIComponent(id)}`),
      { method: "DELETE" },
    );

    if (!response.ok) {
      throw new Error(`Error al eliminar la cita (HTTP ${response.status})`);
    }
  },
};
