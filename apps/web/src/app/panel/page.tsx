import Link from "next/link";
import type { Metadata } from "next";
import {
  BellIcon,
  Building2Icon,
  CalendarClockIcon,
  HeartIcon,
  MessageSquareIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countFavoritesForUser } from "@/modules/favorites/service";
import { requireSession } from "@/modules/identity/session";
import { listConversationsForUser } from "@/modules/messaging/service";
import { countPropertiesByOwner } from "@/modules/properties/service";
import { markNotificationsReadAction } from "@/modules/notifications/actions";
import { listNotificationsForUser } from "@/modules/notifications/service";
import { countPendingVisitsForHost } from "@/modules/visits/service";

export const metadata: Metadata = { title: "Panel" };

export default async function PanelPage() {
  const session = await requireSession();
  const userId = session.user.id;

  const [
    propertyCount,
    conversations,
    pendingVisits,
    favoriteCount,
    notifications,
  ] = await Promise.all([
    countPropertiesByOwner(userId),
    listConversationsForUser(userId),
    countPendingVisitsForHost(userId),
    countFavoritesForUser(userId),
    listNotificationsForUser(userId, 8),
  ]);

  const unreadMessages = conversations.reduce(
    (total, item) => total + item.unreadCount,
    0,
  );

  const stats = [
    {
      label: "Inmuebles publicados",
      value: propertyCount,
      icon: Building2Icon,
      href: "/panel/inmuebles",
    },
    {
      label: "Mensajes sin leer",
      value: unreadMessages,
      icon: MessageSquareIcon,
      href: "/panel/mensajes",
    },
    {
      label: "Visitas pendientes",
      value: pendingVisits,
      icon: CalendarClockIcon,
      href: "/panel/visitas",
    },
    {
      label: "Favoritos",
      value: favoriteCount,
      icon: HeartIcon,
      href: "/panel/favoritos",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-card ring-foreground/10 rounded-xl p-4 ring-1 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                {stat.label}
              </span>
              <stat.icon className="text-primary size-4" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="grid-cols-[1fr_auto] items-center">
          <CardTitle className="flex items-center gap-2 text-base">
            <BellIcon className="text-primary size-4" />
            Notificaciones recientes
          </CardTitle>
          {notifications.some((item) => !item.readAt) ? (
            <form action={markNotificationsReadAction}>
              <Button type="submit" variant="ghost" size="sm">
                Marcar como leídas
              </Button>
            </form>
          ) : null}
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No tienes notificaciones por ahora.
            </p>
          ) : (
            <ul className="divide-y">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span
                    className={
                      item.readAt
                        ? "bg-muted mt-1.5 size-2 shrink-0 rounded-full"
                        : "bg-primary mt-1.5 size-2 shrink-0 rounded-full"
                    }
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.body ? (
                      <p className="text-muted-foreground text-sm">
                        {item.body}
                      </p>
                    ) : null}
                  </div>
                  {item.link ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={item.link} />}
                    >
                      Ver
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
