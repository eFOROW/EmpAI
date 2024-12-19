import { Footer, Navbar } from "../components";
import {
  About,
  Explore,
  Feedback,
  GetStarted,
  Hero,
  Insights,
  WhatsNew,
  World,
} from "../sections/(Home)";

export default function Home() {
  return (
    <main className="bg-primary-black overflow-hidden">
      <Navbar />
      <Hero />
      <section className="relative">
        <About />
        <div className="gradient-03 z-0" />
        <Explore />
      </section>
      <section className="relative">
        <div className="gradient-03 z-0" />
        <WhatsNew />
      </section>
      <Footer />
    </main>
  );
}
