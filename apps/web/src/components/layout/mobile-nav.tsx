"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignOutButton } from "@/modules/identity/sign-out-button";

export type NavLink = { href: string; label: string };

type MobileNavProps = {
  links: NavLink[];
  accountLinks: NavLink[];
  isAuthenticated: boolean;
};

export function MobileNav({
  links,
  accountLinks,
  isAuthenticated,
}: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Abrir menú" />}
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Navegación</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {links.map((link) => (
            <SheetClose
              key={link.href}
              render={
                <Link
                  href={link.href}
                  className="hover:bg-muted rounded-md px-2 py-2 text-sm font-medium"
                />
              }
            >
              {link.label}
            </SheetClose>
          ))}
          {isAuthenticated ? (
            <>
              <div className="my-2 border-t" />
              {accountLinks.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:bg-muted rounded-md px-2 py-2 text-sm"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
              <div className="px-2 pt-3">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <div className="my-2 border-t" />
              <SheetClose
                render={
                  <Link
                    href="/iniciar-sesion"
                    className="hover:bg-muted rounded-md px-2 py-2 text-sm font-medium"
                  />
                }
              >
                Iniciar sesión
              </SheetClose>
              <SheetClose
                render={
                  <Link
                    href="/registrarse"
                    className="text-primary hover:bg-muted rounded-md px-2 py-2 text-sm font-medium"
                  />
                }
              >
                Crear cuenta
              </SheetClose>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
