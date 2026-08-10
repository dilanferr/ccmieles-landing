export type TabId =
  | "impacto"
  | "dashboard"
  | "analiticas"
  | "noticias"
  | "clasificados"
  | "eventos"
  | "servicios"
  | "turnos"
  | "asistencia"
  | "inventario"
  | "miembros"
  | "finanzas"
  | "peticiones"
  | "multimedia"
  | "seo"
  | "usuarios"
  | "auditoria"
  | "config";

/** Roles del panel (RBAC). admin y pastor tienen acceso total. */
export type Rol =
  | "admin"
  | "pastor"
  | "tesorero"
  | "lider"
  | "secretaria"
  | "intercesion"
  | "logistica";
