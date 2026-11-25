import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BathIcon,
  BedDoubleIcon,
  CarIcon,
  EyeIcon,
  ImageOffIcon,
  LogInIcon,
  MapPinIcon,
  PencilIcon,
  RulerIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { isFavorite } from "@/modules/favorites/service";
import { getSession } from "@/modules/identity/session";
import { FavoriteButton } from "@/modules/properties/favorite-button";
import { PropertyContactPanel } from "@/modules/properties/property-contact-panel";
import { PROPERTY_TYPE_LABELS } from "@mh/contracts";
import {
  getPropertyDetail,
  incrementPropertyViews,
} from "@/modules/properties/service";

export async function generateMetadata({
  params,
}: PageProps<"/propiedades/[id]">): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyDetail(id);
  if (!property) return { title: "Inmueble no disponible" };

  return {
    title: property.title,
    description: `${PROPERTY_TYPE_LABELS[property.type]} en arriendo en ${property.neighborhood}, ${property.city}.`,
    openGraph: {
      title: property.title,
      images: property.images[0]?.url ? [property.images[0].url] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: PageProps<"/propiedades/[id]">) {
  const { id } = await params;
  const session = await getSession();

  const property = await getPropertyDetail(
    id,
    session ? { id: session.user.id, role: session.user.role } : null,
  );
  if (!property) notFound();

  const isOwner = session?.user.id === property.owner.id;
  const isModerator =
    session?.user.role === "ADMIN" || session?.user.role === "SUPER_ADMIN";

  if (!isOwner && !isModerator) {
    await incrementPropertyViews(id);
  }

  const savedByViewer =
    session && !isOwner && !isModerator
      ? await isFavorite(session.user.id, property.id)
      : false;

  const characteristics = [
    { icon: BedDoubleIcon, label: `${property.bedrooms} habitaciones` },
    { icon: BathIcon, label: `${property.bathrooms} baños` },
    { icon: CarIcon, label: `${property.parkingSpaces} parqueaderos` },
    ...(property.areaM2
      ? [{ icon: RulerIcon, label: `${property.areaM2} m²` }]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <nav className="text-muted-foreground text-sm">
        <Link href="/propiedades" className="hover:text-foreground">
          Inmuebles
        </Link>
        <span aria-hidden> / </span>
        <span className="text-foreground">{property.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {property.images.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="bg-muted relative aspect-4/3 overflow-hidden rounded-xl sm:col-span-2">
                <Image
                  src={property.images[0].url}
                  alt={property.images[0].altText ?? property.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  className="object-cover"
                />
              </div>
              {property.images.slice(1, 5).map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="bg-muted relative aspect-4/3 overflow-hidden rounded-xl"
                >
                  <Image
                    src={image.url}
                    alt={
                      image.altText ?? `${property.title} — imagen ${index + 2}`
                    }
                    fill
                    sizes="(max-width: 1024px) 50vw, 30vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted text-muted-foreground flex aspect-4/3 items-center justify-center rounded-xl">
              <ImageOffIcon className="size-8" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {PROPERTY_TYPE_LABELS[property.type]}
              </Badge>
              <Badge variant="outline">Disponible</Badge>
              {isOwner ? <Badge>Tu publicación</Badge> : null}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {property.title}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <MapPinIcon className="size-4" />
              {property.neighborhood}, {property.city}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </CardContent>
          </Card>

          {isOwner || isModerator ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información privada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Dirección exacta (no visible al público):
                </p>
                <p className="font-medium">
                  {property.addressLine ?? "No registrada"}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {formatCurrency(property.price)}
                <span className="text-muted-foreground text-sm font-normal">
                  {" "}
                  /mes
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="grid grid-cols-2 gap-3 text-sm">
                {characteristics.map((item) => (
                  <li
                    key={item.label}
                    className="text-muted-foreground flex items-center gap-2"
                  >
                    <item.icon className="text-primary size-4" />
                    {item.label}
                  </li>
                ))}
              </ul>

              <div className="text-muted-foreground space-y-1 border-t pt-4 text-xs">
                <p className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="size-3.5" />
                  Publicado por {property.owner.name}
                </p>
                <p className="flex items-center gap-1.5">
                  <EyeIcon className="size-3.5" />
                  {property.viewsCount} vistas
                </p>
                {property.publishedAt ? (
                  <p>Publicado el {formatDate(property.publishedAt)}</p>
                ) : null}
              </div>

              {isOwner ? (
                <Button
                  className="w-full"
                  render={
                    <Link href={`/panel/inmuebles/${property.id}/editar`} />
                  }
                >
                  <PencilIcon />
                  Editar publicación
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {!isOwner && !isModerator ? (
            session ? (
              <>
                <FavoriteButton
                  propertyId={property.id}
                  initialFavorite={savedByViewer}
                  variant="full"
                />
                <PropertyContactPanel propertyId={property.id} />
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Contacta al anunciante
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Inicia sesión o crea una cuenta para enviar mensajes y
                    solicitar visitas de forma segura.
                  </p>
                  <Button
                    className="w-full"
                    render={
                      <Link
                        href={`/iniciar-sesion?redirect=/propiedades/${property.id}`}
                      />
                    }
                  >
                    <LogInIcon />
                    Iniciar sesión
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    render={
                      <Link
                        href={`/registrarse?redirect=/propiedades/${property.id}`}
                      />
                    }
                  >
                    Crear cuenta
                  </Button>
                </CardContent>
              </Card>
            )
          ) : null}
        </aside>
      </div>
    </div>
  );
}
