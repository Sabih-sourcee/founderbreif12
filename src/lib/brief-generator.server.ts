import { GoogleGenAI, Type } from "@google/genai";

import type { BriefAnswers, BriefApiResponse } from "@/types/brief";

function cleanAndExtractTitle(idea: string): string {
  const words = idea.trim().split(/\s+/).filter((w) => w.length > 2);
  if (words.length >= 2) {
    const cleanWords = words
      .slice(0, 3)
      .map((w) => w.replace(/[^a-zA-Z]/g, ""))
      .filter((w) => w.length > 0);
    if (cleanWords.length >= 2) {
      return (
        cleanWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") +
        " App"
      );
    }
  }
  return "Custom Startup App";
}

function buildMarkdownFromBrief(data: Omit<BriefApiResponse, "rawMarkdown">): string {
  const lines: string[] = [
    `# ${data.title}`,
    "",
    "### TL;DR",
    "",
    data.tldr,
    "",
    "---",
    "",
    "## Goals",
    "",
    "### Business Goals",
    "",
    ...data.goals.business.map((g) => `* ${g}`),
    "",
    "### User Goals",
    "",
    ...data.goals.user.map((g) => `* ${g}`),
    "",
    "### Non-Goals",
    "",
    ...data.goals.nonGoals.map((g) => `* ${g}`),
    "",
    "---",
    "",
    "## User Stories",
    "",
    ...data.userStories.map((s) => `* ${s}`),
    "",
    "---",
    "",
    "## Functional Requirements",
    "",
    ...data.functionalRequirements.flatMap((req) => [
      `* **${req.title} (Priority: ${req.priority})**`,
      ...req.details.map((d) => `  -- ${d}`),
      "",
    ]),
    "---",
    "",
    "## User Experience",
    "",
    "**Entry Point & First-Time User Experience**",
    "",
    data.userExperience.entryPoint,
    "",
    "**Core Experience**",
    "",
    ...data.userExperience.coreExperience.map((s) => `* ${s}`),
    "",
    "**Advanced Features & Edge Cases**",
    "",
    ...data.userExperience.advancedFeatures.map((s) => `* ${s}`),
    "",
    "**UI/UX Highlights**",
    "",
    ...data.userExperience.uiHighlights.map((s) => `* ${s}`),
    "",
    "---",
    "",
    "## Narrative",
    "",
    data.narrative,
    "",
    "---",
    "",
    "## Success Metrics",
    "",
    "### User-Centric Metrics",
    "",
    ...data.successMetrics.userCentric.map((m) => `* ${m}`),
    "",
    "### Business Metrics",
    "",
    ...data.successMetrics.business.map((m) => `* ${m}`),
    "",
    "### Technical Metrics",
    "",
    ...data.successMetrics.technical.map((m) => `* ${m}`),
    "",
    "### Tracking Plan",
    "",
    ...data.successMetrics.trackingPlan.map((m) => `* ${m}`),
    "",
    "---",
    "",
    "## Technical Considerations",
    "",
    "### Technical Needs",
    "",
    ...data.technicalConsiderations.technicalNeeds.map((t) => `* ${t}`),
    "",
    "### Integration Points",
    "",
    ...data.technicalConsiderations.integrationPoints.map((t) => `* ${t}`),
    "",
    "### Data Storage & Privacy",
    "",
    ...data.technicalConsiderations.dataStorage.map((t) => `* ${t}`),
    "",
    "### Scalability & Performance",
    "",
    ...data.technicalConsiderations.scalability.map((t) => `* ${t}`),
    "",
    "### Potential Challenges",
    "",
    ...data.technicalConsiderations.challenges.map((t) => `* ${t}`),
    "",
    "---",
    "",
    "## Milestones & Sequencing",
    "",
    `### Project Estimate`,
    "",
    data.milestones.estimate,
    "",
    "### Team Size & Composition",
    "",
    data.milestones.teamSize,
    "",
    "### Suggested Phases",
    "",
    ...data.milestones.phases.flatMap((phase) => [
      `**${phase.name} (${phase.duration})**`,
      "",
      "*Deliverables:*",
      ...phase.deliverables.map((d) => `  - ${d}`),
      "",
      "*Dependencies:*",
      ...phase.dependencies.map((d) => `  - ${d}`),
      "",
    ]),
    "",
    "---",
    "",
    `**Complexity:** ${data.complexity} | **Estimated Budget:** ${data.estimatedBudget}`,
  ];
  return lines.join("\n");
}

export function buildHeuristicBrief(idea: string, answers: BriefAnswers): BriefApiResponse {
  const cleanIdea = idea.trim();
  const title = cleanAndExtractTitle(cleanIdea);

  let score = 0;
  if (answers.platform === "Both") score += 2;
  if (answers.auth === "Social Accounts") score += 1;
  if (answers.integrations === "Payments" || answers.integrations === "AI or Messaging") score += 2;

  let complexity: BriefApiResponse["complexity"] = "Medium";
  let estimatedBudget = "$12,000 - $18,000";
  if (score >= 4) {
    complexity = "High";
    estimatedBudget = "$25,000 - $38,000";
  } else if (score <= 1) {
    complexity = "Low";
    estimatedBudget = "$5,000 - $9,500";
  }

  const shortenedIdea = cleanIdea.length > 120 ? cleanIdea.slice(0, 120) + "..." : cleanIdea;

  const briefCore: Omit<BriefApiResponse, "rawMarkdown"> = {
    title,
    tldr: `A ${answers.platform.toLowerCase()} application addressing "${shortenedIdea}", built with a ${answers.gridSystem} grid system, ${answers.fontStyle} typography, and a ${answers.colorTheme} color theme.`,
    goals: {
      business: [
        "Reduce time-to-market by automating core product workflows.",
        "Increase user retention through a polished, consistent experience.",
        "Generate leads for premium features or enterprise integrations.",
      ],
      user: [
        "Complete primary tasks quickly with minimal friction.",
        "Access the product reliably on their preferred platform.",
        "Trust that their data is secure and their experience is consistent.",
      ],
      nonGoals: [
        "Not a full-fledged prototyping or wireframing tool on initial release.",
        "No direct code repository integration in the MVP phase.",
        "Does not provide asset storage or image management at launch.",
      ],
    },
    userStories: [
      `As a user, I want to authenticate via ${answers.auth} so that my profile and preferences are saved securely.`,
      `As a customer, I want seamless ${answers.integrations} integration so that transactions and actions complete without friction.`,
      `As an administrator, I want access to activity records and platform metrics so that the product can scale safely.`,
    ],
    functionalRequirements: [
      {
        title: "Platform-Native Interface",
        priority: "Highest",
        details: [
          `Tailored for ${answers.platform} with responsive ${answers.gridSystem} grid layout.`,
          "Smooth transitions, screen density scaling, and native system integration.",
        ],
      },
      {
        title: "Authentication & Authorization",
        priority: "High",
        details: [
          `${answers.auth} flow with modern token-based session management.`,
          "Secure credential storage and session refresh protocols.",
        ],
      },
      {
        title: "External Integrations",
        priority: "High",
        details: [
          `Modular connector for ${answers.integrations} with robust schema mappings.`,
          "Automated rate control and error recovery for third-party APIs.",
        ],
      },
      {
        title: "Design System",
        priority: "Medium",
        details: [
          `${answers.fontStyle} typography with ${answers.colorTheme} color palette.`,
          `${answers.gridSystem} grid system for consistent layout across screens.`,
        ],
      },
    ],
    userExperience: {
      entryPoint:
        "Landing page highlights the app's core value proposition. Users sign up or try a demo mode with guided onboarding.",
      coreExperience: [
        `Step 1: User selects platform focus (${answers.platform}) and validates required project info.`,
        `Step 2: User configures design system — ${answers.gridSystem} grid, ${answers.fontStyle} fonts, ${answers.colorTheme} theme.`,
        `Step 3: User completes core workflows with real-time feedback and validation.`,
        "Step 4: User reviews outputs and exports or shares results.",
      ],
      advancedFeatures: [
        "Power users can manually edit configuration parameters.",
        "Accessibility validation warns of non-compliant color or contrast choices.",
        "Prevent export if required fields are left blank.",
      ],
      uiHighlights: [
        "High-contrast, responsive layouts for accessibility.",
        "Real-time preview with undo/redo support.",
        "Export formats clearly labeled and grouped by use case.",
      ],
    },
    narrative: `A founder discovers this tool to define their app's visual identity and product scope. What once took days of manual specification now takes minutes — creating color palettes, font pairings, and a responsive grid aligned to a ${answers.colorTheme} theme. The team launches faster with a single source of truth for look, feel, and functional scope.`,
    successMetrics: {
      userCentric: [
        "Number of new users completing onboarding per week.",
        "User satisfaction measured via in-app NPS survey.",
        "Export/download rate per user session.",
      ],
      business: [
        "Monthly active users (MAU).",
        "Percentage of users converting to premium plans.",
        "Cost savings vs. manual specification processes.",
      ],
      technical: [
        "System uptime (target: 99.9%).",
        "Average export completion time (target: <3 seconds).",
        "Error rate on export actions (target: <1%).",
      ],
      trackingPlan: [
        "Unique users per project created.",
        "Clicks on export/download buttons.",
        "User engagement with onboarding content.",
        "Errors/warnings on design validation.",
      ],
    },
    technicalConsiderations: {
      technicalNeeds: [
        `Front-end app for ${answers.platform} with live preview.`,
        "Back-end services for user accounts, saved projects, and export management.",
        "Design token generation logic for color, typography, and grid.",
      ],
      integrationPoints: [
        `${answers.integrations} API integration.`,
        "Google Fonts API for typography selection.",
      ],
      dataStorage: [
        "Store user projects securely for authenticated users.",
        "User data encrypted in transit and at rest.",
        "Basic GDPR compliance for account data.",
      ],
      scalability: [
        "Anticipate up to 1,000 concurrent users in MVP version.",
        "Optimize preview calculations for speed.",
      ],
      challenges: [
        "Handling complex or custom grid and token requirements.",
        "Ensuring accessibility and validation logic is robust.",
        "Smooth export experience across multiple browsers and devices.",
      ],
    },
    milestones: {
      estimate: "Small Team: 1–2 weeks (MVP)",
      teamSize: "Small Team: 2 total people — 1 Product/Design, 1 Full-Stack Engineer",
      phases: [
        {
          name: "Requirements & Design",
          duration: "2 days",
          deliverables: ["Wireframes", "Basic user flows"],
          dependencies: ["Stakeholder input", "Export format exploration"],
        },
        {
          name: "MVP Development",
          duration: "6 days",
          deliverables: ["Core features", "Design system integration"],
          dependencies: ["Google Fonts API", "UI kit selection"],
        },
        {
          name: "Testing & Launch",
          duration: "2 days",
          deliverables: ["QA", "Bug fixes", "Marketing page"],
          dependencies: ["Test datasets", "Browser/device coverage"],
        },
      ],
    },
    complexity,
    estimatedBudget,
  };

  return {
    ...briefCore,
    rawMarkdown: buildMarkdownFromBrief(briefCore),
  };
}

const stringArray = { type: Type.ARRAY, items: { type: Type.STRING } };

export async function generateBriefFromIdea(
  idea: string,
  answers: BriefAnswers,
): Promise<BriefApiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured. Using heuristic brief builder.");
    return buildHeuristicBrief(idea, answers);
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const prompt = `
You are an elite product architect and veteran CTO. Translate this startup founder's app vision into a comprehensive, professional product brief document — the kind development agencies and investors expect to read.

Founder's Initial Vision/Idea:
"${idea}"

Questionnaire Answers:
- Platform: ${answers.platform} (${answers.platformDetails || "None specified"})
- Authentication: ${answers.auth} (${answers.authDetails || "None specified"})
- Integrations: ${answers.integrations} (${answers.integrationsDetails || "None specified"})
- Grid System: ${answers.gridSystem} (${answers.gridDetails || "None specified"})
- Font Style: ${answers.fontStyle} (${answers.fontDetails || "None specified"})
- Color Theme: ${answers.colorTheme} (${answers.colorDetails || "None specified"})
- Timeline: ${answers.timeline} (${answers.timelineDetails || "None specified"})

Generate a complete product brief with ALL sections filled in with specific, actionable content tailored to this exact product idea. Write in clear, professional language that any stakeholder can read — not overly technical jargon, but precise and development-ready.

The brief must include:
- TL;DR (2-3 sentence summary)
- Goals (business goals, user goals, non-goals — 3-4 items each)
- User Stories (4-5 stories in "As a [role], I want to [action], so that [benefit]" format)
- Functional Requirements (4-5 features with priority and bullet details)
- User Experience (entry point paragraph, 4-5 core experience steps, advanced features, UI highlights)
- Narrative (a short story paragraph about a user discovering and using the product)
- Success Metrics (user-centric, business, technical metrics + tracking plan)
- Technical Considerations (technical needs, integrations, data storage, scalability, challenges)
- Milestones & Sequencing (estimate, team size, 3 development phases)
- Complexity level and realistic USD budget estimate

Also generate rawMarkdown: the full brief formatted as clean Markdown matching the structure above, ready for PDF export.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an elite CTO who writes comprehensive, readable product briefs. Your tone is professional, precise, and accessible to non-technical stakeholders. Never use marketing fluff or hype words. Every section must contain specific content relevant to the product idea — no placeholder text.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "title",
            "tldr",
            "goals",
            "userStories",
            "functionalRequirements",
            "userExperience",
            "narrative",
            "successMetrics",
            "technicalConsiderations",
            "milestones",
            "complexity",
            "estimatedBudget",
            "rawMarkdown",
          ],
          properties: {
            title: { type: Type.STRING, description: "Short professional project title." },
            tldr: { type: Type.STRING, description: "2-3 sentence TL;DR summary." },
            goals: {
              type: Type.OBJECT,
              required: ["business", "user", "nonGoals"],
              properties: {
                business: stringArray,
                user: stringArray,
                nonGoals: stringArray,
              },
            },
            userStories: stringArray,
            functionalRequirements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "priority", "details"],
                properties: {
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  details: stringArray,
                },
              },
            },
            userExperience: {
              type: Type.OBJECT,
              required: ["entryPoint", "coreExperience", "advancedFeatures", "uiHighlights"],
              properties: {
                entryPoint: { type: Type.STRING },
                coreExperience: stringArray,
                advancedFeatures: stringArray,
                uiHighlights: stringArray,
              },
            },
            narrative: { type: Type.STRING },
            successMetrics: {
              type: Type.OBJECT,
              required: ["userCentric", "business", "technical", "trackingPlan"],
              properties: {
                userCentric: stringArray,
                business: stringArray,
                technical: stringArray,
                trackingPlan: stringArray,
              },
            },
            technicalConsiderations: {
              type: Type.OBJECT,
              required: [
                "technicalNeeds",
                "integrationPoints",
                "dataStorage",
                "scalability",
                "challenges",
              ],
              properties: {
                technicalNeeds: stringArray,
                integrationPoints: stringArray,
                dataStorage: stringArray,
                scalability: stringArray,
                challenges: stringArray,
              },
            },
            milestones: {
              type: Type.OBJECT,
              required: ["estimate", "teamSize", "phases"],
              properties: {
                estimate: { type: Type.STRING },
                teamSize: { type: Type.STRING },
                phases: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "duration", "deliverables", "dependencies"],
                    properties: {
                      name: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      deliverables: stringArray,
                      dependencies: stringArray,
                    },
                  },
                },
              },
            },
            complexity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            estimatedBudget: { type: Type.STRING },
            rawMarkdown: {
              type: Type.STRING,
              description: "Full brief as formatted Markdown, ready for PDF export.",
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}") as BriefApiResponse;
    if (!parsed.rawMarkdown) {
      parsed.rawMarkdown = buildMarkdownFromBrief(parsed);
    }
    return parsed;
  } catch (error) {
    console.error("Gemini generation failed, using heuristic fallback:", error);
    return buildHeuristicBrief(idea, answers);
  }
}

export function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
