import type { z } from "zod";
import type {
  appointmentSchema,
  appointmentStatusSchema,
  appointmentFormSchema,
  serviceSchema,
} from "../schemas/appointmentSchema";

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type AppointmentFormValues = z.output<typeof appointmentFormSchema>;
export type AppointmentFormInput = z.input<typeof appointmentFormSchema>;

export interface Professional {
  id: string;
  name: string;
  specialty: string;
}
