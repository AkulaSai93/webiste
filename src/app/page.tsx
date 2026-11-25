import Hero from "@/components/hero/Hero";
import MascotLayer from "@/components/mascot/MascotLayer";
import SmoothScroll from "@/components/SmoothScroll";
import Specializations from "@/components/sections/Specializations";
import Campuses from "@/components/sections/Campuses";
import Mentors from "@/components/sections/Mentors";
import Curriculum from "@/components/sections/Curriculum";
import Scholarships from "@/components/sections/Scholarships";
import Admission from "@/components/sections/Admission";
import Ecosystem from "@/components/sections/Ecosystem";
import { News } from "@/components/live/sections/News";
import { Leaders } from "@/components/live/sections/Leaders";
import { IITRace } from "@/components/live/sections/IITRace";
import { Spotlight } from "@/components/live/sections/Spotlight";
import { CurriculumJourney } from "@/components/live/sections/Journey";
import { BrochureBook } from "@/components/live/sections/BrochureBook";
import { Testimonials } from "@/components/live/sections/Testimonials";
import { Faqs } from "@/components/live/sections/Faqs";
import Numbers from "@/components/sections/Numbers";
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
      <Curriculum />
      <Scholarships />
      <Admission />
      <Ecosystem />
      <Numbers />
      <News />
      <Leaders />
      <IITRace />
      <Spotlight />
      <CurriculumJourney />
      <BrochureBook />
      <Testimonials />
      <Faqs />
    </main>
  );
}
