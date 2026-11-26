import { Module } from "@nestjs/common";

import { HealthModule } from "./health/health.module";
import { PropertiesModule } from "./properties/properties.module";

/**
 * Aplicación API de Mi Hogar en Línea.
 *
 * Esqueleto inicial: cada dominio funcional del marketplace se incorpora
 * como un módulo propio (`@Module`). Ver `docs/AGENTS.md` §11 para el reparto
 * de trabajo del equipo.
 */
@Module({
  imports: [HealthModule, PropertiesModule],
})
export class AppModule {}
