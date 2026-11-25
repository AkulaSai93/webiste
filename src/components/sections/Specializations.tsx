"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Two-column scroll layout: a sticky left column where the site-wide bot
 * (components/mascot) lands above the heading, and a right column of six big
 * rows. The row crossing the middle of the screen is "active" and its `code`
 * snippet is typed on the bot's screen.
 */
const SPECIALIZATIONS = [
  {
    n: "01",
    kicker: "Artificial Intelligence",
    title: "AI & ML",
    body: "Build intelligent systems that learn and adapt",
    img: "aiml",
    code: "agent",
  },
  {
    n: "02",
    kicker: "FullStack",
    title: "Web Dev",
    body: "Create modern web applications end-to-end",
    img: "webdev",
    code: "fullstack",
  },
  {
    n: "03",
    kicker: "Quantum",
    title: "Computing",
    body: "Explore next-generation computational power",
    img: "quantum",
    code: "quantum",
  },
  {
    n: "04",
    kicker: "Web3",
    title: "Blockchain",
    body: "Master decentralized technologies and Web3",
    img: "blockchain",
    code: "blockchain",
  },
  {
    n: "05",
    kicker: "Cyber",
    title: "Security",
    body: "Protect systems with advanced security practices",
    img: "cybersecurity",
    code: "security",
  },
  {
    n: "06",
    kicker: "Cloud",
    title: "Innovation",
    body: "Design scalable cloud-native architectures",
    img: "cloud",
    code: "cloud",
  },
];
export default function Specializations() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const items = gsap.utils.toArray<HTMLElement>("[data-spec-item]");

      if (!reduced) {
        gsap.from("[data-spec-title] > span", {
          y: 60,
          autoAlpha: 0,
          stagger: 0.12,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-spec-title]", start: "top 90%" },
        });
        gsap.from("[data-spec-intro] > *", {
          y: 30,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-spec-intro]", start: "top 85%" },
        });
        gsap.from("[data-spec-line]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.4,
          ease: "expo.inOut",
          scrollTrigger: { trigger: "[data-spec-line]", start: "top 90%" },
        });
        items.forEach((el) =>
          gsap.from(el.querySelectorAll("[data-spec-reveal]"), {
            y: 40,
            autoAlpha: 0,
            stagger: 0.07,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }),
        );
      }

      // Active row: whichever crosses the middle of the screen (or is hovered).
      let index = -1;
      const activate = (i: number) => {
        if (i === index) return;
        items[index]?.removeAttribute("data-active");
        index = i;
        items[i].setAttribute("data-active", "");
        window.dispatchEvent(
          new CustomEvent("mascot:code", { detail: items[i].dataset.code }),
        );
      };

      const cleanups = items.map((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 58%",
          end: "bottom 58%",
          onToggle: (self) => self.isActive && activate(i),
        });
        const enter = () => activate(i);
        el.addEventListener("pointerenter", enter);
        el.addEventListener("focusin", enter);
        return () => {
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("focusin", enter);
        };
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="specializations"
      className="relative bg-white py-20 lg:py-0"
    >
      <div className="relative z-[2] mx-auto grid w-full max-w-[1200px] px-5 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-x-16 lg:px-0">
        {/* Left — sticky: the bot lands here, heading underneath */}
        <div className="lg:relative">
          <div className="flex flex-col lg:sticky lg:top-0 lg:h-svh lg:justify-end lg:pt-[12vh] lg:pb-[clamp(3rem,9vh,5.5rem)]">
            <div
              data-mascot-stop
              data-mascot-fit="0.92"
              data-mascot-scale="0.72"
              data-mascot-turn="0.25"
              data-mascot-code="agent"
              data-mascot-attach
              data-mascot-start="top 85%"
              data-mascot-end="top 25%"
              data-mascot-mx="0.62"
              data-mascot-my="-0.66"
              data-mascot-ms="0.26"
              aria-hidden
              className="pointer-events-none hidden min-h-0 w-[min(100%,340px)] flex-1 lg:block"
            />
            <h2
              data-spec-title
              className="text-[clamp(2.5rem,4.6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-ink uppercase lg:mt-8"
            >
              <span className="block">New-Gen</span>
              <span className="block">Engineering</span>
              <span className="block text-brand">Specializations.</span>
            </h2>
          </div>
        </div>

        {/* Right — scrolls past the sticky column */}
        <div className="pt-10 lg:pt-[22vh] lg:pb-[clamp(3rem,9vh,5.5rem)]">
          <div data-spec-intro>
            <p className="text-[clamp(1.25rem,1.7vw,1.5rem)] leading-[1.4] font-medium tracking-[-0.01em] text-ink">
              Explore future-focused domains shaping the next decade of
              technology: AI / ML, Cloud, Blockchain and many more.
            </p>
          </div>

          <div className="relative mt-16 pb-3 lg:mt-24">
            <p className="text-[14px] font-medium text-ink">
              Six domains, one AI-first degree
            </p>
            <span
              data-spec-line
              className="absolute inset-x-0 bottom-0 h-px bg-ink"
            />
          </div>

          <ol>
            {SPECIALIZATIONS.map((s) => (
              <SpecItem key={s.n} spec={s} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function SpecItem({ spec }: { spec: (typeof SPECIALIZATIONS)[number] }) {
  return (
    <li
      data-spec-item
      data-code={spec.code}
      tabIndex={0}
      className="group relative flex items-end justify-between gap-6 border-b border-ink/15 py-6 outline-none last:border-b-0 last:pb-0 lg:py-7 lg:last:pb-0"
    >
      <div className="min-w-0">
        <p
          data-spec-reveal
          className="flex items-baseline gap-3 text-[14px] font-medium text-ink/55"
        >
          <span className="font-mono text-[12px] font-bold transition-colors duration-500 group-data-active:text-brand">
            {spec.n}
          </span>
          {spec.kicker}
        </p>
        <h3
          data-spec-reveal
          className="mt-2 text-[clamp(2.75rem,5vw,4.5rem)] leading-[1] font-extrabold tracking-[-0.045em] text-ink/25 transition-colors duration-500 group-data-active:text-ink"
        >
          {spec.title}
        </h3>
        <p
          data-spec-reveal
          className="mt-4 text-[clamp(1rem,1.3vw,1.125rem)] leading-snug font-medium text-ink/60"
        >
          {spec.body}
        </p>
      </div>

      <span data-spec-reveal className="mb-1 shrink-0">
        <span className="relative block size-20 shrink-0 overflow-hidden rounded-[6px] bg-[#0b0d12] opacity-40 grayscale transition-[opacity,filter,transform] duration-500 group-data-active:scale-105 group-data-active:opacity-100 group-data-active:grayscale-0 lg:size-24">
          <Image
            src={`/images/specializations/${spec.img}.webp`}
            alt={`${spec.kicker} ${spec.title}`}
            fill
            sizes="96px"
            className="object-cover"
          />
        </span>
      </span>
    </li>
  );
}
