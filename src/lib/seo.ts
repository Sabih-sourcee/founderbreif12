/** Site-wide SEO / AEO helpers for FounderBrief */

export const SITE_URL = "https://founderbreif.vercel.app";
export const SITE_NAME = "FounderBrief";
export const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/kh4Tf3hCPKXaHih8KZC0cbKy3PR2/social-images/social-1781646801887-founderbriefe.webp";

export const DEFAULT_TITLE = "FounderBrief — Speak an idea. Get a document.";
export const DEFAULT_DESCRIPTION =
  "FounderBrief turns a spoken or typed idea into a PRD, business plan, resume, pitch deck, or brief — then exports it or reads it aloud.";

export type PageSeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}` || SITE_URL;
}

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
      "FounderBrief is a weekly brief for founders. It distills your strategy, metrics, and priorities into one calm, focused summary delivered every Monday morning so you can decide and ship instead of managing dashboards.",
  },
  {
    question: "Who is FounderBrief for?",
    answer:
      "FounderBrief is built for non-technical and technical founders who want a weekly operating rhythm. If your strategy lives across Notion, Sheets, Linear, and Slack, FounderBrief pulls the signal into one brief.",
  },
  {
    question: "How does FounderBrief work?",
    answer:
      "Connect your sources once, set the metrics and priorities that matter, then read a single brief every Monday. You can also try a free demo that turns a startup idea into a structured technical brief.",
  },
  {
    question: "Is there a free trial of FounderBrief?",
    answer:
      "Yes. The Free plan includes one full brief generation with no credit card required. Paid plans start at $18/month, or $15/month when billed annually.",
  },
  {
    question: "Does FounderBrief store my ideas on its servers?",
    answer:
      "Brief content is designed to stay on your device. Account details like email and name are stored to operate the service. When you generate a brief, prompts are processed via Google Gemini through our API and are not permanently stored afterward.",
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
    operatingSystem: "Web",
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
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
      "FounderBrief helps founders replace scattered dashboards with one weekly brief — a calm Monday ritual for strategy, metrics, and priorities.",
    mainEntity: organizationSchema(),
  };
}
