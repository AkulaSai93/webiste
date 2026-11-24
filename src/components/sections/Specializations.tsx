"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Figma: SOT Website › "MacBook Pro 14' - 3" (node 420:2014).
 * Heading + subtitle centred; three specialisations on each side; the site-wide
 * bot (components/mascot) stands in the centre column ("Canvas" in the design).
 * `code` = snippet the bot types while that item is active.
 */
const SPECIALIZATIONS = [
  { n: "01", kicker: "Artificial Intelligence", title: "AI & ML", body: "Build intelligent systems that learn and adapt", img: "aiml", code: "agent" },
  { n: "02", kicker: "FullStack", title: "Web Dev", body: "Create modern web applications end-to-end", img: "webdev", code: "fullstack" },
  { n: "03", kicker: "Quantum", title: "Computing", body: "Explore next-generation computational power", img: "quantum", code: "quantum" },
  { n: "04", kicker: "Web3", title: "Blockchain", body: "Master decentralized technologies and Web3", img: "blockchain", code: "blockchain" },
  { n: "05", kicker: "Cyber", title: "Security", body: "Protect systems with advanced security practices", img: "cybersecurity", code: "security" },
  { n: "06", kicker: "Cloud", title: "Innovation", body: "Design scalable cloud-native architectures", img: "cloud", code: "cloud" },
];
const LEFT = SPECIALIZATIONS.slice(0, 3);
const RIGHT = SPECIALIZATIONS.slice(3);

export default function Specializations() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const items = gsap.utils.toArray<HTMLElement>("[data-spec-item]");

      if (!reduced) {
        gsap.from("[data-spec-head] > *", {
          y: 36,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-spec-head]", start: "top 80%" },
        });
        gsap.from(items, {
          y: 40,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-spec-cols]", start: "top 75%" },
        });
      }

      // Active item: highlighted and shown on the bot's screen. Hover/focus picks
      // one; otherwise it cycles through all six while the section is on screen.
      let index = -1;
      let paused = false;
      let timer: ReturnType<typeof setInterval> | undefined;
      const activate = (i: number) => {
        if (i === index) return;
        items[index]?.removeAttribute("data-active");
        index = i;
        const el = items[i];
        el.setAttribute("data-active", "");
        window.dispatchEvent(new CustomEvent("mascot:code", { detail: el.dataset.code }));
      };
      const start = () => {
        if (timer || reduced) return;
        timer = setInterval(() => !paused && activate((index + 1) % items.length), 4200);
      };
      const stop = () => {
        clearInterval(timer);
        timer = undefined;
      };

      const cleanups = items.map((el, i) => {
        const enter = () => {
          paused = true;
          activate(i);
        };
        const leave = () => (paused = false);
        el.addEventListener("pointerenter", enter);
        el.addEventListener("focusin", enter);
        el.addEventListener("pointerleave", leave);
        el.addEventListener("focusout", leave);
        return () => {
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("focusin", enter);
          el.removeEventListener("pointerleave", leave);
          el.removeEventListener("focusout", leave);
        };
      });

      ScrollTrigger.create({
        trigger: "[data-spec-cols]",
        start: "top 70%",
        end: "bottom 30%",
        onToggle: (self) => {
          if (self.isActive) {
            if (index < 0) activate(0);
            start();
          } else stop();
        },
      });

      return () => {
        stop();
        cleanups.forEach((fn) => fn());
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="specializations"
      className="relative bg-[linear-gradient(to_bottom,var(--color-sky-haze),#fff_140px)] py-24 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:py-16"
    >
      <div className="relative z-[2] mx-auto w-full max-w-[1312px] px-5 sm:px-10 lg:px-6">
        {/* Header */}
        <div data-spec-head className="mx-auto max-w-[980px] text-center">
          <h2 className="text-[clamp(2rem,2.8vw,2.5rem)] leading-[1.15] font-medium tracking-[-0.03em] text-ink">
            New-Gen Engineering <span className="text-brand">Specializations</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-[16px] leading-[1.6] text-balance text-[#3d4452]">
            Explore future-focused domains shaping the next decade of technology
            <br />
            AI / ML, Cloud, Blockchain and many more
          </p>
        </div>

        {/* Left list · bot · right list */}
        <div
          data-spec-cols
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-10 lg:mt-12 lg:grid-cols-[400px_minmax(0,1fr)_400px] lg:items-center lg:gap-x-6"
        >
          <ul className="flex flex-col">
            {LEFT.map((s, i) => (
              <SpecItem key={s.n} spec={s} divider={i < LEFT.length - 1} />
            ))}
          </ul>

          {/* centre column = the design's "Canvas": the bot fits itself in here */}
          <div className="relative hidden self-stretch lg:block">
            <div
              data-mascot-stop
              data-mascot-fit="0.95"
              data-mascot-fit-anchor="section"
              data-mascot-scale="0.7"
              data-mascot-code="agent"
              data-mascot-start="top 70%"
              data-mascot-end="top top"
              data-mascot-mx="0.62"
              data-mascot-my="-0.66"
              data-mascot-ms="0.26"
              className="pointer-events-none absolute inset-0"
            />
          </div>

          <ul className="flex flex-col">
            {RIGHT.map((s, i) => (
              <SpecItem key={s.n} spec={s} divider={i < RIGHT.length - 1} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SpecItem({ spec, divider }: { spec: (typeof SPECIALIZATIONS)[number]; divider: boolean }) {
  return (
    <li
      data-spec-item
      data-code={spec.code}
      tabIndex={0}
      className={`group flex items-center justify-between gap-4 py-6 outline-none ${divider ? "border-b border-[#ebebeb]" : ""}`}
    >
      <div className="min-w-0">
        <p className="flex items-baseline gap-3">
          <span className="font-mono text-[12px] leading-[18px] font-bold text-[#6b7280] transition-colors duration-500 group-data-active:text-brand">
            {spec.n}
          </span>
          <span className="text-[15px] leading-[22.5px] font-semibold text-ink">{spec.kicker}</span>
        </p>
        <h3 className="mt-3 text-[clamp(2rem,2.75vw,2.5rem)] leading-[38px] font-semibold tracking-[-0.045em] text-ink">
          {spec.title}
        </h3>
        <p className="mt-3 max-w-[320px] text-[14.5px] leading-[21.75px] text-[#3d4452]">{spec.body}</p>
      </div>

      {/* 64px dark square from the design, holding the specialisation image */}
      <span className="relative size-16 shrink-0 overflow-hidden rounded-[4px] bg-[#0b0d12] transition-transform duration-500 group-data-active:scale-110">
        <Image
          src={`/images/specializations/${spec.img}.webp`}
          alt={`${spec.kicker} ${spec.title}`}
          fill
          sizes="64px"
          className="object-cover"
        />
      </span>
    </li>
  );
}
