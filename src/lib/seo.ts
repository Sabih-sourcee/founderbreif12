/** Site-wide SEO / AEO helpers for FounderBrief */

export const SITE_URL = "https://founderbreif.vercel.app";
export const SITE_NAME = "FounderBrief";

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}` || SITE_URL;
}

/** 1200×630 PNG served from this site, not an external bucket. */
export const OG_IMAGE = absoluteUrl("/og.png");

export const DEFAULT_TITLE =
  "FounderBrief — AI PRD and build plan before you write code";
export const DEFAULT_DESCRIPTION =
  "FounderBrief is an AI PRD and build-plan generator. Before you write code, know what you are building and how you will make it. Generate your first PRD free.";

/** CDN cache for public marketing pages. Browser 1h, shared cache 1 day, stale for 7 days. */
export const PUBLIC_PAGE_CACHE =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export type PageSeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
};

/** TanStack Router `head()` meta + link helpers */
export function pageHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = OG_IMAGE,
  noindex = false,
  type = "website",
}: PageSeoInput = {}) {
  const url = absoluteUrl(path);
  const robots = noindex ? "noindex, nofollow" : "index, follow";

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { name: "googlebot", content: robots },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const FAQS = [
  {
    question: "What is FounderBrief?",
    answer:
      "FounderBrief is an AI PRD and build-plan generator. You describe a startup idea and get a product requirements document — problem, users, scope, user stories, requirements, technical constraints, and milestones — before anyone writes code.",
  },
  {
    question: "Who is FounderBrief for?",
    answer:
      "FounderBrief is for founders who need to know what they are building and how they will make it. Non-technical founders use it to brief a developer. Technical founders use it to lock scope before the first commit.",
  },
  {
    question: "What is in a FounderBrief PRD?",
    answer:
      "A generated PRD includes a short summary, goals and non-goals, user stories, functional requirements, the core experience, success metrics, technical considerations, and a phased build plan with a complexity and budget range.",
  },
  {
    question: "Is the first PRD free?",
    answer:
      "Yes. Generate your first PRD free — one full generation, no credit card. Paid plans are $18/month, or $15/month when billed annually, for unlimited generations plus shareable links and PDF export.",
  },
  {
    question: "Does FounderBrief store my ideas on its servers?",
    answer:
      "Brief content is designed to stay on your device. Account details like email and name are stored to operate the service. When you generate a PRD, prompts are processed via Google Gemini through our API and are not permanently stored afterward.",
  },
] as const;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    description: DEFAULT_DESCRIPTION,
    email: "hello@founderbrief.app",
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "AI PRD and build plan generator",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "AI product-requirements and build-plan generator. Describe a startup idea and get a PRD with scope, user stories, requirements, technical constraints, and milestones before you write code.",
    featureList: [
      "AI PRD generation",
      "User stories and functional requirements",
      "Technical constraints and build plan",
      "Milestones and complexity estimate",
      "Markdown and PDF export",
    ],
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Pro Monthly",
        price: "18",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Pro Annual",
        price: "15",
        priceCurrency: "USD",
        description: "Per month, billed annually",
      },
    ],
  };
}

export function faqPageSchema(faqs: readonly { question: string; answer: string }[] = FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE_NAME}`,
    url: absoluteUrl("/about"),
    description:
      "FounderBrief is an AI PRD and build-plan generator that helps founders decide what they are building and how they will make it before writing code.",
    mainEntity: organizationSchema(),
  };
}
