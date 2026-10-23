import { GoogleGenAI, Type } from "@google/genai";

import { appGeminiKey } from "@/lib/app-env.server";
import type {
  BriefAnswers,
  BriefApiResponse,
  DocumentOutputType,
  SpokenLanguage,
} from "@/app/types";
import { buildLocalFallbackBrief } from "@/app/fallbackBrief";

const stringArray = { type: Type.ARRAY, items: { type: Type.STRING } };

const BRIEF_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: [
    "title",
    "tldr",
    "description",
    "complexity",
    "estimatedBudget",
    "businessGoals",
    "userGoals",
    "nonGoals",
    "userStories",
    "functionalRequirements",
    "userExperience",
    "narrative",
    "successMetrics",
    "technicalConsiderations",
    "milestones",
    "documentMarkdown",
  ],
  properties: {
    title: { type: Type.STRING },
    tldr: { type: Type.STRING },
    description: { type: Type.STRING },
    complexity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    estimatedBudget: { type: Type.STRING },
    businessGoals: stringArray,
    userGoals: stringArray,
    nonGoals: stringArray,
    userStories: stringArray,
    functionalRequirements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["Highest", "High", "Medium"] },
          details: { type: Type.STRING },
        },
      },
    },
    userExperience: {
      type: Type.OBJECT,
      properties: {
        entryPoint: { type: Type.STRING },
        coreSteps: stringArray,
        advancedFeatures: stringArray,
        uiHighlights: stringArray,
      },
    },
    narrative: { type: Type.STRING },
    successMetrics: {
      type: Type.OBJECT,
      properties: {
        userCentric: stringArray,
        business: stringArray,
        technical: stringArray,
        trackingPlan: stringArray,
      },
    },
    technicalConsiderations: {
      type: Type.OBJECT,
      properties: {
        needs: stringArray,
        integrations: stringArray,
        privacy: stringArray,
        scalability: stringArray,
        challenges: stringArray,
      },
    },
    milestones: {
      type: Type.OBJECT,
      properties: {
        estimate: { type: Type.STRING },
        teamSize: { type: Type.STRING },
        phases: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              duration: { type: Type.STRING },
              deliverables: { type: Type.STRING },
            },
          },
        },
      },
    },
    documentMarkdown: { type: Type.STRING },
  },
};

const DOC_TYPE_INSTRUCTIONS: Record<DocumentOutputType, string> = {
  PRD: `Format as a complete Product Requirements Document (PRD):
- Sections in documentMarkdown: ## Executive Summary, ## Problem & Market Wedge, ## User Stories, ## Functional Scope (MVP vs v2), ## UX & Regional Localization, ## Technical Stack & Integrations, ## Phased Delivery Milestones.`,
  "Business Plan": `Format as an investor-ready Business Plan:
- Sections in documentMarkdown: ## Executive Summary, ## Market Opportunity & Target Customer, ## Value Proposition & Product Offering, ## Revenue Model & Unit Economics, ## Go-To-Market, ## Operations & Team Plan, ## 12-Month Financial & Milestone Roadmap.`,
  Resume: `Format as a high-impact Executive / Founder resume:
- Sections in documentMarkdown: ## Professional Summary, ## Core Competencies, ## Featured Ventures & Experience, ## Key Achievements, ## Skills & Languages, ## Education & Credentials.`,
  "Pitch Deck Outline": `Format as a 10-slide investor pitch deck outline:
- Sections in documentMarkdown: ## Slide 1: Title & One-Line Wedge through ## Slide 10: The Ask & Use of Funds.`,
  "Generic Brief": `Format as a structured executive brief:
- Sections in documentMarkdown: ## Overview & Objective, ## Key Takeaways, ## Core Action Items & Owners, ## Strategic Decisions & Constraints, ## Next Steps & Timeline.`,
};

function formatCalibration(answers: BriefAnswers): string {
  const raw = answers.calibration;
  if (!Array.isArray(raw)) return "";
  const lines = raw
    .map((item) => {
      const q = item.question?.trim() ?? "";
      const a = item.answer?.trim() ?? "";
      return q && a ? `- Q: ${q.slice(0, 300)}\n  A: ${a.slice(0, 1200)}` : "";
    })
    .filter(Boolean);
  return lines.length ? lines.join("\n") : "";
}

function buildBriefPrompt(
  idea: string,
  answers: BriefAnswers,
  documentType: DocumentOutputType,
  spokenLanguage: SpokenLanguage,
) {
  const typeInstruction = DOC_TYPE_INSTRUCTIONS[documentType] || DOC_TYPE_INSTRUCTIONS.PRD;
  const calibration = formatCalibration(answers);

  return `
You are an elite startup advisor, product architect, and executive writer for FounderBrief — built for non-technical South Asian and global founders who speak in English, Urdu, Hindi, Arabic, or mixed code-switching (Roman Urdu / Hinglish).

Selected Output Document Type: "${documentType}"
Spoken / Input Language Context: "${spokenLanguage}"

Founder's spoken or written voice input:
"${idea}"

Context & Calibration Parameters:
- Platform / Channel: ${answers.platform} (${answers.platformDetails || "standard"})
- Access / Auth Model: ${answers.auth} (${answers.authDetails || "standard"})
- Core Integrations / Tools: ${answers.integrations} (${answers.integrationsDetails || "standard"})
- Target Timeline: ${answers.timeline} (${answers.timelineDetails || "standard"})

${calibration ? `Founder's answers to calibration questions (treat these as ground truth and use them throughout the document):\n${calibration}\n\n` : ""}Instructions:
1. If the founder's input contains Urdu, Hindi, Arabic, or Roman Urdu/Hinglish phrases, preserve their intent accurately and translate/synthesize into clear, professional English while noting regional nuances where helpful.
2. ${typeInstruction}
3. Populate all JSON schema fields thoughtfully so the structured fields AND the full documentMarkdown are rich, concrete, and immediately ready for Word, PDF, and TXT export.
`.trim();
}

export async function generateDocumentFromIdea(
  idea: string,
  answers: BriefAnswers,
  documentType: DocumentOutputType = "PRD",
  spokenLanguage: SpokenLanguage = "English",
): Promise<BriefApiResponse> {
  const apiKey = appGeminiKey();
  if (!apiKey) {
    return buildLocalFallbackBrief(idea, answers, documentType, spokenLanguage);
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildBriefPrompt(idea, answers, documentType, spokenLanguage),
      config: {
        systemInstruction: `You are an elite startup advisor and document architect for FounderBrief. Output valid JSON matching the schema for a ${documentType}. The documentMarkdown must be a complete, export-ready document in Markdown with ## section headers.`,
        responseMimeType: "application/json",
        responseSchema: BRIEF_RESPONSE_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text || "{}") as BriefApiResponse;
    if (!parsed.documentMarkdown) {
      return buildLocalFallbackBrief(idea, answers, documentType, spokenLanguage);
    }
    return {
      ...parsed,
      documentType,
      spokenLanguage,
    };
  } catch (error) {
    console.error("Gemini generation failed, using local fallback:", error);
    return buildLocalFallbackBrief(idea, answers, documentType, spokenLanguage);
  }
}

export { corsHeaders } from "@/lib/brief-generator.server";
