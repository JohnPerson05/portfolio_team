import prisma from "@/lib/prisma";

/**
 * Find where each URL is referenced across the CMS, as human-readable labels
 * ("Project · PetCury"). Used by the media library's "Used by" column and to
 * warn before deleting a file that is still in use.
 */
export async function findMediaUsage(
  urls: string[],
): Promise<Map<string, string[]>> {
  const usage = new Map<string, string[]>(urls.map((u) => [u, []]));
  if (urls.length === 0) return usage;
  const add = (url: string | null | undefined, label: string) => {
    if (url && usage.has(url)) usage.get(url)!.push(label);
  };
  const inList = { in: urls };

  const [projects, media, team, services, testimonials, technologies, steps, settings] =
    await Promise.all([
      prisma.project.findMany({
        where: { OR: [{ coverImage: inList }, { heroImage: inList }, { ogImage: inList }] },
        select: { title: true, coverImage: true, heroImage: true, ogImage: true, deletedAt: true },
      }),
      prisma.projectMedia.findMany({
        where: { OR: [{ url: inList }, { thumbnailUrl: inList }] },
        select: { url: true, thumbnailUrl: true, project: { select: { title: true } } },
      }),
      prisma.teamMember.findMany({
        where: { profileImage: inList },
        select: { name: true, profileImage: true },
      }),
      prisma.service.findMany({ where: { image: inList }, select: { title: true, image: true } }),
      prisma.testimonial.findMany({
        where: { OR: [{ avatar: inList }, { logoUrl: inList }] },
        select: { name: true, avatar: true, logoUrl: true },
      }),
      prisma.technology.findMany({ where: { icon: inList }, select: { name: true, icon: true } }),
      prisma.processStep.findMany({ where: { visual: inList }, select: { title: true, visual: true } }),
      prisma.siteSetting.findMany({ select: { key: true, value: true } }),
    ]);

  for (const p of projects) {
    const label = `Project · ${p.title}${p.deletedAt ? " (trash)" : ""}`;
    add(p.coverImage, label);
    if (p.heroImage !== p.coverImage) add(p.heroImage, label);
    add(p.ogImage, `${label} (SEO)`);
  }
  for (const m of media) {
    add(m.url, `Gallery · ${m.project.title}`);
    add(m.thumbnailUrl, `Gallery · ${m.project.title}`);
  }
  for (const t of team) add(t.profileImage, `Team · ${t.name}`);
  for (const s of services) add(s.image, `Service · ${s.title}`);
  for (const t of testimonials) {
    add(t.avatar, `Testimonial · ${t.name}`);
    add(t.logoUrl, `Testimonial · ${t.name}`);
  }
  for (const t of technologies) add(t.icon, `Technology · ${t.name}`);
  for (const s of steps) add(s.visual, `Process · ${s.title}`);
  for (const s of settings) {
    if (typeof s.value === "string") add(s.value, `Setting · ${s.key}`);
  }

  for (const [url, labels] of usage) usage.set(url, [...new Set(labels)]);
  return usage;
}
