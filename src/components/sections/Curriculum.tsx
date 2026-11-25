"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Curriculum — same design as the live SOT site: a bordered panel with four
 * year tabs; each year shows its title, a "Projects you'll build" carousel
 * (prev/next), "Skills you'll build" chips and a collapsible subject list.
 * Content + images from the live site.
 */
type Project = { t: string; b: string };
type Year = {
  title: string;
  body: string;
  projects: Project[];
  skills: string[];
  subjects: string[];
};

const YEARS: Year[] = [
  {
    title: "Foundations",
    body: "Build strong fundamentals in programming, math, and core computer science.",
    projects: [
      {
        t: "Online Reporting & Flight Booking Platform",
        b: "Search, book and report on flights.",
      },
      {
        t: "Dynamic UI with JSON Configs",
        b: "Change layouts and forms without code.",
      },
      {
        t: "Distributed Payment Processor",
        b: "Fault-tolerant payments with reliable webhooks.",
      },
      {
        t: "API Gateway: Rate Limiting & Circuit Breaker",
        b: "Manage traffic and handle failures gracefully.",
      },
      {
        t: "Automated Assignment Evaluation System",
        b: "Auto-grade Python code with tests and CI.",
      },
      {
        t: "React-Based Student Dashboard",
        b: "Timetable, announcements and events in one view.",
      },
    ],
    skills: [
      "Python",
      "Java",
      "Engineering Mathematics",
      "DSA",
      "Frontend (HTML, CSS, JS, React)",
      "Linux",
      "Git & GitHub",
    ],
    subjects: [
      "Python",
      "Engineering Mathematics I",
      "Web Essentials",
      "Data Structures & Algorithms I",
      "FrontEnd Development",
      "Engineering Mathematics II",
      "Java",
    ],
  },
  {
    title: "Core Tech",
    body: "Dive deep into algorithms, data structures, and system design fundamentals.",
    projects: [
      {
        t: "Real-Time IoT Healthcare Management",
        b: "Live patient data from IoT devices.",
      },
      {
        t: "End-to-End Web Contact Center with WebRTC",
        b: "Browser-based calls with live agent management.",
      },
      {
        t: "Multi-Language Encrypted Chat Platform",
        b: "End-to-end encrypted, multi-language chat.",
      },
      {
        t: "Real-Time Collaborative Document Editor",
        b: "Many users editing one document live.",
      },
      {
        t: "Student Performance Analytics Dashboard",
        b: "Turn marks data into visual insights.",
      },
      {
        t: "IoT Smart Monitoring Setup",
        b: "Live temperature and humidity with alerts.",
      },
    ],
    skills: [
      "Advanced DSA",
      "SQL & DBMS",
      "Backend (MERN)",
      "Operating Systems",
      "Generative AI",
      "Cloud Computing",
    ],
    subjects: [
      "Engineering Mathematics III",
      "Data Structures & Algorithms II",
      "Database Management Systems",
      "Backend Development (MERN)",
      "Operating Systems",
      "Generative AI & Agentic Systems",
      "Cloud Computing Fundamentals",
    ],
  },
  {
    title: "Advanced AI & Quantum",
    body: "Explore cutting-edge technologies including AI, ML, and quantum computing.",
    projects: [
      {
        t: "Automated Vulnerability Management",
        b: "Automate dependency scans and security patches.",
      },
      {
        t: "Multi-Tenant SaaS with Tenant Isolation",
        b: "One platform, securely isolated per organisation.",
      },
      {
        t: "Image Recognition Attendance System",
        b: "Mark attendance with face recognition.",
      },
      {
        t: "Smart Campus Navigation App",
        b: "Search and route around campus on a map.",
      },
      {
        t: "Cloud Deployment + Monitoring Pipeline",
        b: "Containerise, deploy and monitor with CI/CD.",
      },
      {
        t: "Fraud Detection for Transactions",
        b: "Flag suspicious transactions with ML.",
      },
    ],
    skills: [
      "Compiler Design",
      "Artificial Intelligence",
      "Computer Architecture",
      "Deep Learning",
      "Software Engineering",
      "Quantum Programming",
    ],
    subjects: [
      "Internship I (6 Months)",
      "Compiler Design",
      "Artificial Intelligence",
      "Computer Organization & Architecture",
      "Deep Learning",
      "Cybersecurity Essentials",
      "Software Engineering",
      "Quantum Programming",
    ],
  },
  {
    title: "Industry & Innovation",
    body: "Real-world industry projects and innovative solutions for complex problems.",
    projects: [
      {
        t: "Enterprise Helpdesk & Ticket System",
        b: "Track issues with roles, SLAs and dashboards.",
      },
      {
        t: "Supply Chain Tracker with Blockchain",
        b: "Tamper-proof shipment tracking.",
      },
      {
        t: "Smart Waste Segregation IoT System",
        b: "Sort waste with sensors and alerts.",
      },
      {
        t: "Credit Card Fraud Alert Platform",
        b: "Real-time fraud alerts on the cloud.",
      },
      {
        t: "Smart Parking System with Analytics",
        b: "Live parking availability and analytics.",
      },
      {
        t: "Personalized Learning Recommendation Engine",
        b: "Suggest courses from learner behaviour.",
      },
    ],
    skills: [
      "Computer Networks",
      "Deep Learning",
      "Product Dev",
      "Agile",
      "Cloud & Distributed Systems",
      "Advanced DSA & System Design",
    ],
    subjects: [
      "Computer Networks",
      "Deep Learning",
      "Capstone Project Phase I",
      "Real-World Product Development & Agile Project Management",
      "Theory of Computation (TOC)",
      "IoT & Edge Computing for Intelligent Systems",
      "AI-Native Cloud Architecture & Distributed Systems",
      "Capstone Project Phase II",
    ],
  },
];

export default function Curriculum() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const y = YEARS[active];

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-cu-head] > *", {
        y: 30,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-cu-head]", start: "top 82%" },
      });
      gsap.from("[data-cu-panel]", {
        y: 50,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-cu-panel]", start: "top 85%" },
      });
    },
    { scope: root },
  );

  // fade the panel content in when the year changes
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-cu-body]",
        { y: 16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out" },
      );
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <section ref={root} id="curriculum" className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-10 lg:px-0">
        <header data-cu-head className="mx-auto max-w-[980px] text-center">
          <h2 className="text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.035em] text-ink uppercase">
            Build industry preferred skills
            <br />
            through <span className="text-brand">practical learning.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-[clamp(0.9375rem,1.1vw,1rem)] leading-[1.6] text-balance text-[#3d4452]">
            A structured learning journey designed with input from industry
            experts.
          </p>
        </header>

        <div
          data-cu-panel
          className="relative mx-auto mt-10 max-w-[1116px] rounded-[8px] border border-black/[0.08] bg-white p-4 sm:px-8 sm:py-6 lg:mt-14"
        >
          {/* year tabs */}
          <div
            role="tablist"
            aria-label="Curriculum years"
            className="flex overflow-x-auto rounded-[4px] border border-black/[0.08] p-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {YEARS.map((yr, i) => (
              <button
                key={yr.title}
                type="button"
                role="tab"
                id={`curriculum-tab-y${i + 1}`}
                aria-selected={i === active}
                aria-controls="curriculum-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") setActive((i + 1) % YEARS.length);
                  if (e.key === "ArrowLeft")
                    setActive((i - 1 + YEARS.length) % YEARS.length);
                }}
                className={`min-w-[150px] flex-1 px-5 py-2.5 text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-inset ${
                  i === active
                    ? "bg-brand text-white"
                    : "bg-white text-[#525252] hover:bg-[#f4f4f5]"
                } ${i === 0 ? "rounded-l-[3px]" : ""} ${i === YEARS.length - 1 ? "rounded-r-[3px]" : ""}`}
              >
                <span className="block text-[14px] leading-5 tracking-[0.35px] uppercase">
                  Year - {i + 1}
                </span>
                <span className="block text-[12px] leading-4 opacity-80">
                  {yr.title}
                </span>
              </button>
            ))}
          </div>

          <div
            id="curriculum-panel"
            role="tabpanel"
            aria-labelledby={`curriculum-tab-y${active + 1}`}
            className="mt-5"
          >
            <div data-cu-body key={active}>
              <h3 className="text-[clamp(1.375rem,2vw,1.75rem)] leading-[1.25] font-semibold tracking-[-0.02em] text-ink">
                {y.title}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#3d4452]">
                {y.body}
              </p>

              <Projects year={active} projects={y.projects} />

              <div className="mt-6">
                <SubHead>Skills you’ll build</SubHead>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {y.skills.map((s) => (
                    <li
                      key={s}
                      className="rounded-[4px] bg-[#f4f4f5] px-3.5 py-2 text-[14px] leading-[14px] text-[#3a3a3a]"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <SubjectList subjects={y.subjects} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="border-l-[3px] border-brand pl-3 text-[17px] leading-tight font-semibold text-brand">
      {children}
    </h4>
  );
}

function Projects({ year, projects }: { year: number; projects: Project[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    el.scrollLeft = 0;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [year, measure]);

  const page = (dir: 1 | -1) => {
    const el = rail.current;
    if (el)
      el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <SubHead>Projects you’ll build</SubHead>
        <div className="flex gap-2">
          <ArrowButton
            dir={-1}
            disabled={edge.start}
            onClick={() => page(-1)}
          />
          <ArrowButton dir={1} disabled={edge.end} onClick={() => page(1)} />
        </div>
      </div>
      <div className="mt-4 overflow-hidden">
        <div
          ref={rail}
          className="flex snap-x snap-mandatory scroll-px-1.5 gap-4 overflow-x-auto px-1.5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((p, i) => (
            <article
              key={p.t}
              className="group relative flex w-[260px] shrink-0 snap-start flex-col rounded-[6px] border border-black/[0.08] bg-white p-2.5 sm:w-[280px]"
            >
              <div className="relative aspect-video shrink-0 overflow-hidden rounded-[4px]">
                <Image
                  src={`/images/curriculum/figma/y${year + 1}-${i + 1}.webp`}
                  alt=""
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col px-1.5 pt-3 pb-1.5">
                <h5 className="text-[15px] leading-[20.625px] font-semibold tracking-[-0.025em] text-balance text-black">
                  {p.t}
                </h5>
                <p className="mt-1 text-[13px] leading-[17.875px] text-[#3d4452]">
                  {p.b}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrowButton({
  dir,
  disabled,
  onClick,
}: {
  dir: 1 | -1;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir > 0 ? "Next projects" : "Previous projects"}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-[4px] border border-black/[0.08] transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-35"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/curriculum/icons/arrow-${dir > 0 ? "next" : "prev"}.svg`}
        alt=""
        width={17}
        height={17}
      />
    </button>
  );
}

function SubjectList({ subjects }: { subjects: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 overflow-hidden rounded-[4px]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-[4px] bg-[#2b2e36] px-5 py-4 text-left outline-none transition-colors duration-300 hover:bg-ink focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset"
      >
        <span className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/curriculum/icons/subject-book-white.svg"
            alt=""
            className="size-5"
          />
          <span className="text-[14px] leading-[21.56px] font-medium text-white">
            View Subject List
          </span>
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/curriculum/icons/subject-chevrons-white.svg"
          alt=""
          className={`h-3 w-2.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <ol className="grid gap-x-8 gap-y-2.5 px-5 py-4 sm:grid-cols-2">
            {subjects.map((s, i) => (
              <li
                key={s}
                className="flex gap-4 text-[14.5px] leading-snug text-ink"
              >
                <span className="w-5 shrink-0 font-semibold text-brand tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
