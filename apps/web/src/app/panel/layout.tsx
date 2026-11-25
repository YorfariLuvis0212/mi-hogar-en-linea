import Link from "next/link";

import { PanelNav } from "@/components/layout/panel-nav";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { canModerate } from "@mh/contracts";
import { requireSession } from "@/modules/identity/session";

export default async function PanelLayout({ children }: LayoutProps<"/panel">) {
  const session = await requireSession();
  const isAdmin = canModerate(session.user.role);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panel</h1>
          <p className="text-muted-foreground text-sm">
            Hola, {session.user.name}. Administra tus inmuebles e interacciones.
          </p>
        </div>
        <Button render={<Link href="/panel/inmuebles/nuevo" />}>
          <PlusIcon />
          Publicar inmueble
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <PanelNav isAdmin={isAdmin} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
