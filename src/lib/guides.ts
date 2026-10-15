export type GuideFaq = { question: string; answer: string };

export type GuideSection = { heading: string; paragraphs: string[] };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  /** 40–60 word direct answer, shown first. */
  answer: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
};

export const GUIDES: readonly Guide[] = [
  {
    slug: "how-to-write-a-prd-for-a-startup",
    title: "How to write a PRD for a startup",
    description:
      "Write a startup PRD before you build: user, problem, scope, non-goals, success metrics, and the technical constraints a builder needs.",
    answer:
      "Write a startup PRD before you build. Name the user, the problem, the outcome, and the smallest product that can prove it. Include the core flow, explicit non-goals, success metrics, and technical constraints. Leave stack choices until the scope is stable. A good PRD is short enough that a builder can start without a meeting.",
    sections: [
      {
        heading: "Start with the job, not the feature list",
        paragraphs: [
          "Open with one sentence: who this is for, what they are trying to finish, and what is broken today. If you cannot name a person and a job, the rest of the document will wander.",
          "Then write the outcome of the first version in a way you could check. “Users can request a pickup, pay, and see the rider” is a PRD. “Delight customers” is not.",
        ],
      },
      {
        heading: "Put non-goals next to the scope",
        paragraphs: [
          "List what the first release will not do. Non-goals are how a startup PRD stays buildable. Every feature you defer is time you can spend on the path that proves the idea.",
          "Write the core flow as steps a user takes, then the requirements that make those steps work. Stories should be testable: a person, an action, and a result.",
        ],
      },
      {
        heading: "End with constraints and a sequence",
        paragraphs: [
          "Note platform, auth, payments, data you must store, and anything that is risky. That is the technical half of the plan. It should follow the scope, not replace it.",
          "Close with phases: what ships first, what it depends on, and how you will know the version worked. FounderBrief drafts this from a short idea description so you can edit a plan instead of staring at a blank page.",
        ],
      },
    ],
    faqs: [
      {
        question: "How long should a startup PRD be?",
        answer:
          "Long enough that a builder can start, and short enough that you will reread it. A few pages covering problem, scope, non-goals, stories, metrics, and a phased plan is enough for an MVP.",
      },
      {
        question: "What should a startup PRD include?",
        answer:
          "The user and problem, the outcome of the first version, the core flow, explicit non-goals, success metrics, technical constraints, and the order you will build it.",
      },
      {
        question: "Should I pick the tech stack in the PRD?",
        answer:
          "Write constraints first: platforms, auth, payments, and data. Choose specific tools after the scope is stable, so the stack serves the product instead of the other way around.",
      },
    ],
  },
  {
    slug: "ai-prd-generator",
    title: "What an AI PRD generator does",
    description:
      "An AI PRD generator turns a startup idea into a product requirements document and a build plan. Generate your first PRD free with FounderBrief.",
    answer:
      "An AI PRD generator turns a plain-language startup idea into a product requirements document and a build plan. You describe the product, answer a few questions about users and constraints, and get scope, user stories, requirements, and a technical outline. FounderBrief does this in one free generation so you can decide what to build before you write code.",
    sections: [
      {
        heading: "What you put in",
        paragraphs: [
          "A useful generator needs the idea in your words, plus the decisions that change the plan: who it is for, which platforms, how people sign in, what it integrates with, and how long you want the first release to take.",
          "Vague input produces a vague PRD. Specific users and a specific job produce requirements a developer can estimate.",
        ],
      },
      {
        heading: "What you should get back",
        paragraphs: [
          "Expect a summary, goals and non-goals, user stories, functional requirements, the core experience, success metrics, technical considerations, and milestones. If the output is only a feature list, it is not a build plan.",
          "Treat the draft as a starting document. Cut anything that is not required to test the outcome, then hand the rest to whoever will build it.",
        ],
      },
      {
        heading: "How FounderBrief generates the PRD",
        paragraphs: [
          "Describe the idea, answer a short set of product questions, and FounderBrief writes the PRD and build plan. The first generation is free and does not require a card.",
          "You can export markdown on the free plan. Paid plans add unlimited generations, shareable links, and PDF export when the plan needs to leave your machine.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is an AI PRD generator a replacement for talking to users?",
        answer:
          "No. It turns what you already know into a structured plan. You still need a real user and a result you can check. The document makes that test specific.",
      },
      {
        question: "What does FounderBrief generate?",
        answer:
          "A PRD with a summary, goals, non-goals, user stories, functional requirements, experience notes, success metrics, technical considerations, and a phased build plan.",
      },
      {
        question: "Can I try an AI PRD generator for free?",
        answer:
          "Yes. FounderBrief includes one full PRD generation at no cost, with no credit card. Open the demo and describe the idea.",
      },
    ],
  },
  {
    slug: "validate-startup-idea-before-building",
    title: "Validate a startup idea before building",
    description:
      "Validate a startup idea by writing the user, the current workaround, the first-month outcome, and a one-page PRD before you build.",
    answer:
      "Validate a startup idea by writing down who it is for, what they do today, and what would count as success in the first month. Cut anything that is not required to test that outcome. A one-page PRD and a build plan show whether the idea is specific enough to build, and whether the first version can be finished.",
    sections: [
      {
        heading: "Write the idea so it can fail",
        paragraphs: [
          "A testable idea names a person, the workaround they use now, and a result you could observe. If every outcome still counts as success, you are not validating anything.",
          "Write the smallest product that would change that person’s behavior. That version is the scope of the PRD, not the whole company.",
        ],
      },
      {
        heading: "Use the plan as the filter",
        paragraphs: [
          "When the PRD is full of “and also,” the idea is not ready. Remove steps that do not help the user finish the one job. What remains is either small enough to build or still too fuzzy to start.",
          "The build plan should say what happens first and how long that slice takes. If the first slice is already a quarter of work, the test is too big.",
        ],
      },
      {
        heading: "Decide, then build",
        paragraphs: [
          "Validation here is a decision: build this slice, change the user, or stop. The document is how you make that decision before payroll and code make it expensive.",
          "Generate the draft in FounderBrief, delete what you cannot defend, and only then open an editor or a contract.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I validate a startup idea without a product?",
        answer:
          "Write the user, the current workaround, and the first outcome you would accept. Show that page to people who have the problem. If you cannot describe the first version, you are not ready to build it.",
      },
      {
        question: "What is a sign the idea is not ready?",
        answer:
          "You cannot name who it is for, every feature feels required, or the first milestone is longer than you can finish. Tighten the outcome or stop.",
      },
      {
        question: "Where does a PRD fit in validation?",
        answer:
          "The PRD is the test plan. It forces the user, the scope, the non-goals, and the sequence into one place so you can see whether the idea is specific.",
      },
    ],
  },
  {
    slug: "mvp-planning-checklist",
    title: "MVP planning checklist",
    description:
      "An MVP planning checklist: the user, the one job, the steps, the non-goals, the success signal, and the build order — before you code.",
    answer:
      "An MVP plan lists the user, the one job the product must do, the steps in that job, what you will not build, how you will know it worked, and the order you will build it. If a task does not help a real user finish that job, it waits. Check this before you hire or start coding.",
    sections: [
      {
        heading: "The checklist",
        paragraphs: [
          "User: one primary person, not a market. Job: the task they cannot finish well today. Flow: the steps in that job, in order. Non-goals: what this version refuses to do.",
          "Proof: the signal that the version worked, stated so you could count it. Sequence: the first build slice, what it depends on, and what is explicitly later.",
        ],
      },
      {
        heading: "Cut before you estimate",
        paragraphs: [
          "Estimates on an uncut list are fiction. Remove screens, roles, and integrations that the one job does not need. Then estimate the list that remains.",
          "A checklist item with no user-facing result is a candidate to drop. Internal polish can follow a version that someone actually uses.",
        ],
      },
      {
        heading: "Turn the list into a PRD",
        paragraphs: [
          "The checklist is the outline. The PRD fills in stories, requirements, and technical constraints so another person can build without you in the room.",
          "FounderBrief maps an idea onto that outline: scope, stories, metrics, and milestones. Use the checklist to edit the draft, not as a second document you forget.",
        ],
      },
    ],
    faqs: [
      {
        question: "What belongs on an MVP planning checklist?",
        answer:
          "The user, the one job, the steps in that job, non-goals, the success signal, and the build order. Anything else waits until that version is in use.",
      },
      {
        question: "How small should an MVP be?",
        answer:
          "Small enough to finish, and complete enough that the user can do the one job. If a step is missing from that job, it is in scope. If it is a second job, it is not.",
      },
      {
        question: "When should I write the checklist?",
        answer:
          "Before you hire and before you write code. The list is how you decide what the first version is.",
      },
    ],
  },
  {
    slug: "tech-stack-for-saas-mvp",
    title: "Tech stack for a SaaS MVP",
    description:
      "Choose a SaaS MVP stack after the PRD: app framework, database and auth, storage, and payments — matched to the scope, not the other way around.",
    answer:
      "Pick a SaaS MVP stack after the PRD is written, not before. Most early products need an app framework, a database with auth, file storage, and a way to take payment. Choose tools your team can ship with this month. FounderBrief's build plan names the technical constraints and milestones so the stack follows the scope.",
    sections: [
      {
        heading: "Decide the product, then the tools",
        paragraphs: [
          "The stack question is easier once you know the surfaces, the data, and the integrations. A PRD that says “web app, email login, one paid plan, no mobile” already removes most of the catalog.",
          "Write those constraints in the plan: clients, auth method, third parties, and what must be stored. Tool names come after that list.",
        ],
      },
      {
        heading: "What an early SaaS usually needs",
        paragraphs: [
          "A UI framework you can ship in, a hosted database, authentication, and payments if the first version charges money. Add file storage only if the job needs files. Add a queue or a separate service only if a requirement says so.",
          "Prefer boring tools the builder already knows. A new stack is a second project hiding inside the first one.",
        ],
      },
      {
        heading: "Let the milestones drive the choice",
        paragraphs: [
          "If phase one is “account, core record, and checkout,” the stack only has to do those three things well. Later phases can add the rest when a user has asked for them.",
          "FounderBrief’s technical section lists needs, integrations, data, and risks next to the phases. Use that to pick a stack, instead of picking a stack and then inventing a product that fits it.",
        ],
      },
    ],
    faqs: [
      {
        question: "When should I choose a SaaS tech stack?",
        answer:
          "After the PRD states the user, the scope, and the integrations. Choosing earlier locks you into tools that may not match the product.",
      },
      {
        question: "What does a SaaS MVP stack usually include?",
        answer:
          "An application framework, a database with authentication, and payments if you charge. Add storage, email, or background jobs only when a requirement needs them.",
      },
      {
        question: "How does a build plan help with the stack?",
        answer:
          "It lists technical constraints and the order of work. You pick tools that can finish the first milestone, not tools that cover a roadmap you have not validated.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
