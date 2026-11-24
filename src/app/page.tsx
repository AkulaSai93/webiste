import Hero from "@/components/hero/Hero";
import MascotLayer from "@/components/mascot/MascotLayer";
import SmoothScroll from "@/components/SmoothScroll";
import PlaceholderSections from "@/components/sections/PlaceholderSections";
import Specializations from "@/components/sections/Specializations";
import Pathways from "@/components/sections/Pathways";

export default function Home() {
  return (
    <main>
      <SmoothScroll />
      <MascotLayer />
      <Hero />
      <Specializations />
      <Pathways />
      <PlaceholderSections />
    </main>
  );
}
