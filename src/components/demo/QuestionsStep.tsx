import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  Cpu,
  CreditCard,
  Grid3x3,
  Hourglass,
  Laptop,
  LayoutGrid,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Palette,
  Smartphone,
  Type,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateDemoAnswers } from "@/lib/demo-session";
import { DEFAULT_BRIEF_ANSWERS, type BriefAnswers } from "@/types/brief";

type QuestionsStepProps = {
  idea: string;
  initialAnswers?: BriefAnswers;
  initialStep?: number;
  onFinish: (answers: BriefAnswers) => void;
  onAnswersChange?: (answers: BriefAnswers) => void;
};

type OptionConfig = {
  value: string;
  label: string;
  icon: LucideIcon;
};

type QuestionConfig = {
  id: string;
  field: keyof BriefAnswers;
  detailField: keyof BriefAnswers;
  prompt: string;
  options: OptionConfig[];
  placeholder: string;
};

function getFontOptions(platform: BriefAnswers["platform"]): OptionConfig[] {
  const mobile = platform !== "Both";
  if (mobile) {
    return [
      { value: "Modern Sans-Serif", label: "Modern Sans", icon: Type },
      { value: "Humanist Rounded", label: "Humanist Rounded", icon: Type },
      { value: "Geometric Display", label: "Geometric Display", icon: Type },
    ];
  }
  return [
    { value: "Modern Sans-Serif", label: "Modern Sans", icon: Type },
    { value: "Editorial Serif", label: "Editorial Serif", icon: Type },
    { value: "Tech Mono", label: "Tech Mono", icon: Type },
  ];
}

function getColorOptions(platform: BriefAnswers["platform"]): OptionConfig[] {
  const mobile = platform !== "Both";
  if (mobile) {
    return [
      { value: "Warm Neutral", label: "Warm Neutral", icon: Palette },
      { value: "Bold Vibrant", label: "Bold Vibrant", icon: Palette },
      { value: "Dark Professional", label: "Dark Pro", icon: Palette },
    ];
  }
  return [
    { value: "Warm Neutral", label: "Warm Neutral", icon: Palette },
    { value: "Ocean Blue", label: "Ocean Blue", icon: Palette },
    { value: "Classic Corporate", label: "Classic Corp", icon: Briefcase },
  ];
}

function buildQuestions(answers: BriefAnswers): QuestionConfig[] {
  return [
    {
      id: "platform",
      field: "platform",
      detailField: "platformDetails",
      prompt: "What platforms are you prioritizing for your initial launch?",
      options: [
        { value: "Android", label: "Android Only", icon: Smartphone },
        { value: "iPhone", label: "iPhone Only", icon: Smartphone },
        { value: "Both", label: "Cross-Platform", icon: Laptop },
      ],
      placeholder: "e.g., Offline mode, real-time sync, or specific hardware integrations...",
    },
    {
      id: "auth",
      field: "auth",
      detailField: "authDetails",
      prompt: "How will your target users log in and register profiles?",
      options: [
        { value: "Email & Password", label: "Email / Pass", icon: Mail },
        { value: "Social Accounts", label: "Social OAuth", icon: User },
        { value: "No authentication", label: "No Auth Needed", icon: Lock },
      ],
      placeholder: "e.g., custom profiles, multi-factor auth (MFA), passwordless verification...",
    },
    {
      id: "integrations",
      field: "integrations",
      detailField: "integrationsDetails",
      prompt: "Are there third-party tools or external APIs to link up?",
      options: [
        { value: "Payments", label: "Payments", icon: CreditCard },
        { value: "Maps & Location", label: "Map/Routes API", icon: MapPin },
        { value: "AI or Messaging", label: "Custom GenAI", icon: Cpu },
      ],
      placeholder: "e.g., Stripe Connect split-payments, shipment trackers, Google Maps SDK...",
    },
    {
      id: "grid",
      field: "gridSystem",
      detailField: "gridDetails",
      prompt: "Which grid system best fits your app's layout structure?",
      options: [
        { value: "3x3", label: "3×3 Grid", icon: Grid3x3 },
        { value: "3x4", label: "3×4 Grid", icon: LayoutGrid },
        { value: "1x2", label: "1×2 Split", icon: LayoutGrid },
      ],
      placeholder: "e.g., card-based dashboard, list-detail split, masonry layout preferences...",
    },
    {
      id: "font",
      field: "fontStyle",
      detailField: "fontDetails",
      prompt: "Which font style matches your app's personality?",
      options: getFontOptions(answers.platform),
      placeholder: "e.g., specific Google Font names, heading vs body font pairing...",
    },
    {
      id: "color",
      field: "colorTheme",
      detailField: "colorDetails",
      prompt: "Which color theme fits your brand identity?",
      options: getColorOptions(answers.platform),
      placeholder: "e.g., specific brand hex codes, dark-mode default, accent color preferences...",
    },
    {
      id: "timeline",
      field: "timeline",
      detailField: "timelineDetails",
      prompt: "What timeline is targeted for your MVP release?",
      options: [
        { value: "Sprints MVP (1-2 months)", label: "MVP (1-2 mo)", icon: Hourglass },
        { value: "Full Release (3-6 months)", label: "Core (3-6 mo)", icon: Calendar },
        { value: "Enterprise Scale (6+ months)", label: "Scale (6+ mo)", icon: Zap },
      ],
      placeholder: "e.g., fixed target investor demo date, modular milestones, budget constraints...",
    },
  ];
}

export function QuestionsStep({
  idea,
  initialAnswers,
  initialStep = 0,
  onFinish,
  onAnswersChange,
}: QuestionsStepProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [answers, setAnswers] = useState<BriefAnswers>(
    initialAnswers ?? { ...DEFAULT_BRIEF_ANSWERS },
  );

  const questions = buildQuestions(answers);
  const question = questions[currentStep];
  const percentComplete = Math.round(((currentStep + 1) / questions.length) * 100);
  const selectedValue = answers[question.field] as string;
  const detailValue = answers[question.detailField] as string;

  const persistAnswers = useCallback(
    (next: BriefAnswers, step: number) => {
      updateDemoAnswers(next, step);
      onAnswersChange?.(next);
    },
    [onAnswersChange],
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your questionnaire progress will be saved, but leaving now may interrupt brief generation.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleOptionSelect = (val: string) => {
    const next = { ...answers, [question.field]: val };
    setAnswers(next);
    persistAnswers(next, currentStep);
  };

  const handleDetailChange = (val: string) => {
    const next = { ...answers, [question.detailField]: val };
    setAnswers(next);
    persistAnswers(next, currentStep);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      persistAnswers(answers, nextStep);
      return;
    }
    onFinish(answers);
  };

  const handlePrevStepClick = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      persistAnswers(answers, prevStep);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col justify-between px-4 py-6 sm:px-6">
      <div>
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handlePrevStepClick}
            className="mb-5 flex items-center gap-1.5 py-1 text-xs font-semibold text-[color:var(--subtle-foreground)] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous question
          </button>
        )}

        <div className="mb-8 w-full">
          <div className="mb-2 flex items-end justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[color:var(--subtle-foreground)]">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="font-mono text-xs font-extrabold text-accent">
              {percentComplete}% Complete
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        <div className="w-full space-y-6">
          <div className="space-y-1.5 text-left">
            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-foreground sm:text-2xl">
              Let&apos;s clarify your project details.
            </h1>
            <p className="text-xs font-normal leading-relaxed text-[color:var(--subtle-foreground)] sm:text-sm">
              {question.prompt}
            </p>
            {idea && (
              <p className="mt-1 truncate text-[10px] italic text-[color:var(--muted-foreground)]">
                Building: &ldquo;{idea.length > 80 ? idea.slice(0, 80) + "…" : idea}&rdquo;
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {question.options.map((opt) => {
              const isActive = selectedValue === opt.value;
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleOptionSelect(opt.value)}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-4 py-4 transition-all ${
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface text-foreground hover:border-foreground/30 hover:bg-surface/80"
                  }`}
                >
                  <OptIcon
                    className={`h-5 w-5 ${isActive ? "text-accent" : "text-[color:var(--muted-foreground)]"}`}
                  />
                  <span className="whitespace-nowrap text-xs font-bold tracking-tight">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2 text-left">
            <label
              className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[color:var(--subtle-foreground)]"
              htmlFor={`details-textarea-${question.id}`}
            >
              Any specific technical requirements or details?
            </label>
            <Textarea
              id={`details-textarea-${question.id}`}
              value={detailValue}
              onChange={(e) => handleDetailChange(e.target.value)}
              rows={3}
              placeholder={question.placeholder}
              className="rounded-xl border-border bg-surface text-sm"
            />
          </div>
        </div>
      </div>

      <footer className="mt-8 pt-4">
        <div className="flex w-full flex-col items-center gap-3">
          <Button
            onClick={handleNext}
            className="h-14 w-full gap-2 rounded-xl bg-accent text-xs font-bold text-accent-foreground hover:bg-accent/90 sm:text-sm"
          >
            {currentStep === questions.length - 1 ? "View Project Brief" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="pointer-events-none mt-8 select-none opacity-65">
          <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface p-4">
            <div className="flex flex-col items-center gap-1 text-center text-[color:var(--muted-foreground)]">
              <Lightbulb className="h-4 w-4 text-accent" />
              <p className="max-w-xs font-mono text-[9px] font-semibold uppercase tracking-wider">
                Your brief is being generated in the background while you answer.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
