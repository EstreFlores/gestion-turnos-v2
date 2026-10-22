"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import type { ComponentProps } from "react";
import {
  CircleCheck,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toastManager";

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} {...props}>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto flex w-auto max-w-sm flex-col gap-2 outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((item) => <ToastItem key={item.id} toast={item} />);
}

function ToastItem({
  toast: toastItem,
}: {
  toast: ComponentProps<typeof ToastPrimitive.Root>["toast"];
}) {
  const icon =
    toastItem.type === "success" ? (
      <CircleCheck className="text-emerald-600" aria-hidden="true" />
    ) : toastItem.type === "error" ? (
      <XCircle className="text-destructive" aria-hidden="true" />
    ) : toastItem.type === "warning" ? (
      <TriangleAlert className="text-amber-600" aria-hidden="true" />
    ) : toastItem.type === "loading" ? (
      <LoaderCircle className="animate-spin" aria-hidden="true" />
    ) : (
      <Info className="text-sky-600" aria-hidden="true" />
    );

  return (
    <ToastPrimitive.Root
      toast={toastItem}
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none",
        "data-[starting-style]:translate-y-3 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition",
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <ToastPrimitive.Title className="text-sm font-semibold" />
        <ToastPrimitive.Description className="mt-1 text-sm text-muted-foreground" />
      </div>
      <ToastPrimitive.Close
        aria-label="Cerrar notificación"
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export { Toaster };
