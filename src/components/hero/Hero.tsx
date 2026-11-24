"use client";

import { useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// WebGL only on the client
const SkyCanvas = dynamic(() => import("./SkyCanvas"), { ssr: false });

const LOGOS = [
  { src: "/images/logos/Haptik.png", alt: "Haptik", w: 402, h: 177 },
  { src: "/images/logos/Google.png", alt: "Google", w: 486, h: 177 },
  { src: "/images/logos/GoldmanSachs.png", alt: "Goldman Sachs", w: 382, h: 177 },
  { src: "/images/logos/Flipkart.png", alt: "Flipkart", w: 583, h: 177 },
  { src: "/images/logos/Accenture.png", alt: "Accenture", w: 623, h: 177 },
  { src: "/images/logos/Groww.png", alt: "Groww", w: 547, h: 177 },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          gsap.set("[data-hero-content]", { autoAlpha: 1 });
          if (ctx.conditions?.reduce) return;

          // --- intro timeline ------------------------------------------------
          const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.4 } });
          tl.from("[data-header] > *", { y: -16, autoAlpha: 0, stagger: 0.08, duration: 1 }, 0.1)
            .from("[data-word]", { yPercent: 115, rotate: 4, stagger: 0.07 }, 0.25)
            .from("[data-reveal]", { y: 28, autoAlpha: 0, stagger: 0.08, duration: 1.2 }, 0.7)
            .from("[data-stat]", { y: 20, autoAlpha: 0, stagger: 0.1, duration: 1 }, 0.85)
            .from("[data-divider]", { scaleY: 0, transformOrigin: "top", duration: 1 }, 0.95)
            .from("[data-logos]", { y: 20, autoAlpha: 0, duration: 1 }, 1.0)
            .from("[data-cta]", { y: 24, autoAlpha: 0, stagger: 0.08, duration: 1 }, 1.05);

          const cleanups: Array<() => void> = [];

          // --- infinite logo marquee ---------------------------------------
          const track = root.current?.querySelector<HTMLElement>("[data-marquee]");
          if (track) {
            const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 18, repeat: -1 });
            // ease to a stop on hover, like the live site's paused marquee
            const slow = () => gsap.to(loop, { timeScale: 0, duration: 0.5 });
            const fast = () => gsap.to(loop, { timeScale: 1, duration: 0.6 });
            track.addEventListener("mouseenter", slow);
            track.addEventListener("mouseleave", fast);
            cleanups.push(() => {
              track.removeEventListener("mouseenter", slow);
              track.removeEventListener("mouseleave", fast);
            });
          }

          // --- magnetic buttons ---------------------------------------------
          root.current?.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
            const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.45)" });
            const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.45)" });
            const move = (e: PointerEvent) => {
              const r = el.getBoundingClientRect();
              xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
              yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
            };
            const leave = () => {
              xTo(0);
              yTo(0);
            };
            el.addEventListener("pointermove", move);
            el.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              el.removeEventListener("pointermove", move);
              el.removeEventListener("pointerleave", leave);
            });
          });

          return () => cleanups.forEach((fn) => fn());
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative min-h-[760px] overflow-hidden lg:h-svh lg:min-h-[800px]">
      <SkyCanvas className="absolute inset-0 z-0" />

      <div
        data-hero-content
        className="invisible relative z-[2] mx-auto flex min-h-[760px] w-full max-w-[1440px] flex-col px-5 pt-6 pb-10 sm:px-10 lg:h-full lg:min-h-0 lg:px-20 lg:pt-12 lg:pb-14"
      >
        {/* ── Header: logo · centred nav · actions ── */}
        <header data-header className="flex items-center justify-between">
          <Image
            src="/images/logo-sot.png"
            alt="upGrad School of Technology"
            width={467}
            height={144}
            className="h-9 w-auto lg:h-11"
            priority
          />
          <div className="flex items-center gap-2.5">
            {/* hidden on phones */}
            <span className="hidden sm:block">
              <MovingBorderCta href="#apply" size="sm">
                Apply Now
                <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </MovingBorderCta>
            </span>
            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex h-[39px] items-center gap-2.5 rounded-[6px] bg-ink px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#13232b]"
            >
              Menu
              <svg viewBox="0 0 18 12" className="h-3 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 1.5h16M1 6h16M1 10.5h10" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Content (left) · bot (right) ── */}
        <div className="grid flex-1 grid-cols-1 items-center gap-y-6 py-8 lg:grid-cols-12 lg:gap-x-8 lg:py-6">
          <div className="lg:col-span-8 lg:pb-10 xl:col-span-7">
            <h1
              data-heading
              className="text-[clamp(2.6rem,5.94vw,5.35rem)] leading-[0.95] font-medium tracking-[-0.04em] text-ink"
            >
              <span className="block w-max overflow-hidden pb-[0.06em]">
                <span data-word className="inline-block whitespace-nowrap">AI-First</span>
              </span>
              <span className="block w-max overflow-hidden pb-[0.06em]">
                <span data-word className="inline-block whitespace-nowrap">B.Tech in</span>
              </span>
              <span className="block w-max overflow-hidden pb-[0.06em]">
                <span data-word className="inline-block whitespace-nowrap text-brand">
                  Computer Science
                </span>
              </span>
            </h1>

            <p data-reveal className="mt-6 text-[15px] font-medium text-ink">
              Admission starts with uGNET
            </p>
            <dl className="mt-3 flex items-stretch gap-6 sm:gap-8">
              <Stat label="COURSE DURATION" value="4 Years" sub="8 semesters" />
              <span data-divider className="w-px bg-line" />
              <Stat label="uGNET EXAM" value="12 Jan, 2027" sub="Online test" />
            </dl>
          </div>

          {/* Mascot stop: the site-wide bot (components/mascot) fills this right-hand cell */}
          <div className="relative h-[min(52vh,380px)] lg:col-span-4 lg:h-full lg:min-h-[380px] xl:col-span-5">
            <div
              data-mascot-stop
              data-mascot-fit="0.95"
              data-mascot-scale="0.85"
              data-mascot-turn="-0.25"
              data-mascot-code="agent"
              className="pointer-events-none absolute inset-0"
            />
          </div>
        </div>

        {/* ── Bottom: logos (left) + CTAs (right) ── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div data-logos className="min-w-0">
            <p className="text-[13px] font-medium text-[#6b7280]">Built by people who&rsquo;ve worked at</p>
            {/* Same structure as the live site: narrow masked strip, two identical lists, 18s loop */}
            <div className="marquee-mask mt-3 w-full lg:w-[400px]">
              <div data-marquee className="flex w-max">
                {[0, 1].map((copy) => (
                  <ul key={copy} className="flex shrink-0 items-center gap-x-8 pr-8" aria-hidden={copy === 1}>
                    {LOGOS.map((logo) => (
                      <li key={logo.alt}>
                        <Image
                          src={logo.src}
                          alt={copy === 0 ? logo.alt : ""}
                          width={logo.w}
                          height={logo.h}
                          className="h-[22px] w-auto max-w-none"
                        />
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 max-sm:flex-col">
            <MovingBorderCta href="#apply" size="lg" className="max-sm:w-full" data-cta data-magnetic>
              Apply Now
              <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </MovingBorderCta>
            <a
              href="#brochure"
              data-cta
              data-magnetic
              className="group inline-flex h-[47px] items-center justify-center gap-2.5 rounded-[6px] border border-black/[0.08] bg-white/60 px-6 text-[15px] font-semibold text-ink backdrop-blur-md transition-colors hover:border-ink/20 hover:bg-white/80 max-sm:w-full"
            >
              <DownloadIcon className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              Download Brochure
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Red CTA with a light running around its border: a 1.5px frame clips a
 * spinning conic-gradient "comet" (.cta-glow in globals.css) behind the button face.
 */
function MovingBorderCta({
  href,
  size,
  className = "",
  children,
  ...rest
}: {
  href: string;
  size: "sm" | "lg";
  className?: string;
  children: React.ReactNode;
} & Record<`data-${string}`, boolean | string>) {
  const face =
    size === "lg"
      ? "h-[44px] gap-2 rounded-[5px] px-6 text-[15px] font-semibold max-sm:w-full max-sm:justify-center"
      : "h-[36px] gap-2 rounded-[5px] px-4 text-[13.5px] font-semibold";
  return (
    <a
      href={href}
      {...rest}
      className={`group relative inline-flex overflow-hidden rounded-[6px] bg-brand-dark p-[1.5px] ${className}`}
    >
      <span aria-hidden className="cta-glow absolute top-1/2 left-1/2 aspect-square w-[160%]" />
      <span
        className={`relative z-[2] inline-flex items-center whitespace-nowrap bg-brand text-white transition-colors group-hover:bg-brand-dark ${face}`}
      >
        {children}
      </span>
    </a>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div data-stat>
      <dt className="text-[10.5px] font-semibold tracking-[0.14em] text-[#6b7280]">{label}</dt>
      <dd className="mt-1 text-[16px] leading-tight font-medium whitespace-nowrap text-ink">
        {value}
      </dd>
      <dd className="mt-0.5 text-[11.5px] text-[#6b7280]">{sub}</dd>
    </div>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M2.5 11v2.5h11V11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
