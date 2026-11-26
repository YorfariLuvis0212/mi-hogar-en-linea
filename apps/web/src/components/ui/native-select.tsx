import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Selector nativo. Se usa en formularios HTML sin JavaScript (por ejemplo, el
 * formulario de filtros del catálogo), donde los componentes personalizados
 * de la interfaz no participarían del envío del formulario.
 */
export function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full appearance-none rounded-lg border pr-8 pl-2.5 text-sm transition-colors outline-none focus-visible:ring-3 disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2" />
    </div>
  );
}
