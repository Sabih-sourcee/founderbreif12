import { createFileRoute, Link } from "@tanstack/react-router";

import { LogoLink } from "@/components/Logo";

export const Route = createFileRoute("/privay")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — FounderBrief" },
      {
        name: "description",
        content:
          "How FounderBrief handles your data — local storage, account details, and AI processing.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <LogoLink to="/" size="sm" />
          <Link
            to="/"
            className="text-sm text-[color:var(--subtle-foreground)] transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
          Last updated: June 20, 2026
        </p>

        <div className="mt-12 space-y-10 text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
          <section>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
              Our approach
            </h2>
            <p className="mt-3">
              FounderBrief is built so your work stays with you. We do not collect, store, or
              profile the content you create inside the app on our servers. Your briefs, ideas,
              questionnaire answers, and generated specifications are saved locally on the device
              you use — in your browser or on your phone — not on FounderBrief infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
              What stays on your device
            </h2>
            <p className="mt-3">The following is kept locally on your device only:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Startup ideas and product descriptions you enter</li>
              <li>Questionnaire responses and generated technical briefs</li>
              <li>Demo usage flags (for example, whether you have used the free demo)</li>
              <li>Any brief history or drafts saved while using the app</li>
            </ul>
            <p className="mt-3">
              Clearing your browser data or uninstalling the app removes this information from
              your device. We cannot recover it for you because we never received it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
              What we collect for your account
            </h2>
            <p className="mt-3">
              When you create an account or join the waitlist, we collect only what is needed to
              identify and maintain your user profile:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="font-semibold text-foreground">Email address</strong> — to
                create your account, send product updates, and manage access
              </li>
              <li>
                <strong className="font-semibold text-foreground">Name</strong> — to personalize
                your experience and display your profile in the app
              </li>
            </ul>
            <p className="mt-3">
              We do not sell your email or name to third parties. These details are used solely
              to operate FounderBrief and communicate with you about the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
              AI processing (Google Gemini)
            </h2>
            <p className="mt-3">
              When you generate a brief, use voice input, or submit prompts, that content is sent
              to Google Gemini through our server-side API to produce your technical
              specification. This includes:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Text you type describing your startup idea</li>
              <li>Questionnaire answers you provide</li>
              <li>Voice recordings transcribed in your browser (web) or sent for transcription</li>
            </ul>
            <p className="mt-3">
              Processing happens via our secure API key. We do not permanently store your prompts
              or AI responses on our servers after generation completes. Google&apos;s handling of
              data sent to Gemini is governed by{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-2 hover:text-accent"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
              What we do not do
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>We do not store your brief content on our servers</li>
              <li>We do not use your ideas or prompts for advertising or model training</li>
              <li>We do not share your personal information with data brokers</li>
              <li>We do not track you across other websites</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
              Cookies and local storage
            </h2>
            <p className="mt-3">
              We use browser local storage to remember preferences and demo limits on your
              device. Authentication sessions may use standard cookies or tokens managed by our
              auth provider to keep you signed in. These are functional — not used for ad
              targeting.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
              Your choices
            </h2>
            <p className="mt-3">
              You can delete locally stored data at any time by clearing your browser storage or
              app data. To update or delete your account email and name, contact us or use account
              settings when available. You may opt out of non-essential emails via unsubscribe
              links in any message we send.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">
              Contact
            </h2>
            <p className="mt-3">
              Questions about this policy? Reach us at{" "}
              <a
                href="mailto:hello@founderbrief.app"
                className="font-medium text-foreground underline underline-offset-2 hover:text-accent"
              >
                hello@founderbrief.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-8 text-xs text-[color:var(--muted-foreground)]">
          © {new Date().getFullYear()} FounderBrief
        </div>
      </footer>
    </div>
  );
}
