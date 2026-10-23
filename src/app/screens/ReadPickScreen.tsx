import { useMemo, useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { Button, Card, ListRow, RowLeading, ScreenFrame, SegmentedToggle, TopBar } from "../kit";
import { ProjectBrief } from "../types";
import { estimateReadSeconds, formatClock, shortDate, stripMarkdown } from "../text";
import { COLORS } from "../theme";

type Source = "paste" | "library";

export function ReadPickScreen({
  briefs,
  onChoose,
  onBack,
}: {
  briefs: ProjectBrief[];
  onChoose: (title: string, text: string, sourceBrief?: ProjectBrief) => void;
  onBack: () => void;
}) {
  const [source, setSource] = useState<Source>("paste");
  const [text, setText] = useState("");

  const docs = useMemo(
    () =>
      briefs
        .filter((b) => b.direction === "voice-to-doc" && b.documentMarkdown.trim())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [briefs],
  );

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <ScreenFrame>
      <TopBar title="Read Aloud" left="back" onLeft={onBack} />
      <div style={{ marginTop: 16 }}>
        <SegmentedToggle<Source>
          options={[
            { id: "paste", label: "Paste text" },
            { id: "library", label: "From Library" },
          ]}
          value={source}
          onChange={setSource}
        />
      </div>

      {source === "paste" ? (
        <div className="fb-col">
          <Card className="fb-paste-card">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type the text you want read aloud…"
              className="fb-textarea"
            />
            <p className="fb-wordcount">
              {words === 0
                ? "No text yet"
                : `${words} words  ·  about ${formatClock(estimateReadSeconds(text))}`}
            </p>
          </Card>
          <div style={{ paddingTop: 12, paddingBottom: 6 }}>
            <Button
              label="Choose Voice"
              disabled={words === 0}
              onPress={() => onChoose("Pasted text", text.trim())}
            />
          </div>
        </div>
      ) : (
        <div className="fb-scroll" style={{ marginTop: 18, paddingBottom: 12 }}>
          {docs.length === 0 ? (
            <Card>
              <div className="fb-empty">
                <div className="fb-empty-title">No documents yet</div>
                <p className="fb-empty-copy" style={{ textAlign: "center" }}>
                  Create a document from the Record tab and it will appear here.
                </p>
              </div>
            </Card>
          ) : (
            docs.map((b) => (
              <ListRow
                key={b.id}
                leading={
                  <RowLeading>
                    <FileText size={23} color={COLORS.ink} />
                  </RowLeading>
                }
                title={b.title}
                subtitle={[shortDate(b.createdAt), b.documentType].join("  ·  ")}
                onPress={() => onChoose(b.title, stripMarkdown(b.documentMarkdown), b)}
                trailing={<ChevronRight size={20} color={COLORS.ink} />}
              />
            ))
          )}
        </div>
      )}
    </ScreenFrame>
  );
}
