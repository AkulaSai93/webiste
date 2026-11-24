"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Content from the live upGrad SOT site. `code` = snippet the bot types while this pathway is featured. */
const PATHWAYS = [
  {
    key: "jobs",
    label: "High Paying Jobs",
    title: "Launch a High-Paying Tech Career",
    body: "Get industry-ready with hands-on coding, hackathons and strong placement support.",
    stats: [
      { k: "Hiring Partners", v: "3000+" },
      { k: "Placements", v: "110K+" },
    ],
    img: "/images/pathways/jobs.webp",
    code: "career",
  },
  {
    key: "startup",
    label: "Startup Support",
    title: "Build Your Own Startup, While You Study",
    body: "Launch your startup while you study, with mentorship, incubation and seed funding.",
    stats: [
      { k: "From day one", v: "Mentorship" },
      { k: "When you’re ready", v: "Seed Funding" },
    ],
    img: "/images/pathways/startup.webp",
    code: "fullstack",
  },
  {
    key: "research",
    label: "Research & Higher Studies",
    title: "Research Today, Study at Top Global Universities",
    body: "Build research skills and prepare for GRE, IELTS and top global universities.",
    stats: [
      { k: "Global Universities", v: "300+" },
      { k: "Test prep", v: "GRE & IELTS" },
    ],
    img: "/images/pathways/research.webp",
    code: "quantum",
  },
] as const;

type Pathway = (typeof PATHWAYS)[number];

export default function Pathways() {
  const root = useRef<HTMLElement>(null);
  // order[0] is featured in the big card, order[1] top-right, order[2] bottom-right
  const [order, setOrder] = useState<number[]>([0, 1, 2]);
  const featured = PATHWAYS[order[0]];
  const mounted = useRef(false);

  const feature = (i: number) => {
    if (i === order[0]) return;
    setOrder([i, ...order.filter((x) => x !== i)]);
    window.dispatchEvent(
      new CustomEvent("mascot:code", { detail: PATHWAYS[i].code }),
    );
  };

  // entrance on scroll
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({
        defaults: { ease: "expo.out", duration: 1.3 },
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
      tl.from("[data-pw-title]", { yPercent: 30, autoAlpha: 0 })
        .from(
          "[data-pw-big]",
          { autoAlpha: 0, scale: 0.94, transformOrigin: "50% 60%" },
          0.1,
        )
        .from(
          "[data-pw-side] > *",
          { autoAlpha: 0, x: 40, stagger: 0.12 },
          0.3,
        );

      ScrollTrigger.create({
        trigger: root.current,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: () =>
          window.dispatchEvent(
            new CustomEvent("mascot:code", { detail: PATHWAYS[0].code }),
          ),
      });
    },
    { scope: root },
  );

  // swap animation whenever the featured pathway changes
  useGSAP(
    () => {
      // only animate real swaps, not the first render (the scroll entrance handles that)
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-pw-big-img]",
        { scale: 1.12 },
        { scale: 1, duration: 1.4, ease: "expo.out" },
      );
      gsap.fromTo(
        "[data-pw-big-copy] > *",
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.9, ease: "expo.out" },
      );
      gsap.fromTo(
        "[data-pw-side-media]",
        { scale: 1.08 },
        { scale: 1, duration: 1, ease: "expo.out", stagger: 0.08 },
      );
    },
    { scope: root, dependencies: [order[0]] },
  );

  return (
    <section ref={root} id="pathways" className="relative bg-white">
      {/* objectBoundingBox clip for the notched big card (KPRverse-style silhouette) */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <clipPath id="pw-notch" clipPathUnits="objectBoundingBox">
            <path d="M0.075,0 H0.955 Q1,0 1,0.045 V0.855 Q1,0.885 0.98,0.905 L0.915,0.975 Q0.89,1 0.855,1 H0.045 Q0,1 0,0.955 V0.64 Q0,0.6 0.022,0.585 Q0.03,0.578 0.03,0.55 V0.045 Q0.03,0 0.075,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="relative z-[2] mx-auto grid max-w-[1512px] grid-cols-1 gap-8 px-5 py-20 sm:px-10 lg:h-svh lg:min-h-[620px] lg:grid-cols-[minmax(0,120px)_minmax(0,1fr)_minmax(0,400px)] lg:grid-rows-[minmax(0,1fr)] lg:gap-x-8 lg:px-10 lg:py-8">
        {/* ── Left: giant vertical heading + label + bot ── */}
        <div className="flex min-h-0 flex-col lg:items-center lg:justify-between">
          {/* Full heading, set vertically: "One Degree" + "Three Pathways" as two big lines */}
          <h2
            data-pw-title
            className="text-[clamp(2.25rem,8vw,3.5rem)] leading-[0.92] font-extrabold tracking-[-0.04em] whitespace-nowrap text-ink uppercase lg:rotate-180 lg:text-[min(4.1vw,6.2vh)] lg:[writing-mode:vertical-rl]"
          >
            <span className="block">One Degree</span>
            <span className="block text-brand">Three Pathways</span>
          </h2>

          {/* Mascot stop: bot stands at the foot of the heading column */}
          <div className="relative hidden h-[30%] w-full shrink-0 lg:block">
            <div
              data-mascot-stop
              data-mascot-fit="0.95"
              data-mascot-fit-anchor="section"
              data-mascot-scale="0.32"
              data-mascot-turn="0.35"
              data-mascot-code="career"
              data-mascot-start="top 70%"
              data-mascot-end="top top"
              data-mascot-mx="0.62"
              data-mascot-my="-0.66"
              data-mascot-ms="0.26"
              className="pointer-events-none absolute inset-0"
            />
          </div>
        </div>

        {/* ── Centre: featured pathway in the notched card ── */}
        <article
          data-pw-big
          className="relative min-h-[560px] overflow-hidden rounded-[28px] bg-ink lg:h-full lg:min-h-0 lg:rounded-none lg:[clip-path:url(#pw-notch)]"
        >
          {/* all three stay mounted (and loaded) so a swap cross-fades instead of flashing black */}
          {PATHWAYS.map((p, i) => (
            <Image
              key={p.key}
              data-pw-big-img={i === order[0] ? "" : undefined}
              src={p.img}
              alt={i === order[0] ? p.label : ""}
              fill
              loading="eager"
              sizes="(min-width: 1024px) 60vw, 100vw"
              className={`object-cover transition-opacity duration-700 ${i === order[0] ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.35)_0%,transparent_30%,transparent_42%,rgb(0_0_0/0.82)_100%)]" />

          <div
            data-pw-big-copy
            className="absolute right-7 bottom-7 left-7 lg:right-24 lg:bottom-[6%] lg:left-14"
          >
            <h3 className="max-w-[17ch] text-[clamp(1.9rem,min(3.2vw,5.4vh),3.25rem)] leading-[1.04] font-medium tracking-[-0.035em] text-white">
              {featured.title}
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/80">
              {featured.body}
            </p>
            <div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-5">
              {featured.stats.map((s) => (
                <div key={s.k}>
                  <p className="text-[clamp(1.4rem,2vw,1.85rem)] leading-none font-medium tracking-[-0.02em] text-white">
                    {s.v}
                  </p>
                  <p className="mt-2 font-mono text-[10.5px] tracking-[0.14em] text-white/65 uppercase">
                    {s.k}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* ── Right: the other two pathways (click to feature) ── */}
        <div
          data-pw-side
          className="flex min-h-0 flex-col lg:border-l lg:border-[#ebebeb]"
        >
          <SpecimenPanel
            divider
            p={PATHWAYS[order[1]]}
            onSelect={() => feature(order[1])}
          />
          <SpecimenPanel
            p={PATHWAYS[order[2]]}
            onSelect={() => feature(order[2])}
          />
        </div>
      </div>
    </section>
  );
}

/** Right-hand pathway panel: framed image, then title and description. */
function SpecimenPanel({
  p,
  onSelect,
  divider = false,
}: {
  p: Pathway;
  onSelect: () => void;
  divider?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex min-h-0 flex-1 flex-col py-6 text-left lg:px-7 lg:pb-6 ${divider ? "border-b border-[#ebebeb] lg:pt-0" : "lg:pt-6 lg:pb-0"}`}
    >
      <span className="relative block aspect-[4/3] min-h-0 overflow-hidden rounded-[14px] ring-1 ring-ink/[0.06] lg:aspect-auto lg:flex-1">
        <Image
          src={p.img}
          alt={p.label}
          fill
          sizes="340px"
          data-pw-side-media
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(.19,1,.22,1)] group-hover:scale-[1.05]"
        />
      </span>

      <span className="mt-4 block text-[clamp(1.05rem,1.3vw,1.25rem)] leading-snug font-medium tracking-[-0.02em] text-ink">
        {p.title}
      </span>
      <span className="mt-1.5 block text-[13.5px] leading-relaxed text-[#3d4452]">
        {p.body}
      </span>
    </button>
  );
}
