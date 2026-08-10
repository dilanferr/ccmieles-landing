"use client";

import { Card, EstadoVacio, ModuleHeader } from "./ui";
import { UserCheckIcon } from "@/app/components/icons";

/**
 * Asistencia y Check-in (Fase 1: stub para verificar el acceso de los roles
 * admin/pastor/lider/secretaria). El registro de sesiones y el check-in rápido
 * llegan en las siguientes fases.
 */
export default function AsistenciaModule() {
  return (
    <div>
      <ModuleHeader
        icon={<UserCheckIcon className="h-6 w-6" />}
        titulo="Asistencia y Check-in"
        descripcion="Registro ágil de asistencia de miembros y visitantes en cultos y eventos."
      />
      <Card>
        <EstadoVacio>
          Módulo en construcción — próximamente el registro de sesiones y el
          check-in rápido desde el celular.
        </EstadoVacio>
      </Card>
    </div>
  );
}
