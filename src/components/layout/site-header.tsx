import Link from "next/link";
import { Building2Icon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MobileNav, type NavLink } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { canModerate } from "@/modules/identity/permissions";
import { getSession } from "@/modules/identity/session";

const PUBLIC_LINKS: NavLink[] = [
  { href: "/propiedades", label: "Explorar" },
  { href: "/como-funciona", label: "Cómo funciona" },
];

const ACCOUNT_LINKS: NavLink[] = [
  { href: "/panel", label: "Mi panel" },
  { href: "/panel/inmuebles", label: "Mis inmuebles" },
  { href: "/panel/favoritos", label: "Favoritos" },
  { href: "/panel/mensajes", label: "Mensajes" },
];

export async function SiteHeader() {
  const session = await getSession();
  const isAdmin = session ? canModerate(session.user.role) : false;

  const accountLinks = isAdmin
    ? [...ACCOUNT_LINKS, { href: "/admin", label: "Administración" }]
    : ACCOUNT_LINKS;

  return (
    <header className="bg-background/85 supports-backdrop-filter:bg-background/70 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Building2Icon className="size-4" />
          </span>
          <span className="text-sm leading-tight">
            Mi Hogar
            <span className="text-muted-foreground block text-xs font-normal">
              en Línea
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {PUBLIC_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            className="hidden md:inline-flex"
            render={<Link href="/panel/inmuebles/nuevo" />}
          >
            <PlusIcon />
            Publicar
          </Button>

          {session ? (
            <div className="hidden md:block">
              <UserMenu
                name={session.user.name}
                email={session.user.email}
                isAdmin={isAdmin}
              />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/iniciar-sesion" />}
              >
                Iniciar sesión
              </Button>
              <Button size="sm" render={<Link href="/registrarse" />}>
                Crear cuenta
              </Button>
            </div>
          )}

          <div className="md:hidden">
            <MobileNav
              links={PUBLIC_LINKS}
              accountLinks={accountLinks}
              isAuthenticated={Boolean(session)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
