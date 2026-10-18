import type { Guide } from "./guides";

const published = "2026-10-18";

export const NEW_GUIDES: Guide[] = [
  {
    slug: "prd-template-for-startups",
    title: "PRD template for startups",
    description:
      "A free startup PRD template you can copy: user, problem, scope, non-goals, stories, metrics, constraints, and the order you will build it.",
    datePublished: published,
    related: ["how-to-write-a-prd-for-a-startup", "prd-vs-spec-vs-roadmap"],
    answer:
      "A free startup PRD template is a short document you can copy: the user and problem, the outcome of the first version, the core flow, explicit non-goals, user stories, success metrics, technical constraints, and the order you will build it. Fill those sections before you hire or open an editor. Leave stack names until the scope is stable.",
    sections: [
      {
        heading: "What belongs in a startup PRD template?",
        paragraphs: [
          "A template is a fixed outline so the next idea does not get a new structure. The sections that earn a place on a first version are the user, the problem as it exists today, the outcome you could check, the steps in that outcome, the refusals, the stories for those steps, the signal that it worked, the constraints a builder cannot guess, and the order of the work.",
          "Copy the blocks below into your own doc and replace every bracket. If a bracket is still empty when you want someone to build, that section is not done. The same outline is explained as prose in the guide on [how to write a PRD for a startup](/guides/how-to-write-a-prd-for-a-startup). This page is the blank you fill. [PRD vs spec vs roadmap](/guides/prd-vs-spec-vs-roadmap) is the page to read if you are unsure which document you are writing.",
        ],
      },
      {
        heading: "How do you describe the user and the problem?",
        paragraphs: [
          'Name one person. A market is not a user. "Small clinics" is a market. "The office manager who confirms locum shifts by texting three group chats" is a user. Write the job they already have, the workaround they use this week, and the tools in that workaround. If you cannot picture the afternoon this happens, you are guessing, and the rest of the template will invent features to cover the guess.',
          'Write the problem as the gap between that workaround and the result they wanted. Keep it to the gap this version closes. A second problem is a second product. Park it under non-goals. The outcome sentence has to be something a stranger could check. "The manager sends one link and the locum confirms without a phone call" can be tested. "Delight clinics" cannot. Copy this block and replace the brackets.',
        ],
        template: {
          title: "User, problem, and outcome",
          body: `Primary user: [one person, and the job they already have]
What they do today: [the workaround, including the tools]
What is broken: [the gap this version closes]

Outcome: When this version is done, the user can [observable result].
We will know it worked if: [a signal you could check]`,
        },
      },
      {
        heading: "What should scope and non-goals say?",
        paragraphs: [
          'Scope is the core flow plus the refusals, written next to each other. List the steps the user takes, in order, from the moment they start the job to the moment it is finished. Three to seven steps is enough for a first version. Each step should say what the user does and what the product does back. "Simple dashboard" is not a step. "The manager sees today\'s unfilled shifts and sends a link" is a step.',
          'Non-goals are how the template stays buildable. Write them as refusals: no team roles, no native app, no reporting beyond one list. Every feature you refuse is time you can spend on the path that proves the idea. When someone later asks for an item on that list, the answer is "not this version," which is a decision you already wrote down. Do not hide a second product inside an adjective.',
        ],
        template: {
          title: "Core flow and non-goals",
          body: `Core flow:
1. [step the user takes, and what the product does]
2. [step]
3. [step]

Non-goals:
- [this version will not do this]
- [this version will not do this]`,
        },
      },
      {
        heading: "How should the user stories be written?",
        paragraphs: [
          'Write a story only for a step you already listed. The form is a person, an action, and a result: "As the office manager, I can send a booking link, so the locum confirms without a phone call." If you cannot name the result, the line is a feature wish and it should come out. Add one acceptance line under any story that could be misread, so a builder does not invent a signup wall you did not ask for.',
          "A handful of stories is the point. A backlog of forty stories means the template became a parking lot. Cut until each story maps to a step in the flow. Skip settings, empty states, and admin screens unless the job fails without them.",
        ],
        template: {
          title: "Story",
          body: `As [user], I can [action], so that [result].
Done when: [what a reviewer can check]`,
        },
      },
      {
        heading: "Which constraints belong in the template?",
        paragraphs: [
          'Constraints are facts a builder cannot infer from the stories. Platforms, how someone signs in, whether money moves, which records you must keep, and which other systems have to be touched. Write "not in this version" when the answer is none. Silence gets filled with assumptions, and assumptions become extra weeks. A risk you already know belongs here too, in one or two lines: a permission you do not have yet, or data that includes phone numbers.',
          'Leave vendor and framework names out until the scope is stable. "Card payments on the web" is a constraint. A particular processor is a choice that follows from it. The same goes for hosting and UI kits. The template\'s job is to make that choice smaller, not to make it for you. If you do not know a line yet, write the question instead of inventing an answer.',
        ],
        template: {
          title: "Constraints",
          body: `Platforms: [web, mobile, or both]
Sign-in: [method, or none in this version]
Payments: [what is charged, or not in this version]
Data we must store: [records]
Integrations: [systems, or none]
Risks: [permission, privacy, or dependency you already know]`,
        },
      },
      {
        heading: "How do you turn the template into a build order?",
        paragraphs: [
          "Close with the sequence. The first slice should be the shortest path that lets the user finish the job, even if it is rough. Later slices are what you will do only if the first one is actually used. If that first slice is already a quarter of work, the outcome is too big. Shrink the flow. Do not shrink the calendar and hope. Read the filled template once as if you were the person building it. Every bracket should be gone, and every non-goal should still be there.",
          "Then hand it over. You can [try FounderBrief](/demo) if you want a first draft of these sections from a short description of the idea. The first generation is free and does not ask for a card. Treat that draft as this template filled in once: delete any line you cannot defend before anyone builds it.",
        ],
        template: {
          title: "Build order",
          body: `1. [shortest slice that lets the user finish the job]
2. [what depends on that slice]
Later, not now: [explicitly deferred]`,
        },
      },
    ],
    faqs: [
      {
        question: "Is this PRD template free to copy?",
        answer:
          "Yes. Copy the sections on this page into your own document. You do not need an account to use the outline. FounderBrief can also draft a filled version from your idea, and the first generation is free.",
      },
      {
        question: "How long should a filled startup PRD be?",
        answer:
          "Long enough that a builder can start, and short enough that you will reread it. The sections in this template are enough for a first version. If it starts reading like a company strategy memo, move the later bets out.",
      },
      {
        question: "Should the tech stack go in the template?",
        answer:
          "Write constraints: platforms, sign-in, payments, data, and integrations. Choose specific tools after those lines are stable, so the stack serves the product.",
      },
    ],
  },
  {
    slug: "prd-for-cursor-lovable-bolt",
    title: "How to write a PRD before Cursor, Lovable, Bolt, or v0",
    description:
      "Write a short spec before you prompt Cursor, Lovable, Bolt, or v0: user, screens, data, non-goals, and how you will check the result.",
    datePublished: published,
    related: ["prd-template-for-startups", "how-to-brief-a-developer-non-technical-founder"],
    answer:
      "Write the PRD before you prompt Cursor, Lovable, Bolt, or v0. Name the user, the job, the screens in that job, what the first version will not do, and the data each step reads or writes. Then paste that spec into the tool. A coding agent follows the prompt it is given, so an unclear spec becomes an unclear app.",
    sections: [
      {
        heading: "Why write a spec before you prompt a coding tool?",
        paragraphs: [
          "Cursor, Lovable, Bolt, and v0 are different products, and each one changes. This guide does not rank them and does not restate their prices or feature lists. Read each product's own site for that. What they share, for a founder, is that you steer them with language. The model fills gaps you leave. If you did not say who the app is for, it will invent a user. If you did not say what to skip, it will add screens.",
          "A spec written first is a constraint on that invention. You are not trying to produce a perfect prompt. You are trying to produce a page you can compare the generated app against. When the result drifts, you edit the spec and prompt again, instead of arguing with a chat thread you can no longer reread. The [PRD template for startups](/guides/prd-template-for-startups) is a blank for that page.",
        ],
      },
      {
        heading: "What should you decide before the first prompt?",
        paragraphs: [
          "Decide the user, the one job, and the outcome you could check. Then list the screens that job needs, in the order the user meets them. A booking product might be: a list of open shifts, a link the other person opens, a confirm button, and a status back on the list. That is enough to start. A settings area, a team switcher, and a chart are not part of the job until a step says they are.",
          'Write the data each screen reads and writes, in plain words. "The list shows today\'s shifts. Confirming a shift stores who confirmed and when." You do not need a schema. You need to stop the tool from inventing accounts, roles, and tables the job does not use. Also write the non-goals in the same note, before you are tempted by a generated screen that looks finished.',
        ],
      },
      {
        heading: "How do you describe screens without designing the whole product?",
        paragraphs: [
          'Describe each screen as a job step, not as a visual. Say what is on it, what the user can do, and where they go next. "A page with the open shifts, a control that copies a link, and the name of the person who confirmed" is a spec. "Make it clean and modern, with a sidebar and cards" is a style request, and the tool will satisfy the style even when the job is wrong.',
          "Keep the first prompt to one flow. Ask for the happy path that finishes the job. Empty states, errors, and edge cases can be a second prompt after the happy path exists and you have clicked through it. If you ask for every state up front, you get a wide app that does not complete the one task. Paste the flow as a numbered list so the order is hard to miss.",
        ],
      },
      {
        heading: "What should you tell the tool not to build?",
        paragraphs: [
          'Put the non-goals in the prompt, not only in your head. Name the things a generator likes to add: extra roles, a billing page, notifications, a dashboard of charts, social login, and a marketing homepage. Say which of those are out for this pass. "Do not add authentication" is a valid line when the first test is a single user on one machine. You can add sign-in when a second person needs to use it.',
          'Also say what "done" means for the pass. "Done when I can create a shift, open the link in another window, confirm it, and see the status change on the list." That sentence is the test you will run when the tool stops. If the generated app cannot do that sentence, the pass failed, even if the interface looks complete. Do not start a second feature to avoid looking at the failure.',
        ],
      },
      {
        heading: "How should you review what the tool generates?",
        paragraphs: [
          'Click the flow before you read the code, if the tool gives you a running screen. Try the steps in the spec, in order, with the data you named. Write down every place the app asks for something the spec did not, or skips a step the spec required. Those notes are the next prompt. "Remove the team invite. The spec has one user in this version" is a better follow-up than "make it better."',
          "Then look at what got stored. If the spec said a confirmation stores a name and a time, check that those are the fields, not a pile of unused profile columns. You are allowed to keep a generated choice that does not contradict the spec. You should delete a generated feature that adds a job you did not write. The spec stays the source. The chat is not.",
        ],
      },
      {
        heading: "When should you stop prompting and edit the spec?",
        paragraphs: [
          "Stop when the same mistake appears twice. That usually means the spec is ambiguous, not that the tool needs a longer scolding. Change the sentence that was misread, then prompt from the revised spec. If you cannot tell whether the app matches, the outcome line is too vague. Rewrite the outcome until a click either passes or fails.",
          "A coding tool is not a substitute for the conversation with a builder when the product is unclear. If you are about to hand the result to a person, read [how a non-technical founder briefs a developer](/guides/how-to-brief-a-developer-non-technical-founder) and send the spec, not only the repo. You can [try FounderBrief](/demo) to draft that spec from a short description before you paste anything into a coding tool. The first generation is free. Cut it until you can defend every line, then prompt.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do Cursor, Lovable, Bolt, and v0 need different specs?",
        answer:
          "The products differ, and their docs are the place to check current limits. The spec can stay the same: user, job, screens, data, non-goals, and a sentence for done. Adjust the prompt to whatever the tool asks you to paste.",
      },
      {
        question: "Should the spec name the tech stack?",
        answer:
          "Name a stack only if you already have one and the tool will touch it. Otherwise state constraints, such as a web app with no login in the first pass. Let the tool's default stand unless it blocks the flow.",
      },
      {
        question: "How long should the prompt be?",
        answer:
          "Long enough to include the flow, the data, the non-goals, and the done sentence. A page is enough. A vague paragraph produces a vague app, and a ten-page prompt gets summarized in ways you did not choose.",
      },
    ],
  },
  {
    slug: "how-to-brief-a-developer-non-technical-founder",
    title: "How a non-technical founder briefs a developer",
    description:
      "Brief a developer with a written PRD: the user, the job, the steps, the non-goals, the success signal, and the constraints you already know.",
    datePublished: published,
    related: ["prd-template-for-startups", "prd-for-cursor-lovable-bolt"],
    answer:
      "A non-technical founder briefs a developer with a written PRD, not a walkthrough. State who the product is for, the job it must finish, the steps in that job, what this version will not include, how you will know it worked, and any constraints you already know. Hand over that document and let the builder choose the tools.",
    sections: [
      {
        heading: "What should you hand a developer?",
        paragraphs: [
          "Hand them a document they can read without you in the room. A call can explain tone. It cannot be the spec, because the spec has to survive after the call. The document names the user, the job, the steps, the non-goals, the signal that the version worked, and the constraints you already know. That is a PRD. A slide of the logo and a list of adjectives is not.",
          "Use the [PRD template for startups](/guides/prd-template-for-startups) if you want the sections laid out as blocks you can fill. You do not need to know how the product will be built. You need to know what the user will be able to finish, and what you are refusing to include. If a line is something only you understand, rewrite it until a stranger could test it.",
        ],
      },
      {
        heading: "How do you describe the product without picking the stack?",
        paragraphs: [
          'Talk about what the user sees and does. "They open a link on their phone and tap confirm" is a product sentence. "Use this framework and this database" is a solution sentence, and it is the developer\'s to make unless you already have a system they must fit. When you do have a constraint, say it as a constraint: the clinic already pays for a calendar that has to stay the source of bookings, or the first version has to run in a browser because you will not ship an app store release.',
          'Separate facts from preferences. A fact is "we already collect phone numbers and we are not allowed to text them yet." A preference is "I like how that other product looks." Put facts in the brief. Mention a preference once, and let the developer ignore it if it fights the job. A brief that is mostly visual references gives you a costume of another product, not the flow your user needs.',
        ],
      },
      {
        heading: "What should you answer before the first call?",
        paragraphs: [
          "Answer six things in writing, even if the answers are short. Who is the user. What do they do today. What must they be able to finish in this version. What will this version not do. How will you know the version worked. What is already decided about platforms, sign-in, payments, data, and other systems. If you cannot answer one, write the question. Do not fill it with a guess and hope the developer notices.",
          "Bring the real workaround to the call if you can: the spreadsheet, the text thread with names removed, the email you send every Friday. A developer estimates better from an artifact than from a metaphor. Walk the steps once, in order, and then stop talking. Ask them to restate the job. If their restatement adds a feature, decide in the meeting whether it is in or out, and write the decision into the doc before you hang up.",
        ],
      },
      {
        heading: "How do you talk about money, time, and done?",
        paragraphs: [
          'Ask for an estimate of the first slice, not of the whole company. The first slice is the shortest sequence that lets the user finish the job. If the estimate is larger than you can pay for or wait for, cut steps, not quality adjectives. "Make it faster to build" without removing a step is not a cut. Removing "team invites" is a cut. Update the non-goals so the smaller version is the version you both think you agreed to.',
          'Define done as the user\'s outcome, plus the obvious failure you will not accept. "A locum can confirm from the link, and we can see who confirmed" is done. "Pixel perfect" is not a finish line you can share. Agree how you will look at the work: a staging link you click through against the steps in the brief. Written acceptance beats a feeling that it is not quite right yet.',
        ],
      },
      {
        heading: "What should you leave for the developer to decide?",
        paragraphs: [
          "Leave the tools, the file structure, the libraries, and the shape of the database, unless a constraint forces one of them. Also leave small interface choices that do not change the job: the exact control, the spacing, the empty-state illustration. Reviewing those as if they were requirements burns the time you meant to spend on the flow.",
          'Do not leave the scope. Scope is yours. If you say "you are the expert, just build what makes sense," you will get a reasonable product for a user the developer imagined. That can be a good product and still the wrong one. The brief is how you stay the person who decides. The developer is the person who finds a way to build the decision. Both jobs are real. They are not the same job.',
        ],
      },
      {
        heading: "How do you keep the brief current after work starts?",
        paragraphs: [
          "When a new idea shows up, write it down away from the current slice. Once a week, decide whether it replaces a step, waits, or dies. If it replaces a step, change the brief and accept that the estimate changes. If it waits, it goes on the later list. Sending it in a chat message and also expecting the old date is how briefs rot. The document in front of the developer should match the version you think you are buying.",
          "If you are also prompting a coding tool yourself, keep one spec for both the person and the tool. The page on a [spec you can paste into Cursor, Lovable, Bolt, or v0](/guides/prd-for-cursor-lovable-bolt) is the same decisions, aimed at a generator. You can [try FounderBrief](/demo) to get a first draft of the brief from a plain description of the idea. The first generation is free. Edit it until you can read every line out loud to the developer without apologizing for it.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need to know how to code to brief a developer?",
        answer:
          "No. You need the user, the job, the steps, the non-goals, the success signal, and the constraints you already know. The developer chooses how to build that, and tells you when a constraint makes a step expensive.",
      },
      {
        question: "Is a long call enough of a brief?",
        answer:
          "A call helps, and then the decisions have to land in the document. If it only lives in the recording, you will disagree later about what was in scope. Write the outcome and the non-goals before you estimate.",
      },
      {
        question: "What if I do not know the answer to a constraint?",
        answer:
          'Write the question. "I do not know if we are allowed to text locums" is more useful than a fake decision. The developer can tell you what changes if the answer is no.',
      },
    ],
  },
  {
    slug: "prd-vs-spec-vs-roadmap",
    title: "PRD vs spec vs roadmap",
    description:
      "A PRD says what this version is and why. A spec says how one slice behaves. A roadmap orders later bets without designing them.",
    datePublished: published,
    related: ["how-to-write-a-prd-for-a-startup", "mvp-planning-checklist"],
    answer:
      "A PRD says what you are building and why for this version. A spec says how one slice behaves, in enough detail to build and test it. A roadmap orders later bets without designing them. Write the PRD first, then the spec for the slice you will build now, and keep the roadmap as a sequence rather than a promise.",
    sections: [
      {
        heading: "What is a PRD?",
        paragraphs: [
          "A product requirements document says what this version is for. It names the user, the problem, the outcome, the scope, the non-goals, the stories, the success signal, and the constraints. It is a decision about the product, written so someone else can tell what is in and what is out. It is not a design file, and it is not a list of every idea you have had.",
          "For a startup, the PRD should describe the first version you are willing to build, not the company you hope to be. If the outcome cannot be checked, it is still a wish. The guide on [how to write a PRD for a startup](/guides/how-to-write-a-prd-for-a-startup) is the longer pass on writing that decision. This page is about how that decision sits next to the other two documents.",
        ],
      },
      {
        heading: "What is a spec?",
        paragraphs: [
          "A spec takes one slice of the PRD and says how it behaves. It is detailed enough to build or to test. For the confirm-a-shift step, a spec might say: the link opens without an account, the shift's time and place are visible, confirm stores the person's name and the time, and the manager's list updates. A PRD says that confirmation exists. The spec says what confirmation does.",
          "You do not need a spec for every future idea. You need one for the slice someone is about to build. If the spec contradicts the PRD, fix one of them before the work starts. Two documents that disagree are worse than one short PRD. Keep the spec boring. Edge cases belong here. Vision does not.",
        ],
      },
      {
        heading: "What is a roadmap?",
        paragraphs: [
          'A roadmap is the order of later bets. It says what you intend to learn or build after this version, and what you are explicitly not designing yet. "After clinics use the link for a month, decide whether to add a native app" is a roadmap line. A mock of that app, with a feature list, is a second PRD you are pretending not to have started.',
          "Order is the whole point. A roadmap that is a pile of columns with no sequence does not help you say no. Put the next bet, the one after that, and a parking lot for things you will not sequence until the current outcome is real. Dates are optional. If you put a date on a bet you have not specified, you have made a promise about a product you have not decided.",
        ],
      },
      {
        heading: "Which document should you write first?",
        paragraphs: [
          "Write the PRD first. It is the filter. Until the user, the outcome, and the non-goals exist, a spec has nothing to be precise about, and a roadmap is a wish list with headings. Founders often start with the roadmap because it feels like progress. It spreads attention across bets that the first version has not earned.",
          "Then write a spec only for the slice in the build order. The [MVP planning checklist](/guides/mvp-planning-checklist) is a short way to check that the slice is one job. If you are hiring, the PRD is what you send before the estimate. The spec can follow once the developer is looking at that slice. The roadmap can be five lines at the bottom of the PRD until you have more than one version in market.",
        ],
      },
      {
        heading: "How do the three documents point at each other?",
        paragraphs: [
          "Each line in the spec should point at a step or a story in the PRD. If it does not, it is scope creep or a missing requirement. Add it to the PRD on purpose, or take it out of the spec. Each item on the roadmap should be something the PRD refused or deferred. If a roadmap item is required for the user to finish the job, it is not later. It is scope, and the PRD is wrong.",
          'Use the same words in all three. If the PRD says "locum" and the spec says "contractor" and the roadmap says "provider," you will have a meeting about vocabulary. Pick the user\'s word and keep it. Link the documents. Do not paste the whole PRD into the spec, or the spec stops being the precise page and becomes a second copy that drifts.',
        ],
      },
      {
        heading: "What happens if you only write one of them?",
        paragraphs: [
          "A PRD alone can be enough to start, if the first slice is small and the stories are testable. Add a spec when a step is being misbuilt. A spec alone, with no PRD, tends to grow, because nothing says what the product is not. A roadmap alone is how teams stay busy without a version anyone can use. If you only have time for one page, make it the PRD, and put three roadmap lines and the first slice's acceptance notes on that same page.",
          "You can [try FounderBrief](/demo) when you want that page drafted from a description of the idea. The generator writes a PRD and a build plan: goals, non-goals, stories, requirements, constraints, and milestones. That is the PRD plus a sequence. It is not a full engineering spec of every screen, and it is not a multi-quarter roadmap. Treat the draft as a start, then cut it to the version you will actually build.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is a user story a spec?",
        answer:
          "A story belongs in the PRD. It says who does what and why. A spec is what you add when that story needs rules: fields, errors, and the check for done. One story can be enough of a spec when the step is simple.",
      },
      {
        question: "Can a roadmap live inside the PRD?",
        answer:
          "Yes, as a short later list, while you only have one version. Split it out when later bets need their own owners. Do not let the later list change the scope of the version you are building.",
      },
      {
        question: "Who writes each document?",
        answer:
          "The founder or product owner writes the PRD and owns the roadmap order. The person building the slice writes or co-writes the spec, because they are the one who has to make the behavior precise. The founder still checks that the spec matches the PRD.",
      },
    ],
  },
  {
    slug: "chatprd-alternatives",
    title: "ChatPRD alternatives",
    description:
      "An honest look at ChatPRD alternatives for founders: a template, a general chat assistant, the doc you already use, or a startup PRD generator.",
    datePublished: published,
    related: ["ai-prd-generator", "prd-template-for-startups"],
    answer:
      "ChatPRD alternatives are other ways to produce a PRD: a general chat assistant, a document you already use, a written template, or a startup generator such as FounderBrief. ChatPRD presents itself as an AI workspace for product managers. A founder locking a first version needs scope, non-goals, and a build order. Compare the job, then check each product's current site.",
    sections: [
      {
        heading: "What are people comparing when they look for a ChatPRD alternative?",
        paragraphs: [
          'The search usually means "I want help writing a PRD, and I want to know what else can do that." The products in that search are not the same kind of tool. Some are workspaces aimed at product managers inside a team. Some are general writing assistants. Some are documents you already have. Some are generators aimed at a founder who has not written code yet. Picking by a logo, or by a roundup that scores them, skips the only useful question: what do you need the document to do tomorrow?',
          "This page does not rank products, does not quote competitor prices, and does not repeat feature lists this author has not verified. Comparison posts disagree with each other, and product pages change. Where a product describes itself, that description is attributed. Check the current site before you pay anyone, including FounderBrief.",
        ],
      },
      {
        heading: "What does ChatPRD say it is?",
        paragraphs: [
          "ChatPRD's own documentation describes the product as an AI workspace for product managers and product teams. In that description, it helps turn rough ideas, research, and existing context into structured product documents, and it is meant to act as a thinking partner for requirements and tradeoffs. That is their account of the product, not a result from a test run for this guide. It is a fair reason the name shows up when someone wants a PM-oriented writing tool.",
          "Their marketing also describes a wider set of documents, workflows, and connections to other tools. Those pages are the right place to read the current offer. This guide will not restate a price, a template count, an integration list, or a security claim, because those details are easy to get wrong from memory and easy for a vendor to change. If you are a product manager who wants a workspace built around that job, read chatprd.ai and decide from what it says today.",
        ],
      },
      {
        heading: "When is a general chat assistant enough?",
        paragraphs: [
          "A general chat assistant, such as the chat products from the major model labs, can draft a PRD if you bring the structure. Paste a template, paste what you know about the user, and ask it to fill the sections and mark anything it had to invent. The advantage is flexibility. The same chat can also critique the draft, shorten it, or turn one section into stories. The limit is that you are the one holding the outline. Nothing in a general chat stops it from adding a plausible feature you did not ask for.",
          "Do not treat the draft as research. If you did not provide a real user and a real workaround, the model will supply a generic one that sounds specific. Delete those lines. This guide does not compare model quality and does not quote plan prices for those assistants. Use whichever chat you already have access to, keep the source notes next to the draft, and reread every requirement as if you had to pay someone to build it.",
        ],
      },
      {
        heading: "When is a document you already use enough?",
        paragraphs: [
          "If the team already writes in a shared doc, a template in that doc is a real alternative. Google Docs, Notion, and similar tools are places a PRD can live. Some of them sell writing assistance inside the document. Whether that assistance is on your plan, and what it can see, is something you check in the product. This page does not claim a particular doc tool has a given AI feature this month.",
          "A doc is the right choice when the hard part is agreement, not the blank page. Two people can comment on a non-goal. A generator cannot replace that argument. The weakness of a doc is the same as its strength: it will hold anything. Without an outline, it becomes a scratch pad. Start from a fixed set of sections. The [PRD template for startups](/guides/prd-template-for-startups) on this site is free to copy into whatever tool you already use.",
        ],
      },
      {
        heading: "When does a startup PRD generator fit?",
        paragraphs: [
          "A startup generator fits when the job is the first version, not an ongoing product-management system. You have an idea, you need it turned into scope, stories, requirements, constraints, and a sequence, and you want that before anyone writes code. FounderBrief is that kind of tool. You describe the product, answer a short set of questions about users and constraints, and get a PRD and a build plan. The [guide to what an AI PRD generator does](/guides/ai-prd-generator) covers the shape of that output.",
          "The facts of this product, as it is sold on this site: the first generation is free and does not require a card. Paid plans are $18 a month, or $15 a month when billed annually. The free generation includes markdown export. Paid plans add unlimited generations, shareable links, and PDF export. Brief content is designed to stay on your device. Those are claims about FounderBrief, not about anyone else. If you need a PM workspace with a team's existing research already connected, a founder generator is a different job, and you should look at tools that say they do that job.",
        ],
      },
      {
        heading: "What should you check before you pay any of them?",
        paragraphs: [
          'Check four things on the vendor\'s current site, not on a roundup. What document types they say they produce. Whether you can try it on your own idea before you pay. What they say they do with the text you paste. And whether the output is a buildable version or a general strategy memo. Ignore charts that score "PM quality" without showing the prompts and the drafts. Ignore user counts you cannot trace. If a page on this site ever quoted a competitor price, that would be a bug in the page.',
          "Then run the same idea through the option you can try. For a founder, the test is simple: can a builder start from the document without a meeting, and can you point at the non-goals? You can [try FounderBrief](/demo) on that test. The first PRD is free. If another tool is a better fit for a team that already has a head of product, use that tool. The alternatives are allowed to be good at a job this product is not trying to do.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is FounderBrief a ChatPRD alternative?",
        answer:
          "It is an alternative if what you want is a startup PRD and build plan before you write code. ChatPRD describes itself as a workspace for product managers. Those can be different jobs. Read both products' current pages and try the one that matches the document you need.",
      },
      {
        question: "Why does this page not list competitor prices?",
        answer:
          "Prices, trials, and feature lists change, and secondhand roundups often disagree. Restating them here would risk being wrong. Check the vendor's site. FounderBrief's own prices are stated above because this is our site.",
      },
      {
        question: "Can I just use a template and skip the tools?",
        answer:
          "Yes. A filled template is a PRD. Use a chat assistant or FounderBrief when you want a first draft of the sections, then edit. The tool does not remove the need to cut lines you cannot defend.",
      },
    ],
  },
];
