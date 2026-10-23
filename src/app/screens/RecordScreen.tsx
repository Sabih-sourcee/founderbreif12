import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, Trash2 } from "lucide-react";
import {
  AccentCircle,
  ActionSheet,
  Button,
  ChatBubble,
  Composer,
  DayPill,
  FilterChip,
  ScreenFrame,
  Tap,
  TopBar,
} from "../kit";
import { VoiceNoteSheet } from "../components/VoiceNoteSheet";
import { DOCUMENT_OUTPUT_TYPES, DocumentOutputType, SPOKEN_LANGUAGES, SpokenLanguage } from "../types";
import { CALIBRATION_QUESTIONS } from "../questions";
import { COLORS } from "../theme";

export function RecordScreen({
  messages,
  docType,
  language,
  onChangeDocType,
  onChangeLanguage,
  onAddMessage,
  onClear,
  onCreateNow,
  onAnswerQuestions,
  onBack,
}: {
  messages: string[];
  docType: DocumentOutputType;
  language: SpokenLanguage;
  onChangeDocType: (t: DocumentOutputType) => void;
  onChangeLanguage: (l: SpokenLanguage) => void;
  onAddMessage: (text: string) => void;
  onClear: () => void;
  onCreateNow: () => void;
  onAnswerQuestions: () => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
    }, 60);
    return () => clearTimeout(t);
  }, [messages.length]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAddMessage(text);
    setDraft("");
  };

  const hasIdea = messages.length > 0;
  const questionCount = CALIBRATION_QUESTIONS[docType].length;

  return (
    <ScreenFrame>
      <TopBar
        title="Describe Your Idea"
        left="back"
        onLeft={onBack}
        rightIcon="more"
        onRight={() => setMenuOpen(true)}
      />

      <div className="fb-col">
        <div ref={scroller} className="fb-scroll fb-thread">
          <DayPill label="today" />
          <ChatBubble
            variant="ai"
            text="Tell me about your idea. Speak or type it, as much or as little as you like."
          />
          {messages.map((m, i) => (
            <ChatBubble key={`${i}-${m.slice(0, 12)}`} variant="user" text={m} />
          ))}

          {!hasIdea ? (
            <div className="fb-mic-block">
              <Tap onPress={() => setVoiceOpen(true)} className="fb-big-mic" accessibilityLabel="Start voice note">
                <Mic size={56} color={COLORS.ink} />
              </Tap>
              <p style={{ color: COLORS.inkMuted, marginTop: 16, textAlign: "center", fontSize: 16 }}>
                Tap the mic to start talking
              </p>
            </div>
          ) : (
            <>
              <div className="fb-options">
                <div className="fb-options-title">What should I create?</div>
                <div className="fb-group-label">Language</div>
                <div className="fb-chips-row">
                  {SPOKEN_LANGUAGES.map((l) => (
                    <FilterChip
                      small
                      key={l.id}
                      label={l.label}
                      active={language === l.id}
                      onPress={() => onChangeLanguage(l.id)}
                    />
                  ))}
                </div>
                <div className="fb-group-label">Document</div>
                <div className="fb-chips-row">
                  {DOCUMENT_OUTPUT_TYPES.map((d) => (
                    <FilterChip
                      small
                      key={d.id}
                      label={d.shortLabel}
                      active={docType === d.id}
                      onPress={() => onChangeDocType(d.id)}
                    />
                  ))}
                </div>
              </div>
              <Button
                label={`Answer ${questionCount} quick questions`}
                onPress={onAnswerQuestions}
                className="fb-mt-18"
              />
              <Tap onPress={onCreateNow} className="fb-skip" accessibilityLabel="Skip questions and create now">
                <span className="fb-skip-text">Skip and create now</span>
              </Tap>
            </>
          )}
        </div>

        <div className="fb-composer-wrap">
          <Composer
            value={draft}
            onChangeText={setDraft}
            placeholder={hasIdea ? "Add more detail…" : "Describe your idea…"}
            onSubmit={submit}
            trailing={
              draft.trim() ? (
                <AccentCircle onPress={submit} accessibilityLabel="Send">
                  <ArrowUp size={22} color={COLORS.ink} />
                </AccentCircle>
              ) : (
                <AccentCircle onPress={() => setVoiceOpen(true)} accessibilityLabel="Record voice note">
                  <Mic size={22} color={COLORS.ink} />
                </AccentCircle>
              )
            }
          />
        </div>
      </div>

      <VoiceNoteSheet visible={voiceOpen} onClose={() => setVoiceOpen(false)} onTranscript={onAddMessage} />
      <ActionSheet
        visible={menuOpen}
        title="Conversation"
        onClose={() => setMenuOpen(false)}
        options={[{ label: "Clear conversation", icon: <Trash2 size={21} color={COLORS.ink} />, onPress: onClear }]}
      />
    </ScreenFrame>
  );
}
