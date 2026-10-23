import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Crown, Globe, Play, Square, User } from "lucide-react";
import {
  ActionSheet,
  Button,
  ListRow,
  RowLeading,
  ScreenFrame,
  SearchBar,
  Tap,
  TopBar,
} from "../kit";
import { SPOKEN_LANGUAGES, SpokenLanguage, VOICES, VoiceProfile } from "../types";
import { previewVoice, stopSpeech } from "../tts";
import { COLORS } from "../theme";

export function VoiceSelectScreen({
  isPro,
  initialLanguage,
  selectedId,
  recentIds,
  onConfirm,
  onClose,
  onUpgrade,
}: {
  isPro: boolean;
  initialLanguage: SpokenLanguage;
  selectedId?: string;
  recentIds: string[];
  onConfirm: (voice: VoiceProfile) => void;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  const [language, setLanguage] = useState<SpokenLanguage>(initialLanguage);
  const [query, setQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>(selectedId);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      stopSpeech();
      if (previewTimer.current) clearTimeout(previewTimer.current);
    },
    [],
  );

  const q = query.trim().toLowerCase();
  const matches = (v: VoiceProfile) =>
    v.language === language &&
    (!q || v.name.toLowerCase().includes(q) || v.region.toLowerCase().includes(q) || v.gender.toLowerCase().includes(q));

  const filtered = useMemo(() => VOICES.filter(matches), [language, q]);
  const recents = useMemo(
    () =>
      recentIds
        .map((id) => filtered.find((v) => v.id === id))
        .filter((v): v is VoiceProfile => !!v),
    [recentIds, filtered],
  );
  const others = filtered.filter((v) => !recents.some((r) => r.id === v.id));
  const chosen = VOICES.find((v) => v.id === selected);
  const locked = (v: VoiceProfile) => v.isPremium && !isPro;

  const preview = (v: VoiceProfile) => {
    if (previewing === v.id) {
      stopSpeech();
      setPreviewing(null);
      return;
    }
    setPreviewing(v.id);
    void previewVoice(v);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewing(null), 6000);
  };

  const renderRow = (v: VoiceProfile) => {
    const isLocked = locked(v);
    return (
      <ListRow
        key={v.id}
        dimmed={isLocked}
        selected={selected === v.id && !isLocked}
        leading={
          <RowLeading size={50}>
            <User size={28} color={COLORS.ink} />
          </RowLeading>
        }
        title={v.name}
        subtitle={`${v.region}  ·  ${v.gender}`}
        onPress={() => (isLocked ? onUpgrade() : setSelected(v.id))}
        accessibilityLabel={isLocked ? `${v.name}, premium voice, locked` : v.name}
        trailing={
          isLocked ? (
            <Crown size={24} color={COLORS.ink} style={{ margin: "0 8px" }} />
          ) : (
            <Tap
              onPress={() => preview(v)}
              accessibilityLabel={previewing === v.id ? `Stop preview of ${v.name}` : `Preview ${v.name}`}
              className="fb-play-mini"
            >
              {previewing === v.id ? (
                <Square size={14} color={COLORS.white} fill={COLORS.white} />
              ) : (
                <Play size={16} color={COLORS.white} fill={COLORS.white} style={{ marginLeft: 2 }} />
              )}
            </Tap>
          )
        }
      />
    );
  };

  return (
    <ScreenFrame>
      <TopBar title="Select Voice" left="close" onLeft={onClose} />
      <div style={{ marginTop: 16, marginBottom: 18 }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search voices"
          right={
            <Tap onPress={() => setLangOpen(true)} accessibilityLabel={`Language: ${language}`} className="fb-lang-chip">
              <span style={{ fontWeight: 600, fontSize: 14 }}>{language}</span>
              <ChevronDown size={16} color={COLORS.ink} style={{ marginLeft: 4 }} />
            </Tap>
          }
        />
      </div>
      <div className="fb-scroll" style={{ paddingBottom: 8 }}>
        {recents.length > 0 ? (
          <>
            <div className="fb-section">Recently Used</div>
            {recents.map(renderRow)}
          </>
        ) : null}
        {others.length > 0 ? (
          <>
            <div className="fb-section">All Voices</div>
            {others.map(renderRow)}
          </>
        ) : null}
        {filtered.length === 0 ? (
          <p className="fb-empty-copy" style={{ textAlign: "center", marginTop: 30 }}>
            No voices match your search.
          </p>
        ) : null}
      </div>
      <div style={{ paddingTop: 10, paddingBottom: 6 }}>
        <Button label="OK" disabled={!chosen} onPress={() => chosen && onConfirm(chosen)} />
      </div>
      <ActionSheet
        visible={langOpen}
        title="Language"
        onClose={() => setLangOpen(false)}
        options={SPOKEN_LANGUAGES.map((l) => ({
          label: l.label,
          icon: <Globe size={21} color={COLORS.ink} />,
          selected: l.id === language,
          onPress: () => setLanguage(l.id),
        }))}
      />
    </ScreenFrame>
  );
}
