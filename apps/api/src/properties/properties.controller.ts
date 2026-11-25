import { PROPERTY_TYPES, type PropertyTypeValue } from "@mh/contracts";
import { prisma } from "@mh/database";
import { Controller, Get, Query } from "@nestjs/common";

/**
 * Endpoint de ejemplo del esqueleto: demuestra el consumo de los paquetes
 * compartidos (`@mh/contracts` para el vocabulario y `@mh/database` para la
 * persistencia). El equipo migra aquí los servicios del frontend de forma
 * incremental.
 */
@Controller("properties")
export class PropertiesController {
  /** Listado público: solo publicaciones aprobadas y disponibles. */
  @Get()
  async list(@Query("type") type?: string) {
    const whereType =
      type && (PROPERTY_TYPES as readonly string[]).includes(type)
        ? (type as PropertyTypeValue)
        : undefined;

    return prisma.property.findMany({
      where: {
        moderationStatus: "APPROVED",
        availability: "AVAILABLE",
        ...(whereType ? { type: whereType } : {}),
      },
      select: {
        id: true,
        title: true,
        price: true,
        type: true,
        city: true,
        neighborhood: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
  }
}
