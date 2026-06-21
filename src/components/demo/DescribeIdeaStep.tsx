import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Lightbulb, Mic, MicOff } from "lucide-react";

import { EXAMPLE_IDEAS } from "@/types/brief";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type DescribeIdeaStepProps = {
  initialIdea: string;
  onContinue: (idea: string) => void;
  onBack: () => void;
};

export function DescribeIdeaStep({ initialIdea, onContinue, onBack }: DescribeIdeaStepProps) {
  const [idea, setIdea] = useState(initialIdea);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionCtor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const rec = new SpeechRecognitionCtor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event: { results: { length: number; [index: number]: { 0: { transcript: string } } } }) => {
      const lastResultIndex = event.results.length - 1;
      const text = event.results[lastResultIndex][0]?.transcript ?? "";
      setIdea((prev) => {
        const updated = prev ? `${prev} ${text}` : text;
        return updated.slice(0, 500);
      });
    };

    rec.onerror = () => {
      setMicError("Microphone error occurred. Please type instead.");
      setIsListening(false);
    };

    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      setMicError("Voice dictation is unsupported in this browser. Please type your idea.");
      setTimeout(() => setMicError(""), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setMicError("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setMicError("Unable to activate mic. Check site permissions.");
      setTimeout(() => setMicError(""), 4000);
    }
  };

  const charCount = idea.length;
  const isOverLimit = charCount > 500;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col justify-between px-4 py-6 sm:px-6">
      <div className="space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 self-start py-1 text-xs font-semibold text-[color:var(--subtle-foreground)] transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <section className="space-y-1 text-left">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            What are you building?
          </h1>
          <p className="text-xs leading-relaxed text-[color:var(--subtle-foreground)] sm:text-sm">
            Tell us about your product vision. We&apos;ll turn your idea into a professional CTO
            strategy brief.
          </p>
        </section>

        <div className="relative flex w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-4 transition-all focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground/10">
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={6}
            className="resize-none border-none bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:ring-0 sm:text-base"
            placeholder="e.g., I want a laundry delivery app in Karachi with rider tracking and online payments..."
            maxLength={600}
          />

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span
              className={`font-mono text-[11px] font-semibold ${isOverLimit ? "text-red-600" : "text-[color:var(--subtle-foreground)]"}`}
            >
              {charCount} / 500 characters
            </span>

            <div className="flex items-center gap-2">
              {isListening && (
                <span className="animate-pulse font-mono text-[11px] font-bold text-accent">
                  Listening...
                </span>
              )}
              <button
                type="button"
                onClick={handleMicToggle}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all sm:h-11 sm:w-11 ${
                  isListening
                    ? "border-red-200 bg-red-50 text-red-600 shadow-md shadow-red-200/50"
                    : "border-border bg-background text-foreground hover:bg-surface"
                }`}
                title="Dictate with voice input"
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {micError && (
          <p className="flex items-center gap-1 text-xs font-semibold text-red-600">
            <AlertTriangle className="h-4 w-4" />
            {micError}
          </p>
        )}

        <section className="space-y-2">
          <p className="eyebrow">Example prompts — click to fill</p>
          <div className="grid gap-2">
            {EXAMPLE_IDEAS.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => setIdea(example.text)}
                className="rounded-xl border border-dashed border-border bg-background/50 p-4 text-left transition-colors hover:bg-surface/30"
              >
                <div className="mb-1 flex items-center gap-1.5 text-accent">
                  <Lightbulb className="h-4 w-4" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                    {example.label}
                  </span>
                </div>
                <p className="text-xs italic leading-relaxed text-[color:var(--subtle-foreground)]">
                  &ldquo;{example.text}&rdquo;
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-8 pt-4">
        <Button
          onClick={() => onContinue(idea)}
          disabled={!idea.trim() || isOverLimit}
          className="h-14 w-full gap-2 rounded-xl text-xs font-bold sm:text-sm"
        >
          Continue Questionnaire
          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: unknown) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
