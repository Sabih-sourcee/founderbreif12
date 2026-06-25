import { createFileRoute, Link } from "@tanstack/react-router";
import { WaitlistForm } from "@/components/WaitlistForm";
import { LogoLink } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FounderBrief — Your weekly brief, built for founders who ship" },
      { name: "description", content: "FounderBrief distills your strategy, metrics, and priorities into one calm, focused summary — every Monday morning." },
      { property: "og:title", content: "FounderBrief — Your weekly brief" },
      { property: "og:description", content: "One brief. Every Monday. No noise." },
    ],
  }),
  component: Landing,
});

/* ---------- Icons (24px, 1.75 stroke, monochrome) ---------- */
type IconProps = { className?: string };
const stroke = "currentColor";
const baseIcon = "h-6 w-6";

const Icons = {
  Layers: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? baseIcon}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5" /><path d="m3 18 9 5 9-5" />
    </svg>
  ),
  Calendar: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? baseIcon}>
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  ),
  Brain: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? baseIcon}>
      <path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5 3 3 0 0 0 2 5v0a3 3 0 0 0 3 3h0V4Z" />
      <path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5 3 3 0 0 1-2 5v0a3 3 0 0 1-3 3h0V4Z" />
    </svg>
  ),
  Inbox: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? baseIcon}>
      <path d="M3 13h4l2 3h6l2-3h4" /><path d="M5 5h14l2 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6l2-8Z" />
    </svg>
  ),
  Focus: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? baseIcon}>
      <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </svg>
  ),
  Chart: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? baseIcon}>
      <path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" />
    </svg>
  ),
  Compass: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? baseIcon}>
      <circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-5 2 2-5 5-2Z" />
    </svg>
  ),
  Clock: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? baseIcon}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  Share: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? baseIcon}>
      <circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" />
      <path d="m8 11 8-4M8 13l8 4" />
    </svg>
  ),
  Check: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? "h-4 w-4"}>
      <path d="m5 12 4 4 10-10" />
    </svg>
  ),
  Twitter: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? "h-5 w-5"}>
      <path d="M4 4l7.5 10L4.5 20h2l6-6.6L17.5 20H20l-7.8-10.4L19.5 4h-2l-5.6 6.2L7 4H4Z" />
    </svg>
  ),
  Linkedin: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? "h-5 w-5"}>
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </svg>
  ),
  Github: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={p.className ?? "h-5 w-5"}>
      <path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  ),
};

/* ---------- Buttons ---------- */
function Btn({
  children, variant = "primary", as: As = "button", href, className = "", ...rest
}: any) {
  const base = "inline-flex items-center justify-center h-11 px-5 rounded-[8px] text-sm font-semibold transition-colors";
  const styles = {
    primary: "bg-foreground text-background hover:bg-foreground/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    secondary: "bg-transparent text-foreground border border-border hover:bg-surface",
  } as const;
  const cls = `${base} ${styles[variant as keyof typeof styles]} ${className}`;
  if (As === "a" || href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return <button className={cls} {...rest}>{children}</button>;
}

/* ---------- Page ---------- */
function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <main>
        <Hero />
        <ProblemStrip />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-6 ${className}`}>{children}</div>;
}

function Nav() {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-30 backdrop-blur-[2px]">
      <Container className="flex h-16 items-center justify-between">
        <LogoLink to="/" size="sm" />
        <nav className="hidden md:flex items-center gap-8 text-sm text-[color:var(--subtle-foreground)]">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/demo"
            className="hidden h-10 items-center justify-center rounded-[8px] border border-border bg-transparent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface sm:inline-flex"
          >
            Try demo
          </Link>
          <Btn variant="primary" href="#waitlist" className="h-10 px-4">
            Join waitlist
          </Btn>
        </div>
      </Container>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-border">
      <Container className="grid md:grid-cols-12 gap-12 py-20 md:py-28 items-center">
        <div className="md:col-span-7">
          <span className="eyebrow">For non-technical founders</span>
          <h1 className="mt-5 text-[40px] md:text-[56px] font-bold tracking-[-0.02em] leading-[1.05]">
            Your weekly brief.<br />Built for founders who ship.
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-[17px] leading-[1.65] text-[color:var(--subtle-foreground)]">
            FounderBrief distills your strategy, metrics, and priorities into one calm, focused summary — every Monday morning.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/demo"
              className="inline-flex h-12 items-center justify-center rounded-[8px] bg-accent px-6 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Try free demo
            </Link>
            <Btn variant="secondary" href="#features">
              See features
            </Btn>
          </div>
          <div id="waitlist" className="mt-8 scroll-mt-24">
            <WaitlistForm variant="inline" showName submitLabel="Join the waitlist" />
          </div>
          <p className="mt-4 text-[11px] text-[color:var(--muted-foreground)]">
            One free demo · Paid plans from $15/mo · No card required to join
          </p>
          <p className="mt-6 text-xs font-semibold text-[color:var(--muted-foreground)]">
            Join 400+ founders on the waitlist
          </p>
        </div>

        <div className="md:col-span-5">
          <BriefMockup />
        </div>
      </Container>
    </section>
  );
}

function BriefMockup() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <p className="eyebrow">Monday Brief</p>
          <p className="text-sm font-semibold mt-1">Week 41 · Oct 14</p>
        </div>
        <span className="inline-flex items-center rounded-[12px] bg-border/70 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
          Draft → Sent
        </span>
      </div>

      <div className="mt-5">
        <p className="eyebrow">North Star</p>
        <p className="mt-2 text-[15px] leading-[1.55]">
          Reach 1,000 weekly active teams by Q1. Currently at <span className="font-semibold">612</span>.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { l: "MRR", v: "$8,420", d: "+12%" },
          { l: "Active", v: "612", d: "+38" },
          { l: "Churn", v: "1.2%", d: "−0.3" },
        ].map((m) => (
          <div key={m.l} className="rounded-lg border border-border bg-background p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">{m.l}</p>
            <p className="mt-1 text-lg font-bold tracking-[-0.01em]">{m.v}</p>
            <p className="text-xs text-[color:var(--success)] font-semibold">{m.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="eyebrow">This Week's 3</p>
        <ul className="mt-2 space-y-2 text-[14px]">
          {["Ship onboarding rewrite", "Interview 5 churned users", "Close pricing experiment"].map((t, i) => (
            <li key={t} className="flex gap-3">
              <span className="mt-0.5 text-[color:var(--muted-foreground)] font-semibold text-xs w-4">0{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProblemStrip() {
  const items = [
    { icon: Icons.Layers, t: "Too many tools", b: "Notion, Sheets, Linear, Slack. Your strategy is scattered across ten tabs." },
    { icon: Icons.Calendar, t: "No weekly rhythm", b: "Without a cadence, weeks blur. You react instead of decide." },
    { icon: Icons.Brain, t: "Strategy stays in your head", b: "If it isn't written down, it isn't shared — and it isn't real." },
  ];
  return (
    <section className="bg-surface border-b border-border">
      <Container className="py-20">
        <div className="grid md:grid-cols-3 gap-10 md:gap-16">
          {items.map(({ icon: I, t, b }) => (
            <div key={t}>
              <I />
              <h3 className="mt-5 text-base font-semibold tracking-[-0.01em]">{t}</h3>
              <p className="mt-2 text-sm leading-[1.65] text-[color:var(--subtle-foreground)]">{b}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { t: "Connect your sources", d: "Link the metrics, docs, and tools you already use. Five minutes, once." },
    { t: "Set your weekly cadence", d: "Pick what matters: north star, KPIs, priorities, blockers, decisions." },
    { t: "Read it every Monday", d: "Open your inbox to one calm brief. Decide. Close the tab. Get to work." },
  ];
  return (
    <section className="border-b border-border">
      <Container className="py-24">
        <span className="eyebrow">How it works</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.02em] max-w-2xl">
          Set it once. Read it every Monday.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-10 md:gap-12">
          {steps.map((s, i) => (
            <div key={s.t} className="border-t border-border pt-6">
              <p className="text-[40px] font-bold leading-none tracking-[-0.02em] text-[color:var(--border)]">
                0{i + 1}
              </p>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em]">{s.t}</h3>
              <p className="mt-2 text-sm leading-[1.65] text-[color:var(--subtle-foreground)]">{s.d}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Icons.Inbox, t: "Weekly Brief", d: "One email, one page. Strategy, metrics, and priorities — nothing else." },
    { icon: Icons.Focus, t: "Focus Mode", d: "Hide the noise. See only this week's three priorities while you work." },
    { icon: Icons.Chart, t: "Metrics Snapshot", d: "Live numbers from the tools you already use. No dashboards to maintain." },
    { icon: Icons.Compass, t: "Priority Engine", d: "Decide what matters. Everything else waits until next Monday." },
    { icon: Icons.Clock, t: "Async-friendly", d: "Share read-only briefs with investors, advisors, and your team." },
    { icon: Icons.Share, t: "One-click Share", d: "Public links, PDF export, or send straight to your investor update." },
  ];
  return (
    <section id="features" className="bg-surface border-b border-border">
      <Container className="py-24">
        <span className="eyebrow">Features</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.02em] max-w-2xl">
          The smallest set of tools that gets you a clear week.
        </h2>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-background p-6">
              <I />
              <h3 className="mt-5 text-base font-semibold tracking-[-0.01em]">{t}</h3>
              <p className="mt-2 text-sm leading-[1.65] text-[color:var(--subtle-foreground)]">{d}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { q: "FounderBrief replaced four tabs and a recurring calendar event. Monday finally feels designed.", n: "Maya Okafor", r: "Founder, Ledgerline" },
    { q: "I stopped writing investor updates from scratch. The brief is the update.", n: "Daniel Reyes", r: "CEO, Northpath" },
    { q: "It's the only product where I read every word, every week. Quiet and useful.", n: "Priya Shah", r: "Founder, Quill & Co." },
  ];
  return (
    <section className="border-b border-border">
      <Container className="py-24">
        <span className="eyebrow">From founders</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.02em] max-w-2xl">
          A quieter way to run a company.
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {quotes.map((t) => (
            <figure key={t.n} className="rounded-2xl border border-border bg-surface p-6 flex flex-col">
              <blockquote className="text-base italic leading-[1.65] text-foreground">
                "{t.q}"
              </blockquote>
              <figcaption className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-semibold">{t.n}</p>
                <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">{t.r}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      per: "to start",
      desc: "Try FounderBrief with one full brief generation — no card required.",
      features: [
        "1 brief generation",
        "North star, metrics & priorities",
        "Markdown export",
        "Personal use",
      ],
      cta: "Join waitlist",
      variant: "secondary" as const,
      strong: false,
    },
    {
      name: "Monthly",
      price: "$18",
      per: "per month",
      desc: "Full access, billed month to month. Cancel anytime.",
      features: [
        "Unlimited brief generations",
        "Weekly email brief",
        "Shareable links & PDF",
        "Investor update mode",
      ],
      cta: "Join waitlist",
      variant: "secondary" as const,
      strong: false,
    },
    {
      name: "Annual",
      price: "$15",
      per: "per month",
      billed: "$180 billed yearly",
      desc: "Same full access, save when you commit for the year.",
      features: [
        "Everything in Monthly",
        "Save $36 vs monthly",
        "Priority support",
        "Early access to new features",
      ],
      cta: "Join waitlist",
      variant: "accent" as const,
      strong: true,
    },
  ];
  return (
    <section id="pricing" className="bg-surface border-b border-border">
      <Container className="py-24">
        <span className="eyebrow">Pricing</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.02em] max-w-2xl">
          Simple, honest pricing.
        </h2>
        <p className="mt-3 text-sm text-[color:var(--subtle-foreground)] max-w-xl">
          One generation free. Then $18/month, or $15/month when billed annually.
        </p>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl bg-background p-8 flex flex-col ${t.strong ? "border border-foreground" : "border border-border"}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold tracking-[-0.01em]">{t.name}</h3>
                {t.strong && (
                  <span className="rounded-[12px] bg-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shrink-0">
                    Best value
                  </span>
                )}
              </div>
              <p className="mt-6">
                <span className="text-[28px] font-bold tracking-[-0.02em]">{t.price}</span>
                <span className="ml-2 text-sm text-[color:var(--muted-foreground)]">{t.per}</span>
              </p>
              {"billed" in t && t.billed && (
                <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{t.billed}</p>
              )}
              <p className="mt-3 text-sm text-[color:var(--subtle-foreground)] leading-[1.65]">{t.desc}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 text-[color:var(--success)]"><Icons.Check /></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Btn variant={t.variant} href="#waitlist" className="mt-8 w-full">{t.cta}</Btn>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="border-b border-border">
      <Container className="py-28 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.02em] max-w-2xl mx-auto">
          One brief. Every Monday. No noise.
        </h2>
        <p className="mt-4 text-sm text-[color:var(--subtle-foreground)] max-w-md mx-auto">
          Join the waitlist and we&apos;ll invite you as soon as a spot opens.
        </p>
        <div className="mt-10 flex justify-center px-2">
          <WaitlistForm variant="stacked" submitLabel="Get early access" />
        </div>
        <p className="mt-4 text-[10px] font-semibold tracking-wider uppercase text-[color:var(--muted-foreground)]">
          No credit card required
        </p>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <Container className="py-14 grid md:grid-cols-3 gap-10">
        <div>
          <LogoLink to="/" size="sm" />
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)] max-w-xs leading-[1.65]">
            A weekly brief for founders who'd rather decide than dashboard.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="eyebrow">Product</p>
            <ul className="mt-3 space-y-2">
              <li><a href="#features" className="hover:text-foreground text-[color:var(--subtle-foreground)]">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground text-[color:var(--subtle-foreground)]">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground text-[color:var(--subtle-foreground)]">Changelog</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Company</p>
            <ul className="mt-3 space-y-2">
              <li><a href="/auth" className="hover:text-foreground text-[color:var(--subtle-foreground)]">Sign in</a></li>
              <li><a href="#" className="hover:text-foreground text-[color:var(--subtle-foreground)]">Contact</a></li>
              <li><a href="/privay" className="hover:text-foreground text-[color:var(--subtle-foreground)]">Privacy</a></li>
              <li><Link to="/delete-account" className="hover:text-foreground text-[color:var(--subtle-foreground)]">Delete account</Link></li>
            </ul>
          </div>
        </div>
        <div className="md:text-right">
          <div className="inline-flex gap-3">
            <a href="#" aria-label="Twitter" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-surface"><Icons.Twitter /></a>
            <a href="#" aria-label="LinkedIn" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-surface"><Icons.Linkedin /></a>
            <a href="#" aria-label="GitHub" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-surface"><Icons.Github /></a>
          </div>
          <p className="mt-6 text-xs text-[color:var(--muted-foreground)]">© {new Date().getFullYear()} FounderBrief</p>
        </div>
      </Container>
      <div className="border-t border-border" />
    </footer>
  );
}
