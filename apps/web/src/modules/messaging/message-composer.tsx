"use client";

import * as React from "react";
import { SendIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState } from "@/lib/form";
import { sendMessageAction } from "@/modules/messaging/actions";

export function MessageComposer({
  conversationId,
}: {
  conversationId: string;
}) {
  const [body, setBody] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim() || isPending) return;

    const formData = new FormData();
    formData.set("conversationId", conversationId);
    formData.set("body", body);

    startTransition(async () => {
      const result = await sendMessageAction(initialFormState, formData);
      if (result.status === "success") {
        setBody("");
        setError(null);
      } else {
        setError(
          result.message ??
            result.fieldErrors?.body?.[0] ??
            "No se pudo enviar el mensaje.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          rows={2}
          maxLength={2000}
          placeholder="Escribe un mensaje…"
          aria-label="Mensaje"
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isPending || body.trim().length === 0}
          aria-label="Enviar"
        >
          <SendIcon />
          Enviar
        </Button>
      </div>
    </form>
  );
}
