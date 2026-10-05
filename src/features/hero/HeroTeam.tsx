import { MemberPortrait } from "@/features/studio/Team";
import { cn } from "@/lib/utils";
import type { TeamMemberView } from "@/types";

export type HeroMember = Pick<
  TeamMemberView,
  "id" | "name" | "role" | "initials" | "profileImage"
>;

/**
 * Homepage hero visual for a team: every featured member's portrait, side by
 * side and gently staggered, joined by a "+" on the two-person layout. Members
 * without a photo get the branded placeholder until one is uploaded in
 * Admin → Team. Scales to three or more members as a simple grid.
 */
export function HeroTeam({ members }: { members: readonly HeroMember[] }) {
  const pair = members.length === 2;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        aria-hidden="true"
        className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,var(--accent-cool),transparent_68%)] opacity-[0.1] blur-2xl"
      />
      <ul
        className={cn(
          "relative grid gap-space-2 sm:gap-space-3",
          members.length >= 3 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {members.map((member, index) => (
          <li
            key={member.id}
            className={cn(
              "list-none",
              // Offset every other card so the pair reads as a composition.
              pair && index === 1 && "translate-y-space-6 sm:translate-y-space-8",
            )}
          >
            <figure className="overflow-hidden rounded-2xl border border-white/10 bg-[#090b0e]/90 shadow-2xl shadow-black/50">
              <MemberPortrait
                member={member}
                priority
                sizes="(max-width: 1024px) 45vw, 14rem"
                className="rounded-none border-0"
              />
              <figcaption className="border-t border-white/10 p-space-2 sm:p-space-3">
                <p className="line-clamp-2 font-display text-caption font-semibold text-text sm:text-body">
                  {member.name}
                </p>
                <p className="mt-0.5 line-clamp-2 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-muted sm:text-[0.6rem]">
                  {member.role}
                </p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {pair ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[42%] z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-bg font-display text-h3 text-accent shadow-[0_0_40px_-6px_rgba(212,175,55,0.5)] sm:h-14 sm:w-14"
        >
          +
        </div>
      ) : null}
      <div
        className={cn(
          "relative flex justify-end",
          // Clear the offset second card in the pair layout.
          pair ? "mt-space-8 sm:mt-space-10" : "mt-space-3 sm:mt-space-4",
        )}
      >
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-space-2 py-1 font-mono text-[0.62rem] uppercase tracking-wider text-emerald-300 backdrop-blur">
          <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Available for projects
        </span>
      </div>
    </div>
  );
}
