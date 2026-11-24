import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/modules/identity/session";
import { MessageComposer } from "@/modules/messaging/message-composer";
import {
  getConversationView,
  markConversationRead,
} from "@/modules/messaging/service";

export const metadata: Metadata = { title: "Conversación" };

export default async function ConversationPage({
  params,
}: PageProps<"/panel/mensajes/[id]">) {
  const session = await requireSession();
  const { id } = await params;

  const conversation = await getConversationView(id, session.user.id);
  if (!conversation) notFound();

  await markConversationRead(id, session.user.id);

  const others = conversation.participants.filter(
    (participant) => participant.id !== session.user.id,
  );
  const title =
    others.map((participant) => participant.name).join(", ") || "Conversación";

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/panel/mensajes" />}
        >
          <ArrowLeftIcon />
          Mensajes
        </Button>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm">
          Sobre{" "}
          <Link
            href={`/propiedades/${conversation.propertyId}`}
            className="text-primary hover:underline"
          >
            {conversation.propertyTitle}
          </Link>{" "}
          · {conversation.neighborhood}, {conversation.city}
        </p>
      </div>

      <div className="bg-card ring-foreground/10 space-y-3 rounded-xl p-4 ring-1">
        {conversation.messages.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Aún no hay mensajes en esta conversación.
          </p>
        ) : (
          <ul className="space-y-3">
            {conversation.messages.map((message) => (
              <li
                key={message.id}
                className={cn(
                  "flex flex-col",
                  message.isMine ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                    message.isMine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm",
                  )}
                >
                  <p className="break-words whitespace-pre-wrap">
                    {message.body}
                  </p>
                </div>
                <span className="text-muted-foreground mt-1 text-[0.7rem]">
                  {formatDateTime(message.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <MessageComposer conversationId={conversation.id} />
    </div>
  );
}
