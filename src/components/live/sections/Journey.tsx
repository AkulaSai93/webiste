"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/live/motion/Reveal";
import { lenis } from "@/components/SmoothScroll";
import { CornerHandles } from "@/components/live/site/CornerHandles";
import { SectionHeading } from "@/components/live/site/SectionHeading";
import { VideoPlayer, type Video } from "@/components/live/site/VideoPlayer";
import { Minus, Play, Plus } from "lucide-react";

gsap.registerPlugin(useGSAP);

type Pillar = {
  key: string;
  title: string;
  body: string;
  /** the label over its row of videos */
  label: string;
  videos: { id: string; title: string }[];
};

/** "What makes uGSOT built for the AI age", in four pillars, each with a row
 *  of Shorts from the school's YouTube channel (@upGradSchoolofTechnology)
 *  that shows it; thumbnails in /images/journey. Captions are shortened from
 *  the videos' titles. */
const PILLARS: Pillar[] = [
  {
    key: "y1",
    title: "Start Strong",
    body: "From day one: orientation, first-week guides and a founding batch building it together.",
    label: "On campus",
    videos: [
      { id: "LUiEPZiMc6M", title: "Founding Batch 2026–30 kicks off" },
      { id: "hC4YxBgeQ0E", title: "Orientation day on campus" },
      { id: "heOBtPAl24w", title: "First week of college survival guide" },
      { id: "8cT_bD0GTBg", title: "7 first-year mistakes to avoid" },
    ],
  },
  {
    key: "y2",
    title: "Learn By Building",
    body: "Coding battles, real projects, and building AI rather than just using it.",
    label: "Building",
    videos: [
      { id: "rnMH5swIn94", title: "A real student coding battle" },
      { id: "T5QwtXlf02Y", title: "Don’t wait for final year to build" },
      { id: "b_rZ-y54QKE", title: "Everyone uses AI. Who builds it?" },
      { id: "CHeadHnjVU4", title: "Build the model, not a wrapper app" },
    ],
  },
  {
    key: "y3",
    title: "Go Deep in AI & Quantum",
    body: "Get ahead on the tech that comes next, and land internships that get you hired.",
    label: "AI, quantum & internships",
    videos: [
      { id: "hYx1y8ilkWo", title: "Why learn quantum computing now" },
      {
        id: "sEF2j8xC91w",
        title: "If you knew how AI worked, what would you build?",
      },
      {
        id: "drNgH8I1RCE",
        title: "Degrees get interviews, internships get you hired",
      },
      { id: "pnjbJgI50-w", title: "International vs. Indian internships" },
    ],
  },
  {
    key: "y4",
    title: "Launch Your Career",
    body: "Hiring, startups and funding: be ready for what comes after graduation.",
    label: "Careers & startups",
    videos: [
      { id: "UfcYFWNynfc", title: "What tech hiring looks like now" },
      { id: "MqrKN3rYzc8", title: "When your university backs your startup" },
      { id: "ge_-IHtkR1g", title: "Why funding should come fifth, not first" },
      { id: "U9lIlNb6m7c", title: "Future-proof your career for 2030" },
    ],
  },
];

/** one Short, as on scaler.com's "What makes SST": the upright thumbnail
 *  with a play button, then its caption */
function VideoCard({
  v,
  onOpen,
}: {
  v: { id: string; title: string };
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Play video: ${v.title}`}
      className="group flex w-[180px] shrink-0 snap-start flex-col rounded-[4px] border border-black/[0.08] bg-white p-2 text-left outline-none transition-colors hover:border-ink focus-visible:ring-2 focus-visible:ring-accent sm:w-[196px]"
    >
      <span className="relative block aspect-[9/16] overflow-hidden rounded-[2px] bg-ink">
        <Image
          src={`/images/journey/${v.id}.webp`}
          alt=""
          fill
          sizes="200px"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-accent"
        >
          <Play
            size={16}
            fill="currentColor"
            strokeWidth={0}
            className="translate-x-[1px]"
          />
        </span>
      </span>
      <span className="line-clamp-2 px-1 pb-1 pt-2.5 text-[13.5px] font-semibold leading-snug text-ink">
        {v.title}
      </span>
    </button>
  );
}

/** a year's Shorts in a sideways row with prev/next arrows (each greyed at
 *  its end); it swipes or scrolls by touch too */
function VideoRow({
  pillar,
  onOpen,
}: {
  pillar: Pillar;
  onOpen: (v: Video) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });
  const videos = pillar.videos;

  const sync = () => {
    const el = track.current;
    if (!el) return;
    setEnds({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  };

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const slide = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("button");
    const step = card
      ? card.getBoundingClientRect().width + 16
      : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-4">
        <Label>{`Watch: ${pillar.label}`}</Label>
        <div className="flex gap-2">
          {[
            {
              d: -1 as const,
              label: "Previous videos",
              icon: "arrow-prev",
              off: ends.start,
            },
            {
              d: 1 as const,
              label: "Next videos",
              icon: "arrow-next",
              off: ends.end,
            },
          ].map(({ d, label, icon, off }) => (
            <button
              key={d}
              type="button"
              aria-label={label}
              disabled={off}
              onClick={() => slide(d)}
              className="grid size-10 place-items-center rounded-[4px] border border-black/[0.08] transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-35"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/curriculum/icons/${icon}.svg`}
                alt=""
                width={17}
                height={17}
              />
            </button>
          ))}
        </div>
      </div>
      <Reveal stagger={0.07} className="mt-4 overflow-hidden">
        <div
          ref={track}
          onScroll={sync}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {videos.map((v) => (
            <div key={v.id} data-reveal-item className="shrink-0">
              <VideoCard
                v={v}
                onOpen={() =>
                  onOpen({
                    id: v.id,
                    name: v.title,
                    thumb: `/images/journey/${v.id}.webp`,
                    vertical: true,
                  })
                }
              />
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/** one project: its coloured thumbnail (the client's Figma illustrations,
 *  each on its own gradient, /images/curriculum/figma), then its title and
 *  line */

/** a pillar's column: its number big in red, its title and line */
function PillarColumn({ pillar, index }: { pillar: Pillar; index: number }) {
  return (
    <div className="relative lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:pl-7">
      <p className="font-display text-[clamp(3.5rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.05em] text-accent">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-3 text-[22px] font-medium leading-tight tracking-[-0.02em] text-ink">
        {pillar.title}
      </h3>
      <p className="mt-2 max-w-[280px] text-[14.5px] leading-[1.6] text-body">
        {pillar.body}
      </p>
    </div>
  );
}


export function CurriculumJourney() {
  const list = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<Video | null>(null);

  // the red line fills the rail as the years scroll by: empty when the list's
  // top reaches the middle of the screen, full when its bottom does. Measured
  // live on every scroll rather than from cached trigger positions, which go
  // stale as the sections above settle (images, the stacked Pathways cards)
  // and left the line already full
  useGSAP(
    () => {
      const el = list.current;
      const fill = el?.querySelector<HTMLElement>("[data-rail-fill]");
      if (!el || !fill) return;
      const update = () => {
        const r = el.getBoundingClientRect();
        const mid = window.innerHeight / 2;
        const p = r.height
          ? Math.min(1, Math.max(0, (mid - r.top) / r.height))
          : 0;
        fill.style.transform = `scaleY(${p})`;
      };
      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      };
    },
    { scope: list },
  );

  return (
    <section id="curriculum-journey" className="bg-canvas py-8 lg:py-16">
      <div className="container-page">
        <SectionHeading
          title="What Makes uGSOT"
          accent="Built for the AI Age"
          // phones: the whole heading on one line, sized to fit
          titleClassName="max-lg:whitespace-nowrap max-lg:text-[4.6vw]"
          intro="See it for yourself: stories from our campus, students and leaders."
        />

        <div
          ref={list}
          className="relative mt-12 space-y-16 lg:mt-16 lg:space-y-24"
        >
          {/* one rail down the whole list (phones too) and the red line that
              fills it with the scroll, as on quadcse.com */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 !mt-0 w-[2px] bg-ink/10"
          />
          <span
            aria-hidden
            data-rail-fill
            // starts empty via transform, not Tailwind's scale-y-0: that sets
            // the separate CSS scale property, which would stack with GSAP's
            style={{ transform: "scaleY(0)" }}
            className="absolute inset-y-0 left-0 !mt-0 w-[2px] origin-top bg-accent will-change-transform"
          />
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.key}
              className="grid gap-6 pl-5 sm:pl-7 lg:grid-cols-[minmax(260px,320px)_1fr] lg:items-start lg:gap-12 lg:pl-0"
            >
              <PillarColumn pillar={pillar} index={i} />
              <VideoRow pillar={pillar} onOpen={setPlaying} />
            </div>
          ))}
        </div>
      </div>

      {playing && (
        <VideoPlayer video={playing} onClose={() => setPlaying(null)} />
      )}
    </section>
  );
}


function Label({
  children,
  tone = "accent",
}: {
  children: string;
  tone?: "accent" | "ink";
}) {
  return (
    <h4
      className={`border-l-[3px] border-accent pl-3 text-[17px] font-semibold leading-tight ${
        tone === "accent" ? "text-accent" : "text-ink"
      }`}
    >
      {children}
    </h4>
  );
}
