import Hero from "@/components/hero/Hero";
import MascotLayer from "@/components/mascot/MascotLayer";
import SmoothScroll from "@/components/SmoothScroll";
import PlaceholderSections from "@/components/sections/PlaceholderSections";
import Specializations from "@/components/sections/Specializations";
import Campuses from "@/components/sections/Campuses";
import Mentors from "@/components/sections/Mentors";
import ShipPathways from "@/components/sections/ShipPathways";

export default function Home() {
  return (
    <main>
      <SmoothScroll />
      <MascotLayer />
      <Hero />
      <Specializations />
      <ShipPathways />
      <Campuses />
      <Mentors />
      <PlaceholderSections />
    </main>
  );
}
