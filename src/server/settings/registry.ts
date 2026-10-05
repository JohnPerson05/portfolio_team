/**
 * Site settings registry — every key the CMS can edit, its input type, the
 * group it appears under in /admin/settings, and the value used until someone
 * saves one.
 *
 * Defaults are the original portfolio's copy (john-person.vercel.app), so the
 * site looks exactly as it did before the CMS until something is edited.
 *
 * Values live in the `SiteSetting` table (JSONB). Unknown keys in the table
 * are ignored; missing keys fall back to `defaultValue`. The seed writes these
 * defaults to the database so the CMS shows them as editable content.
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

export interface SettingChapter {
  label: string;
  title: string;
  body: string;
}

const VALUE_PROPOSITION =
  "A two-person delivery team: backend and full-stack engineering with ~6 years of enterprise experience, paired with 7+ years of Identity & Access Management, IT automation, and compliance — so what we build is secure, supported, and ready for real users.";

export interface SiteSettings {
  "studio.name": string;
  "studio.tagline": string;
  "studio.description": string;

  "hero.name": string;
  "hero.role": string;
  "hero.subtitle": string;
  "hero.portrait": string;
  "hero.cover": string;

  "craft.eyebrow": string;
  "craft.heading": string;
  "craft.chapters": SettingChapter[];
  "home.tickerItems": string[];
  "home.stats": SettingStat[];
  "home.whyUsReasons": SettingItem[];
  "home.processCover": string;

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
  | "chapters"
  | "stats";

export type SettingGroup =
  | "Site"
  | "Hero"
  | "Homepage content"
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
    label: "Site name",
    type: "text",
    group: "Site",
    help: "Shown in the navbar, footer, page titles, and structured data.",
    defaultValue: "Pairwork Studio",
  },
  "studio.tagline": {
    key: "studio.tagline",
    label: "Tagline",
    type: "text",
    group: "Site",
    defaultValue: "Engineering · Identity & Access · IT Operations",
  },
  "studio.description": {
    key: "studio.description",
    label: "Short description",
    type: "textarea",
    group: "Site",
    defaultValue: VALUE_PROPOSITION,
  },

  "hero.name": {
    key: "hero.name",
    label: "Hero name",
    type: "text",
    group: "Hero",
    defaultValue: "Pairwork Studio",
  },
  "hero.role": {
    key: "hero.role",
    label: "Role line",
    type: "text",
    group: "Hero",
    defaultValue: "Engineering · Identity & Access · IT Operations",
  },
  "hero.subtitle": {
    key: "hero.subtitle",
    label: "Introduction",
    type: "textarea",
    group: "Hero",
    defaultValue: VALUE_PROPOSITION,
  },
  "hero.portrait": {
    key: "hero.portrait",
    label: "Portrait",
    type: "image",
    group: "Hero",
    help: "Used in the hero and the 3D scroll scene.",
    defaultValue: "/images/profile.png",
  },
  "hero.cover": {
    key: "hero.cover",
    label: "Cover image",
    type: "image",
    group: "Hero",
    help: "Background of the hero and back plane of the 3D scroll scene.",
    defaultValue: "/images/cover.png",
  },

  "craft.eyebrow": {
    key: "craft.eyebrow",
    label: "3D scroll scene — eyebrow",
    type: "text",
    group: "Homepage content",
    defaultValue: "Immersive craft",
  },
  "craft.heading": {
    key: "craft.heading",
    label: "3D scroll scene — heading",
    type: "text",
    group: "Homepage content",
    defaultValue: "Scroll through the work.",
  },
  "craft.chapters": {
    key: "craft.chapters",
    label: "3D scroll scene — chapters",
    type: "chapters",
    group: "Homepage content",
    help: "Each chapter fades in as the visitor scrolls through the scene.",
    defaultValue: [
      {
        label: "01 — Presence",
        title: "A face for the system",
        body: "Portrait and cover set the atmosphere — quiet confidence before the stack, the delivery, and the product story.",
      },
      {
        label: "02 — Depth",
        title: "Layers that earn their keep",
        body: "Motion should explain hierarchy: what is close, what supports, and what stays in the background.",
      },
      {
        label: "03 — Delivery",
        title: "Built to ship, not just impress",
        body: "3D scroll is a craft tool — used to guide attention, not distract from the engineering behind it.",
      },
    ],
  },
  "home.tickerItems": {
    key: "home.tickerItems",
    label: "Capability ticker",
    type: "list",
    group: "Homepage content",
    defaultValue: [
      "Java & Spring Boot",
      "Microservices",
      "REST API engineering",
      "React & Next.js",
      "Azure DevOps CI/CD",
      "Rapid MVP delivery",
      "Identity & Access Management",
      "User access administration",
      "IT operations & support",
      "Incident & root-cause resolution",
      "AI-assisted development",
    ],
  },
  "home.stats": {
    key: "home.stats",
    label: "By the numbers",
    type: "stats",
    group: "Homepage content",
    defaultValue: [
      { label: "Specialists, one team", value: 2 },
      { label: "Combined years of experience", value: 11, suffix: "+" },
      { label: "Core Technologies", value: 30, suffix: "+" },
      { label: "Delivery Domains", value: 6 },
      { label: "AI Development Tools", value: 4 },
    ],
  },
  "home.whyUsReasons": {
    key: "home.whyUsReasons",
    label: "“Why work with us” reasons (optional section)",
    type: "items",
    group: "Homepage content",
    help: "Only shown if the “Why us” section is enabled under Homepage.",
    defaultValue: [],
  },
  "home.processCover": {
    key: "home.processCover",
    label: "Process section image (optional section)",
    type: "image",
    group: "Homepage content",
    defaultValue: "/images/cover.png",
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
      "A two-person team for enterprise systems, product integrations, MVP delivery, and secure identity & access operations.",
  },

  "seo.title": {
    key: "seo.title",
    label: "Default SEO title",
    type: "text",
    group: "SEO",
    defaultValue: "Pairwork Studio — Engineering · Identity & Access · IT Operations",
  },
  "seo.description": {
    key: "seo.description",
    label: "Default SEO description",
    type: "textarea",
    group: "SEO",
    defaultValue: VALUE_PROPOSITION,
  },
  "seo.ogImage": {
    key: "seo.ogImage",
    label: "Default social share image",
    type: "image",
    group: "SEO",
    help: "1200×630 works best.",
    defaultValue: "/images/profile.png",
  },
};

export const SETTING_GROUPS: SettingGroup[] = [
  "Site",
  "Hero",
  "Homepage content",
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

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object";

/**
 * Coerce a stored JSON value to the definition's type, falling back to the
 * default when the stored shape is wrong (e.g. after a type change).
 */
export function coerceSetting<K extends SettingKey>(
  key: K,
  value: unknown,
): SiteSettings[K] {
  const def = SETTINGS_REGISTRY[key];
  const ok = (() => {
    switch (def.type) {
      case "list":
        return Array.isArray(value) && value.every((v) => typeof v === "string");
      case "items":
        return Array.isArray(value) && value.every((v) => isObj(v) && typeof v.title === "string" && typeof v.body === "string");
      case "chapters":
        return (
          Array.isArray(value) &&
          value.every((v) => isObj(v) && typeof v.label === "string" && typeof v.title === "string" && typeof v.body === "string")
        );
      case "stats":
        return Array.isArray(value) && value.every((v) => isObj(v) && typeof v.label === "string" && typeof v.value === "number");
      default:
        return typeof value === "string";
    }
  })();
  return (ok ? value : def.defaultValue) as SiteSettings[K];
}
