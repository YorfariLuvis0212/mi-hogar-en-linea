import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { hasRole, type AppRole } from "@mh/contracts";

import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string | null;
};

export type AppSession = {
  user: SessionUser;
  sessionId: string;
};

/** Sesión actual o `null`. No lanza. */
export async function getSession(): Promise<AppSession | null> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;

  return {
    sessionId: result.session.id,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: String(result.user.role ?? "USER"),
      status: String(result.user.status ?? "ACTIVE"),
      phone: (result.user.phone as string | null | undefined) ?? null,
    },
  };
}

/** Exige sesión activa; redirige al inicio de sesión si no existe. */
export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect("/iniciar-sesion");
  if (session.user.status !== "ACTIVE") redirect("/cuenta-suspendida");
  return session;
}

/** Exige un rol mínimo (ADMIN / SUPER_ADMIN). */
export async function requireRole(role: AppRole): Promise<AppSession> {
  const session = await requireSession();
  if (!hasRole(session.user.role, role)) redirect("/sin-acceso");
  return session;
}
