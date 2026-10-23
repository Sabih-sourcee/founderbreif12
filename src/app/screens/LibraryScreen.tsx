import { useMemo, useState } from "react";
import { AudioLines, FileText, Folder, MoreVertical, Play, Search, Trash2, Volume2, X } from "lucide-react";
import {
  ActionSheet,
  Button,
  Card,
  CircleButton,
  FilterChip,
  ListRow,
  RowLeading,
  ScreenFrame,
  ScreenTitle,
  SearchBar,
  Tap,
} from "../kit";
import { ProjectBrief } from "../types";
import { formatClock, shortDate } from "../text";
import { COLORS } from "../theme";

type Filter = "All" | "Documents" | "Audio";
const FILTERS: Filter[] = ["All", "Documents", "Audio"];

export function LibraryScreen({
  briefs,
  onOpen,
  onReadAloud,
  onDelete,
  onRecord,
}: {
  briefs: ProjectBrief[];
  onOpen: (brief: ProjectBrief) => void;
  onReadAloud: (brief: ProjectBrief) => void;
  onDelete: (brief: ProjectBrief) => void;
  onRecord: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<ProjectBrief | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...briefs]
      .filter((b) => {
        const isAudio = b.direction === "doc-to-voice";
        if (filter === "Documents" && isAudio) return false;
        if (filter === "Audio" && !isAudio) return false;
        if (!q) return true;
        return b.title.toLowerCase().includes(q) || b.documentType.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [briefs, filter, query]);

  const confirmDelete = (b: ProjectBrief) => {
    if (window.confirm(`Delete "${b.title}" from this device?`)) onDelete(b);
  };

  const sheetOptions = target
    ? [
        {
          label: target.direction === "doc-to-voice" ? "Play again" : "Open",
          icon: <Play size={21} color={COLORS.ink} />,
          onPress: () => onOpen(target),
        },
        ...(target.direction === "voice-to-doc"
          ? [
              {
                label: "Read aloud",
                icon: <Volume2 size={21} color={COLORS.ink} />,
                onPress: () => onReadAloud(target),
              },
            ]
          : []),
        {
          label: "Delete",
          icon: <Trash2 size={21} color={COLORS.ink} />,
          onPress: () => confirmDelete(target),
        },
      ]
    : [];

  return (
    <ScreenFrame>
      <ScreenTitle
        title="Library"
        right={
          <CircleButton
            onPress={() => {
              if (searching) setQuery("");
              setSearching((s) => !s);
            }}
            accessibilityLabel={searching ? "Close search" : "Search library"}
          >
            {searching ? <X size={22} color={COLORS.ink} /> : <Search size={22} color={COLORS.ink} />}
          </CircleButton>
        }
      />

      {searching ? (
        <div style={{ marginTop: 12 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search your library" autoFocus />
        </div>
      ) : null}

      <div className="fb-lib-chips">
        {FILTERS.map((f) => (
          <FilterChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </div>

      <div className="fb-scroll" style={{ paddingBottom: 12 }}>
        {items.length === 0 ? (
          <Card>
            <div className="fb-empty">
              <RowLeading tone="accent" size={64}>
                <Folder size={32} color={COLORS.ink} />
              </RowLeading>
              <div className="fb-empty-title">{briefs.length === 0 ? "Nothing saved yet" : "No matches"}</div>
              <p className="fb-empty-copy" style={{ textAlign: "center" }}>
                {briefs.length === 0
                  ? "Documents you create and audio you save will show up here."
                  : "Try a different filter or search."}
              </p>
              {briefs.length === 0 ? (
                <Button label="Record your first idea" onPress={onRecord} className="fb-mt-20" />
              ) : null}
            </div>
          </Card>
        ) : (
          items.map((b) => {
            const isAudio = b.direction === "doc-to-voice";
            const date = shortDate(b.createdAt);
            const subtitle = isAudio
              ? [date, "Audio", b.durationSec ? formatClock(b.durationSec) : ""].filter(Boolean).join("  ·  ")
              : [date, b.documentType].filter(Boolean).join("  ·  ");
            return (
              <ListRow
                key={b.id}
                leading={
                  <RowLeading tone={isAudio ? "accent" : "teal"}>
                    {isAudio ? (
                      <AudioLines size={26} color={COLORS.ink} />
                    ) : (
                      <FileText size={23} color={COLORS.ink} />
                    )}
                  </RowLeading>
                }
                title={b.title}
                subtitle={subtitle}
                onPress={() => onOpen(b)}
                trailing={
                  <Tap
                    onPress={() => setTarget(b)}
                    accessibilityLabel={`Options for ${b.title}`}
                    className="fb-more"
                  >
                    <MoreVertical size={22} color={COLORS.ink} />
                  </Tap>
                }
              />
            );
          })
        )}
      </div>

      <ActionSheet
        visible={target !== null}
        title={target?.title}
        options={sheetOptions}
        onClose={() => setTarget(null)}
      />
    </ScreenFrame>
  );
}
