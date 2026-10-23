import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SPOKEN_LANGUAGES, VoiceProfile } from "./types";
import { splitSentences, stripMarkdown } from "./text";

const EST_CHARS_PER_SEC = 15;

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  const existing = window.speechSynthesis?.getVoices() ?? [];
  if (existing.length) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const done = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 600);
  });
}

function pickVoice(profile: VoiceProfile, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const locale = profile.locale.toLowerCase();
  const lang = locale.split("-")[0];
  const sameLang = voices.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(lang));
  if (!sameLang.length) return voices[0];
  const exact = sameLang.filter((v) => v.lang.toLowerCase().replace("_", "-") === locale);
  const pool = exact.length ? exact : sameLang;
  const wantFemale = profile.gender === "Female";
  const byGender = pool.filter((v) => {
    const n = v.name.toLowerCase();
    return wantFemale ? /female|woman|zira|samantha|sara|google uk english female/.test(n) : /male|david|daniel|google uk english male/.test(n);
  });
  return (byGender[0] ?? pool[0]) as SpeechSynthesisVoice;
}

export async function previewVoice(voice: VoiceProfile): Promise<void> {
  if (!window.speechSynthesis) return;
  const line = SPOKEN_LANGUAGES.find((l) => l.id === voice.language)?.previewLine ?? "Hello";
  window.speechSynthesis.cancel();
  const voices = await waitForVoices();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.lang = voice.locale;
  utterance.pitch = voice.pitch;
  utterance.rate = 1;
  const picked = pickVoice(voice, voices);
  if (picked) utterance.voice = picked;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  window.speechSynthesis?.cancel();
}

export function useTtsPlayer({
  text,
  voice,
  rate,
}: {
  text: string;
  voice: VoiceProfile | undefined;
  rate: number;
}) {
  const sentences = useMemo(() => splitSentences(stripMarkdown(text)), [text]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const gen = useRef(0);
  const indexRef = useRef(0);
  const rateRef = useRef(rate);
  const voiceRef = useRef(voice);
  const playingRef = useRef(false);
  const startedAt = useRef(0);
  const basePos = useRef(0);

  rateRef.current = rate;
  voiceRef.current = voice;
  indexRef.current = index;

  const durationSec = useMemo(
    () => Math.max(3, sentences.join(" ").length / (EST_CHARS_PER_SEC * Math.max(0.5, rate))),
    [sentences, rate],
  );

  const sentenceOffset = useCallback(
    (i: number) => {
      const before = sentences.slice(0, i).join(" ").length;
      return (before / Math.max(1, sentences.join(" ").length)) * durationSec;
    },
    [sentences, durationSec],
  );

  const speakAt = useCallback(
    async (i: number) => {
      if (!window.speechSynthesis || !sentences[i]) {
        setIsPlaying(false);
        playingRef.current = false;
        return;
      }
      window.speechSynthesis.cancel();
      const voices = await waitForVoices();
      const current = voiceRef.current;
      const utterance = new SpeechSynthesisUtterance(sentences[i]);
      if (current) {
        utterance.lang = current.locale;
        utterance.pitch = current.pitch;
        const picked = pickVoice(current, voices);
        if (picked) utterance.voice = picked;
      }
      utterance.rate = rateRef.current;
      const myGen = gen.current;
      utterance.onend = () => {
        if (gen.current !== myGen) return;
        const next = i + 1;
        if (next >= sentences.length) {
          setIndex(sentences.length - 1);
          setIsPlaying(false);
          playingRef.current = false;
          setPositionSec(durationSec);
          return;
        }
        setIndex(next);
        indexRef.current = next;
        basePos.current = sentenceOffset(next);
        startedAt.current = Date.now();
        void speakAt(next);
      };
      utterance.onerror = () => {
        if (gen.current !== myGen) return;
        setIsPlaying(false);
        playingRef.current = false;
      };
      window.speechSynthesis.speak(utterance);
    },
    [sentences, durationSec, sentenceOffset],
  );

  const play = useCallback(() => {
    if (!sentences.length) return;
    gen.current += 1;
    playingRef.current = true;
    setIsPlaying(true);
    basePos.current = sentenceOffset(indexRef.current);
    startedAt.current = Date.now();
    void speakAt(indexRef.current);
  }, [sentences.length, sentenceOffset, speakAt]);

  const pause = useCallback(() => {
    gen.current += 1;
    window.speechSynthesis?.cancel();
    playingRef.current = false;
    setIsPlaying(false);
    setPositionSec(basePos.current + ((Date.now() - startedAt.current) / 1000) * rateRef.current);
  }, []);

  const toggle = useCallback(() => {
    if (playingRef.current) pause();
    else play();
  }, [pause, play]);

  const jumpTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(sentences.length - 1, i));
      setIndex(clamped);
      indexRef.current = clamped;
      basePos.current = sentenceOffset(clamped);
      setPositionSec(basePos.current);
      if (playingRef.current) {
        gen.current += 1;
        startedAt.current = Date.now();
        void speakAt(clamped);
      }
    },
    [sentences.length, sentenceOffset, speakAt],
  );

  const seekTo = useCallback(
    (sec: number) => {
      const fraction = Math.max(0, Math.min(1, sec / Math.max(1, durationSec)));
      const i = Math.min(sentences.length - 1, Math.floor(fraction * sentences.length));
      jumpTo(i);
    },
    [durationSec, sentences.length, jumpTo],
  );

  const skip = useCallback(
    (deltaSec: number) => {
      seekTo(positionSec + deltaSec);
    },
    [positionSec, seekTo],
  );

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      const live = basePos.current + ((Date.now() - startedAt.current) / 1000) * rateRef.current;
      setPositionSec(Math.min(durationSec, live));
    }, 200);
    return () => clearInterval(t);
  }, [isPlaying, durationSec]);

  useEffect(() => {
    return () => {
      gen.current += 1;
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    sentences,
    index,
    isPlaying,
    positionSec,
    durationSec,
    play,
    pause,
    toggle,
    jumpTo,
    seekTo,
    skip,
  };
}
