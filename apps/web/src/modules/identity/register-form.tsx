"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/form";
import { registerAction } from "@/modules/identity/actions";

export function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const [state, action] = useActionState(registerAction, initialFormState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FormField
        id="name"
        label="Nombre completo"
        error={state.fieldErrors?.name?.[0]}
      >
        <Input id="name" name="name" autoComplete="name" required />
      </FormField>

      <FormField
        id="email"
        label="Correo electrónico"
        error={state.fieldErrors?.email?.[0]}
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </FormField>

      <FormField
        id="phone"
        label="Teléfono (opcional)"
        hint="Se comparte solo cuando inicias una conversación."
        error={state.fieldErrors?.phone?.[0]}
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+57 300 000 0000"
        />
      </FormField>

      <FormField
        id="password"
        label="Contraseña"
        hint="Mínimo 8 caracteres."
        error={state.fieldErrors?.password?.[0]}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </FormField>

      <SubmitButton className="w-full" pendingLabel="Creando cuenta…">
        Crear cuenta
      </SubmitButton>

      <p className="text-muted-foreground text-center text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/iniciar-sesion"
          className="text-primary font-medium hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
