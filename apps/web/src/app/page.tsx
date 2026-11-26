import Link from "next/link";
import {
  ArrowRightIcon,
  Building2Icon,
  MessageSquareIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getFeaturedProperties,
  type PropertyListItem,
} from "@/modules/properties/service";
import { PropertyCard } from "@/modules/properties/property-card";

async function loadFeatured(): Promise<PropertyListItem[]> {
  try {
    return await getFeaturedProperties(6);
  } catch (error) {
    console.error("No fue posible cargar los inmuebles destacados:", error);
    return [];
  }
}

const VALUE_PROPS = [
  {
    icon: ShieldCheckIcon,
    title: "Anunciantes verificados",
    description:
      "Publicaciones revisadas y cuentas con historial para reducir el riesgo de fraude.",
  },
  {
    icon: MessageSquareIcon,
    title: "Contacto directo y privado",
    description:
      "Conversa con el propietario dentro de la plataforma, sin exponer tus datos personales.",
  },
  {
    icon: Building2Icon,
    title: "Enfocado en Quibdó",
    description:
      "Un catálogo pensado para el Chocó, con barrios reales y precios en pesos colombianos.",
  },
];

export default async function HomePage() {
  const featured = await loadFeatured();

  return (
    <div className="flex flex-1 flex-col">
      <section className="from-accent/60 to-background border-b bg-linear-to-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
          <div className="max-w-2xl space-y-5">
            <span className="bg-background text-primary ring-primary/20 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1">
              <ShieldCheckIcon className="size-3.5" />
              Marketplace inmobiliario de Quibdó
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Encuentra tu próximo hogar en arriendo, con confianza
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Explora apartamentos, casas y habitaciones publicadas directamente
              por sus propietarios en Quibdó y el Chocó.
            </p>

            <form
              action="/propiedades"
              method="get"
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <Input
                name="q"
                placeholder="Barrio, tipo de inmueble o palabra clave"
                aria-label="Buscar inmuebles"
                className="bg-background h-11"
              />
              <Button type="submit" size="lg" className="h-11">
                <SearchIcon />
                Buscar
              </Button>
            </form>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="outline"
                render={<Link href="/propiedades?type=APARTMENT" />}
              >
                Apartamentos
              </Button>
              <Button
                variant="outline"
                render={<Link href="/propiedades?type=HOUSE" />}
              >
                Casas
              </Button>
              <Button
                variant="outline"
                render={<Link href="/propiedades?type=ROOM" />}
              >
                Habitaciones
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Inmuebles recientes
            </h2>
            <p className="text-muted-foreground text-sm">
              Las últimas publicaciones aprobadas y disponibles.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/propiedades" />}
          >
            Ver todos
            <ArrowRightIcon />
          </Button>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-xl border border-dashed px-6 py-12 text-center">
            <p className="font-medium">Aún no hay inmuebles publicados</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Sé el primero en publicar un inmueble en arriendo en Quibdó.
            </p>
            <Button
              className="mt-4"
              render={<Link href="/panel/inmuebles/nuevo" />}
            >
              Publicar un inmueble
            </Button>
          </div>
        )}
      </section>

      <section className="bg-muted/30 border-t">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="space-y-2">
              <span className="bg-background text-primary ring-primary/15 flex size-10 items-center justify-center rounded-lg ring-1">
                <item.icon className="size-5" />
              </span>
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="bg-primary text-primary-foreground flex flex-col items-start justify-between gap-4 rounded-xl px-6 py-8 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              ¿Tienes un inmueble para arrendar?
            </h2>
            <p className="text-primary-foreground/80 text-sm">
              Publícalo gratis, recibe mensajes de interesados y administra tus
              visitas.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            render={<Link href="/panel/inmuebles/nuevo" />}
          >
            Publicar ahora
          </Button>
        </div>
      </section>
    </div>
  );
}
