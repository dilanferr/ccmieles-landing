export type TabId =
  | "impacto"
  | "dashboard"
  | "analiticas"
  | "noticias"
  | "clasificados"
  | "eventos"
  | "servicios"
  | "miembros"
  | "finanzas"
  | "peticiones"
  | "multimedia"
  | "seo"
  | "usuarios"
  | "config";

/** Roles del panel (RBAC). admin y pastor tienen acceso total. */
export type Rol = "admin" | "pastor" | "tesorero" | "lider" | "secretaria";
