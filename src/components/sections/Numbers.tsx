"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * upGrad in numbers — Figma 444:10422 (bento), with the live site's ecosystem
 * stats, the ecosystem logos and new images (SOT image file, 36:2–36:4).
 * Scroll (after shadergradient.co): pinned; it starts with the red Ecosystem
 * screen filling the viewport; as the camera pulls back (tilting on the way) that
 * screen fades into the placements card underneath, and the bento lands flat.
 */
const LOGO = (n: string) => `/images/ecosystem/white-${n}.png`;
// original brand-colour logos (used on the cards)
const COLOR = (n: string) => `/images/ecosystem/color-${n}.png`;

export default function Numbers() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          // shadergradient.co: start zoomed right into one card of a tilted
          // grid, then the camera pulls back — the grid untilts, shrinks and the
          // cards close their gaps until they sit in the bento.
          const grid = document.querySelector<HTMLElement>("[data-nb-grid]")!;
          const focus = document.querySelector<HTMLElement>("[data-nb-focus]")!;
          const cards = gsap.utils.toArray<HTMLElement>("[data-nb-card]");
          // layout positions (offsets ignore the grid's own transform)
          const rel = (el: HTMLElement) => {
            let x = 0;
            let y = 0;
            let n: HTMLElement | null = el;
            while (n && n !== grid) {
              x += n.offsetLeft;
              y += n.offsetTop;
              n = n.offsetParent as HTMLElement | null;
            }
            return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
          };
          const origin = () => {
            const f = rel(focus);
            return `${f.x}px ${f.y}px`;
          };
          const spread = (c: HTMLElement, axis: "x" | "y") => {
            const p = rel(c);
            return axis === "x"
              ? (p.x - grid.offsetWidth / 2) * 0.18
              : (p.y - grid.offsetHeight / 2) * 0.22;
          };

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=160%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          // hold the full-screen ecosystem view for a beat, then pull back
          const cover = () =>
            Math.max(
              window.innerWidth / focus.offsetWidth,
              window.innerHeight / focus.offsetHeight,
            );
          tl.fromTo(
            grid,
            {
              x: () => grid.offsetWidth / 2 - rel(focus).x,
              y: () => grid.offsetHeight / 2 - rel(focus).y,
              scale: cover,
              transformOrigin: origin,
            },
            {
              x: 0,
              y: 0,
              scale: 1,
              transformOrigin: origin,
              duration: 1,
            },
            0.15,
          );
          // the camera tilts on the way out and settles flat (shadergradient)
          tl.fromTo(
            grid,
            { rotationX: 0, rotationZ: 0, rotationY: 0 },
            {
              keyframes: [
                {
                  rotationX: 22,
                  rotationY: -10,
                  rotationZ: -6,
                  duration: 0.5,
                  ease: "power1.out",
                },
                {
                  rotationX: 0,
                  rotationY: 0,
                  rotationZ: 0,
                  duration: 0.5,
                  ease: "power2.inOut",
                },
              ],
            },
            0.15,
          );
          cards
            .filter((c) => c !== focus)
            .forEach((c) =>
              tl.fromTo(
                c,
                { x: () => spread(c, "x"), y: () => spread(c, "y") },
                { x: 0, y: 0, duration: 1 },
                0.15,
              ),
            );
          // the red screen changes into the placements card while it comes in:
          // its heading + logos fade first, then the red dissolves into the photo
          tl.to(
            "[data-nb-eco-content]",
            { autoAlpha: 0, duration: 0.3, ease: "power1.in" },
            0.18,
          ).fromTo(
            "[data-nb-eco]",
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: 0.6, ease: "power1.inOut" },
            0.35,
          );
          tl.fromTo(
            "[data-nb-head] > *",
            { y: 30, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.3 },
            0.85,
          );
        },
      );
      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils.toArray<HTMLElement>("[data-nb-card]").forEach((c) =>
            gsap.from(c, {
              y: 40,
              autoAlpha: 0,
              duration: 1,
              ease: "expo.out",
              scrollTrigger: { trigger: c, start: "top 88%" },
            }),
          );
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="numbers"
      className="overflow-hidden bg-white py-16 lg:flex lg:h-svh lg:min-h-[860px] lg:items-center lg:py-0 lg:[perspective:1800px]"
    >
      <div
        data-nb-grid
        className="relative mx-auto flex w-full max-w-[1168px] flex-col gap-[13px] px-5 will-change-transform sm:px-10 lg:flex-row lg:items-stretch lg:px-0"
      >
        {/* left: two rows of cards + heading */}
        <div className="flex min-w-0 flex-col gap-[13px] lg:w-[770px] lg:justify-between">
          <div className="flex flex-col gap-[13px]">
            <div className="flex flex-col gap-[13px] sm:flex-row">
              {/* A · learners */}
              <Card
                className="h-[185px] sm:flex-[517]"
                back="upgrad"
                fx={-420}
                fy={260}
                fr={-14}
                front={
                  <div className="relative h-full overflow-hidden rounded-[8px] bg-[radial-gradient(120%_110%_at_100%_100%,#7a0a1e_0%,#3a0a13_38%,#16090c_60%,#0b0d12_80%)] p-5 text-[#f7fafc]">
                    <span className="absolute top-1/2 right-[8%] grid size-[120px] -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.5)]">
                      <Image
                        src={COLOR("upgrad")}
                        alt="upGrad"
                        width={54}
                        height={62}
                      />
                    </span>
                    <Label dark>Across upGrad’s learning ecosystem</Label>
                    <p className="mt-3 text-[26px] leading-[1.1] font-medium tracking-[-0.03em]">
                      10M+
                      <br />
                      learners.
                    </p>
                    <p className="mt-3 max-w-[160px] text-[11px] leading-[1.4] text-[#a1aab5]">
                      Learning, hiring and career success in one place.
                    </p>
                  </div>
                }
              />
              {/* B · global universities */}
              <Card
                className="h-[185px] sm:flex-[304]"
                back="abroad"
                fx={380}
                fy={300}
                fr={12}
                front={
                  <div className="relative h-full overflow-hidden rounded-[8px] bg-[#f4f4f5] p-5">
                    <div className="flex items-start justify-between">
                      <Label>Global universities</Label>
                      <Image
                        src={COLOR("abroad")}
                        alt="upGrad Abroad"
                        width={52}
                        height={52}
                        className="rounded-[8px]"
                      />
                    </div>
                    <p className="mt-1.5 text-[52px] leading-none font-normal tracking-[-0.03em] text-ink">
                      300+
                    </p>
                    <p className="mt-1.5 text-[11px] text-[#545b5e]">
                      across 70+ countries
                    </p>
                    <span className="absolute right-5 bottom-5 left-5 flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map((k) => (
                        <span
                          key={k}
                          className={`h-1 flex-1 rounded-full ${k < 4 ? "bg-brand" : "bg-ink/15"}`}
                        />
                      ))}
                    </span>
                  </div>
                }
              />
            </div>

            <div className="flex flex-col gap-[13px] sm:flex-row">
              {/* C · internships */}
              <Card
                className="h-[272px] sm:flex-[304]"
                back="internshala"
                fx={-360}
                fy={380}
                fr={10}
                front={
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[8px] bg-brand p-5 text-white">
                    <Label tone="light">Internships</Label>
                    <p className="mt-auto text-[52px] leading-none tracking-[-0.03em]">
                      28L+
                    </p>
                    <p className="mt-2 text-[26px] leading-[1.1] font-medium tracking-[-0.03em]">
                      Internships
                      <br />
                      enabled.
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[11px] text-white/85">
                        For learners, every year.
                      </p>
                      <span className="rounded-[6px] bg-white px-2.5 py-2">
                        <Image
                          src={COLOR("internshala")}
                          alt="Internshala"
                          width={100}
                          height={25}
                        />
                      </span>
                    </div>
                  </div>
                }
              />
              {/* D · hiring partners */}
              <Card
                className="h-[272px] sm:flex-[517]"
                back="rekrut"
                fx={300}
                fy={420}
                fr={-12}
                front={
                  <div className="relative h-full overflow-hidden rounded-[8px] bg-[#0b0d12] p-5 text-[#f7fafc]">
                    <Image
                      src="/images/numbers/hire-3.webp"
                      alt="Students meeting recruiters at a campus placement drive"
                      fill
                      sizes="520px"
                      className="object-cover object-right"
                    />
                    <span className="absolute inset-0 bg-[linear-gradient(90deg,rgb(11_13_18/0.95)_0%,rgb(11_13_18/0.8)_40%,rgb(11_13_18/0.1)_80%)]" />
                    <div className="relative flex h-full max-w-[220px] flex-col">
                      <Label dark>Hiring partners</Label>
                      <p className="mt-4 text-[52px] leading-none tracking-[-0.03em]">
                        3000+
                      </p>
                      <p className="mt-3 text-[26px] leading-[1.1] font-medium tracking-[-0.03em]">
                        Companies
                        <br />
                        hiring.
                      </p>
                      <div className="mt-auto flex items-center gap-3">
                        <span className="rounded-[6px] bg-white px-2.5 py-1.5">
                          <Image
                            src={COLOR("rekrut")}
                            alt="upGrad Rekrut"
                            width={70}
                            height={38}
                          />
                        </span>
                        <p className="text-[11px] leading-snug text-[#a1aab5]">
                          hiring from the upGrad ecosystem
                        </p>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          {/* heading row */}
          <div
            data-nb-head
            className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:mt-0"
          >
            <div>
              <h2 className="text-[clamp(2rem,2.8vw,2.5rem)] leading-[1.3] font-semibold tracking-[-0.03em] text-ink uppercase">
                <span className="normal-case">upGrad</span> in{" "}
                <span className="text-brand">numbers</span>
              </h2>
              <p className="mt-2 text-[16px] leading-[25.6px] text-[#3d4452] lg:whitespace-nowrap">
                A legacy of 10+ years driving learning, hiring and career
                success.
              </p>
            </div>
            <a
              href="#admission"
              className="group/cta relative flex shrink-0 self-start overflow-hidden rounded-[6px] p-[1.5px] sm:self-auto"
            >
              <span
                aria-hidden
                className="cta-glow absolute top-1/2 left-1/2 aspect-square w-[160%]"
              />
              <span className="relative z-[2] flex h-11 items-center gap-2 rounded-[5px] bg-brand px-6 text-[15px] font-medium text-white transition-colors group-hover/cta:bg-brand-dark">
                Check eligibility
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/scholarships/icon-arrow-right.svg"
                  alt=""
                  width={16}
                  height={16}
                />
              </span>
            </a>
          </div>
        </div>

        {/* right column */}
        <div className="flex min-w-0 flex-col gap-[13px] lg:w-[385px]">
          {/* E · placements. The red Ecosystem screen sits on top of it: it starts
              full-screen and fades away as it shrinks, so it turns into this card. */}
          <Card
            focus
            className="h-[351px]"
            back="upgrad"
            fx={0}
            fy={0}
            fr={0}
            front={
              <div className="relative h-full overflow-hidden rounded-[8px] bg-[#0b0d12]">
                <Image
                  src="/images/numbers/place-3.webp"
                  alt="Students celebrating a job offer"
                  fill
                  sizes="385px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgb(11_13_18/0.95)] to-transparent px-5 pt-12 pb-5 text-[#f7fafc]">
                  <Label dark>Placements</Label>
                  <p className="mt-1.5 text-[26px] leading-[1.1] font-medium tracking-[-0.03em]">
                    110K+ careers launched.
                  </p>
                  <p className="mt-1.5 text-[11px]">
                    by learners across the ecosystem
                  </p>
                </div>
                <div
                  data-nb-eco
                  className="absolute inset-0 hidden lg:block lg:motion-reduce:hidden"
                >
                  <EcoCard />
                </div>
              </div>
            }
          />
          {/* F · corporate clients */}
          <Card
            className="h-[226px]"
            back="enterprise"
            fx={360}
            fy={420}
            fr={-10}
            front={
              <div className="relative h-full overflow-hidden rounded-[8px] bg-[#0b0d12] p-5 text-[#f7fafc]">
                <Image
                  src="/images/numbers/corp-3.webp"
                  alt="A corporate training session"
                  fill
                  sizes="385px"
                  className="object-cover opacity-55"
                />
                <div className="relative">
                  <Image
                    src={COLOR("enterprise")}
                    alt="upGrad Enterprise"
                    width={44}
                    height={44}
                    className="rounded-[8px] ring-1 ring-white/25"
                  />
                  <p className="mt-3">
                    <Label dark>Corporate clients</Label>
                  </p>
                  <p className="mt-1 text-[52px] leading-none tracking-[-0.03em]">
                    600+
                  </p>
                  <p className="mt-2 text-[18px] leading-[1.2] font-medium tracking-[-0.03em]">
                    Trained annually.
                  </p>
                  <p className="mt-1.5 text-[11px] text-[#a1aab5]">
                    Upskilling teams with upGrad Enterprise.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

/**
 * The "Backed by upGrad's Learning Ecosystem" screen, laid out at full screen
 * size (1512 wide) and scaled down to fit the 385 × 351 card. When the grid is
 * zoomed so this card covers the viewport, it looks exactly like a full section.
 */
const ECO_W = 1512;
const ECO_K = 385 / ECO_W;
const ECO_LOGOS = [
  { n: "upgrad", alt: "upGrad", h: 52, r: 241 / 286 },
  { n: "abroad", alt: "upGrad Abroad", h: 38, r: 571 / 158 },
  { n: "knowledgehut", alt: "upGrad KnowledgeHut", h: 40, r: 256 / 92 },
  { n: "enterprise", alt: "upGrad Enterprise", h: 34, r: 103 / 96 },
  { n: "internshala", alt: "Internshala", h: 30, r: 498 / 125 },
  { n: "rekrut", alt: "upGrad Rekrut", h: 46, r: 1054 / 570 },
];
function EcoCard() {
  return (
    <div className="relative h-full overflow-hidden rounded-[8px] bg-brand">
      <div
        className="absolute top-0 left-0 origin-top-left text-white"
        style={{
          width: ECO_W,
          height: 351 / ECO_K,
          transform: `scale(${ECO_K})`,
        }}
      >
        <Image
          src="/images/ecosystem/gradient.webp"
          alt=""
          fill
          sizes="1512px"
          className="object-cover opacity-45 mix-blend-luminosity"
        />
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent_35%,rgb(150_0_25/0.3)_100%)]" />
        <div
          data-nb-eco-content
          className="relative flex h-full flex-col items-center justify-center gap-6 px-10 text-center"
        >
          <h2 className="text-[68px] leading-[1.03] font-extrabold tracking-[-0.035em] uppercase">
            <span className="block whitespace-nowrap">Backed by upGrad’s</span>
            <span className="block whitespace-nowrap">Learning Ecosystem</span>
          </h2>
          <p className="max-w-[493px] text-[24px] leading-[1.3] font-medium">
            A legacy of 10+ years in higher education, driving learning, hiring,
            and career success.
          </p>
          <ul
            aria-label="upGrad ecosystem"
            className="mt-12 flex items-center justify-center gap-x-12"
          >
            {ECO_LOGOS.map((l) => (
              <li key={l.n}>
                <Image
                  src={LOGO(l.n)}
                  alt={l.alt}
                  width={Math.round(l.h * l.r)}
                  height={l.h}
                  style={{ height: l.h, width: "auto" }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Label({
  children,
  dark = false,
  tone,
}: {
  children: React.ReactNode;
  dark?: boolean;
  tone?: "light";
}) {
  return (
    <span
      className={`block text-[10px] leading-[14px] font-medium tracking-[0.04em] uppercase ${tone === "light" ? "text-white/85" : dark ? "text-[#a1aab5]" : "text-[#545b5e]"}`}
    >
      {children}
    </span>
  );
}

/** Two-sided card: the front is the content, the back is brand red with a white logo. */
function Card({
  focus = false,
  className = "",
  front,
  back,
  fx,
  fy,
  fr,
}: {
  focus?: boolean;
  className?: string;
  front: React.ReactNode;
  back: string;
  fx: number;
  fy: number;
  fr: number;
}) {
  return (
    <div
      data-nb-card
      {...(focus ? { "data-nb-focus": "" } : {})}
      data-fx={fx}
      data-fy={fy}
      data-fr={fr}
      className={`relative min-w-0 [transform-style:preserve-3d] ${className}`}
    >
      <div className="absolute inset-0 [backface-visibility:hidden]">
        {front}
      </div>
      <div
        aria-hidden
        className="absolute inset-0 grid [transform:rotateY(180deg)] place-items-center overflow-hidden rounded-[8px] bg-brand [backface-visibility:hidden]"
      >
        <Image
          src="/images/numbers/grain.webp"
          alt=""
          fill
          sizes="400px"
          className="object-cover opacity-20 mix-blend-overlay"
        />
        <Image
          src={LOGO(back)}
          alt=""
          width={120}
          height={60}
          className="relative h-12 w-auto"
        />
      </div>
    </div>
  );
}
