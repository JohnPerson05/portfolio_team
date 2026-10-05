/**
 * Site settings registry — every key the CMS can edit, its input type, the
 * group it appears under in /admin/settings, and the value used until someone
 * saves one.
 *
 * Values live in the `SiteSetting` table (JSONB). Unknown keys in the table
 * are ignored; missing keys fall back to `defaultValue`. The seed writes these
 * defaults to the database so the CMS shows them as editable content.
 *
 * To add a setting: add a field to `SiteSettings`, add a definition below,
 * then read it via `getSiteSettings()`.
 */

export interface SettingItem {
  title: string;
  body: string;
}

export interface SettingStat {
  label: string;
  value: number;
  suffix?: string;
}

export interface SiteSettings {
  "studio.name": string;
  "studio.shortName": string;
  "studio.tagline": string;
  "studio.description": string;
  "studio.location": string;

  "hero.eyebrow": string;
  "hero.title": string;
  "hero.titleAccent": string;
  "hero.subtitle": string;
  "hero.availability": string;
  "hero.primaryCtaLabel": string;
  "hero.primaryCtaUrl": string;
  "hero.secondaryCtaLabel": string;
  "hero.secondaryCtaUrl": string;
  "hero.outcomes": string[];

  "home.tickerItems": string[];
  "home.overlapTitle": string;
  "home.overlapBody": string;
  "home.overlapPoints": string[];
  "home.whyUsReasons": SettingItem[];
  "home.stats": SettingStat[];
  "home.processCover": string;

  "about.intro": string;
  "about.principles": SettingItem[];
  "about.ctaTitle": string;
  "about.ctaBody": string;

  "contact.email": string;
  "social.linkedin": string;
  "social.github": string;
  "social.x": string;
  "cta.text": string;
  "cta.url": string;
  "footer.text": string;

  "seo.title": string;
  "seo.description": string;
  "seo.ogImage": string;
}

export type SettingKey = keyof SiteSettings;

export type SettingType =
  | "text"
  | "textarea"
  | "url"
  | "email"
  | "image"
  | "list"
  | "items"
  | "stats";

export type SettingGroup =
  | "Studio"
  | "Hero"
  | "Homepage content"
  | "About page"
  | "Contact & social"
  | "SEO";

export interface SettingDefinition<K extends SettingKey = SettingKey> {
  key: K;
  label: string;
  type: SettingType;
  group: SettingGroup;
  help?: string;
  defaultValue: SiteSettings[K];
}

type Registry = { [K in SettingKey]: SettingDefinition<K> };

export const SETTINGS_REGISTRY: Registry = {
  "studio.name": {
    key: "studio.name",
    label: "Studio name",
    type: "text",
    group: "Studio",
    help: "Shown in the navbar, footer, page titles, and structured data.",
    defaultValue: "Pairwork Studio",
  },
  "studio.shortName": {
    key: "studio.shortName",
    label: "Short name",
    type: "text",
    group: "Studio",
    defaultValue: "Pairwork",
  },
  "studio.tagline": {
    key: "studio.tagline",
    label: "Tagline",
    type: "text",
    group: "Studio",
    defaultValue: "Two people. One digital product team.",
  },
  "studio.description": {
    key: "studio.description",
    label: "Studio description",
    type: "textarea",
    group: "Studio",
    defaultValue:
      "A two-person digital product studio. We design, build, launch, and look after the digital products businesses run on — from customer portals and internal tools to first versions of new ideas.",
  },
  "studio.location": {
    key: "studio.location",
    label: "Location line",
    type: "text",
    group: "Studio",
    defaultValue: "Working with clients remotely",
  },

  "hero.eyebrow": {
    key: "hero.eyebrow",
    label: "Hero eyebrow",
    type: "text",
    group: "Hero",
    defaultValue: "Two-person digital product studio",
  },
  "hero.title": {
    key: "hero.title",
    label: "Hero title",
    type: "text",
    group: "Hero",
    defaultValue: "We turn ideas into digital products",
  },
  "hero.titleAccent": {
    key: "hero.titleAccent",
    label: "Hero title (highlighted part)",
    type: "text",
    group: "Hero",
    defaultValue: "people actually want to use.",
  },
  "hero.subtitle": {
    key: "hero.subtitle",
    label: "Hero subtitle",
    type: "textarea",
    group: "Hero",
    defaultValue:
      "Two builders — one shaping and engineering the product, one making sure it's secure, reliable, and supported. From the first sketch to the day your team logs in.",
  },
  "hero.availability": {
    key: "hero.availability",
    label: "Availability note",
    type: "text",
    group: "Hero",
    defaultValue: "Taking on new projects",
  },
  "hero.primaryCtaLabel": {
    key: "hero.primaryCtaLabel",
    label: "Primary button label",
    type: "text",
    group: "Hero",
    defaultValue: "Start a project",
  },
  "hero.primaryCtaUrl": {
    key: "hero.primaryCtaUrl",
    label: "Primary button link",
    type: "url",
    group: "Hero",
    defaultValue: "/contact",
  },
  "hero.secondaryCtaLabel": {
    key: "hero.secondaryCtaLabel",
    label: "Secondary button label",
    type: "text",
    group: "Hero",
    defaultValue: "See our work",
  },
  "hero.secondaryCtaUrl": {
    key: "hero.secondaryCtaUrl",
    label: "Secondary button link",
    type: "url",
    group: "Hero",
    defaultValue: "/#work",
  },
  "hero.outcomes": {
    key: "hero.outcomes",
    label: "Floating outcome chips",
    type: "list",
    group: "Hero",
    help: "Short phrases that float around the team portraits (up to 4).",
    defaultValue: [
      "Idea → working product",
      "Spreadsheets → simple system",
      "Secure from day one",
      "Supported after launch",
    ],
  },

  "home.tickerItems": {
    key: "home.tickerItems",
    label: "Outcome ticker",
    type: "list",
    group: "Homepage content",
    help: "The scrolling strip under the hero. Business outcomes, not tech.",
    defaultValue: [
      "Customer portals",
      "Internal tools",
      "Booking & workflow systems",
      "First versions for founders",
      "Dashboards & reporting",
      "Secure logins & user access",
      "Modernising old systems",
      "Ongoing care & support",
    ],
  },
  "home.overlapTitle": {
    key: "home.overlapTitle",
    label: "Team band title",
    type: "text",
    group: "Homepage content",
    defaultValue: "Where we meet",
  },
  "home.overlapBody": {
    key: "home.overlapBody",
    label: "Team band text",
    type: "textarea",
    group: "Homepage content",
    defaultValue:
      "Most small teams can build a product. Fewer can also make sure it's secure, that access is handled properly, and that someone looks after it once it's live. Between the two of us, you get both — from the first conversation to long after launch.",
  },
  "home.overlapPoints": {
    key: "home.overlapPoints",
    label: "Team band points",
    type: "list",
    group: "Homepage content",
    defaultValue: ["Built right", "Launched safely", "Looked after"],
  },
  "home.whyUsReasons": {
    key: "home.whyUsReasons",
    label: "Why us — reasons",
    type: "items",
    group: "Homepage content",
    defaultValue: [
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
  },
  "home.stats": {
    key: "home.stats",
    label: "Numbers",
    type: "stats",
    group: "Homepage content",
    help: "Only figures backed by real experience.",
    defaultValue: [
      { label: "Combined years in enterprise tech", value: 11, suffix: "+" },
      { label: "Specialists, one team", value: 2 },
      { label: "Industries & delivery domains", value: 5 },
      { label: "Hand-offs to outsiders", value: 0 },
    ],
  },
  "home.processCover": {
    key: "home.processCover",
    label: "Process section image",
    type: "image",
    group: "Homepage content",
    defaultValue: "/images/cover.png",
  },

  "about.intro": {
    key: "about.intro",
    label: "Intro paragraph",
    type: "textarea",
    group: "About page",
    defaultValue:
      "We're a deliberately small studio. One of us turns ideas into working products; the other makes sure they're secure, reliable, and looked after once real people start using them. You work directly with both of us — from first conversation to long after launch.",
  },
  "about.principles": {
    key: "about.principles",
    label: "Principles",
    type: "items",
    group: "About page",
    defaultValue: [
      {
        title: "Clarity before code",
        body: "We make sure we understand the business problem — and agree what success looks like — before anything gets built.",
      },
      {
        title: "Secure by default",
        body: "Who can sign in and what they can see is designed from the start, not patched on after launch.",
      },
      {
        title: "Built to keep working",
        body: "Fast, reliable, and easy to change. A product is only finished when it keeps doing its job on an ordinary Tuesday.",
      },
    ],
  },
  "about.ctaTitle": {
    key: "about.ctaTitle",
    label: "Closing call-to-action title",
    type: "text",
    group: "About page",
    defaultValue: "Have an idea, or a process that's holding your business back?",
  },
  "about.ctaBody": {
    key: "about.ctaBody",
    label: "Closing call-to-action text",
    type: "textarea",
    group: "About page",
    defaultValue:
      "Tell us about it in plain language. We'll come back with honest thoughts on what to build first — and what not to build at all.",
  },

  "contact.email": {
    key: "contact.email",
    label: "Contact email",
    type: "email",
    group: "Contact & social",
    help: "Leave empty to rely on the contact form only.",
    defaultValue: "",
  },
  "social.linkedin": {
    key: "social.linkedin",
    label: "LinkedIn",
    type: "url",
    group: "Contact & social",
    defaultValue: "",
  },
  "social.github": {
    key: "social.github",
    label: "GitHub",
    type: "url",
    group: "Contact & social",
    defaultValue: "",
  },
  "social.x": {
    key: "social.x",
    label: "X / Twitter",
    type: "url",
    group: "Contact & social",
    defaultValue: "",
  },
  "cta.text": {
    key: "cta.text",
    label: "Navbar button label",
    type: "text",
    group: "Contact & social",
    defaultValue: "Start a project",
  },
  "cta.url": {
    key: "cta.url",
    label: "Navbar button link",
    type: "url",
    group: "Contact & social",
    defaultValue: "/contact",
  },
  "footer.text": {
    key: "footer.text",
    label: "Footer text",
    type: "textarea",
    group: "Contact & social",
    defaultValue:
      "Two people, one digital product team. We design, build, launch, and look after the products businesses run on.",
  },

  "seo.title": {
    key: "seo.title",
    label: "Default SEO title",
    type: "text",
    group: "SEO",
    defaultValue: "Pairwork Studio — Two people. One digital product team.",
  },
  "seo.description": {
    key: "seo.description",
    label: "Default SEO description",
    type: "textarea",
    group: "SEO",
    defaultValue:
      "A two-person digital product studio. We design, build, launch, and look after the digital products businesses run on — from customer portals and internal tools to first versions of new ideas.",
  },
  "seo.ogImage": {
    key: "seo.ogImage",
    label: "Default social share image",
    type: "image",
    group: "SEO",
    help: "1200×630 works best.",
    defaultValue: "/images/cover.png",
  },
};

export const SETTING_GROUPS: SettingGroup[] = [
  "Studio",
  "Hero",
  "Homepage content",
  "About page",
  "Contact & social",
  "SEO",
];

export const SETTING_DEFINITIONS = Object.values(
  SETTINGS_REGISTRY,
) as SettingDefinition[];

export function isSettingKey(key: string): key is SettingKey {
  return Object.prototype.hasOwnProperty.call(SETTINGS_REGISTRY, key);
}

export function defaultSettings(): SiteSettings {
  const result = {} as Record<string, unknown>;
  for (const def of SETTING_DEFINITIONS) result[def.key] = def.defaultValue;
  return result as unknown as SiteSettings;
}

/**
 * Coerce a stored JSON value to the definition's type, falling back to the
 * default when the stored shape is wrong (e.g. after a type change).
 */
export function coerceSetting<K extends SettingKey>(
  key: K,
  value: unknown,
): SiteSettings[K] {
  const def = SETTINGS_REGISTRY[key];
  switch (def.type) {
    case "list":
      return (
        Array.isArray(value) && value.every((v) => typeof v === "string")
          ? value
          : def.defaultValue
      ) as SiteSettings[K];
    case "items":
      return (
        Array.isArray(value) &&
        value.every(
          (v) =>
            v &&
            typeof v === "object" &&
            typeof (v as SettingItem).title === "string" &&
            typeof (v as SettingItem).body === "string",
        )
          ? value
          : def.defaultValue
      ) as SiteSettings[K];
    case "stats":
      return (
        Array.isArray(value) &&
        value.every(
          (v) =>
            v &&
            typeof v === "object" &&
            typeof (v as SettingStat).label === "string" &&
            typeof (v as SettingStat).value === "number",
        )
          ? value
          : def.defaultValue
      ) as SiteSettings[K];
    default:
      return (typeof value === "string" ? value : def.defaultValue) as SiteSettings[K];
  }
}
