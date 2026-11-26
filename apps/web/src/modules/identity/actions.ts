"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@mh/database";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "@mh/contracts";

import { auth } from "@/lib/auth";
import { toFieldErrors, type FormState } from "@/lib/form";
import { requireSession } from "@/modules/identity/session";

/** Evita redirecciones abiertas: solo acepta rutas relativas internas. */
function safeRedirect(
  value: FormDataEntryValue | null,
  fallback = "/panel",
): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/already exists|ya existe/i.test(message)) {
    return "Ya existe una cuenta con este correo electrónico.";
  }
  if (/invalid email or password|credenciales/i.test(message)) {
    return "Correo o contraseña incorrectos.";
  }
  if (/password/i.test(message)) {
    return "La contraseña no cumple los requisitos mínimos.";
  }
  return "No pudimos completar la operación. Intenta nuevamente.";
}

export async function registerAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const { name, email, phone, password } = parsed.data;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password, phone: phone || undefined },
    });
  } catch (error) {
    return { status: "error", message: authErrorMessage(error) };
  }

  redirect(safeRedirect(formData.get("redirect")));
}

export async function loginAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  try {
    await auth.api.signInEmail({ body: parsed.data });
  } catch (error) {
    return { status: "error", message: authErrorMessage(error) };
  }

  redirect(safeRedirect(formData.get("redirect")));
}

export async function updateProfileAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });

  revalidatePath("/panel");
  revalidatePath("/panel/perfil");

  return { status: "success", message: "Perfil actualizado correctamente." };
}
