"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * "Get Upto 100% Scholarship" — Figma 442:9127 (top half).
 * Heading + line + CTA, then four full-bleed colour cards (title top, new
 * illustration in the middle, description at the bottom). Card colours are
 * matched to the illustration backgrounds so the art sits seamlessly.
 * Illustrations generated in the SOT image file (Figma 35:2–35:5).
 */
const CARDS = [
  {
    key: "merit",
    title: "Merit-Based Scholarship",
    body: "Awarded to students with strong academic performance or outstanding achievements. This scholarship recognizes hard work, discipline, and excellence in studies.",
    bg: "#111324",
  },
  {
    key: "need",
    title: "Need-Based Scholarship",
    body: "Designed for students who require financial support to pursue their education. It ensures that deserving learners are not held back due to economic constraints.",
    bg: "#00a8e4",
  },
  {
    key: "girls",
    title: "Girls in Tech Scholarship",
    body: "A dedicated scholarship to encourage more young women to enter and excel in technology. It supports aspiring female students who want to build successful careers in tech.",
    bg: "#c26543",
  },
  {
    key: "innov",
    title: "Ronnie Screwvala Scholarship for Budding Tech Innovators",
    body: "Given to students who show early talent, creativity, or passion for building innovative tech solutions. It supports future innovators who want to solve real-world problems using technology.",
    bg: "#101323",
  },
];

export default function Scholarships() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-sc-head] > *", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-sc-head]", start: "top 82%" },
      });
      gsap.from("[data-sc-card]", {
        yPercent: 12,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-sc-cards]", start: "top 85%" },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="scholarships"
      className="bg-white pt-16 lg:pt-[100px]"
    >
      <div
        data-sc-head
        className="mx-auto flex max-w-[1312px] flex-col gap-8 px-5 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-6"
      >
        <h2 className="text-[clamp(2.5rem,4.6vw,4.375rem)] leading-[1.22] font-extrabold tracking-[-0.03em] text-ink uppercase">
          Get upto
          <br />
          <span className="text-brand">100% Scholarship</span>
        </h2>
        <div className="flex w-full max-w-[424px] flex-col items-start gap-6">
          <p className="text-[15.75px] leading-[18.9px] font-medium text-[#111]">
            Invest in your future with scholarship opportunities that make
            quality education more affordable and accessible.
          </p>
          <a
            href="#admission"
            className="group/cta relative flex overflow-hidden rounded-[6px] p-[1.5px]"
          >
            <span
              aria-hidden
              className="cta-glow absolute top-1/2 left-1/2 aspect-square w-[160%]"
            />
            <span className="relative z-[2] flex h-11 items-center gap-2 rounded-[5px] bg-brand px-6 text-[15px] leading-[22.5px] font-medium text-white transition-colors group-hover/cta:bg-brand-dark">
              Check eligibility
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/scholarships/icon-arrow-right.svg"
                alt=""
                width={16}
                height={16}
                className="transition-transform group-hover/cta:translate-x-0.5"
              />
            </span>
          </a>
        </div>
      </div>

      {/* four full-bleed cards */}
      <div
        data-sc-cards
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4"
      >
        {CARDS.map((c) => (
          <article
            key={c.key}
            data-sc-card
            className="group relative flex h-[clamp(480px,38vw,567px)] flex-col items-center overflow-hidden px-3.5 pt-7 pb-8 text-center text-white"
            style={{ backgroundColor: c.bg }}
          >
            <h3
              className={`relative z-[2] ${c.key === "innov" ? "max-w-[340px]" : "max-w-[230px]"} text-[clamp(1.5rem,1.9vw,1.75rem)] leading-[1.2] font-semibold tracking-[-0.02em] text-balance`}
            >
              {c.title}
            </h3>
            <div className="relative my-4 w-full min-h-0 flex-1">
              <Image
                src={`/images/scholarships/${c.key}.webp`}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />
            </div>
            <p className="relative z-[2] w-full max-w-[350px] text-[11px] leading-[1.55] font-medium text-white/80">
              {c.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
