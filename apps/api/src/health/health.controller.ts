import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  /** Sonda de disponibilidad usada por el despliegue y la monitorización. */
  @Get()
  check() {
    return { status: "ok", service: "mi-hogar-en-linea-api" };
  }
}
