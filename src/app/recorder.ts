import { useCallback, useEffect, useRef, useState } from "react";

export type RecPhase = "idle" | "recording" | "paused";

export function useVoiceRecorder() {
  const [phase, setPhase] = useState<RecPhase>("idle");
  const [levels, setLevels] = useState<number[]>([]);
  const [durationSec, setDurationSec] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const tickRef = useRef<number>(0);
  const startedAt = useRef(0);
  const elapsed = useRef(0);

  const stopMeters = () => {
    cancelAnimationFrame(rafRef.current);
    clearInterval(tickRef.current);
  };

  const cleanupStream = () => {
    stopMeters();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    mediaRef.current = null;
  };

  const sample = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    setLevels((prev) => [...prev, Math.min(1, rms * 4)].slice(-48));
    rafRef.current = requestAnimationFrame(sample);
  }, []);

  const start = async (): Promise<{ ok: boolean; error?: string }> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return { ok: false, error: "Microphone isn't available in this browser." };
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mediaRef.current = rec;
      rec.start(120);

      const audioCtx = new AudioContext();
      ctxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      sample();

      startedAt.current = Date.now();
      elapsed.current = 0;
      setDurationSec(0);
      tickRef.current = window.setInterval(() => {
        setDurationSec((Date.now() - startedAt.current + elapsed.current) / 1000);
      }, 200);
      setPhase("recording");
      return { ok: true };
    } catch {
      cleanupStream();
      return { ok: false, error: "Microphone permission was denied." };
    }
  };

  const togglePause = async () => {
    const rec = mediaRef.current;
    if (!rec) return;
    if (phase === "recording") {
      rec.pause();
      elapsed.current += Date.now() - startedAt.current;
      stopMeters();
      setPhase("paused");
    } else if (phase === "paused") {
      rec.resume();
      startedAt.current = Date.now();
      sample();
      tickRef.current = window.setInterval(() => {
        setDurationSec((Date.now() - startedAt.current + elapsed.current) / 1000);
      }, 200);
      setPhase("recording");
    }
  };

  const stop = async (): Promise<Blob | null> => {
    const rec = mediaRef.current;
    if (!rec || rec.state === "inactive") {
      cleanupStream();
      setPhase("idle");
      return null;
    }
    const blob = await new Promise<Blob | null>((resolve) => {
      rec.onstop = () => {
        const type = rec.mimeType || "audio/webm";
        const out = chunksRef.current.length ? new Blob(chunksRef.current, { type }) : null;
        resolve(out);
      };
      try {
        rec.stop();
      } catch {
        resolve(null);
      }
    });
    cleanupStream();
    setPhase("idle");
    setLevels([]);
    return blob;
  };

  const cancel = async () => {
    try {
      if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    } catch {
      /* ignore */
    }
    chunksRef.current = [];
    cleanupStream();
    setPhase("idle");
    setLevels([]);
    setDurationSec(0);
  };

  useEffect(() => () => void cancel(), []);

  return { phase, levels, durationSec, start, togglePause, stop, cancel };
}
