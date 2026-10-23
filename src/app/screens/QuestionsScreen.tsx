import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, RotateCcw, SkipForward, Square, Zap } from "lucide-react";
import {
  AccentCircle,
  ActionSheet,
  ChatBubble,
  Composer,
  ProgressBar,
  ScreenFrame,
  TopBar,
} from "../kit";
import { getQuestions } from "../questions";
import { useVoiceRecorder } from "../recorder";
import { transcribeVoiceRecording } from "../api";
import { DocumentOutputType } from "../types";
import { COLORS } from "../theme";

export function QuestionsScreen({
  docType,
  initialAnswers,
  onProgress,
  onFinish,
  onGenerateNow,
  onRestart,
  onBack,
  onNotice,
}: {
  docType: DocumentOutputType;
  initialAnswers: string[];
  onProgress: (answers: string[]) => void;
  onFinish: (answers: string[]) => void;
  onGenerateNow: (answers: string[]) => void;
  onRestart: () => void;
  onBack: () => void;
  onNotice: (message: string) => void;
}) {
  const questions = getQuestions(docType);
  const total = questions.length;
  const [answers, setAnswers] = useState<string[]>(() => initialAnswers.slice(0, total));
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const rec = useVoiceRecorder();
  const scroller = useRef<HTMLDivElement>(null);
  const step = Math.min(answers.length, total - 1);

  useEffect(() => {
    const t = setTimeout(() => {
      scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
    }, 60);
    return () => clearTimeout(t);
  }, [answers.length]);

  const commit = (value: string) => {
    const next = [...answers, value];
    setAnswers(next);
    setDraft("");
    onProgress(next);
    if (next.length >= total) onFinish(next);
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || transcribing) return;
    commit(text);
  };

  const toggleMic = async () => {
    if (transcribing) return;
    if (rec.phase !== "idle") {
      const blob = await rec.stop();
      if (!blob) return;
      setTranscribing(true);
      try {
        const text = (await transcribeVoiceRecording(blob)).trim();
        if (text) setDraft((d) => (d ? `${d} ${text}` : text));
        else onNotice("We couldn't hear any speech. Try again or type your answer.");
      } catch {
        onNotice("Couldn't transcribe that. Check your connection or type your answer.");
      } finally {
        setTranscribing(false);
      }
      return;
    }
    const res = await rec.start();
    if (!res.ok) onNotice(res.error ?? "Couldn't start recording.");
  };

  const answered = answers.length;
  const done = answered >= total;
  const shownQuestions = questions.slice(0, Math.min(answered + 1, total));
  const progress = Math.min(total, answered + 1) / total;
  const recording = rec.phase !== "idle";

  return (
    <ScreenFrame>
      <TopBar
        title="Calibration Questions"
        left="back"
        onLeft={onBack}
        rightIcon="more"
        onRight={() => setMenuOpen(true)}
      />
      <p className="fb-step-label">{`Question ${step + 1} of ${total}`}</p>
      <ProgressBar progress={progress} height={10} className="fb-q-progress" />

      <div className="fb-col">
        <div ref={scroller} className="fb-scroll" style={{ paddingBottom: 14 }}>
          {shownQuestions.map((q, i) => (
            <div key={q}>
              <ChatBubble variant="ai" text={q} />
              {i < answered ? <ChatBubble variant="user" text={answers[i] ? answers[i] : "Skipped"} /> : null}
            </div>
          ))}
        </div>
        <div className="fb-composer-wrap" style={{ paddingBottom: 14 }}>
          <Composer
            value={draft}
            onChangeText={setDraft}
            placeholder={
              transcribing
                ? "Transcribing…"
                : recording
                  ? "Listening… tap to finish"
                  : "Type or speak your answer…"
            }
            editable={!recording && !transcribing && !done}
            onSubmit={submit}
            trailing={
              draft.trim() && !recording ? (
                <AccentCircle onPress={submit} accessibilityLabel="Send answer">
                  <ArrowUp size={22} color={COLORS.ink} />
                </AccentCircle>
              ) : (
                <AccentCircle
                  onPress={toggleMic}
                  dark={recording}
                  accessibilityLabel={recording ? "Stop recording" : "Record answer"}
                >
                  {recording ? <Square size={18} color={COLORS.white} fill={COLORS.white} /> : <Mic size={22} color={COLORS.ink} />}
                </AccentCircle>
              )
            }
          />
        </div>
      </div>

      <ActionSheet
        visible={menuOpen}
        title="Calibration"
        onClose={() => setMenuOpen(false)}
        options={[
          {
            label: "Skip this question",
            icon: <SkipForward size={21} color={COLORS.ink} />,
            onPress: () => commit(""),
          },
          {
            label: "Generate now with what I have",
            icon: <Zap size={21} color={COLORS.ink} />,
            onPress: () => onGenerateNow(answers),
          },
          { label: "Start over", icon: <RotateCcw size={21} color={COLORS.ink} />, onPress: onRestart },
        ]}
      />
    </ScreenFrame>
  );
}
