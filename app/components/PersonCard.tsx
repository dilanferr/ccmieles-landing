import PersonAvatar from "./PersonAvatar";
import { CardTilt3D } from "./ui/card-tilt-3d";

/**
 * Tarjeta vertical centrada de una persona (encargada, integrante…), con
 * foto grande (Cloudinary) y respaldo de iniciales. Diseño unificado para
 * todo el sitio.
 */
export default function PersonCard({
  nombre,
  cargo,
  imageUrl,
  descripcion,
}: {
  nombre: string;
  cargo: string;
  imageUrl?: string;
  descripcion?: string;
}) {
  return (
    <CardTilt3D className="h-full">
      <article className="flex h-full flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-600/10">
        <PersonAvatar
          nombre={nombre}
          imageUrl={imageUrl}
          className="mb-4 h-28 w-28 border-4 border-white shadow-md ring-4 ring-blue-50 md:h-32 md:w-32"
          textClass="text-3xl"
          sizes="(max-width: 768px) 112px, 128px"
        />
        <h3 className="text-base font-bold text-slate-900">{nombre}</h3>
        <span className="mt-2 inline-block rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-600">
          {cargo}
        </span>
        {descripcion && (
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
            {descripcion}
          </p>
        )}
      </article>
    </CardTilt3D>
  );
}
