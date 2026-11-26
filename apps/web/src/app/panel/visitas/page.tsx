import type { Metadata } from "next";
import {
  CalendarClockIcon,
  CheckIcon,
  XIcon,
  CheckCheckIcon,
  BanIcon,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/modules/identity/session";
import { respondVisitAction } from "@/modules/visits/actions";
import {
  listVisitsForUser,
  VISIT_STATUS_LABELS,
} from "@/modules/visits/service";

export const metadata: Metadata = { title: "Visitas" };

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  REQUESTED: "secondary",
  ACCEPTED: "default",
  COMPLETED: "default",
  REJECTED: "destructive",
  CANCELLED: "outline",
};

export default async function VisitsPage() {
  const session = await requireSession();
  const visits = await listVisitsForUser(session.user.id);

  if (visits.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClockIcon className="size-5" />}
        title="No hay visitas registradas"
        description="Las solicitudes de visita que envíes o recibas aparecerán en esta sección."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {visits.map((visit) => {
        const isReceived = visit.direction === "received";
        const canRespond = isReceived && visit.status === "REQUESTED";
        const canComplete = isReceived && visit.status === "ACCEPTED";
        const canCancel =
          !isReceived &&
          (visit.status === "REQUESTED" || visit.status === "ACCEPTED");

        return (
          <li
            key={visit.id}
            className="bg-card ring-foreground/10 space-y-3 rounded-xl p-4 ring-1"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{visit.propertyTitle}</p>
                <p className="text-muted-foreground text-sm">
                  {isReceived ? "Solicitada por" : "Anfitrión"}:{" "}
                  {visit.counterpartName}
                </p>
              </div>
              <Badge variant={STATUS_VARIANTS[visit.status] ?? "outline"}>
                {VISIT_STATUS_LABELS[visit.status] ?? visit.status}
              </Badge>
            </div>

            <div className="text-muted-foreground space-y-1 text-sm">
              {visit.scheduledAt ? (
                <p>Fecha propuesta: {formatDateTime(visit.scheduledAt)}</p>
              ) : (
                <p>Fecha por acordar</p>
              )}
              {visit.notes ? (
                <p className="text-foreground">“{visit.notes}”</p>
              ) : null}
            </div>

            {canRespond || canComplete || canCancel ? (
              <div className="flex flex-wrap gap-2">
                {canRespond ? (
                  <>
                    <form action={respondVisitAction}>
                      <input type="hidden" name="visitId" value={visit.id} />
                      <input type="hidden" name="decision" value="ACCEPTED" />
                      <Button type="submit" size="sm">
                        <CheckIcon />
                        Aceptar
                      </Button>
                    </form>
                    <form action={respondVisitAction}>
                      <input type="hidden" name="visitId" value={visit.id} />
                      <input type="hidden" name="decision" value="REJECTED" />
                      <Button type="submit" size="sm" variant="outline">
                        <XIcon />
                        Rechazar
                      </Button>
                    </form>
                  </>
                ) : null}

                {canComplete ? (
                  <form action={respondVisitAction}>
                    <input type="hidden" name="visitId" value={visit.id} />
                    <input type="hidden" name="decision" value="COMPLETED" />
                    <Button type="submit" size="sm" variant="outline">
                      <CheckCheckIcon />
                      Marcar como realizada
                    </Button>
                  </form>
                ) : null}

                {canCancel ? (
                  <form action={respondVisitAction}>
                    <input type="hidden" name="visitId" value={visit.id} />
                    <input type="hidden" name="decision" value="CANCELLED" />
                    <Button type="submit" size="sm" variant="ghost">
                      <BanIcon />
                      Cancelar
                    </Button>
                  </form>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
