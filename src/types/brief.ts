export interface BriefAnswers {
  platform: "Android" | "iPhone" | "Both";
  platformDetails: string;
  auth: string;
  authDetails: string;
  integrations: string;
  integrationsDetails: string;
  gridSystem: "3x3" | "3x4" | "1x2";
  gridDetails: string;
  fontStyle: string;
  fontDetails: string;
  colorTheme: string;
  colorDetails: string;
  timeline: string;
  timelineDetails: string;
}

export interface BriefGoals {
  business: string[];
  user: string[];
  nonGoals: string[];
}

export interface BriefFunctionalRequirement {
  title: string;
  priority: string;
  details: string[];
}

export interface BriefUserExperience {
  entryPoint: string;
  coreExperience: string[];
  advancedFeatures: string[];
  uiHighlights: string[];
}

export interface BriefSuccessMetrics {
  userCentric: string[];
  business: string[];
  technical: string[];
  trackingPlan: string[];
}

export interface BriefTechnicalConsiderations {
  technicalNeeds: string[];
  integrationPoints: string[];
  dataStorage: string[];
  scalability: string[];
  challenges: string[];
}

export interface BriefPhase {
  name: string;
  duration: string;
  deliverables: string[];
  dependencies: string[];
}

export interface BriefMilestones {
  estimate: string;
  teamSize: string;
  phases: BriefPhase[];
}

export interface BriefApiResponse {
  title: string;
  tldr: string;
  goals: BriefGoals;
  userStories: string[];
  functionalRequirements: BriefFunctionalRequirement[];
  userExperience: BriefUserExperience;
  narrative: string;
  successMetrics: BriefSuccessMetrics;
  technicalConsiderations: BriefTechnicalConsiderations;
  milestones: BriefMilestones;
  complexity: "Low" | "Medium" | "High";
  estimatedBudget: string;
  rawMarkdown: string;
}

export interface ProjectBrief extends BriefApiResponse {
  id: string;
  createdAt: string;
  originalIdea: string;
  answers: BriefAnswers;
}

export const DEFAULT_BRIEF_ANSWERS: BriefAnswers = {
  platform: "Both",
  platformDetails: "",
  auth: "Email & Password",
  authDetails: "",
  integrations: "Payments",
  integrationsDetails: "",
  gridSystem: "3x3",
  gridDetails: "",
  fontStyle: "Modern Sans-Serif",
  fontDetails: "",
  colorTheme: "Warm Neutral",
  colorDetails: "",
  timeline: "Full Release (3-6 months)",
  timelineDetails: "",
};

export const LOADING_STEP_MESSAGES = [
  "Translating your vision into a structured product brief...",
  "Drafting business goals and user stories...",
  "Mapping functional requirements and UX flows...",
  "Building success metrics and technical considerations...",
  "Finalizing milestones and export-ready document...",
] as const;

export const EXAMPLE_IDEAS = [
  {
    label: "On-Demand Delivery App",
    text: "A laundry and grocery delivery app with rider tracking, order scheduling, and online payments for urban customers.",
  },
  {
    label: "B2B SaaS Inventory Tracker",
    text: "A B2B SaaS platform for multi-warehouse inventory tracking with automated replenishment alerts and supplier integrations.",
  },
  {
    label: "Interactive AI Classroom Helper",
    text: "An interactive GenAI homework companion that adapts explanations by grade level and subject for students and parents.",
  },
] as const;

export const DEMO_SESSION_KEY = "founderbrief_demo_session";

export interface DemoSession {
  step: "idea" | "questions" | "result";
  idea: string;
  answers: BriefAnswers;
  questionIndex: number;
  brief: ProjectBrief | null;
  updatedAt: string;
}
