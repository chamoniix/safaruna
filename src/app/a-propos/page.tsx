import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '8rem 2rem', minHeight: '60vh' }}>
        <h1>A-PROPOS</h1>
        <p className="mt-4 text-muted">Page en construction. Cette page contiendra les éléments de a-propos.</p>
      </div>
      <Footer />
    </>
  );
}