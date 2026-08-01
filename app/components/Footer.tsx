import Link from "next/link";
import Brand from "./Brand";
import {
  FacebookIcon,
  TiktokIcon,
  YoutubeIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
} from "./icons";
import { IGLESIA } from "@/app/data/iglesia";
import { getSettings } from "@/src/utils/settings";
import TrackLink from "./TrackLink";

const institucional = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Eventos", href: "/eventos" },
  { label: "Cultos y Horarios", href: "/#cultos" },
];

const comunidad = [
  { label: "Comunidad", href: "/comunidad" },
  { label: "Testimonios", href: "/testimonios" },
  { label: "Entrevistas", href: "/entrevistas" },
];

const grupos = [
  { label: "Coro e Instrumentos", href: "/grupos/coro-juventud" },
  { label: "Evangelización", href: "/grupos/evangelizacion" },
  { label: "Visita a Hogares", href: "/departamento-visitas" },
  { label: "Oración y Petición", href: "/oracion-peticion" },
  { label: "Escuela Dominical Infantil", href: "/grupos/escuela-dominical" },
  { label: "Comunicación Digital", href: "/grupos/comunicacion-digital" },
];

function ColumnaEnlaces({
  titulo,
  enlaces,
}: {
  titulo: string;
  enlaces: { label: string; href: string }[];
}) {
  return (
    <nav className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
        {titulo}
      </h3>
      <ul className="space-y-2.5">
        {enlaces.map((u) => (
          <li key={u.href + u.label}>
            <Link
              href={u.href}
              className="text-sm text-slate-400 transition-colors hover:text-sky-400"
            >
              {u.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default async function Footer() {
  const s = await getSettings();
  const redes = [
    { label: "Facebook", href: s.redes.facebook, Icon: FacebookIcon },
    { label: "TikTok", href: s.redes.tiktok, Icon: TiktokIcon },
    { label: "YouTube", href: s.redes.youtube, Icon: YoutubeIcon },
    { label: "Instagram", href: s.redes.instagram, Icon: InstagramIcon },
  ];

  return (
    <footer className="mt-auto bg-blue-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* 1 · Identidad */}
          <div className="space-y-4 lg:col-span-3">
            <Brand tone="light" />
            <p className="text-sm leading-relaxed text-slate-400">
              {s.ministerio}. Una familia de fe fundada el{" "}
              <span className="font-medium text-slate-200">
                {IGLESIA.fundacion}
              </span>
              .
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              {IGLESIA.personaJuridica}
            </p>
          </div>

          {/* 2 · Institucional */}
          <div className="lg:col-span-2">
            <ColumnaEnlaces titulo="Institucional" enlaces={institucional} />
          </div>

          {/* 3 · Comunidad */}
          <div className="lg:col-span-2">
            <ColumnaEnlaces titulo="Comunidad" enlaces={comunidad} />
          </div>

          {/* 4 · Grupos y Ministerios */}
          <div className="lg:col-span-2">
            <ColumnaEnlaces titulo="Grupos y Ministerios" enlaces={grupos} />
          </div>

          {/* 5 · Contacto */}
          <div className="space-y-4 lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contacto
            </h3>

            {/* Dirección + mapa (destacado) */}
            <TrackLink
              href={s.mapsUrl}
              external
              event="visit_plan_click"
              className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-white/10"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/20 text-sky-300">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                    Nuestro Templo
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {s.direccion}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-400">
                    Cómo llegar <span aria-hidden>→</span>
                  </span>
                </div>
              </div>
            </TrackLink>

            {/* Correo */}
            <TrackLink
              href={`mailto:${s.correo}`}
              event="contact_click"
              meta={{ type: "email" }}
              className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-sky-400"
            >
              <MailIcon className="h-5 w-5 text-sky-400" />
              {s.correo}
            </TrackLink>

            {/* Redes */}
            <div className="flex items-center gap-3 pt-1">
              {redes.map(({ label, href, Icon }) => (
                <TrackLink
                  key={label}
                  href={href}
                  external
                  event="social_click"
                  meta={{ red: label }}
                  ariaLabel={label}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:text-sky-400"
                >
                  <Icon className="h-5 w-5" />
                </TrackLink>
              ))}
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-500">
            © {IGLESIA.anioFundacion} en adelante · {s.nombre}. Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs font-medium text-slate-400">
              Desarrollador: {IGLESIA.desarrollador}
            </p>
            <Link
              href="/login"
              className="text-xs text-slate-500 transition-colors hover:text-sky-400"
            >
              Administración
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
