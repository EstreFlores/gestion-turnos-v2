import { expect, test } from "@playwright/test";

test("crea una cita y la muestra en la lista de Citas", async ({ page }) => {
  const appointments: Record<string, unknown>[] = [];
  const services = [
    {
      id: "facial",
      name: "Limpieza facial",
      durationMinutes: 45,
      price: 85000,
    },
  ];

  await page.route("**/mock-api/**", async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());

    if (pathname.endsWith("/services") && request.method() === "GET") {
      await route.fulfill({ json: services });
      return;
    }

    if (pathname.endsWith("/appointments")) {
      if (request.method() === "GET") {
        await route.fulfill({ json: appointments });
        return;
      }

      if (request.method() === "POST") {
        const now = new Date().toISOString();
        const createdAppointment = {
          ...request.postDataJSON(),
          id: "e2e-appointment",
          createdAt: now,
          updatedAt: now,
        };
        appointments.push(createdAppointment);
        await route.fulfill({ status: 201, json: createdAppointment });
        return;
      }
    }

    await route.fulfill({ status: 404, json: { message: "Not found" } });
  });

  await page.goto("/");
  await expect(
    page.getByText("No hay citas programadas para hoy."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Nueva cita" }).click();
  await expect(page.getByRole("heading", { name: "Nueva cita" })).toBeVisible();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const appointmentDate = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0"),
  ].join("-");

  await page.getByLabel("Nombre de la clienta").fill("Cliente Prueba");
  await page.getByLabel("Teléfono").fill("3001234567");
  await page.getByLabel("Servicio").selectOption("facial");
  await page.getByLabel("Profesional").selectOption("camila-santos");
  await page.getByLabel("Fecha").fill(appointmentDate);
  await page.getByLabel("Hora de inicio").fill("10:00");
  await page.getByRole("button", { name: "Crear cita" }).click();

  await page.getByRole("button", { name: "Citas y turnos" }).click();
  await expect(page.getByRole("row", { name: /Cliente Prueba/ })).toBeVisible();
});
