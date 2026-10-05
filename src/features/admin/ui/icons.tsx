import type { SVGProps } from "react";

/**
 * Minimal stroke icon set for the CMS (Lucide-style paths, inlined so the
 * admin has no icon dependency). All icons are decorative by default.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const Icon = {
  Dashboard: (p: IconProps) => (
    <Svg {...p}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></Svg>
  ),
  Projects: (p: IconProps) => (
    <Svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></Svg>
  ),
  Team: (p: IconProps) => (
    <Svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2A5 5 0 0 1 21.5 19" /></Svg>
  ),
  Services: (p: IconProps) => (
    <Svg {...p}><path d="M12 2 3 7l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></Svg>
  ),
  Process: (p: IconProps) => (
    <Svg {...p}><circle cx="5" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="12" r="2" /><path d="M7 6h4a4 4 0 0 1 4 4v0" /><path d="M7 18h4a4 4 0 0 0 4-4v0" /></Svg>
  ),
  Quote: (p: IconProps) => (
    <Svg {...p}><path d="M7 7h4v4c0 3-2 5-4 6" /><path d="M15 7h4v4c0 3-2 5-4 6" /></Svg>
  ),
  Code: (p: IconProps) => (
    <Svg {...p}><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></Svg>
  ),
  Home: (p: IconProps) => (
    <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></Svg>
  ),
  Nav: (p: IconProps) => (
    <Svg {...p}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /></Svg>
  ),
  Settings: (p: IconProps) => (
    <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></Svg>
  ),
  Image: (p: IconProps) => (
    <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></Svg>
  ),
  Users: (p: IconProps) => (
    <Svg {...p}><path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></Svg>
  ),
  Activity: (p: IconProps) => (
    <Svg {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></Svg>
  ),
  Inbox: (p: IconProps) => (
    <Svg {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" /></Svg>
  ),
  Pen: (p: IconProps) => (
    <Svg {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" /></Svg>
  ),
  Logout: (p: IconProps) => (
    <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Svg>
  ),
  Plus: (p: IconProps) => (
    <Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>
  ),
  Grip: (p: IconProps) => (
    <Svg {...p}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></Svg>
  ),
  More: (p: IconProps) => (
    <Svg {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></Svg>
  ),
  Eye: (p: IconProps) => (
    <Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Svg>
  ),
  EyeOff: (p: IconProps) => (
    <Svg {...p}><path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2" /><path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="m2 2 20 20" /><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" /></Svg>
  ),
  Trash: (p: IconProps) => (
    <Svg {...p}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></Svg>
  ),
  Copy: (p: IconProps) => (
    <Svg {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></Svg>
  ),
  Archive: (p: IconProps) => (
    <Svg {...p}><rect x="2" y="4" width="20" height="5" rx="1" /><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" /><path d="M10 13h4" /></Svg>
  ),
  Restore: (p: IconProps) => (
    <Svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Svg>
  ),
  Star: (p: IconProps) => (
    <Svg {...p}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z" /></Svg>
  ),
  Upload: (p: IconProps) => (
    <Svg {...p}><path d="M12 16V4" /><path d="m6 10 6-6 6 6" /><path d="M4 20h16" /></Svg>
  ),
  External: (p: IconProps) => (
    <Svg {...p}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></Svg>
  ),
  Check: (p: IconProps) => (
    <Svg {...p}><path d="m5 12 5 5L20 7" /></Svg>
  ),
  X: (p: IconProps) => (
    <Svg {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>
  ),
  Alert: (p: IconProps) => (
    <Svg {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></Svg>
  ),
  Menu: (p: IconProps) => (
    <Svg {...p}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></Svg>
  ),
  ArrowLeft: (p: IconProps) => (
    <Svg {...p}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></Svg>
  ),
  ChevronUp: (p: IconProps) => (
    <Svg {...p}><path d="m18 15-6-6-6 6" /></Svg>
  ),
  ChevronDown: (p: IconProps) => (
    <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
  ),
  Video: (p: IconProps) => (
    <Svg {...p}><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4Z" /></Svg>
  ),
  Link: (p: IconProps) => (
    <Svg {...p}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></Svg>
  ),
  Search: (p: IconProps) => (
    <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Svg>
  ),
};

export type IconName = keyof typeof Icon;
