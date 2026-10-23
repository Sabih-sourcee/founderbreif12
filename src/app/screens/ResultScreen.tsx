import { useState } from "react";
import { FileText, Hourglass, Share2, Trash2, Volume2 } from "lucide-react";
import { ActionSheet, Card, ScreenFrame, Tap, TopBar } from "../kit";
import { MarkdownView } from "../markdown";
import { exportDocument, shareAsText } from "../exporter";
import { DOCUMENT_OUTPUT_TYPES, ExportDocFormat, ProjectBrief } from "../types";
import { COLORS, SHADOW } from "../theme";

const FORMATS: Array<{ id: ExportDocFormat; label: string }> = [
  { id: "Word", label: "Word" },
  { id: "PDF", label: "PDF" },
  { id: "TXT", label: "TXT" },
];

export function ResultScreen({
  brief,
  defaultFormat,
  onExported,
  onReadAloud,
  onDelete,
  onBack,
  onNotice,
}: {
  brief: ProjectBrief;
  defaultFormat: ExportDocFormat;
  onExported: (format: ExportDocFormat) => void;
  onReadAloud: () => void;
  onDelete: () => void;
  onBack: () => void;
  onNotice: (message: string) => void;
}) {
  const [active, setActive] = useState<ExportDocFormat>(defaultFormat);
  const [busy, setBusy] = useState<ExportDocFormat | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const typeInfo = DOCUMENT_OUTPUT_TYPES.find((d) => d.id === brief.documentType);
  const barTitle = `Your ${typeInfo?.barLabel ?? "Document"}`;

  const doExport = async (format: ExportDocFormat) => {
    if (busy) return;
    setActive(format);
    setBusy(format);
    try {
      await exportDocument(brief, format);
      onExported(format);
    } catch (e) {
      onNotice(e instanceof Error ? e.message : "Couldn't export this document.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScreenFrame>
      <TopBar title={barTitle} left="back" onLeft={onBack} rightIcon="more" onRight={() => setMenuOpen(true)} />
      <Card className="fb-doc-card">
        <div className="fb-scroll" style={{ paddingBottom: 8 }}>
          <MarkdownView markdown={brief.documentMarkdown} />
        </div>
      </Card>
      <div className="fb-export-row">
        {FORMATS.map((f) => {
          const isActive = f.id === active;
          return (
            <Tap
              key={f.id}
              onPress={() => void doExport(f.id)}
              accessibilityLabel={`Export as ${f.label}`}
              className="fb-export-pill"
              style={{
                background: isActive ? COLORS.accent : COLORS.white,
                boxShadow: SHADOW,
              }}
            >
              {busy === f.id ? (
                <Hourglass size={20} color={COLORS.ink} />
              ) : (
                <FileText size={20} color={COLORS.ink} />
              )}
              <span style={{ fontWeight: 700, fontSize: 15, marginLeft: 8 }}>{f.label}</span>
            </Tap>
          );
        })}
      </div>
      <ActionSheet
        visible={menuOpen}
        title={brief.title}
        onClose={() => setMenuOpen(false)}
        options={[
          { label: "Read aloud", icon: <Volume2 size={21} color={COLORS.ink} />, onPress: onReadAloud },
          {
            label: "Share as text",
            icon: <Share2 size={21} color={COLORS.ink} />,
            onPress: () => {
              shareAsText(brief)
                .then(() => {
                  if (!navigator.share) onNotice("Copied to clipboard.");
                })
                .catch(() => onNotice("Couldn't share this document."));
            },
          },
          { label: "Delete", icon: <Trash2 size={21} color={COLORS.ink} />, onPress: onDelete },
        ]}
      />
    </ScreenFrame>
  );
}
