const navigation = [
  { id: "dashboard", label: "Dashboard" },
  { id: "citas", label: "Citas" },
  { id: "calendario", label: "Calendario" },
  { id: "servicios", label: "Servicios" },
];

export default function Home() {
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <a href="#dashboard" className="text-lg font-bold text-rose-700">
          Glow by Estrella
        </a>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          Gestión de turnos
        </p>
        <nav aria-label="Navegación principal" className="mt-8 grid gap-2">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <section
          id="dashboard"
          aria-labelledby="dashboard-title"
          className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <p className="text-sm font-semibold text-rose-700">Proyecto V2</p>
          <h1
            id="dashboard-title"
            className="mt-2 text-3xl font-bold text-slate-900"
          >
            Gestión de Turnos
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Base de la aplicación preparada. Las vistas del MVP se migrarán por
            partes en los siguientes PRs.
          </p>
        </section>

        <div className="mx-auto mt-6 grid max-w-5xl gap-4 sm:grid-cols-3">
          {navigation.slice(1).map((item) => (
            <section
              key={item.id}
              id={item.id}
              aria-labelledby={`${item.id}-title`}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <h2
                id={`${item.id}-title`}
                className="font-semibold text-slate-900"
              >
                {item.label}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Se agregará en su PR correspondiente.
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
