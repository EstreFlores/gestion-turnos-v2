"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/features/appointments/types/appointment";

interface CancelAppointmentDialogProps {
  appointment: Appointment | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelAppointmentDialog({
  appointment,
  saving,
  onClose,
  onConfirm,
}: CancelAppointmentDialogProps) {
  return (
    <Dialog
      open={Boolean(appointment)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cancelar esta cita?</DialogTitle>
          <DialogDescription>
            {appointment
              ? `La cita de ${appointment.clientName} cambiará al estado cancelada.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
