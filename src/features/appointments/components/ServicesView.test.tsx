import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ServicesView } from "@/features/appointments/components/ServicesView";
import type { Service } from "@/features/appointments/types/appointment";

const services: Service[] = [
  {
    id: "facial",
    name: "Limpieza facial",
    durationMinutes: 45,
    price: 85000,
  },
];

describe("ServicesView", () => {
  it("muestra los servicios con su precio y duración", () => {
    render(
      <ServicesView services={services} loading={false} onRetry={vi.fn()} />,
    );

    expect(
      screen.getByRole("heading", { name: "Limpieza facial" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/\$\s*85\.000/)).toBeInTheDocument();
    expect(screen.getByText(/45\s*min/)).toBeInTheDocument();
  });

  it("muestra un estado vacío cuando no hay servicios", () => {
    render(<ServicesView services={[]} loading={false} onRetry={vi.fn()} />);

    expect(
      screen.getByText("Todavía no hay servicios registrados."),
    ).toBeInTheDocument();
  });

  it("permite reintentar cuando falla la carga", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ServicesView
        services={[]}
        loading={false}
        error={new Error("Error de conexión")}
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByText("Error de conexión")).toBeInTheDocument();
  });
});
