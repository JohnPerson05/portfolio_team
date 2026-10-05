/**
 * Studio content — the single source of truth for the two-person studio.
 *
 * Everything a visitor reads about "who we are" lives here: the studio name,
 * the two team members, the services, the process, and the reasons to work
 * with us. Edit this file to change the copy across the homepage, the Studio
 * page, the navbar/footer, and the SEO metadata.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  HOW TO ADD THE SECOND TEAM MEMBER
 *  1. Find `PARTNER` below.
 *  2. Replace `name`, `firstName`, and `initials`.
 *  3. Add a portrait at `/public/images/team/partner.jpg` and set `photo`
 *     to "/images/team/partner.jpg" (leave `null` to show the monogram card).
 *  4. Set `isPlaceholder: false`.
 *  Nothing else needs to change.
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface StudioLink {
  readonly label: string;
  readonly href: string;
}

export interface TeamMember {
  readonly id: "john" | "partner";
  /** Full name shown on cards and the Studio page. */
  readonly name: string;
  /** Short name used in running copy ("John handles…"). */
  readonly firstName: string;
  /** Monogram used when no photo is available. */
  readonly initials: string;
  /** True while the real details have not been provided yet. */
  readonly isPlaceholder: boolean;
  /** Portrait path, or null to render a designed monogram card. */
  readonly photo: string | null;
  /** Discipline label, e.g. "Product & Engineering". */
  readonly discipline: string;
  /** One-line, plain-language description of what this person makes happen. */
  readonly promise: string;
  /** A short paragraph in business language. */
  readonly bio: string;
  /** What this person takes care of, written for non-technical readers. */
  readonly handles: readonly string[];
  /** Experience headline (only facts that were provided). */
  readonly experience: string;
  /** Underlying professional background — shown subtly, never as the headline. */
  readonly background: readonly string[];
  /** Optional profile links (LinkedIn, etc.). */
  readonly links: readonly StudioLink[];
}

/* -------------------------------------------------------------------------- */
/* Studio identity                                                            */
/* -------------------------------------------------------------------------- */

export const STUDIO = {
  /**
   * Working studio name. Replace with your final name — it flows into the
   * navbar, footer, page titles, and structured data.
   */
  name: "Pairwork Studio",
  shortName: "Pairwork",
  tagline: "Two people. One digital product team.",
  description:
    "A two-person digital product studio. We design, build, launch, and look after the digital products businesses run on — from customer portals and internal tools to first versions of new ideas.",
  /** Social / profile links for the studio itself. Add verified links only. */
  links: [] as readonly StudioLink[],
  /** Default social share image. */
  shareImage: "/images/cover.png",
  location: "Working with clients remotely",
} as const;

/* -------------------------------------------------------------------------- */
/* The two people                                                             */
/* -------------------------------------------------------------------------- */

export const JOHN: TeamMember = {
  id: "john",
  name: "John Person Narral",
  firstName: "John",
  initials: "JP",
  isPlaceholder: false,
  photo: "/images/profile.png",
  discipline: "Product & Engineering",
  promise: "Turns your idea into a product that actually works.",
  bio: "John takes what your business needs and builds it — the screens your customers use, the systems behind them, and the connections to the tools you already rely on. He has spent around six years building software for banking, insurance, and live-event products, and now brings that same standard to growing businesses.",
  handles: [
    "Shaping the idea into a clear first version",
    "Building websites, portals, and web apps",
    "Turning manual, messy processes into simple workflows",
    "Connecting your product to the tools you already use",
    "Fast prototypes to test an idea before you invest",
  ],
  experience: "~6 years building enterprise and web products",
  background: [
    "Backend & full-stack engineering",
    "Banking, insurance, and live-event platforms",
    "Rapid prototyping and MVP delivery",
    "Cloud delivery and release pipelines",
  ],
  links: [],
};

export const PARTNER: TeamMember = {
  id: "partner",
  name: "[SECOND TEAM MEMBER]",
  firstName: "[Partner]",
  initials: "+",
  isPlaceholder: true,
  photo: null,
  discipline: "Systems, Access & Operations",
  promise: "Makes sure it stays secure, reliable, and running.",
  bio: "5+ years inside enterprise technology teams, making sure the right people had the right access, systems stayed up, and problems got fixed at the root. On our projects, that means your product launches safely and keeps working long after go-live.",
  handles: [
    "Secure logins — the right people see the right things",
    "Setting up user roles, permissions, and onboarding",
    "Keeping systems healthy and running day to day",
    "Finding the real cause of problems, not just the symptom",
    "Support processes so nothing falls through the cracks",
  ],
  experience: "5+ years in enterprise technology & identity management",
  background: [
    "Identity & Access Management (IAM)",
    "IT operations & technical support",
    "Enterprise application support",
    "User access administration",
    "Incident & problem resolution",
    "Systems administration",
    "IT service management",
    "Troubleshooting & root-cause analysis",
    "Process improvement",
  ],
  links: [],
};

export const TEAM: readonly TeamMember[] = [JOHN, PARTNER];

/** What happens where the two disciplines meet. */
export const OVERLAP = {
  title: "Where we meet",
  body: "Most small teams can build a product. Fewer can also make sure it's secure, that access is handled properly, and that someone looks after it once it's live. Between the two of us, you get both — from the first conversation to long after launch.",
  points: ["Built right", "Launched safely", "Looked after"],
} as const;

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

export const HERO = {
  eyebrow: "Two-person digital product studio",
  headline: "We turn ideas into digital products",
  headlineAccent: "people actually want to use.",
  supporting:
    "Two builders — one shaping and engineering the product, one making sure it's secure, reliable, and supported. From the first sketch to the day your team logs in.",
  primaryCta: { label: "Start a project", href: "/contact" },
  secondaryCta: { label: "See our work", href: "/#work" },
  availability: "Taking on new projects",
  /** Short outcomes that float around the hero composition. */
  outcomes: [
    "Idea → working product",
    "Spreadsheets → simple system",
    "Secure from day one",
    "Supported after launch",
  ],
} as const;

/** Business outcomes for the scrolling ticker (no tech jargon). */
export const OUTCOME_TICKER = [
  "Customer portals",
  "Internal tools",
  "Booking & workflow systems",
  "First versions for founders",
  "Dashboards & reporting",
  "Secure logins & user access",
  "Modernising old systems",
  "Ongoing care & support",
] as const;

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

export interface Service {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  /** The problem as the client would describe it. */
  readonly when: string;
  /** What we do about it. */
  readonly what: string;
  /** Who leads it. */
  readonly lead: "john" | "partner" | "both";
}

export const SERVICES: readonly Service[] = [
  {
    id: "launch",
    number: "01",
    title: "Launch a new product",
    when: "You have an idea and need a real, working first version — not a slide deck.",
    what: "We shape the idea, design the essentials, and ship something your customers can actually use, so you can learn fast and grow from there.",
    lead: "both",
  },
  {
    id: "internal-tools",
    number: "02",
    title: "Replace the spreadsheets",
    when: "Your team runs on spreadsheets, email threads, and copy-paste.",
    what: "We turn those manual steps into a simple internal tool that saves hours every week and keeps everyone working from the same information.",
    lead: "john",
  },
  {
    id: "portals",
    number: "03",
    title: "Customer portals & web apps",
    when: "Customers keep calling or emailing for things they should be able to do themselves.",
    what: "We build a clean, self-serve experience — bookings, requests, account details, documents — that feels effortless for your customers.",
    lead: "john",
  },
  {
    id: "modernise",
    number: "04",
    title: "Modernise an outdated system",
    when: "The system works, but it's slow, fragile, and nobody wants to touch it.",
    what: "We rebuild it step by step, without disrupting your day-to-day, so it becomes faster, easier to use, and easier to change.",
    lead: "both",
  },
  {
    id: "access",
    number: "05",
    title: "Secure logins & user access",
    when: "You're not sure who can see what — or onboarding new staff and clients is a headache.",
    what: "We set up proper sign-in, roles, and permissions so the right people get the right access, and removing access is just as easy.",
    lead: "partner",
  },
  {
    id: "care",
    number: "06",
    title: "Launch support & ongoing care",
    when: "You need someone to call when something breaks — and to stop it breaking again.",
    what: "We keep your product healthy after launch, fix issues at their root, and put simple support processes in place.",
    lead: "partner",
  },
];

/* -------------------------------------------------------------------------- */
/* Process                                                                    */
/* -------------------------------------------------------------------------- */

export const PROCESS = {
  eyebrow: "How we work",
  heading: "From first conversation to a product that keeps working.",
  steps: [
    {
      id: "understand",
      label: "01 — Understand",
      title: "We start with your business, not the code",
      body: "A focused conversation about what's slowing you down, who the product is for, and what success looks like. You get a clear plan in plain language.",
    },
    {
      id: "shape",
      label: "02 — Shape & build",
      title: "You see real progress, early and often",
      body: "We design the essentials and build in short steps, sharing working versions as we go — so there are no surprises at the end.",
    },
    {
      id: "launch",
      label: "03 — Launch safely",
      title: "Secure, tested, and ready for real people",
      body: "Logins, permissions, and access are set up properly before go-live, and we handle the launch with you so day one is calm.",
    },
    {
      id: "care",
      label: "04 — Look after it",
      title: "We don't disappear after launch",
      body: "We keep the product healthy, fix what comes up, and help it grow as your business does.",
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Why work with us                                                           */
/* -------------------------------------------------------------------------- */

export const WHY_US = {
  eyebrow: "Why a two-person team",
  heading: "Small on purpose. Serious about the work.",
  reasons: [
    {
      title: "You talk to the people doing the work",
      body: "No account managers, no hand-offs. The two people you meet are the two people building your product.",
    },
    {
      title: "Built and looked after by the same team",
      body: "The people who build it are the people who support it — so issues get fixed properly, and fast.",
    },
    {
      title: "Security isn't an afterthought",
      body: "Who can sign in, and what they can see, is designed in from day one by someone who has done it at enterprise scale.",
    },
    {
      title: "Plain language, always",
      body: "You'll always know what we're doing, why, and what it means for your business — without the jargon.",
    },
  ],
} as const;

/** Credibility numbers — only figures backed by the team's real experience. */
export const STUDIO_STATS = [
  { id: "combined", label: "Combined years in enterprise tech", value: 11, suffix: "+" },
  { id: "people", label: "Specialists, one team", value: 2 },
  { id: "industries", label: "Industries & delivery domains", value: 5 },
  { id: "handoffs", label: "Hand-offs to outsiders", value: 0 },
] as const;
