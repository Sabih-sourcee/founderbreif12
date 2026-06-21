import { Cpu, Loader2, Sparkles } from "lucide-react";

type DemoLoadingOverlayProps = {
  message: string;
};

export function DemoLoadingOverlay({ message }: DemoLoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 p-6 text-center">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
        <Loader2 className="absolute h-16 w-16 animate-spin text-accent" />
        <Cpu className="h-8 w-8 animate-pulse text-foreground" />
      </div>

      <h3 className="mb-2 max-w-sm text-lg font-bold text-foreground">
        Generating your Blueprint...
      </h3>

      <p
        key={message}
        className="max-w-xs animate-in fade-in text-xs font-semibold leading-relaxed text-[color:var(--subtle-foreground)] duration-300"
      >
        {message}
      </p>

      <span className="mt-20 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[color:var(--subtle-foreground)]">
        <Sparkles className="h-3 w-3 text-accent" />
        Powered by Google Gemini
      </span>
    </div>
  );
}
