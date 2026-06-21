import type { ProjectBrief } from "@/types/brief";

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^---+$/gm, "──────────────────────────────")
    .replace(/^>\s+/gm, "")
    .replace(/`(.+?)`/g, "$1");
}

export async function downloadBriefPdf(brief: ProjectBrief): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const logoDataUrl = await loadLogoDataUrl();

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const stampWatermark = () => {
    const logoW = 42;
    const logoH = 10;
    doc.addImage(logoDataUrl, "PNG", pageWidth - margin - logoW, pageHeight - 14, logoW, logoH);
  };

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > pageHeight - margin - 12) {
      stampWatermark();
      doc.addPage();
      y = margin;
    }
  };

  const addText = (text: string, fontSize: number, style: "normal" | "bold" = "normal") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      addPageIfNeeded(fontSize * 0.5);
      doc.text(line, margin, y);
      y += fontSize * 0.45;
    }
  };

  const addSection = (heading: string, body: string, headingSize = 13, bodySize = 10) => {
    y += 4;
    addText(heading, headingSize, "bold");
    y += 2;
    addText(body, bodySize);
  };

  const content = brief.rawMarkdown || buildFallbackMarkdown(brief);
  const plain = stripMarkdown(content);
  const sections = plain.split(/\n{2,}/).filter(Boolean);

  doc.addImage(logoDataUrl, "PNG", margin, y, 48, 11);
  y += 16;

  addText(brief.title, 20, "bold");
  y += 4;
  addText(`Generated ${new Date(brief.createdAt).toLocaleDateString()}`, 9);
  y += 6;

  for (const section of sections) {
    const lines = section.split("\n");
    const firstLine = lines[0]?.trim() ?? "";
    const rest = lines.slice(1).join("\n").trim();

    if (firstLine.length < 60 && rest) {
      addSection(firstLine, rest);
    } else {
      addText(section, 10);
    }
    y += 2;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    stampWatermark();
  }

  doc.save(`${brief.title.replace(/[^a-zA-Z0-9]/g, "_")}_brief.pdf`);
}

async function loadLogoDataUrl(): Promise<string> {
  const res = await fetch("/logo.png");
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function buildFallbackMarkdown(brief: ProjectBrief): string {
  return [
    brief.tldr,
    "",
    "Goals:",
    ...brief.goals.business.map((g) => `- ${g}`),
    "",
    "User Stories:",
    ...brief.userStories.map((s) => `- ${s}`),
    "",
    `Complexity: ${brief.complexity}`,
    `Budget: ${brief.estimatedBudget}`,
  ].join("\n");
}
