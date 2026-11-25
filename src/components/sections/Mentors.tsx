"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * "Taught by World's Top Tech and Academic Minds" — mentors, from the live SOT
 * site (names, roles, poster photos, past-company logos). Same design as the live
 * site: black section, coverflow of 9:16 poster cards (centre card full size with
 * white corner handles, neighbours step back smaller and dimmer), white logos +
 * name on top, role at the bottom, square prev/next buttons, auto-advance.
 * Ours adds slightly rounded corners.
 */
type Logo = { src: string; alt: string };
const L = (file: string, alt: string): Logo => ({
  src: `/images/mentors/logos/${file}`,
  alt,
});

const MENTORS: { slug: string; name: string; role: string; logos?: Logo[] }[] =
  [
    {
      slug: "vishwa-mohan",
      name: "Vishwa Mohan",
      role: "CEO of upGrad SOT",
      logos: [
        L("linkedin.webp", "LinkedIn"),
        L("walmart.webp", "Walmart"),
        L("paypal.webp", "PayPal"),
        L("oracle.webp", "Oracle"),
        L("pw.webp", "PhysicsWallah"),
      ],
    },
    {
      slug: "rishi-saraf",
      name: "Rishi Saraf",
      role: "Cofounder & CEO DevDynamics",
      logos: [
        L("hotstar.webp", "Hotstar"),
        L("vmware.webp", "VMware"),
        L("walmart.webp", "Walmart"),
      ],
    },
    {
      slug: "gaurav-kaushik",
      name: "Gaurav Kaushik",
      role: "Senior Staff Software Engineer & Problem Solving Track Lead",
      logos: [
        L("salesforce.webp", "Salesforce"),
        L("microsoft.webp", "Microsoft"),
        L("paypal.webp", "PayPal"),
      ],
    },
    {
      slug: "gladden-rumao",
      name: "Gladden Rumao",
      role: "Staff Software AI Engineer",
      logos: [L("barclays.webp", "Barclays")],
    },
    {
      slug: "jyoti-nigam",
      name: "Jyoti Nigam",
      role: "Data Scientist at upGrad SOT",
    },
    {
      slug: "rishabh-bafna",
      name: "Rishabh Bafna",
      role: "Senior AI Engineer & Lead Instructor",
    },
    {
      slug: "mithun-s",
      name: "Mithun S",
      role: "SDE II at Cisco",
      logos: [L("cisco_dark.webp", "Cisco"), L("ineuron.webp", "iNeuron")],
    },
    {
      slug: "piyush-jain",
      name: "Piyush Jain",
      role: "Senior Mathematician and Lead Instructor",
    },
    {
      slug: "bhavishya-rao",
      name: "Bhavishya Rao",
      role: "Mathematics Teaching Assistant",
    },
    {
      slug: "akash-tiwari",
      name: "Akash Tiwari",
      role: "SDE + Instructor",
      logos: [L("kr-mangalam.png", "K.R. Mangalam University")],
    },
    {
      slug: "rahul-yadav",
      name: "Rahul Yadav",
      role: "SDE 2 + Lead Instructor",
    },
    { slug: "deepak-mishra", name: "Deepak Mishra", role: "SDE + Instructor" },
    {
      slug: "drishti-aggarwal",
      name: "Drishti Aggarwal",
      role: "SDE + Instructor",
    },
    {
      slug: "dhanshree",
      name: "Dhanshree",
      role: "Mathematics Teaching Assistant",
    },
    { slug: "simran-pathania", name: "Simran Pathania", role: "SDE + SME" },
    { slug: "jai-prasad-b", name: "Jai Prasad B", role: "SDE + Instructor" },
    {
      slug: "avinash-agrawal",
      name: "Avinash Agrawal",
      role: "SDE + Instructor",
    },
    {
      slug: "shivam-shrivastava",
      name: "Shivam Shrivastava",
      role: "SDE + Instructor",
    },
    {
      slug: "ananya-saini",
      name: "Ananya Saini",
      role: "Mathematics Teaching Assistant",
    },
    {
      slug: "shivam-pandey",
      name: "Shivam Pandey",
      role: "Mathematics Teaching Assistant",
    },
    { slug: "yash-gautam", name: "Yash Gautam", role: "SDE + Instructor" },
  ];

// coverflow steps (same values as the live site): x offset in card widths, scale, brightness, opacity
const STEPS = [
  { x: 0, s: 1, b: 1, o: 1 },
  { x: 1, s: 0.89, b: 0.9, o: 0.88 },
  { x: 1.89, s: 0.78, b: 0.75, o: 0.72 },
  { x: 2.66, s: 0.68, b: 0.6, o: 0.5 },
];
const N = MENTORS.length;

export default function Mentors() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);

  const go = useCallback(
    (d: number) => setActive((a) => (((a + d) % N) + N) % N),
    [],
  );

  // the bot's hands (desktop): -1 = screen-left hand → previous, 1 → next
  useEffect(() => {
    const onHand = (e: Event) => {
      const d = (e as CustomEvent<number>).detail;
      if (d === -1 || d === 1) go(d);
    };
    window.addEventListener("mascot:hand", onHand);
    return () => window.removeEventListener("mascot:hand", onHand);
  }, [go]);

  // auto-advance, paused on hover / focus / drag and for reduced motion
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => !paused.current && go(1), 3200);
    return () => clearInterval(id);
  }, [go]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-mt-head] > *", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-mt-head]", start: "top 82%" },
      });
      gsap.from("[data-mt-stage]", {
        y: 60,
        autoAlpha: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-mt-stage]", start: "top 85%" },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="mentors"
      className="relative overflow-hidden bg-black py-16 text-white lg:pt-10 lg:pb-8"
    >
      <div
        data-mt-head
        className="mx-auto max-w-[980px] px-5 text-center sm:px-10"
      >
        <h2 className="text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.02] font-extrabold tracking-[-0.035em] uppercase">
          Taught by World’s Top
          <br />
          <span className="text-brand">Tech &amp; Academic Minds.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[clamp(0.9375rem,1.1vw,1rem)] leading-[1.6] text-white/65">
          Industry experts and innovators who turn real-world experience into
          transformative learning.
        </p>
      </div>

      {/* coverflow */}
      <div
        data-mt-stage
        role="region"
        aria-roledescription="carousel"
        aria-label="Mentors"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onPointerEnter={() => (paused.current = true)}
        onPointerLeave={() => (paused.current = false)}
        onFocus={() => (paused.current = true)}
        onBlur={() => (paused.current = false)}
        onPointerDown={(e) => (drag.current = { x: e.clientX, moved: false })}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.moved) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 40) {
            d.moved = true;
            go(dx < 0 ? 1 : -1);
          }
        }}
        onPointerUp={() => setTimeout(() => (drag.current = null), 0)}
        className="relative mt-12 h-[calc(var(--card-h)+12px)] touch-pan-y overflow-hidden outline-none select-none [--card-h:calc(var(--card-w)*16/9)] [--card-w:200px] focus-visible:ring-2 focus-visible:ring-white/40 sm:[--card-w:236px] lg:mt-10 lg:[--card-w:240px]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-6 bg-gradient-to-r from-black to-transparent sm:w-12 lg:w-16"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-6 bg-gradient-to-l from-black to-transparent sm:w-12 lg:w-16"
        />

        {MENTORS.map((m, i) => {
          // shortest signed distance around the loop
          let off = i - active;
          if (off > N / 2) off -= N;
          if (off < -N / 2) off += N;
          const k = Math.abs(off);
          const st = STEPS[Math.min(k, 3)];
          const hidden = k > 3;
          const x = hidden ? Math.sign(off) * 3.3 : Math.sign(off) * st.x;
          return (
            <button
              key={m.slug}
              type="button"
              tabIndex={k === 0 ? 0 : -1}
              aria-hidden={k !== 0}
              aria-label={`${m.name}, ${m.role}`}
              onClick={() => {
                if (drag.current?.moved) return;
                if (k !== 0) setActive(i);
              }}
              style={{
                transform: `translateX(calc(${x} * var(--card-w))) scale(${hidden ? 0.6 : st.s})`,
                filter: `brightness(${hidden ? 0.5 : st.b})`,
                opacity: hidden ? 0 : st.o,
                zIndex: 10 - Math.min(k, 4),
                pointerEvents: hidden ? "none" : undefined,
              }}
              className="absolute top-[6px] left-1/2 -ml-[calc(var(--card-w)/2)] h-[var(--card-h)] w-[var(--card-w)] transition-[transform,opacity,filter] duration-[420ms] ease-[cubic-bezier(0.32,0,0.2,1)]"
            >
              <MentorCard m={m} active={k === 0} />
            </button>
          );
        })}
      </div>

      {/* desktop: the site bot lands here — click its hands to change mentors */}
      <div className="relative mt-4 hidden h-[230px] lg:block">
        <div
          data-mascot-dock
          data-mascot-fit="0.95"
          data-mascot-scale="0.6"
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-7 left-1/2 w-[320px] -translate-x-1/2"
        />
        <p className="absolute right-0 bottom-0 left-0 text-center font-mono text-[11px] tracking-[0.14em] text-white/45 uppercase">
          ← Tap the bot’s hands →
        </p>
      </div>

      {/* phones (and keyboard users on desktop): plain prev / next */}
      <div className="mt-8 flex justify-center gap-3 lg:sr-only lg:focus-within:not-sr-only lg:focus-within:mt-4">
        <RailButton dir={-1} onClick={() => go(-1)} />
        <RailButton dir={1} onClick={() => go(1)} />
      </div>
    </section>
  );
}

function MentorCard({
  m,
  active,
}: {
  m: (typeof MENTORS)[number];
  active: boolean;
}) {
  return (
    <>
      <span className="absolute inset-0 overflow-hidden rounded-[10px] border border-white/20 bg-[#08080a]">
        <Image
          src={`/images/mentors/${m.slug}.webp`}
          alt=""
          fill
          sizes="256px"
          draggable={false}
          className="object-cover"
        />
        <span className="absolute inset-x-0 top-[9%] flex flex-col items-center gap-[calc(var(--card-w)*0.045)]">
          {/* upGrad SOT + past companies, all in white */}
          <span className="flex w-[78%] flex-wrap items-center justify-center gap-x-[calc(var(--card-w)*0.035)] gap-y-[calc(var(--card-w)*0.03)]">
            {[
              {
                src: "/images/logo-sot.png",
                alt: "upGrad School of Technology",
              },
              ...(m.logos ?? []),
            ].map((l) => (
              <span
                key={l.alt}
                className="relative h-[calc(var(--card-w)*0.06)] w-[calc(var(--card-w)*0.2)]"
              >
                <Image
                  src={l.src}
                  alt={l.alt}
                  fill
                  sizes="60px"
                  draggable={false}
                  className="object-contain brightness-0 invert"
                />
              </span>
            ))}
          </span>
          <NameLines name={m.name} active={active} />
        </span>
        <span className="absolute inset-x-3 bottom-[5%] text-center text-[11.5px] leading-snug font-medium text-balance text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)] sm:text-[12.5px]">
          {m.role}
        </span>
      </span>
    </>
  );
}

/** Name in one line (two for long names), sized so it always fits the card width. */
function NameLines({ name, active }: { name: string; active: boolean }) {
  const words = name.split(" ");
  const lines =
    name.length > 16 && words.length > 1
      ? [
          words.slice(0, Math.ceil(words.length / 2)).join(" "),
          words.slice(Math.ceil(words.length / 2)).join(" "),
        ]
      : [name];
  const longest = Math.max(...lines.map((l) => l.length));
  const k = Math.min(active ? 0.13 : 0.11, 1.4 / longest);
  return (
    <span
      style={{ fontSize: `calc(var(--card-w) * ${k.toFixed(4)})` }}
      className="block w-full px-2 text-center leading-[0.95] font-medium tracking-[-0.035em] text-white uppercase [text-shadow:0_4px_14px_rgba(0,0,0,0.3)]"
    >
      {lines.map((l) => (
        <span key={l} className="block whitespace-nowrap">
          {l}
        </span>
      ))}
    </span>
  );
}

function RailButton({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir > 0 ? "Next mentor" : "Previous mentor"}
      className="grid size-11 place-items-center rounded-[6px] border border-white/20 text-white transition-colors hover:border-white"
    >
      <svg
        viewBox="0 0 24 24"
        className={`size-4 ${dir < 0 ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
