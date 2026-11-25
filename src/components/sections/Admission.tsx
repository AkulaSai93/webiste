"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * "Admission Process" — Figma 442:9127 (bottom half).
 * Five-step timeline on the left (the red line fills and each dot turns red as
 * you scroll past it), sticky red scholarship card on the right.
 */
const STEPS = [
  {
    title: "Apply for the uGNET Exam",
    body: "Submit your application to secure a chance to appear for the entrance assessment.",
    link: "Check Eligibility",
  },
  {
    title: "Appear for the Exam",
    body: "Take the uGSOT exam to demonstrate your aptitude and readiness for the program.",
  },
  {
    title: "Personal Interview",
    body: "Showcase your skills, passion, and potential in a one-on-one discussion with our admission panel.",
  },
  {
    title: "Counselling Session",
    body: "Receive guidance on program selection, career pathways, and tailored learning opportunities.",
  },
  {
    title: "Block Your Seat",
    body: "Confirm your admission and reserve your spot in the program to kickstart your tech journey.",
  },
];

export default function Admission() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      // the site bot stands on the tip of the red line and walks down with it
      const list = q("[data-ad-list]")[0] as HTMLElement;
      const track = q("[data-ad-track]")[0] as HTMLElement;
      const setWalk = (p: number) => {
        const y = track.offsetTop + p * track.offsetHeight;
        list.dataset.walkX = String(track.offsetLeft + 0.5);
        list.dataset.walkY = y.toFixed(1);
        list.dataset.walkLen = y.toFixed(1);
        list.dataset.walkDir = "d";
      };
      setWalk(0);

      // progress line + active dots
      gsap.fromTo(
        q("[data-ad-fill]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: q("[data-ad-list]")[0],
            start: "top 60%",
            end: "bottom 60%",
            scrub: 0.6,
            onUpdate: (self) => setWalk(self.progress),
            onRefresh: (self) => setWalk(self.progress),
          },
        },
      );
      q("[data-ad-step]").forEach((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 62%",
          onEnter: () => el.setAttribute("data-active", ""),
          onLeaveBack: () => el.removeAttribute("data-active"),
        }),
      );

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-ad-head] > *", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-ad-head]", start: "top 82%" },
      });
      gsap.from("[data-ad-card]", {
        y: 50,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-ad-card]", start: "top 85%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="admission" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-10 lg:px-0">
        <header data-ad-head className="text-center">
          <h2 className="text-[clamp(2.5rem,4.5vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-ink uppercase">
            Admission <span className="text-brand">Process</span>
          </h2>
          <p className="mx-auto mt-4 text-[16px] leading-[25.6px] text-balance text-[#3d4452]">
            A simple, transparent journey from application to admission.
          </p>
        </header>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,589px)_minmax(0,530px)] lg:justify-between lg:gap-20">
          {/* timeline */}
          <ol
            data-ad-list
            data-mascot-path
            data-mascot-height="120"
            className="relative"
          >
            <span
              data-ad-track
              aria-hidden
              className="absolute top-4 bottom-10 left-[15px] w-px bg-[rgb(11_13_18/0.1)]"
            >
              <span
                data-ad-fill
                className="absolute inset-0 origin-top bg-brand"
              />
            </span>
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                data-ad-step
                {...(i === 0 ? { "data-active": "" } : {})}
                className="group relative pb-10 pl-14 last:pb-0"
              >
                <span className="absolute top-0 left-0 grid size-8 place-items-center rounded-full bg-[rgb(11_13_18/0.06)] transition-colors duration-500 group-data-active:bg-brand/15">
                  <span className="size-3.5 rounded-full bg-[rgb(11_13_18/0.25)] transition-colors duration-500 group-data-active:bg-brand" />
                </span>
                <p className="text-[13px] leading-[19.5px] font-semibold text-brand">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="pt-1 text-[18px] leading-[24.75px] font-medium tracking-[-0.01em] text-balance text-[#0b0d12]">
                  {s.title}
                </h3>
                <p className="max-w-[520px] pt-2 text-[14.5px] leading-[23.56px] text-[#3d4452]">
                  {s.body}
                </p>
                {s.link && (
                  <a
                    href="#scholarships"
                    className="group/l mt-3 inline-flex items-center gap-1.5 text-[13.5px] leading-[20.25px] font-semibold text-brand"
                  >
                    <span className="border-b border-transparent transition-colors group-hover/l:border-brand">
                      {s.link}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/scholarships/icon-arrow-up-right-red.svg"
                      alt=""
                      width={15}
                      height={15}
                    />
                  </a>
                )}
              </li>
            ))}
          </ol>

          {/* sticky scholarship card */}
          <div className="lg:relative">
            <div
              data-ad-card
              className="rounded-[8px] border border-black/[0.08] bg-brand p-7 sm:p-9 lg:sticky lg:top-[120px]"
            >
              <h3 className="max-w-[457px] text-[clamp(1.6rem,2.2vw,2rem)] leading-[1.15] font-medium tracking-[-0.02em] text-balance text-white">
                Study Without Limits: Up to 100% Scholarships
              </h3>
              <p className="max-w-[457px] pt-4 text-[15px] leading-[24.375px] text-white/85">
                We’ve set aside ₹7 Cr+ in scholarships and eligible students can
                have up to 100% of tuition covered. Continue registration,
                complete payment, and book your exam slot.
              </p>
              <div className="pt-10">
                <a
                  href="https://sot.upgrad.com/"
                  className="group/cta relative flex h-[60px] w-full overflow-hidden rounded-[6px] p-[2px]"
                >
                  <span
                    aria-hidden
                    className="cta-glow absolute top-1/2 left-1/2 aspect-square w-[160%]"
                  />
                  <span className="relative z-[2] flex w-full items-center justify-center gap-2 rounded-[4px] bg-white text-[16px] leading-6 font-semibold text-[#0b0d12] transition-colors group-hover/cta:bg-[#f4f4f5]">
                    Resume Application
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/scholarships/icon-arrow-up-right-dark.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
