import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Sign in — FounderBrief" }],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});
const signUpSchema = signInSchema.extend({
  full_name: z.string().trim().min(1, "Required").max(100),
});
type SignIn = z.infer<typeof signInSchema>;
type SignUp = z.infer<typeof signUpSchema>;

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 bg-surface border-r border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg border border-border bg-background flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-[-0.01em]">FounderBrief</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] max-w-md">
            One brief.<br />Every Monday.<br />No noise.
          </h1>
          <p className="mt-4 text-sm text-[color:var(--subtle-foreground)] max-w-md leading-[1.65]">
            A quiet weekly ritual for founders who'd rather decide than dashboard.
          </p>
        </div>
        <p className="text-xs text-[color:var(--muted-foreground)]">© {new Date().getFullYear()} FounderBrief</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden mb-8 inline-flex items-center gap-2">
            <div className="h-7 w-7 rounded-md border border-border bg-surface flex items-center justify-center">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold tracking-[-0.01em]">FounderBrief</span>
          </Link>

          {signedUpEmail ? (
            <div className="mt-2">
              <h2 className="text-2xl font-bold tracking-[-0.02em]">Check your inbox</h2>
              <p className="mt-2 text-sm text-[color:var(--subtle-foreground)] leading-[1.65]">
                We sent a confirmation link to <span className="font-semibold text-foreground">{signedUpEmail}</span>.
                Click it to activate your account, then sign in.
              </p>
              <button
                onClick={() => { setSignedUpEmail(null); setMode("signin"); }}
                className="mt-6 h-11 w-full rounded-[8px] bg-foreground text-background text-sm font-semibold hover:bg-foreground/90"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-[-0.02em]">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--subtle-foreground)]">
                {mode === "signin" ? "Sign in to read this week's brief." : "Start your weekly brief practice."}
              </p>

              {mode === "signin" ? (
                <SignInForm />
              ) : (
                <SignUpForm onDone={(email) => setSignedUpEmail(email)} />
              )}

              <div className="mt-6 text-sm text-[color:var(--subtle-foreground)]">
                {mode === "signin" ? (
                  <>
                    New here?{" "}
                    <button onClick={() => setMode("signup")} className="font-semibold text-foreground hover:underline">
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => setMode("signin")} className="font-semibold text-foreground hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-[8px] border border-border bg-surface px-3 text-sm placeholder:text-[color:var(--muted-foreground)] focus:outline-none focus:border-foreground focus:bg-background";
const labelCls = "text-xs font-semibold text-[color:var(--subtle-foreground)]";
const errCls = "text-xs text-[color:var(--destructive)] mt-1";

function SignInForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignIn>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(values: SignIn) {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
      <div>
        <label className={labelCls} htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" className={`${inputCls} mt-1.5`} {...register("email")} />
        {errors.email && <p className={errCls}>{errors.email.message}</p>}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls} htmlFor="password">Password</label>
          <Link to="/forgot-password" className="text-xs text-[color:var(--subtle-foreground)] hover:text-foreground">Forgot?</Link>
        </div>
        <input id="password" type="password" autoComplete="current-password" className={`${inputCls} mt-1.5`} {...register("password")} />
        {errors.password && <p className={errCls}>{errors.password.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-[8px] bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function SignUpForm({ onDone }: { onDone: (email: string) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(values: SignUp) {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: values.full_name },
      },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    onDone(values.email);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
      <div>
        <label className={labelCls} htmlFor="full_name">Your name</label>
        <input id="full_name" autoComplete="name" className={`${inputCls} mt-1.5`} {...register("full_name")} />
        {errors.full_name && <p className={errCls}>{errors.full_name.message}</p>}
      </div>
      <div>
        <label className={labelCls} htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" className={`${inputCls} mt-1.5`} {...register("email")} />
        {errors.email && <p className={errCls}>{errors.email.message}</p>}
      </div>
      <div>
        <label className={labelCls} htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="new-password" className={`${inputCls} mt-1.5`} {...register("password")} />
        {errors.password && <p className={errCls}>{errors.password.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-[8px] bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 disabled:opacity-60"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
      <p className="text-[11px] text-[color:var(--muted-foreground)] leading-[1.6]">
        We'll send a confirmation email. Click the link to activate your account.
      </p>
    </form>
  );
}
