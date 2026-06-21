import { useCallback, useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "@tanstack/react-router";

import { AlertCircle } from "lucide-react";



import { BriefResultStep } from "@/components/demo/BriefResultStep";

import { DemoLoadingOverlay } from "@/components/demo/DemoLoadingOverlay";

import { DescribeIdeaStep } from "@/components/demo/DescribeIdeaStep";

import { QuestionsStep } from "@/components/demo/QuestionsStep";

import { Button } from "@/components/ui/button";

import { useProfile } from "@/hooks/use-profile";

import { generateBrief } from "@/lib/demo-api";

import { canGenerateBrief, markDemoUsed } from "@/lib/demo-limit";

import {

  clearDemoSession,

  loadDemoSession,

  saveDemoSession,

  saveDemoBrief,

} from "@/lib/demo-session";

import { useAuth } from "@/lib/auth";

import {

  DEFAULT_BRIEF_ANSWERS,

  LOADING_STEP_MESSAGES,

  type BriefAnswers,

  type BriefApiResponse,

  type ProjectBrief,

} from "@/types/brief";



type DemoStep = "idea" | "questions" | "result";



export function DemoFlow() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const { data: profile } = useProfile();

  const isAdmin = profile?.role === "admin";

  const isPro = profile?.plan === "pro";

  const unlimited = canGenerateBrief(isAdmin, isPro);



  const [step, setStep] = useState<DemoStep>("idea");

  const [idea, setIdea] = useState("");

  const [questionIndex, setQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState<BriefAnswers>({ ...DEFAULT_BRIEF_ANSWERS });

  const [brief, setBrief] = useState<ProjectBrief | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_STEP_MESSAGES[0]);

  const [error, setError] = useState("");

  const [demoBlocked, setDemoBlocked] = useState(false);

  const [sessionRestored, setSessionRestored] = useState(false);



  const backgroundPromiseRef = useRef<Promise<BriefApiResponse> | null>(null);

  const backgroundAnswersRef = useRef<BriefAnswers>({ ...DEFAULT_BRIEF_ANSWERS });



  const startBackgroundGeneration = useCallback((ideaText: string, genAnswers: BriefAnswers) => {

    backgroundAnswersRef.current = genAnswers;

    backgroundPromiseRef.current = generateBrief(ideaText, genAnswers);

  }, []);



  useEffect(() => {

    if (sessionRestored) return;

    const saved = loadDemoSession();

    if (saved) {

      setIdea(saved.idea);

      setAnswers(saved.answers);

      setQuestionIndex(saved.questionIndex);

      setStep(saved.step);

      if (saved.brief) setBrief(saved.brief);

      if (saved.step === "questions" && saved.idea) {

        startBackgroundGeneration(saved.idea, saved.answers);

      }

    }

    setSessionRestored(true);

    setDemoBlocked(!unlimited && saved?.step !== "result");

  }, [sessionRestored, unlimited, startBackgroundGeneration]);



  useEffect(() => {

    if (!sessionRestored) return;

    if (step !== "result") {

      setDemoBlocked(!unlimited);

    }

  }, [unlimited, step, sessionRestored]);



  const finalizeBrief = async (finalAnswers: BriefAnswers) => {

    setIsLoading(true);

    setError("");



    let stepIdx = 0;

    setLoadingMessage(LOADING_STEP_MESSAGES[0]);

    const stepInterval = window.setInterval(() => {

      stepIdx += 1;

      if (stepIdx < LOADING_STEP_MESSAGES.length) {

        setLoadingMessage(LOADING_STEP_MESSAGES[stepIdx]);

      }

    }, 1500);



    try {

      let data: BriefApiResponse;



      const answersMatch =

        JSON.stringify(finalAnswers) === JSON.stringify(backgroundAnswersRef.current);



      if (backgroundPromiseRef.current && answersMatch) {

        data = await backgroundPromiseRef.current;

      } else {

        data = await generateBrief(idea, finalAnswers);

      }



      const generated: ProjectBrief = {

        id: `demo-${Date.now()}`,

        ...data,

        createdAt: new Date().toISOString(),

        originalIdea: idea,

        answers: finalAnswers,

      };



      if (!unlimited) markDemoUsed();

      saveDemoBrief(generated);

      setBrief(generated);

      setStep("result");

    } catch (err) {

      setError(err instanceof Error ? err.message : "An unexpected error occurred.");

    } finally {

      window.clearInterval(stepInterval);

      setIsLoading(false);

    }

  };



  const handleIdeaContinue = (nextIdea: string) => {

    setIdea(nextIdea);

    setStep("questions");

    saveDemoSession({ step: "questions", idea: nextIdea, answers, questionIndex: 0 });

    startBackgroundGeneration(nextIdea, { ...DEFAULT_BRIEF_ANSWERS });

  };



  const handleAnswersChange = (nextAnswers: BriefAnswers) => {
    setAnswers(nextAnswers);
    if (idea) {
      startBackgroundGeneration(idea, nextAnswers);
    }
  };



  if (demoBlocked && step !== "result" && sessionRestored) {

    return (

      <div className="mx-auto max-w-lg px-6 py-20 text-center">

        <h1 className="text-2xl font-bold tracking-tight text-foreground">

          You&apos;ve used your free demo

        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[color:var(--subtle-foreground)]">

          {user

            ? "Upgrade to Pro for unlimited briefs, or contact support for admin access."

            : "Create an account for unlimited briefs, weekly cadence, and PDF exports."}

        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">

          {!user && (

            <Button asChild className="h-11 px-6">

              <Link to="/auth">Create account</Link>

            </Button>

          )}

          <Button asChild variant="outline" className="h-11 px-6">

            <Link to="/">Back to home</Link>

          </Button>

        </div>

      </div>

    );

  }



  return (

    <div className="relative min-h-[70vh]">

      {isLoading && <DemoLoadingOverlay message={loadingMessage} />}



      {error && (

        <div className="mx-auto max-w-2xl px-4 pt-4 sm:px-6">

          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="text-left text-xs">

              <p className="mb-1 font-bold">Brief generation failed</p>

              <p className="font-semibold leading-relaxed">{error}</p>

              <button

                type="button"

                onClick={() => setError("")}

                className="mt-2 rounded border border-red-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase hover:bg-red-100"

              >

                Dismiss

              </button>

            </div>

          </div>

        </div>

      )}



      {step === "idea" && (

        <DescribeIdeaStep

          initialIdea={idea}

          onContinue={handleIdeaContinue}

          onBack={() => navigate({ to: "/" })}

        />

      )}



      {step === "questions" && (

        <QuestionsStep

          idea={idea}

          initialAnswers={answers}

          initialStep={questionIndex}

          onFinish={finalizeBrief}

          onAnswersChange={handleAnswersChange}

        />

      )}



      {step === "result" && brief && (

        <BriefResultStep

          brief={brief}

          isAdmin={isAdmin}

          onStartOver={() => {

            clearDemoSession();

            setStep("idea");

            setIdea("");

            setBrief(null);

            setAnswers({ ...DEFAULT_BRIEF_ANSWERS });

            backgroundPromiseRef.current = null;

          }}

        />

      )}

    </div>

  );

}

