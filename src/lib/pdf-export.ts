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

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > pageHeight - margin) {
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

  doc.save(`${brief.title.replace(/[^a-zA-Z0-9]/g, "_")}_brief.pdf`);
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
