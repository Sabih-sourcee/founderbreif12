import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, Pause, X } from "lucide-react";
import { AccentCircle, Sheet, Tap, Waveform } from "../kit";
import { transcribeVoiceRecording } from "../api";
import { useVoiceRecorder } from "../recorder";
import { formatClock } from "../text";
import { COLORS } from "../theme";

export function VoiceNoteSheet({
  visible,
  onClose,
  onTranscript,
}: {
  visible: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}) {
  const rec = useVoiceRecorder();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const wasVisible = useRef(false);

  const begin = async () => {
    setError("");
    const res = await rec.start();
    if (!res.ok) setError(res.error ?? "Couldn't start recording.");
  };

  useEffect(() => {
    if (visible && !wasVisible.current) void begin();
    if (!visible && wasVisible.current) void rec.cancel();
    wasVisible.current = visible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const cancel = async () => {
    await rec.cancel();
    setError("");
    onClose();
  };

  const send = async () => {
    if (busy) return;
    const blob = await rec.stop();
    if (!blob) {
      setError("Nothing was recorded. Tap the mic and try again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const text = (await transcribeVoiceRecording(blob)).trim();
      if (!text) {
        setError("We couldn't hear any speech. Tap the mic and try again.");
      } else {
        onTranscript(text);
        onClose();
      }
    } catch {
      setError("Couldn't transcribe your recording. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const status = busy
    ? "Transcribing…"
    : error
      ? error
      : rec.phase === "recording"
        ? "Recording…"
        : rec.phase === "paused"
          ? "Paused"
          : "Tap the mic to record";

  return (
    <Sheet visible={visible} onClose={cancel}>
      <div className="fb-sheet-title" style={{ textAlign: "center" }}>
        Voice Note
      </div>
      <p
        className="fb-sheet-sub"
        style={{ textAlign: "center", color: error ? COLORS.ink : COLORS.inkMuted }}
      >
        {status}
      </p>
      <Waveform levels={rec.levels} />
      <p className="fb-timer">{formatClock(rec.durationSec)}</p>
      <div className="fb-voice-controls">
        <Tap onPress={cancel} className="fb-side-btn" accessibilityLabel="Cancel recording">
          <X size={24} color={COLORS.ink} />
        </Tap>
        <AccentCircle
          onPress={rec.phase === "idle" ? begin : rec.togglePause}
          disabled={busy}
          size={68}
          accessibilityLabel={rec.phase === "recording" ? "Pause recording" : "Start recording"}
        >
          {rec.phase === "recording" ? (
            <Pause size={30} color={COLORS.ink} />
          ) : (
            <Mic size={30} color={COLORS.ink} />
          )}
        </AccentCircle>
        <Tap
          onPress={send}
          disabled={busy || rec.phase === "idle"}
          className="fb-side-btn"
          style={{ opacity: busy || rec.phase === "idle" ? 0.4 : 1 }}
          accessibilityLabel="Send voice note"
        >
          <ArrowUp size={24} color={COLORS.ink} />
        </Tap>
      </div>
    </Sheet>
  );
}
