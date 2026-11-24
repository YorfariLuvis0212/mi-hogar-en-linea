import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ImageOffIcon, MessageSquareIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/modules/identity/session";
import { listConversationsForUser } from "@/modules/messaging/service";

export const metadata: Metadata = { title: "Mensajes" };

export default async function MessagesPage() {
  const session = await requireSession();
  const conversations = await listConversationsForUser(session.user.id);

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquareIcon className="size-5" />}
        title="No tienes conversaciones"
        description="Cuando contactes a un anunciante o alguien te escriba, las conversaciones aparecerán aquí."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <Link
            href={`/panel/mensajes/${conversation.id}`}
            className="bg-card ring-foreground/10 flex items-center gap-3 rounded-xl p-3 ring-1 transition-shadow hover:shadow-md"
          >
            <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-lg">
              {conversation.coverUrl ? (
                <Image
                  src={conversation.coverUrl}
                  alt={conversation.propertyTitle}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  <ImageOffIcon className="size-4" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium">
                  {conversation.otherParticipantName}
                </p>
                {conversation.lastMessageAt ? (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatDateTime(conversation.lastMessageAt)}
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground truncate text-xs">
                {conversation.propertyTitle}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {conversation.lastMessage ?? "Sin mensajes todavía"}
              </p>
            </div>

            {conversation.unreadCount > 0 ? (
              <Badge
                variant="default"
                aria-label={`${conversation.unreadCount} sin leer`}
              >
                {conversation.unreadCount}
              </Badge>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
