"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * "Backed by upGrad's Learning Ecosystem" — Figma 444:9947.
 * Phones/tablets only: on desktop this screen is the first card of the numbers
 * bento (Numbers.tsx), which zooms out of it.
 * Full-bleed grain gradient (Figma asset), toned to brand red, centred heading + line,
 * and the upGrad ecosystem logos in white along the bottom.
 */
const LOGOS = [
  { n: "upgrad", alt: "upGrad", h: 52 },
  { n: "abroad", alt: "upGrad Abroad", h: 38 },
  { n: "knowledgehut", alt: "upGrad KnowledgeHut", h: 40 },
  { n: "enterprise", alt: "upGrad Enterprise", h: 34 },
  { n: "internshala", alt: "Internshala", h: 30 },
  { n: "rekrut", alt: "upGrad Rekrut", h: 46 },
];
// natural sizes of the white logo files (for aspect ratios)
const SIZE: Record<string, [number, number]> = {
  upgrad: [241, 286],
  abroad: [571, 158],
  knowledgehut: [256, 92],
  enterprise: [103, 96],
  internshala: [498, 125],
  rekrut: [1054, 570],
};

export default function Ecosystem() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-eco-bg]",
        { scale: 1.12 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
      gsap.from("[data-eco-head] > *", {
        y: 40,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-eco-head]", start: "top 80%" },
      });
      gsap.from("[data-eco-logo]", {
        y: 24,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-eco-logos]", start: "top 92%" },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="ecosystem"
      className="relative flex min-h-[640px] flex-col overflow-hidden bg-brand text-white lg:hidden"
    >
      <div data-eco-bg className="absolute inset-0">
        <Image
          src="/images/ecosystem/gradient.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-45 mix-blend-luminosity"
        />
        {/* keep it in brand red: deepen toward the edges */}
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent_35%,rgb(150_0_25/0.3)_100%)]" />
      </div>

      <div
        data-eco-head
        className="relative z-[2] mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center gap-6 px-5 py-20 text-center sm:px-10"
      >
        <h2 className="mx-auto max-w-[860px] text-[clamp(1.6rem,5.4vw,4.25rem)] leading-[1.03] font-extrabold tracking-[-0.035em] uppercase">
          <span className="block whitespace-nowrap">Backed by upGrad’s</span>
          <span className="block whitespace-nowrap">Learning Ecosystem</span>
        </h2>
        <p className="max-w-[493px] text-[clamp(1.125rem,1.6vw,1.5rem)] leading-[1.3] font-medium">
          A legacy of 10+ years in higher education, driving learning, hiring,
          and career success.
        </p>

        {/* ecosystem logos, white — right under the content */}
        <ul
          data-eco-logos
          aria-label="upGrad ecosystem"
          className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:mt-12 lg:gap-x-12"
        >
          {LOGOS.map((l) => {
            const [w, h] = SIZE[l.n];
            return (
              <li key={l.n} data-eco-logo>
                <Image
                  src={`/images/ecosystem/white-${l.n}.png`}
                  alt={l.alt}
                  width={Math.round((w * l.h) / h)}
                  height={l.h}
                  className="opacity-90 transition-opacity hover:opacity-100"
                  style={{ height: l.h, width: "auto" }}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
