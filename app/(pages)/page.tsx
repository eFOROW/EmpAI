import { Footer } from "../components/Home";
import {
  About,
  Explore,
  Hero,
  WhatsNew,
} from "../sections/Home";

export default function Home() {
  return (
    <div>
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
    </div>
  );
}
