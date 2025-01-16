import { Footer, Navbar } from "../components/Home";
import {
  About,
  Explore,
  Hero
} from "../sections/Home";

export default function Home() {
  return (
    <main className="bg-gray-150 overflow-hidden">
      <Navbar />
      <div className="mt-[130px]">
        <Hero />
      </div>
      <section className="relative">
        <About />
        <div className="gradient-03 z-0" />
        <Explore />
      </section>
      <Footer />
    </main>
  );
}