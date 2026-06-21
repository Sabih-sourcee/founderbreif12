import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  DollarSign,
  Download,
  Layers,
  Map,
  Share2,
  Target,
  Users,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadBriefPdf } from "@/lib/pdf-export";
import type { ProjectBrief } from "@/types/brief";

type BriefResultStepProps = {
  brief: ProjectBrief;
  isAdmin?: boolean;
  onStartOver?: () => void;
};

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 text-left">
      <div className="mb-4 flex items-center gap-1.5 border-b border-border/60 pb-2">
        <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-tight text-foreground sm:text-sm">
          <Icon className="h-4 w-4 text-accent" />
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

export function BriefResultStep({ brief, isAdmin, onStartOver }: BriefResultStepProps) {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleCopyText = () => {
    const text = brief.rawMarkdown || brief.tldr;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      await downloadBriefPdf(brief);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `FounderBrief Project Ready!\n\nProject: ${brief.title}\nComplexity: ${brief.complexity}\nEst. Budget: ${brief.estimatedBudget}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: brief.title, text: shareText });
        return;
      } catch {
        // fall through
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6 sm:px-6">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-700 shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mb-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Your project brief is ready!
        </h1>
        <p className="text-xs text-[color:var(--subtle-foreground)]">
          A comprehensive, readable product brief tailored to your vision.
        </p>
      </div>

      <div className="space-y-4">
        <section className="block rounded-2xl border border-border bg-surface p-5 text-left">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
            {brief.title}
          </span>
          <h2 className="mb-2 mt-1 text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-xl">
            TL;DR
          </h2>
          <p className="border-l-2 border-accent pl-3 text-xs leading-relaxed text-[color:var(--subtle-foreground)] sm:text-sm">
            {brief.tldr}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 text-left">
            <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-[color:var(--subtle-foreground)]">
              Complexity
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`text-sm font-black uppercase tracking-wider ${
                  brief.complexity === "Low"
                    ? "text-green-700"
                    : brief.complexity === "High"
                      ? "text-red-600"
                      : "text-accent"
                }`}
              >
                {brief.complexity}
              </span>
              <Activity className="h-4 w-4 text-[color:var(--muted-foreground)]" />
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 text-left">
            <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-[color:var(--subtle-foreground)]">
              Est. Budget
            </span>
            <div className="mt-1 flex items-center gap-1">
              <DollarSign className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-sm font-extrabold tracking-tight text-foreground sm:text-base">
                {brief.estimatedBudget}
              </span>
            </div>
          </div>
        </div>

        <SectionCard title="Goals" icon={Target}>
          <div className="space-y-4">
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold uppercase text-[color:var(--subtle-foreground)]">
                Business Goals
              </p>
              <ul className="space-y-1.5">
                {brief.goals.business.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-foreground sm:text-sm">
                    <span className="mt-0.5 shrink-0 text-accent">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold uppercase text-[color:var(--subtle-foreground)]">
                User Goals
              </p>
              <ul className="space-y-1.5">
                {brief.goals.user.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-foreground sm:text-sm">
                    <span className="mt-0.5 shrink-0 text-accent">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold uppercase text-[color:var(--subtle-foreground)]">
                Non-Goals
              </p>
              <ul className="space-y-1.5">
                {brief.goals.nonGoals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-[color:var(--subtle-foreground)] sm:text-sm">
                    <span className="mt-0.5 shrink-0">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="User Stories" icon={Users}>
          <div className="space-y-3">
            {brief.userStories.map((story, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs italic leading-relaxed text-[color:var(--subtle-foreground)]">
                  &ldquo;{story}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Functional Requirements" icon={Layers}>
          <div className="space-y-4">
            {brief.functionalRequirements.map((req, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-foreground sm:text-sm">
                  {req.title}{" "}
                  <span className="font-normal text-[color:var(--subtle-foreground)]">
                    (Priority: {req.priority})
                  </span>
                </p>
                <ul className="mt-1.5 space-y-1">
                  {req.details.map((d, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs leading-relaxed text-[color:var(--subtle-foreground)]">
                      <span className="mt-0.5 shrink-0 text-green-600">✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="User Experience" icon={Map}>
          <div className="space-y-3 text-xs leading-relaxed sm:text-sm">
            <p className="text-[color:var(--subtle-foreground)]">{brief.userExperience.entryPoint}</p>
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-bold uppercase text-[color:var(--subtle-foreground)]">
                Core Experience
              </p>
              <ul className="space-y-1">
                {brief.userExperience.coreExperience.map((s, i) => (
                  <li key={i} className="text-foreground">• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Narrative" icon={BookOpen}>
          <p className="text-xs italic leading-relaxed text-[color:var(--subtle-foreground)] sm:text-sm">
            {brief.narrative}
          </p>
        </SectionCard>

        <SectionCard title="Success Metrics" icon={BarChart3}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "User-Centric", items: brief.successMetrics.userCentric },
              { label: "Business", items: brief.successMetrics.business },
              { label: "Technical", items: brief.successMetrics.technical },
              { label: "Tracking Plan", items: brief.successMetrics.trackingPlan },
            ].map(({ label, items }) => (
              <div key={label}>
                <p className="mb-1 font-mono text-[10px] font-bold uppercase text-[color:var(--subtle-foreground)]">
                  {label}
                </p>
                <ul className="space-y-1">
                  {items.map((m, i) => (
                    <li key={i} className="text-[11px] leading-relaxed text-foreground">
                      • {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Technical Considerations" icon={Wrench}>
          <div className="space-y-3">
            {[
              { label: "Technical Needs", items: brief.technicalConsiderations.technicalNeeds },
              { label: "Integrations", items: brief.technicalConsiderations.integrationPoints },
              { label: "Challenges", items: brief.technicalConsiderations.challenges },
            ].map(({ label, items }) => (
              <div key={label}>
                <p className="mb-1 font-mono text-[10px] font-bold uppercase text-[color:var(--subtle-foreground)]">
                  {label}
                </p>
                <ul className="space-y-1">
                  {items.map((t, i) => (
                    <li key={i} className="text-xs leading-relaxed text-foreground">
                      • {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Milestones & Sequencing" icon={Target}>
          <div className="space-y-3 text-xs sm:text-sm">
            <p className="text-foreground">
              <strong>Estimate:</strong> {brief.milestones.estimate}
            </p>
            <p className="text-foreground">
              <strong>Team:</strong> {brief.milestones.teamSize}
            </p>
            {brief.milestones.phases.map((phase, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold text-foreground">
                  {phase.name} ({phase.duration})
                </p>
                <p className="mt-1 text-[color:var(--subtle-foreground)]">
                  {phase.deliverables.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="rounded-2xl border border-border bg-surface p-4 text-left">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase text-[color:var(--subtle-foreground)]">
            Design Selections
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              `Grid: ${brief.answers.gridSystem}`,
              `Font: ${brief.answers.fontStyle}`,
              `Theme: ${brief.answers.colorTheme}`,
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-border px-3 py-1 font-mono text-[10px] font-bold text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background/95 px-5 pb-8 pt-4 backdrop-blur-sm">
        <div className="mx-auto max-w-md space-y-2.5">
          <Button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="h-12 w-full gap-2 rounded-xl bg-accent text-xs font-bold text-accent-foreground hover:bg-accent/90 sm:text-sm"
          >
            <Download className="h-4 w-4" />
            {pdfLoading ? "Generating PDF…" : "Download PDF"}
          </Button>

          <Button
            onClick={handleCopyText}
            variant="outline"
            className="h-11 w-full gap-2 rounded-xl text-xs font-bold sm:text-sm"
          >
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied to Clipboard!" : "Copy Full Brief"}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
              className="h-11 flex-1 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            {isAdmin && onStartOver ? (
              <Button
                onClick={onStartOver}
                className="h-11 flex-1 rounded-xl text-xs font-semibold"
              >
                New Brief
              </Button>
            ) : (
              <Button
                asChild
                className="h-11 flex-1 rounded-xl bg-accent text-xs font-semibold text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/auth">Sign up for unlimited</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
