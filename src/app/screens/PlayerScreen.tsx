import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { Card, ScreenFrame, Tap, TopBar } from "../kit";
import { useTtsPlayer } from "../tts";
import { VoiceProfile } from "../types";
import { formatClock } from "../text";
import { COLORS, SHADOW } from "../theme";

const SPEEDS = [0.75, 1, 1.25, 1.5];

function SeekBar({ progress, onSeek }: { progress: number; onSeek: (fraction: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const fractionAt = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
  };

  const shown = dragging ?? progress;
  return (
    <div
      ref={ref}
      className="fb-seek"
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown * 100)}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(fractionAt(e.clientX));
      }}
      onPointerMove={(e) => {
        if (dragging !== null) setDragging(fractionAt(e.clientX));
      }}
      onPointerUp={(e) => {
        const f = fractionAt(e.clientX);
        setDragging(null);
        onSeek(f);
      }}
    >
      <div className="fb-seek-track">
        <div className="fb-seek-fill" style={{ width: `${shown * 100}%` }} />
      </div>
      <div className="fb-seek-knob" style={{ left: `${shown * 100}%` }} />
    </div>
  );
}

export function PlayerScreen({
  title,
  text,
  voice,
  rate,
  onRateChange,
  onSave,
  onBack,
}: {
  title: string;
  text: string;
  voice: VoiceProfile;
  rate: number;
  onRateChange: (rate: number) => void;
  onSave: (durationSec: number) => void;
  onBack: () => void;
}) {
  const player = useTtsPlayer({ text, voice, rate });
  const scroller = useRef<HTMLDivElement>(null);
  const offsets = useRef<number[]>([]);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || player.sentences.length === 0) return;
    started.current = true;
    const t = setTimeout(() => player.play(), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.sentences.length]);

  useEffect(() => {
    const y = offsets.current[player.index];
    if (y !== undefined) scroller.current?.scrollTo({ top: Math.max(0, y - 70), behavior: "smooth" });
  }, [player.index]);

  const progress = player.durationSec > 0 ? player.positionSec / player.durationSec : 0;

  const cycleSpeed = () => {
    const i = SPEEDS.findIndex((s) => Math.abs(s - rate) < 0.01);
    onRateChange(SPEEDS[(i + 1) % SPEEDS.length]);
  };

  return (
    <ScreenFrame>
      <TopBar
        title={`Reading: ${title}`}
        left="back"
        onLeft={onBack}
        rightIcon="download"
        rightLabel="Save to Library"
        onRight={() => onSave(Math.round(player.durationSec * rate))}
      />
      <Card className="fb-doc-card">
        <div ref={scroller} className="fb-scroll" style={{ paddingBottom: 12 }}>
          {player.sentences.map((s, i) => {
            const current = i === player.index;
            return (
              <div
                key={`${i}-${s.slice(0, 10)}`}
                ref={(el) => {
                  if (el) offsets.current[i] = el.offsetTop;
                }}
              >
                <Tap
                  onPress={() => player.jumpTo(i)}
                  accessibilityLabel={`Jump to sentence ${i + 1}`}
                  className="fb-sentence"
                  style={{ background: current ? COLORS.accent : "transparent" }}
                >
                  <span style={{ fontWeight: current ? 600 : 400, fontSize: 17, lineHeight: "26px", color: COLORS.ink }}>
                    {s}
                  </span>
                </Tap>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="fb-player">
        <SeekBar progress={progress} onSeek={(f) => player.seekTo(f * player.durationSec)} />
        <div className="fb-times">
          <span>{formatClock(player.positionSec)}</span>
          <span>{formatClock(player.durationSec)}</span>
        </div>
        <div className="fb-controls">
          <div className="fb-side" />
          <Tap onPress={() => player.skip(-10)} accessibilityLabel="Back 10 seconds" className="fb-skip-btn">
            <RotateCcw size={28} color={COLORS.ink} />
            <span>10</span>
          </Tap>
          <Tap
            onPress={player.toggle}
            className="fb-play-btn"
            style={{ boxShadow: SHADOW }}
            accessibilityLabel={player.isPlaying ? "Pause" : "Play"}
          >
            {player.isPlaying ? (
              <Pause size={34} color={COLORS.white} fill={COLORS.white} />
            ) : (
              <Play size={34} color={COLORS.white} fill={COLORS.white} style={{ marginLeft: 4 }} />
            )}
          </Tap>
          <Tap onPress={() => player.skip(10)} accessibilityLabel="Forward 10 seconds" className="fb-skip-btn">
            <RotateCw size={28} color={COLORS.ink} />
            <span>10</span>
          </Tap>
          <div className="fb-side" style={{ alignItems: "flex-end" }}>
            <Tap onPress={cycleSpeed} accessibilityLabel={`Speed ${rate}x`} className="fb-speed">
              {`${rate}x`}
            </Tap>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
