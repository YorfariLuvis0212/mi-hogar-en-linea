import Link from "next/link";

const COLUMNS = [
  {
    title: "Explorar",
    links: [
      { href: "/propiedades", label: "Todos los inmuebles" },
      { href: "/propiedades?type=APARTMENT", label: "Apartamentos" },
      { href: "/propiedades?type=HOUSE", label: "Casas" },
      { href: "/propiedades?type=ROOM", label: "Habitaciones" },
    ],
  },
  {
    title: "Publicar",
    links: [
      { href: "/panel/inmuebles/nuevo", label: "Publicar un inmueble" },
      { href: "/como-funciona", label: "Cómo funciona" },
      { href: "/panel/inmuebles", label: "Administrar mis inmuebles" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { href: "/registrarse", label: "Crear cuenta" },
      { href: "/iniciar-sesion", label: "Iniciar sesión" },
      { href: "/panel", label: "Mi panel" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-muted/30 mt-auto border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <p className="font-semibold">Mi Hogar en Línea</p>
          <p className="text-muted-foreground text-sm">
            Marketplace inmobiliario para arrendar con confianza en Quibdó y el
            Chocó.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title} className="space-y-2">
            <p className="text-sm font-medium">{column.title}</p>
            <ul className="space-y-1.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="text-muted-foreground mx-auto w-full max-w-6xl px-4 py-4 text-xs">
          © {new Date().getFullYear()} Mi Hogar en Línea. Datos tratados
          conforme a la legislación colombiana de protección de datos
          personales.
        </div>
      </div>
    </footer>
  );
}
