import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PageTracker from "@/app/components/PageTracker";
import FloatingWidgets from "@/app/components/FloatingWidgets";

export default function PublicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Accesibilidad: saltar el navbar y llegar directo al contenido (teclado
          y lectores de pantalla). Oculto hasta recibir foco. */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-blue-700 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <PageTracker />
      <Navbar />
      {/* pt-16 compensa el navbar fijo (h-16); el Hero lo anula con -mt si hace falta */}
      <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
