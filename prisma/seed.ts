import "dotenv/config";

import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

/**
 * Datos de demostración para desarrollo. Idempotente: elimina los registros
 * creados por el propio seed (dominio `@demo.mihogar.co`) antes de recrearlos.
 *
 * No debe ejecutarse contra una base de datos de producción.
 */

const DEMO_DOMAIN = "@demo.mihogar.co";

const img = (prompt: string) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=landscape_4_3`;

type DemoUser = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
};

const users: DemoUser[] = [
  {
    name: "Administración",
    email: `admin${DEMO_DOMAIN}`,
    password: "Admin1234",
    phone: "+57 300 000 0000",
    role: "SUPER_ADMIN",
  },
  {
    name: "Inmobiliaria Pacífico",
    email: `propietario1${DEMO_DOMAIN}`,
    password: "Propietario1234",
    phone: "+57 301 111 1111",
    role: "USER",
  },
  {
    name: "María Córdoba",
    email: `propietario2${DEMO_DOMAIN}`,
    password: "Propietario1234",
    phone: "+57 302 222 2222",
    role: "USER",
  },
  {
    name: "Carlos Rentería",
    email: `interesado${DEMO_DOMAIN}`,
    password: "Interesado1234",
    phone: "+57 303 333 3333",
    role: "USER",
  },
];

type DemoProperty = {
  title: string;
  description: string;
  type: "APARTMENT" | "HOUSE" | "ROOM" | "STUDIO" | "COMMERCIAL" | "LOT";
  price: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  areaM2: number;
  neighborhood: string;
  addressLine: string;
  imagePrompt: string;
  availability?: "AVAILABLE" | "RENTED" | "PAUSED";
  moderationStatus?:
    "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";
};

const propertiesByOwner: Record<string, DemoProperty[]> = {
  [`propietario1${DEMO_DOMAIN}`]: [
    {
      title: "Apartamento moderno cerca al Malecón",
      description:
        "Apartamento de dos habitaciones con balcón, cocina integral y excelente ventilación. A pocos minutos del Malecón y del centro de Quibdó. Incluye administración.",
      type: "APARTMENT",
      price: 950000,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpaces: 1,
      areaM2: 78,
      neighborhood: "La Yesquita",
      addressLine: "Calle 25 # 4-35, Apto 502",
      imagePrompt:
        "modern apartment living room with balcony natural light in a tropical city",
      moderationStatus: "APPROVED",
    },
    {
      title: "Casa familiar con patio en Barrio Kennedy",
      description:
        "Casa de tres habitaciones, patio amplio y zona de lavandería. Ideal para familias. Barrio tranquilo con acceso a transporte público.",
      type: "HOUSE",
      price: 1600000,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      areaM2: 140,
      neighborhood: "Kennedy",
      addressLine: "Carrera 12 # 30-18",
      imagePrompt:
        "tropical family house with courtyard and palm trees in Colombia",
      moderationStatus: "APPROVED",
    },
    {
      title: "Local comercial sobre vía principal",
      description:
        "Local de 60 m² con vitrina, baño y bodega. Ubicado sobre vía de alto flujo peatonal, apto para comercio o servicios.",
      type: "COMMERCIAL",
      price: 2200000,
      bedrooms: 0,
      bathrooms: 1,
      parkingSpaces: 0,
      areaM2: 60,
      neighborhood: "Centro",
      addressLine: "Calle 26 # 3-10",
      imagePrompt:
        "empty commercial storefront on a busy street in a Colombian town",
      moderationStatus: "APPROVED",
    },
  ],
  [`propietario2${DEMO_DOMAIN}`]: [
    {
      title: "Apartaestudio amoblado para estudiante",
      description:
        "Apartaestudio amoblado con cocina, baño privado e internet incluido. Ambiente seguro, ideal para estudiantes o profesionales.",
      type: "STUDIO",
      price: 620000,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 0,
      areaM2: 34,
      neighborhood: "César Conto",
      addressLine: "Carrera 5 # 27-40, Apto 201",
      imagePrompt: "small furnished studio apartment with bed and kitchenette",
      moderationStatus: "APPROVED",
    },
    {
      title: "Habitación independiente con baño privado",
      description:
        "Habitación amplia con entrada independiente, baño privado y closet. Servicios incluidos. Zona residencial cercana a la universidad.",
      type: "ROOM",
      price: 420000,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 0,
      areaM2: 20,
      neighborhood: "Cristo Rey",
      addressLine: "Calle 28 # 7-22",
      imagePrompt:
        "private bedroom with bathroom in a shared house, warm lighting",
      moderationStatus: "PENDING_REVIEW",
    },
    {
      title: "Apartamento en arriendo, sector La Yesquita",
      description:
        "Apartamento de una habitación totalmente remodelado, con cocina nueva y buena iluminación natural. Recién publicado.",
      type: "APARTMENT",
      price: 780000,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 1,
      areaM2: 52,
      neighborhood: "La Yesquita",
      addressLine: "Carrera 6 # 24-50",
      imagePrompt:
        "renovated one bedroom apartment interior with large windows",
      moderationStatus: "APPROVED",
    },
  ],
};

async function seedUser(user: DemoUser) {
  await auth.api.signUpEmail({
    body: {
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone,
    },
  });
  await prisma.user.update({
    where: { email: user.email },
    data: { role: user.role, emailVerified: true },
  });
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("El seed no puede ejecutarse en producción.");
  }

  console.log("Limpiando datos de demostración…");
  const existing = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_DOMAIN } },
    select: { id: true },
  });
  if (existing.length > 0) {
    const ids = existing.map((row) => row.id);
    await prisma.property.deleteMany({ where: { ownerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }

  console.log("Creando usuarios de demostración…");
  for (const user of users) {
    await seedUser(user);
  }

  console.log("Creando inmuebles de demostración…");
  for (const [email, list] of Object.entries(propertiesByOwner)) {
    const owner = await prisma.user.findUniqueOrThrow({ where: { email } });
    for (const item of list) {
      await prisma.property.create({
        data: {
          ownerId: owner.id,
          title: item.title,
          description: item.description,
          type: item.type,
          price: item.price,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          parkingSpaces: item.parkingSpaces,
          areaM2: item.areaM2,
          city: "Quibdó",
          neighborhood: item.neighborhood,
          addressLine: item.addressLine,
          moderationStatus: item.moderationStatus ?? "APPROVED",
          availability: item.availability ?? "AVAILABLE",
          publishedAt: item.moderationStatus === "APPROVED" ? new Date() : null,
          media: {
            create: [
              {
                type: "IMAGE",
                url: img(item.imagePrompt),
                altText: item.title,
                position: 0,
                isCover: true,
              },
            ],
          },
        },
      });
    }
  }

  console.log("Seed completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
