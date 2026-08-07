"use client";

import { Card, EstadoVacio, ModuleHeader } from "./ui";
import { BoxIcon } from "@/app/components/icons";

/**
 * Inventario y Bienes (Fase 1: stub para verificar el acceso del rol
 * 'logistica'). El catálogo, los préstamos y la exportación llegan en las
 * siguientes fases.
 */
export default function InventarioModule() {
  return (
    <div>
      <ModuleHeader
        icon={<BoxIcon className="h-6 w-6" />}
        titulo="Inventario y Bienes"
        descripcion="Catálogo de bienes de la iglesia y control de préstamos."
      />
      <Card>
        <EstadoVacio>
          Módulo en construcción — próximamente el catálogo, la valorización y
          el control de préstamos.
        </EstadoVacio>
      </Card>
    </div>
  );
}
