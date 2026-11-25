"use client";

import * as React from "react";
import { useActionState } from "react";
import { CalendarClockIcon, MessageSquareIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState } from "@/lib/form";
import { startConversationAction } from "@/modules/messaging/actions";
import { requestVisitAction } from "@/modules/visits/actions";

export function PropertyContactPanel({ propertyId }: { propertyId: string }) {
  const [messageState, messageAction] = useActionState(
    startConversationAction,
    initialFormState,
  );
  const [visitState, visitAction] = useActionState(
    requestVisitAction,
    initialFormState,
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareIcon className="text-primary size-4" />
            Enviar mensaje
          </CardTitle>
          <CardDescription>
            La conversación es privada entre tú y el anunciante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={messageAction} className="space-y-3">
            <input type="hidden" name="propertyId" value={propertyId} />
            {messageState.message ? (
              <Alert variant="destructive">
                <AlertDescription>{messageState.message}</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              id="message-body"
              label="Mensaje"
              error={messageState.fieldErrors?.body?.[0]}
            >
              <Textarea
                id="message-body"
                name="body"
                required
                rows={4}
                maxLength={2000}
                placeholder="Hola, estoy interesado en este inmueble. ¿Sigue disponible?"
              />
            </FormField>
            <SubmitButton className="w-full" pendingLabel="Enviando…">
              Enviar mensaje
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClockIcon className="text-primary size-4" />
            Solicitar visita
          </CardTitle>
          <CardDescription>
            Acuerda una fecha tentativa. Nunca compartas datos bancarios ni
            realices pagos antes de ver el inmueble.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={visitAction} className="space-y-3">
            <input type="hidden" name="propertyId" value={propertyId} />
            {visitState.message ? (
              <Alert
                variant={
                  visitState.status === "success" ? "default" : "destructive"
                }
              >
                <AlertDescription>{visitState.message}</AlertDescription>
              </Alert>
            ) : null}
            <FormField
              id="visit-date"
              label="Fecha preferida"
              error={visitState.fieldErrors?.scheduledAt?.[0]}
            >
              <Input id="visit-date" name="scheduledAt" type="datetime-local" />
            </FormField>
            <FormField
              id="visit-notes"
              label="Notas (opcional)"
              error={visitState.fieldErrors?.notes?.[0]}
            >
              <Textarea
                id="visit-notes"
                name="notes"
                rows={3}
                maxLength={500}
                placeholder="Preferencia de horario, acompañantes, preguntas…"
              />
            </FormField>
            <SubmitButton
              className="w-full"
              variant="outline"
              pendingLabel="Enviando…"
            >
              Solicitar visita
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
