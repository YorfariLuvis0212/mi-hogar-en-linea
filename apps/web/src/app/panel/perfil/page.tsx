import type { Metadata } from "next";

import { ProfileForm } from "@/modules/identity/profile-form";
import { requireSession } from "@/modules/identity/session";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const session = await requireSession();

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Mi perfil</h2>
        <p className="text-muted-foreground text-sm">
          Mantén tus datos actualizados para generar confianza con otros
          usuarios.
        </p>
      </div>
      <ProfileForm
        defaultName={session.user.name}
        defaultPhone={session.user.phone ?? ""}
        email={session.user.email}
      />
    </div>
  );
}
