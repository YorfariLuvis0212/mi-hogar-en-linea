"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/form";
import { updateProfileAction } from "@/modules/identity/actions";

type ProfileFormProps = {
  defaultName: string;
  defaultPhone: string;
  email: string;
};

export function ProfileForm({
  defaultName,
  defaultPhone,
  email,
}: ProfileFormProps) {
  const [state, formAction] = useActionState(
    updateProfileAction,
    initialFormState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Datos de la cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.status === "success" && state.message ? (
            <Alert>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          {state.status === "error" && state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            id="name"
            label="Nombre completo"
            error={state.fieldErrors?.name?.[0]}
          >
            <Input
              id="name"
              name="name"
              required
              maxLength={80}
              defaultValue={defaultName}
            />
          </FormField>

          <FormField
            id="phone"
            label="Teléfono"
            hint="Opcional. Ayuda a coordinar visitas."
            error={state.fieldErrors?.phone?.[0]}
          >
            <Input
              id="phone"
              name="phone"
              maxLength={20}
              defaultValue={defaultPhone}
              placeholder="+57 300 000 0000"
            />
          </FormField>

          <FormField
            id="email"
            label="Correo electrónico"
            hint="El correo no se puede cambiar."
          >
            <Input id="email" value={email} disabled readOnly />
          </FormField>

          <SubmitButton pendingLabel="Guardando…">Guardar cambios</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
