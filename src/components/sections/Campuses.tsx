"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Icon = "badge" | "pin" | "cap";

/**
 * "Our Campuses" — matches the live upGrad SOT site (sizes, card, icon tiles,
 * full-width moving-border button). Content and links from the live site.
 */
const CAMPUSES: {
  key: string;
  kicker: string;
  name: string;
  location: string;
  img: string;
  href: string;
  highlights: { icon: Icon; text: string }[];
}[] = [
  {
    key: "ssahe",
    kicker: "Tumkuru Campus · Karnataka",
    name: "Sri Siddhartha Academy of Higher Education",
    location: "Tumkuru (Outer Bangalore), Karnataka",
    img: "/images/campuses/ssahe-campus.webp",
    href: "https://sot.upgrad.com/university/ssahe",
    highlights: [
      {
        icon: "badge",
        text: "NAAC A+ accredited, UGC recognised and AICTE approved",
      },
      {
        icon: "pin",
        text: "70+ acre green campus in Tumkuru, Outer Bangalore",
      },
      {
        icon: "cap",
        text: "AI-First B.Tech in Computer Science, 4 years / 8 semesters",
      },
    ],
  },
  {
    key: "adypu",
    kicker: "Pune Campus · Maharashtra",
    name: "Ajeenkya DY Patil University",
    location: "Pune, Maharashtra",
    img: "/images/campuses/adypu-campus.webp",
    href: "https://sot.upgrad.com/university/adypu",
    highlights: [
      { icon: "badge", text: "NAAC A accredited university" },
      {
        icon: "pin",
        text: "Campus in Pune, one of India's leading tech and startup hubs",
      },
      {
        icon: "cap",
        text: "AI-First B.Tech in Computer Science with upGrad School of Technology",
      },
    ],
  },
];

export default function Campuses() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-cp-head] > *", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-cp-head]", start: "top 82%" },
      });
      gsap.from("[data-cp-card]", {
        y: 50,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-cp-grid]", start: "top 82%" },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="campuses"
      className="relative bg-white py-8 lg:py-16"
    >
      <div className="relative z-[2] mx-auto max-w-[1200px] px-5 sm:px-10 lg:px-0">
        <div data-cp-head className="mx-auto max-w-[980px] text-center">
          <h2 className="text-[clamp(2.5rem,4.6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-ink uppercase">
            Our <span className="text-brand">Campuses.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-[clamp(0.9375rem,1.1vw,1rem)] leading-[1.6] text-balance text-[#3d4452]">
            uGSOT is collaborating with cutting-edge university campuses across
            India, giving students world-class learning spaces right where
            innovation thrives
          </p>
        </div>

        <div
          data-cp-grid
          className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-8"
        >
          {CAMPUSES.map((c) => (
            <article
              key={c.key}
              data-cp-card
              className="group relative flex flex-col overflow-hidden rounded-[8px] border border-black/[0.08] bg-white transition-[translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
            >
              <div className="relative aspect-video overflow-hidden bg-ink">
                <Image
                  src={c.img}
                  alt={`${c.name}, ${c.location}`}
                  fill
                  sizes="(min-width: 1024px) 600px, 100vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
                {/* soft overlay: light tint + gentle darkening toward the bottom */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_13_16/0.08)_0%,rgb(0_13_16/0.12)_55%,rgb(0_13_16/0.35)_100%)]"
                />
              </div>

              <div className="flex flex-1 flex-col p-5 lg:p-6">
                <h3 className="text-[clamp(1.125rem,1.55vw,1.5rem)] leading-tight font-bold tracking-[-0.03em] text-ink sm:whitespace-nowrap">
                  {c.name}
                </h3>
                <p className="mt-1.5 text-[14px] text-[#3d4452]">
                  {c.location}
                </p>

                <p className="mt-5 text-[12px] font-medium tracking-[0.16em] text-brand uppercase">
                  Key highlights
                </p>
                <ul className="mt-3 space-y-3">
                  {c.highlights.map((h) => (
                    <li
                      key={h.text}
                      className="flex items-center gap-3 text-[14px] leading-snug text-ink"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-[4px] bg-[linear-gradient(135deg,#ff8fa3_0%,#e4002b_42%,#e4002b_58%,#ffb3c0_100%)] text-white">
                        <HighlightIcon name={h.icon} />
                      </span>
                      {h.text}
                    </li>
                  ))}
                </ul>

                {/* full-width red button with the moving border (.cta-glow) */}
                <div className="mt-auto pt-6">
                  <a
                    href={c.href}
                    className="group/cta relative flex w-full overflow-hidden rounded-[6px] p-[1.5px]"
                  >
                    <span
                      aria-hidden
                      className="cta-glow absolute top-1/2 left-1/2 aspect-square w-[160%]"
                    />
                    <span className="relative z-[2] flex w-full items-center justify-center gap-2 rounded-[4px] bg-brand px-6 py-3 text-[14.5px] font-semibold text-white transition-colors group-hover/cta:bg-brand-dark">
                      Explore campus
                      <svg
                        viewBox="0 0 24 24"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M7 17 17 7M7 7h10v10" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightIcon({ name }: { name: Icon }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-4",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "badge")
    return (
      <svg {...common}>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  if (name === "pin")
    return (
      <svg {...common}>
        <path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}
