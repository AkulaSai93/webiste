/**
 * PLACEHOLDER sections — only here to show the mascot following the page.
 * Replace with the real sections; keep a data-mascot-stop element in each one
 * to tell the bot where to fly and which code to show.
 */

const SECTIONS = [
  {
    eyebrow: "Build from day one",
    title: "Ship real products, not just assignments.",
    body: "Every semester ends in something you can deploy — web apps, AI agents and cloud services, reviewed like production code.",
    chips: ["Projects every semester", "Code reviews", "Live deployments"],
    side: "right" as const,
    stop: { x: -0.52, y: -0.05, scale: 0.66, turn: 0.45, code: "fullstack" },
  },
  {
    eyebrow: "Careers",
    title: "From your first commit to your first offer.",
    body: "Mentors from Google, Goldman Sachs, Flipkart and more help you turn your portfolio into placements.",
    chips: ["Mentorship", "Portfolio reviews", "Placement support"],
    side: "left" as const,
    stop: { x: 0.5, y: 0.05, scale: 0.6, turn: -0.4, code: "career" },
  },
];

export default function PlaceholderSections() {
  return (
    <>
      {SECTIONS.map((s) => (
        <section key={s.eyebrow} className="relative min-h-svh">
          <div
            data-mascot-stop
            data-mascot-x={s.stop.x}
            data-mascot-y={s.stop.y}
            data-mascot-scale={s.stop.scale}
            data-mascot-turn={s.stop.turn}
            data-mascot-code={s.stop.code}
            data-mascot-mx={s.side === "left" ? 0.55 : -0.55}
            data-mascot-my={-0.62}
            data-mascot-ms={0.32}
            className="pointer-events-none absolute inset-0"
          />
          <div
            className={`relative z-[2] mx-auto flex min-h-svh max-w-[1440px] items-center px-5 py-24 sm:px-10 lg:px-20 ${
              s.side === "right" ? "lg:justify-end" : ""
            }`}
          >
            <div className="max-w-xl">
              <p className="text-xs font-medium tracking-[0.2em] text-mute uppercase">{s.eyebrow}</p>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3.75rem)] leading-[1.05] font-medium tracking-[-0.035em] text-ink">
                {s.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft">{s.body}</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {s.chips.map((c) => (
                  <li key={c} className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm text-ink backdrop-blur">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
