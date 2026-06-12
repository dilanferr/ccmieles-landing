import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function PublicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {/* pt-16 compensa el navbar fijo (h-16); el Hero lo anula con -mt si hace falta */}
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
