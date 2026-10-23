import { COLORS } from "./theme";

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== "");
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{p.replace(/`([^`]+)`/g, "$1")}</span>
    ),
  );
}

type Block =
  | { kind: "h1" | "h2" | "h3" | "p"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "rule" };

function parse(markdown: string): Block[] {
  const blocks: Block[] = [];
  let quote: string[] = [];
  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ kind: "quote", text: quote.join(" ") });
      quote = [];
    }
  };

  for (const raw of markdown.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    const t = line.trim();
    if (t.startsWith(">")) {
      quote.push(t.replace(/^>\s?/, ""));
      continue;
    }
    flushQuote();
    if (!t) continue;
    if (/^[-*_]{3,}$/.test(t)) blocks.push({ kind: "rule" });
    else if (t.startsWith("### ")) blocks.push({ kind: "h3", text: t.slice(4) });
    else if (t.startsWith("## ")) blocks.push({ kind: "h2", text: t.slice(3) });
    else if (t.startsWith("# ")) blocks.push({ kind: "h1", text: t.slice(2) });
    else if (/^[-*+]\s+/.test(t)) blocks.push({ kind: "bullet", text: t.replace(/^[-*+]\s+/, "") });
    else if (/^\|?[\s:-]+\|[\s|:-]*$/.test(t)) continue;
    else if (t.startsWith("|")) {
      const cells = t
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      blocks.push({ kind: "p", text: cells.join("  ·  ") });
    } else blocks.push({ kind: "p", text: t });
  }
  flushQuote();
  return blocks;
}

export function MarkdownView({ markdown }: { markdown: string }) {
  const blocks = parse(markdown);
  return (
    <div className="fb-md">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h1":
            return (
              <h1 key={i} className="fb-md-h1">
                {b.text}
              </h1>
            );
          case "h2":
            return (
              <h2 key={i} className="fb-md-h2">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="fb-md-h3">
                {b.text}
              </h3>
            );
          case "bullet":
            return (
              <div key={i} className="fb-md-bullet">
                <span>•</span>
                <p>{renderInline(b.text, `b${i}`)}</p>
              </div>
            );
          case "quote":
            return (
              <div key={i} className="fb-md-quote" style={{ background: COLORS.bg }}>
                <p>{renderInline(b.text, `q${i}`)}</p>
              </div>
            );
          case "rule":
            return <hr key={i} className="fb-md-rule" />;
          default:
            return (
              <p key={i} className="fb-md-p">
                {renderInline(b.text, `p${i}`)}
              </p>
            );
        }
      })}
    </div>
  );
}
