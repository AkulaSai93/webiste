"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Hero — Figma: SOT Website › "MacBook Pro 14' - 5" (node 429:5169).
 * Red announcement bar, left content block (centred vertically at 156px / the 1200px
 * column) over the looping upGrad campus video. The site bot stands in the open right half.
 */

// original colours; logos with black ink use white-on-dark versions
const LOGOS = [
  { src: "/images/logos/Google.png", alt: "Google", w: 486, h: 177 },
  {
    src: "/images/logos/GoldmanSachs-onDark.png",
    alt: "Goldman Sachs",
    w: 382,
    h: 177,
  },
  { src: "/images/logos/Flipkart.png", alt: "Flipkart", w: 583, h: 177 },
  {
    src: "/images/logos/Accenture-onDark.png",
    alt: "Accenture",
    w: 623,
    h: 177,
  },
  { src: "/images/logos/Groww-onDark.png", alt: "Groww", w: 547, h: 177 },
  { src: "/images/logos/Haptik-onDark.png", alt: "Haptik", w: 402, h: 177 },
];

// Figma 429:5279 — two glass "explore" cards with fanned thumbnail stacks (front → back)
const EXPLORE = [
  {
    title: "What will I learn?",
    sub: "6 New-Gen Specializations",
    href: "#specializations",
    thumbs: [
      "/images/hero-chips/thumb-2.jpg",
      "/images/hero-chips/thumb-1.jpg",
      "/images/hero-chips/thumb-0.jpg",
    ],
  },
  {
    title: "What will I become?",
    sub: "One Degree, Three Pathways",
    href: "#pathways",
    thumbs: [
      "/images/hero-chips/thumb-5.jpg",
      "/images/hero-chips/thumb-4.jpg",
      "/images/hero-chips/thumb-3.jpg",
    ],
  },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          gsap.set("[data-hero-content]", { autoAlpha: 1 });
          const video =
            root.current?.querySelector<HTMLVideoElement>("[data-hero-video]");
          if (ctx.conditions?.reduce) {
            video?.pause();
            return;
          }

          // keep the muted loop playing (browsers may pause it in background tabs)
          const playVideo = () => {
            if (video && video.paused && document.visibilityState === "visible")
              video.play().catch(() => {});
          };
          playVideo();
          document.addEventListener("visibilitychange", playVideo);

          // entrance
          gsap.fromTo(
            "[data-hero-bg]",
            { scale: 1.1 },
            { scale: 1, duration: 2.4, ease: "expo.out" },
          );
          gsap
            .timeline({ defaults: { ease: "expo.out", duration: 1.3 } })
            .from("[data-announce]", { yPercent: -100, duration: 0.9 }, 0)
            .from("[data-word]", { yPercent: 110, stagger: 0.08 }, 0.15)
            .from("[data-reveal]", { y: 20, autoAlpha: 0, stagger: 0.07 }, 0.5)
            .from("[data-cta]", { y: 18, autoAlpha: 0, stagger: 0.08 }, 0.7)
            .from("[data-logos]", { y: 14, autoAlpha: 0 }, 0.8);

          const cleanups: Array<() => void> = [
            () => document.removeEventListener("visibilitychange", playVideo),
          ];

          // logo marquee (pauses on hover)
          const track =
            root.current?.querySelector<HTMLElement>("[data-marquee]");
          if (track) {
            const loop = gsap.to(track, {
              xPercent: -50,
              ease: "none",
              duration: 18,
              repeat: -1,
            });
            const slow = () => gsap.to(loop, { timeScale: 0, duration: 0.5 });
            const fast = () => gsap.to(loop, { timeScale: 1, duration: 0.6 });
            track.addEventListener("mouseenter", slow);
            track.addEventListener("mouseleave", fast);
            cleanups.push(() => {
              track.removeEventListener("mouseenter", slow);
              track.removeEventListener("mouseleave", fast);
            });
          }

          // magnetic buttons
          root.current
            ?.querySelectorAll<HTMLElement>("[data-magnetic]")
            .forEach((el) => {
              const xTo = gsap.quickTo(el, "x", {
                duration: 0.6,
                ease: "elastic.out(1, 0.45)",
              });
              const yTo = gsap.quickTo(el, "y", {
                duration: 0.6,
                ease: "elastic.out(1, 0.45)",
              });
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
    <section
      ref={root}
      className="relative min-h-[760px] overflow-hidden bg-black text-white lg:h-svh lg:min-h-[700px]"
    >
      {/* Background: looping upGrad campus video, darkened like the design's black frame */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 overflow-hidden bg-black"
      >
        <div data-hero-bg className="absolute inset-0 will-change-transform">
          <video
            data-hero-video
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/videos/hero-loop-poster.webp"
          >
            <source
              src="/videos/hero-loop.mp4"
              type="video/mp4"
              media="(min-width: 768px)"
            />
            <source src="/videos/hero-loop-mobile.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.85)_0%,rgb(0_0_0/0.6)_45%,rgb(0_0_0/0.15)_100%)] max-lg:bg-[linear-gradient(180deg,rgb(0_0_0/0.5)_0%,rgb(0_0_0/0.75)_55%,rgb(0_0_0/0.9)_100%)]" />
      </div>

      {/* Announcement bar */}
      <a
        href="#apply"
        data-announce
        className="absolute inset-x-0 top-0 z-[3] flex h-9 items-center justify-center bg-[#d50028] px-4 text-center text-[13px] font-medium text-white transition-colors hover:bg-brand sm:text-[14px]"
      >
        Applications Open for 2027 Intake — Deadline 9th Jan
      </a>

      <div
        data-hero-content
        className="invisible relative z-[2] mx-auto flex min-h-[760px] max-w-[1200px] items-center px-5 pt-20 pb-12 sm:px-10 lg:h-full lg:min-h-0 lg:px-0 lg:pt-9 lg:pb-0"
      >
        {/* Mascot stop: the bot stands in the open right half over the video */}
        <div
          data-mascot-stop
          data-mascot-fit="0.9"
          data-mascot-scale="0.62"
          data-mascot-turn="-0.3"
          data-mascot-code="agent"
          data-mascot-mx="0.62"
          data-mascot-my="-0.76"
          data-mascot-ms="0"
          className="pointer-events-none absolute top-[14%] bottom-[8%] left-[66%] w-[30%] max-lg:hidden"
        />

        <div className="w-full max-w-[754px]">
          <h1 className="flex flex-col gap-1 text-[clamp(2.35rem,5vw,4.75rem)] leading-[1.126] font-extrabold tracking-[-0.0276em] uppercase">
            <span className="block overflow-hidden">
              <span data-word className="block text-white">
                AI-First B.Tech in
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-word className="block text-brand">
                Computer Science
              </span>
            </span>
          </h1>

          <div className="max-w-[640px] pt-[clamp(1.75rem,4.2vh,2.5rem)]">
            <div data-reveal className="flex flex-wrap gap-3">
              {EXPLORE.map((e) => (
                <ExploreCard key={e.title} {...e} />
              ))}
            </div>

            <p
              data-reveal
              className="pt-[clamp(1.5rem,3.4vh,2rem)] text-[14.5px] leading-[21.75px] font-medium text-white"
            >
              Admission starts with uGNET
            </p>

            <dl data-reveal className="flex items-start gap-7 pt-4">
              <Stat label="COURSE DURATION" value="4 Years" sub="8 semesters" />
              <div className="border-l border-white/60 pl-7">
                <Stat
                  label="uGNET EXAM"
                  value="12 Jan, 2027"
                  sub="Online test"
                />
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-3 pt-[clamp(1.75rem,4.2vh,2.5rem)]">
              {/* Apply Now: red face inside a 1.5px frame with the moving border (.cta-glow) */}
              <a
                href="#apply"
                data-cta
                data-magnetic
                className="group relative flex overflow-hidden rounded-[6px] bg-brand-dark p-[1.5px] max-sm:w-full"
              >
                <span
                  aria-hidden
                  className="cta-glow absolute top-1/2 left-1/2 aspect-square w-[160%]"
                />
                <span className="relative z-[2] flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-brand px-6 text-[15px] leading-[22.5px] font-medium text-white transition-colors group-hover:bg-brand-dark">
                  Apply Now
                  <Image
                    src="/images/icons/arrow-right.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </span>
              </a>
              <a
                href="#brochure"
                data-cta
                data-magnetic
                className="group flex items-center justify-center gap-2.5 rounded-[6px] border border-white/[0.08] bg-white px-6 py-[11px] text-[15px] leading-[22.5px] font-medium text-ink backdrop-blur-[12px] transition-colors hover:bg-white/85 max-sm:w-full"
              >
                <Image
                  src="/images/icons/download.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                />
                Download Brochure
              </a>
            </div>

            <div data-logos className="pt-[clamp(2rem,5vh,3rem)]">
              <p className="text-[13px] leading-[19.5px] font-medium text-white">
                Built by people who&rsquo;ve worked at
              </p>
              <div className="marquee-mask mt-3.5 h-[22px] w-full max-w-[400px]">
                <div data-marquee className="flex w-max">
                  {[0, 1].map((copy) => (
                    <ul
                      key={copy}
                      className="flex shrink-0 items-center gap-8 pr-8"
                      aria-hidden={copy === 1}
                    >
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
          </div>
        </div>
      </div>
    </section>
  );
}

/** Glass card: fanned stack of three thumbnails, title + subline, white "+" button. */
function ExploreCard({
  title,
  sub,
  href,
  thumbs,
}: {
  title: string;
  sub: string;
  href: string;
  thumbs: string[];
}) {
  // back → front: offset (px) and rotation (deg) per layer, from the design; they fan a bit more on hover
  const layers = [
    {
      i: 2,
      left: "left-[22px]",
      rot: "rotate-[14deg] group-hover:rotate-[20deg] group-hover:translate-x-1",
    },
    {
      i: 1,
      left: "left-[11px]",
      rot: "rotate-[7deg] group-hover:rotate-[10deg] group-hover:translate-x-0.5",
    },
    { i: 0, left: "left-0", rot: "group-hover:-rotate-[4deg]" },
  ];
  return (
    <a
      href={href}
      className="group flex h-[58px] items-center gap-3 overflow-hidden rounded-[5px] border border-white/15 bg-white/[0.07] py-2 pr-2.5 pl-2 backdrop-blur-[24px] transition-colors hover:border-white/30 hover:bg-white/[0.12] max-sm:w-full"
    >
      <span aria-hidden className="relative h-10 w-16 shrink-0">
        {layers.map((l) => (
          <span
            key={l.i}
            className={`absolute top-0 ${l.left} size-10 overflow-hidden rounded-[3px] border-[1.5px] border-[#1a1b20] shadow-[0_8px_20px_-6px_rgb(0_0_0/0.7)] transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)] ${l.rot}`}
          >
            <Image
              src={thumbs[l.i]}
              alt=""
              width={37}
              height={37}
              className="size-[37px] object-cover"
            />
          </span>
        ))}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] leading-[18.125px] font-semibold tracking-[-0.01em] whitespace-nowrap text-white">
          {title}
        </span>
        <span className="block pt-0.5 text-[12.5px] leading-[17.19px] whitespace-nowrap text-white/55">
          {sub}
        </span>
      </span>
      <span className="pl-1">
        <span className="grid size-7 place-items-center rounded-full bg-white transition-transform duration-300 group-hover:rotate-45">
          <Image src="/images/icons/plus.svg" alt="" width={14} height={14} />
        </span>
      </span>
    </a>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <dt className="text-[10.5px] leading-[15.75px] font-semibold tracking-[0.14em] whitespace-nowrap text-white">
        {label}
      </dt>
      <dd className="pt-1 text-[16px] leading-4 font-medium whitespace-nowrap text-white">
        {value}
      </dd>
      <dd className="pt-1 text-[11.5px] leading-[17.25px] whitespace-nowrap text-white">
        {sub}
      </dd>
    </div>
  );
}
