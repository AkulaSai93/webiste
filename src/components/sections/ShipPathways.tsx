"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Figma 433:7840 — "One degree / Three pathway".
 * A giant light "THREE PATHWAY" word sits above a dark band. On desktop the
 * section pins and the band's row slides sideways to bring in all three
 * pathway columns (the row is wider than the screen, like United Carriers'
 * services). Phones get the same content stacked.
 */
const PATHWAYS = [
  {
    key: "jobs",
    title: ["Launch a High-Paying", "Tech Career"],
    body: "Get industry-ready with hands-on coding, hackathons and strong placement support.",
    img: "/images/pathways-band/photo-jobs.webp",
  },
  {
    key: "startup",
    title: ["Build Your Own Startup,", "While You Study"],
    body: "Launch your startup while you study, with mentorship, incubation and seed funding",
    img: "/images/pathways-band/photo-startup.webp",
  },
  {
    key: "research",
    title: ["Research Today, Study at", "Top Global Universities"],
    body: "Build research skills and prepare for GRE, IELTS and top global universities.",
    img: "/images/pathways-band/photo-research.webp",
  },
] as const;

export default function ShipPathways() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const q = gsap.utils.selector(root);
          const track = q("[data-sp-band-row]")[0] as HTMLElement;
          const walkEl = q("[data-mascot-walk]")[0] as HTMLElement | undefined;
          const setWalk = (p: number) => {
            if (walkEl) walkEl.dataset.walkP = p.toFixed(4);
          };
          const overflow = () =>
            Math.max(
              0,
              track.scrollWidth + track.offsetLeft - window.innerWidth + 120,
            );

          // entrance: word rises, band content comes in
          gsap
            .timeline({
              defaults: { ease: "expo.out", duration: 1.2 },
              scrollTrigger: { trigger: root.current, start: "top 70%" },
            })
            .from(q("[data-sp-giant]"), { y: 80, autoAlpha: 0 })
            .from(
              q("[data-sp-band-row] > *"),
              { y: 40, autoAlpha: 0, stagger: 0.12 },
              0.15,
            );

          // pinned sideways reveal of the pathway columns
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: q("[data-sp-stage]")[0],
                start: "top top",
                end: () => `+=${overflow() * 1.4}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                // the site bot walks along the band while the row slides
                onUpdate: (self) => setWalk(self.progress),
                onRefresh: (self) => setWalk(self.progress),
              },
            })
            .to(track, { x: () => -overflow() }, 0)
            .to(q("[data-sp-giant]"), { x: () => -overflow() * 0.6 }, 0);
        },
      );

      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.from("[data-sp-card]", {
            y: 50,
            autoAlpha: 0,
            stagger: 0.12,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: "[data-sp-cards]", start: "top 80%" },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="pathways" className="relative bg-white">
      <h2 className="sr-only">One Degree, Three Pathways</h2>

      {/* ── Desktop: giant word over the dark band ── */}
      <div
        data-sp-stage
        className="relative hidden h-svh min-h-[760px] overflow-hidden lg:block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-sp-giant
          src="/images/pathways-band/three-pathway.svg"
          alt=""
          width={2091}
          height={191}
          className="absolute bottom-[502px] left-[max(20px,calc((100vw-1200px)/2))] h-[190.72px] w-[2091.4px] max-w-none"
        />

        {/* ground line the bot walks on (top edge of the band) */}
        <div
          data-mascot-walk
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[496px] h-0"
        />

        <div className="absolute inset-x-0 bottom-0 h-[496px] overflow-hidden bg-[#111]">
          <div
            data-sp-band-row
            className="absolute top-[72px] left-[max(20px,calc((100vw-1200px)/2))] flex w-max items-end gap-[140px]"
          >
            <BandIntro />
            <BandColumns />
          </div>
        </div>
      </div>

      {/* ── Phones: same content stacked ── */}
      <div className="bg-[#111] text-white lg:hidden">
        <div className="px-5 pt-16 pb-20 sm:px-10">
          <BandIntro />
          <div data-sp-cards className="mt-12">
            <BandColumns stacked />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Figma 433:7846 — heading + line. */
function BandIntro() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-[94px]">
      <p className="text-[clamp(2.75rem,10vw,76px)] leading-[1.02] font-semibold whitespace-nowrap text-white uppercase">
        One degree
        <br />
        <span className="text-brand">Three pathway</span>
      </p>
      <p className="w-[273px] max-w-full text-[15.75px] leading-[18.9px] font-medium text-white/70">
        A successful tech career, your own startup, or pursue higher education.
      </p>
    </div>
  );
}

/** Figma 433:7847 — three columns with a hairline on the left of each. */
function BandColumns({ stacked = false }: { stacked?: boolean }) {
  return (
    <div className={stacked ? "flex flex-col gap-10" : "flex items-start"}>
      {PATHWAYS.map((p) => (
        <div
          key={p.key}
          data-sp-card
          className="flex w-[368px] max-w-full flex-col items-start border-l border-white/[0.08] pl-[35px]"
        >
          <div className="pb-[21px]">
            <span className="relative block aspect-[16/9] w-[298px] max-w-full overflow-hidden rounded-[8px] bg-white/5">
              <Image
                src={p.img}
                alt=""
                fill
                sizes="300px"
                className="object-cover"
              />
            </span>
          </div>
          <h3 className="pb-[17.5px] text-[24px] leading-[30px] font-semibold whitespace-nowrap text-white uppercase">
            {p.title[0]}
            <br />
            {p.title[1]}
          </h3>
          <p className="w-[274px] max-w-full text-[14px] leading-[16.8px] text-white/60">
            {p.body}
          </p>
        </div>
      ))}
    </div>
  );
}
