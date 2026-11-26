"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleSignOut() {
    setPending(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return { pending, handleSignOut };
}

/** Botón de cierre de sesión para formularios y navegación. */
export function SignOutButton({ className }: { className?: string }) {
  const { pending, handleSignOut } = useSignOut();
  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className={cn(
        "text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50",
        className,
      )}
    >
      <LogOutIcon className="size-4" />
      Cerrar sesión
    </button>
  );
}

/** Variante del cierre de sesión para usar dentro del menú desplegable. */
export function SignOutMenuItem() {
  const { pending, handleSignOut } = useSignOut();
  return (
    <DropdownMenuItem onClick={handleSignOut} disabled={pending}>
      <LogOutIcon />
      Cerrar sesión
    </DropdownMenuItem>
  );
}
