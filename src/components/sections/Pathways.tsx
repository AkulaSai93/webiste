"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * "One Degree, Three Pathways" — KPRverse "10K / Initial Collection" layout:
 * - Left: "ONE DEGREE" runs vertically, sized to fill the full height, with a
 *   small "Three Pathways" caption beside it.
 * - Middle: the pathway photo in KPR's card silhouette (image only).
 * - Right, split by hairlines: a "specimen" panel (caption, measurement lines,
 *   floating photo, then heading + content) and an image panel that shows the
 *   next pathway; clicking it brings that pathway in.
 * Content from the live upGrad SOT site.
 */
const PATHWAYS = [
  {
    key: "jobs",
    label: "High Paying Jobs",
    title: "Launch a High-Paying Tech Career",
    body: "Get industry-ready with hands-on coding, hackathons and strong placement support.",
    img: "/images/pathways/jobs.webp",
  },
  {
    key: "startup",
    label: "Startup Support",
    title: "Build Your Own Startup, While You Study",
    body: "Launch your startup while you study, with mentorship, incubation and seed funding.",
    img: "/images/pathways/startup.webp",
  },
  {
    key: "research",
    label: "Research & Higher Studies",
    title: "Research Today, Study at Top Global Universities",
    body: "Build research skills and prepare for GRE, IELTS and top global universities.",
    img: "/images/pathways/research.webp",
  },
] as const;

export default function Pathways() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const p = PATHWAYS[active];
  const next = PATHWAYS[(active + 1) % PATHWAYS.length];
  const mounted = useRef(false);

  // size "ONE DEGREE" so it runs the full height of its column (like KPR's 10K)
  useGSAP(
    () => {
      const box =
        root.current?.querySelector<HTMLElement>("[data-pw-word-box]");
      const word = root.current?.querySelector<HTMLElement>("[data-pw-word]");
      if (!box || !word) return;
      const fit = () => {
        word.style.fontSize = "";
        if (!window.matchMedia("(min-width: 1024px)").matches) return;
        word.style.fontSize = "100px";
        const len = word.getBoundingClientRect().height;
        word.style.fontSize = `${(100 * box.clientHeight) / len}px`;
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(box);
      document.fonts?.ready.then(fit);

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const tl = gsap.timeline({
          defaults: { ease: "expo.out", duration: 1.4 },
          scrollTrigger: { trigger: root.current, start: "top 65%" },
        });
        tl.from("[data-pw-left]", { yPercent: 30, autoAlpha: 0 })
          .from(
            "[data-pw-card]",
            { scale: 0.92, autoAlpha: 0, transformOrigin: "50% 60%" },
            0.05,
          )
          .from(
            "[data-pw-right] > *",
            { yPercent: 25, autoAlpha: 0, stagger: 0.12 },
            0.12,
          )
          .from(
            "[data-pw-line]",
            { scaleY: 0, transformOrigin: "top", duration: 1.2 },
            0.3,
          );
      }
      return () => ro.disconnect();
    },
    { scope: root },
  );

  // swap animation when the next pathway is brought in
  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-pw-swap]",
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.9, ease: "expo.out" },
      );
      gsap.fromTo(
        "[data-pw-zoom]",
        { scale: 1.12 },
        { scale: 1, duration: 1.2, ease: "expo.out" },
      );
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <section ref={root} id="pathways" className="relative bg-white">
      {/* KPR card silhouette: slanted top, rounded corners, notch on the left, cut bottom-right */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <clipPath id="pw-card" clipPathUnits="objectBoundingBox">
            <path d="M0.115,0.02 L0.94,0.008 Q0.97,0.008 0.971,0.038 L0.99,0.79 Q0.99,0.82 0.97,0.842 L0.865,0.968 Q0.84,0.992 0.81,0.992 L0.065,1 Q0.035,1 0.035,0.97 L0.035,0.64 Q0.035,0.612 0.055,0.592 L0.068,0.578 Q0.08,0.566 0.08,0.538 L0.08,0.06 Q0.08,0.02 0.115,0.02 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="relative z-[2] mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-5 py-20 sm:px-10 lg:h-svh lg:min-h-[640px] lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,320px)] lg:grid-rows-[minmax(0,1fr)] lg:gap-0 lg:px-0 lg:py-6">
        {/* ── Left: ONE DEGREE (full height) + caption ── */}
        <div data-pw-left className="flex min-h-0 items-end gap-3">
          <h2 className="contents">
            <span
              data-pw-word-box
              className="block lg:h-full lg:rotate-180 lg:[writing-mode:vertical-rl]"
            >
              <span
                data-pw-word
                className="inline-block text-[clamp(2.5rem,9vw,4rem)] leading-[0.8] font-extrabold tracking-[-0.04em] whitespace-nowrap text-ink uppercase"
              >
                One Degree
              </span>
            </span>
            <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] whitespace-nowrap text-ink uppercase max-lg:hidden lg:rotate-180 lg:[writing-mode:vertical-rl]">
              <span className="text-brand">▶▶</span>
              Three Pathways
            </span>
          </h2>
        </div>

        {/* ── Middle: image card, hairline on its right ── */}
        <div className="relative min-h-0 lg:px-6 lg:[container-type:size]">
          <div
            data-pw-card
            className="relative mx-auto aspect-square w-full overflow-hidden bg-ink [clip-path:url(#pw-card)] lg:absolute lg:top-1/2 lg:left-1/2 lg:w-[min(100cqw,100cqh)] lg:-translate-x-1/2 lg:-translate-y-1/2"
          >
            {PATHWAYS.map((x, i) => (
              <Image
                key={x.key}
                src={x.img}
                alt={i === active ? x.label : ""}
                fill
                loading="eager"
                sizes="(min-width: 1024px) 680px, 100vw"
                className={`object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>
          <span
            data-pw-line
            aria-hidden
            className="absolute top-0 right-0 hidden h-full w-px bg-black/10 lg:block"
          />
        </div>

        {/* ── Right: specimen panel over a hairline, then the next-pathway image ── */}
        <div data-pw-right className="flex min-h-0 flex-col">
          <div className="flex min-h-0 flex-col border-b border-black/10 pb-6 lg:basis-[60%] lg:pt-2 lg:pl-8">
            <Caption key={`c-${p.key}`} text={p.label} />

            <div className="relative my-5 flex min-h-[200px] flex-1 items-center justify-center">
              <MeasurementLines className="absolute top-1/2 left-1/2 h-full max-h-[220px] w-auto -translate-x-1/2 -translate-y-1/2" />
              <span className="relative aspect-[4/3] w-[66%] overflow-hidden rounded-[8px] shadow-[0_24px_50px_-24px_rgb(0_13_16/0.45)] motion-safe:animate-[pw-float_6s_ease-in-out_infinite]">
                <Image
                  key={p.key}
                  data-pw-zoom
                  src={p.img}
                  alt=""
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </span>
            </div>

            <h3
              data-pw-swap
              className="text-[clamp(1.2rem,1.5vw,1.4rem)] leading-[1.2] font-semibold tracking-[-0.025em] text-ink"
            >
              {p.title}
            </h3>
            <p
              data-pw-swap
              className="mt-2 text-[14px] leading-relaxed text-[#3d4452]"
            >
              {p.body}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActive((active + 1) % PATHWAYS.length)}
            aria-label={`Show next pathway: ${next.label}`}
            className="group relative mt-6 block text-left lg:mt-0 lg:flex lg:min-h-0 lg:flex-1 lg:items-center lg:pl-8"
          >
            <span className="relative block aspect-[1.3] w-full overflow-hidden rounded-[8px] bg-ink lg:aspect-auto lg:h-[calc(100%-3rem)]">
              <Image
                key={next.key}
                src={next.img}
                alt=""
                fill
                sizes="300px"
                className="object-cover object-[60%_40%] transition-transform duration-700 ease-[cubic-bezier(.19,1,.22,1)] group-hover:scale-[1.05]"
              />
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.45),transparent_45%)]" />
              <span className="absolute top-5 left-5">
                <Caption key={`n-${next.key}`} text={next.label} light />
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

/** KPR-style tiny caption: square dot + mono uppercase text. */
function Caption({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <span
      data-pw-swap
      className={`flex items-center gap-2.5 font-mono text-[11px] leading-none tracking-[0.12em] uppercase ${light ? "text-white" : "text-ink"}`}
    >
      <span className="size-1.5 shrink-0 bg-current" />
      {text}
    </span>
  );
}

/** Faint horizontal guide lines with a fine scale on the right (KPR's measurement lines). */
function MeasurementLines({ className }: { className?: string }) {
  const rows = [0.5, 43.5, 87.5, 130.5, 173.5, 216.5, 259.5];
  const ticks = Array.from({ length: 53 }, (_, i) => 0.5 + i * 5);
  return (
    <svg viewBox="0 0 258 260" fill="none" aria-hidden className={className}>
      {rows.map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="226"
          y2={y}
          stroke="#0b0d12"
          strokeOpacity="0.14"
        />
      ))}
      {ticks.map((y, i) => (
        <line
          key={y}
          x1={i % 5 === 0 ? 240 : 247}
          y1={y}
          x2="257"
          y2={y}
          stroke="#0b0d12"
          strokeOpacity={i % 5 === 0 ? 0.55 : 0.3}
          strokeWidth="0.8"
        />
      ))}
    </svg>
  );
}
