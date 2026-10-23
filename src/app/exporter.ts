import { ExportDocFormat, ProjectBrief } from "./types";
import { stripMarkdown } from "./text";

function safeName(title: string) {
  return title.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "FounderBrief";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function markdownToHtml(md: string): string {
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/\n/g, "<br/>");
}

export async function exportDocument(brief: ProjectBrief, format: ExportDocFormat): Promise<void> {
  const name = safeName(brief.title);
  if (format === "TXT") {
    downloadBlob(new Blob([stripMarkdown(brief.documentMarkdown)], { type: "text/plain" }), `${name}.txt`);
    return;
  }
  if (format === "Word") {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${brief.title}</title></head><body style="font-family:Calibri,sans-serif;color:#1C2120">${markdownToHtml(brief.documentMarkdown)}</body></html>`;
    downloadBlob(new Blob(["\ufeff", html], { type: "application/msword" }), `${name}.doc`);
    return;
  }

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;
  const plain = stripMarkdown(brief.documentMarkdown);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(28, 33, 32);
  const titleLines = doc.splitTextToSize(brief.title, maxWidth);
  for (const line of titleLines) {
    doc.text(line, margin, y);
    y += 8;
  }
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const body = doc.splitTextToSize(plain, maxWidth);
  for (const line of body) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 6;
  }
  doc.save(`${name}.pdf`);
}

export async function shareAsText(brief: ProjectBrief): Promise<void> {
  const text = stripMarkdown(brief.documentMarkdown);
  if (navigator.share) {
    await navigator.share({ title: brief.title, text });
    return;
  }
  await navigator.clipboard.writeText(text);
}
