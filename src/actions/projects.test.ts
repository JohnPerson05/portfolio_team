import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Project CMS actions. Prisma, auth, and the Next cache are mocked so these
 * tests exercise the guard → validate → mutate → revalidate sequence without a
 * database.
 */

vi.mock("@/lib/prisma", () => {
  const client = {
    project: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    projectTechnology: { deleteMany: vi.fn(), createMany: vi.fn() },
    projectMedia: { deleteMany: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
    technology: { findMany: vi.fn() },
    activityLog: { create: vi.fn() },
    $transaction: vi.fn(),
  };
  return { __esModule: true, default: client, prisma: client };
});

class RedirectError extends Error {
  constructor() {
    super("NEXT_REDIRECT");
  }
}
vi.mock("@/lib/auth", () => ({ __esModule: true, requireAdmin: vi.fn() }));
vi.mock("next/cache", () => ({ __esModule: true, revalidatePath: vi.fn() }));

import { revalidatePath } from "next/cache";
import type { ProjectInput } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  deleteProjectPermanently,
  reorderProjects,
  restoreProject,
  saveProject,
  setProjectStatus,
  trashProject,
} from "./projects";

type Mock = ReturnType<typeof vi.fn>;
const db = prisma as unknown as {
  project: Record<"create" | "update" | "delete" | "findFirst" | "findUnique", Mock>;
  projectTechnology: Record<"deleteMany" | "createMany", Mock>;
  projectMedia: Record<"deleteMany" | "updateMany" | "create", Mock>;
  technology: Record<"findMany", Mock>;
  activityLog: Record<"create", Mock>;
  $transaction: Mock;
};
const mockedRequireAdmin = requireAdmin as unknown as Mock;
const mockedRevalidate = revalidatePath as unknown as Mock;

const ADMIN = { id: "admin-1", email: "owner@example.com", name: "Owner", role: "SUPER_ADMIN" };

function input(overrides: Record<string, unknown> = {}): ProjectInput {
  return {
    title: "PetCury",
    slug: "petcury",
    shortDescription: "Clinic management.",
    problem: "Disconnected processes.",
    solution: "One platform.",
    result: "Faster bookings.",
    technologyIds: ["tech-1"],
    media: [{ mediaType: "IMAGE" as const, url: "https://x.public.blob.vercel-storage.com/a.png" }],
    ...overrides,
  } as ProjectInput;
}

function savedRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    title: "PetCury",
    slug: "petcury",
    status: "DRAFT",
    updatedAt: new Date("2026-10-05T00:00:00Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedRequireAdmin.mockResolvedValue(ADMIN);
  // Interactive transactions run the callback against the same mocked client.
  db.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function" ? (arg as (tx: unknown) => unknown)(db) : Promise.all(arg as unknown[]),
  );
  db.technology.findMany.mockResolvedValue([{ id: "tech-1" }]);
  db.projectMedia.updateMany.mockResolvedValue({ count: 0 });
});

describe("auth guard", () => {
  it.each([
    ["saveProject", () => saveProject(null, input(), "draft")],
    ["setProjectStatus", () => setProjectStatus("p1", "PUBLISHED")],
    ["trashProject", () => trashProject("p1")],
    ["restoreProject", () => restoreProject("p1")],
    ["deleteProjectPermanently", () => deleteProjectPermanently("p1")],
    ["reorderProjects", () => reorderProjects(["p1", "p2"])],
  ])("%s writes nothing when the caller is not signed in", async (_name, call) => {
    mockedRequireAdmin.mockRejectedValueOnce(new RedirectError());
    await expect(call()).rejects.toThrow("NEXT_REDIRECT");
    expect(db.project.create).not.toHaveBeenCalled();
    expect(db.project.update).not.toHaveBeenCalled();
    expect(db.project.delete).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

describe("saveProject", () => {
  it("rejects invalid input with field errors and writes nothing", async () => {
    const result = await saveProject(null, input({ title: "", slug: "Not A Slug" }), "draft");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.title).toBeDefined();
      expect(result.fieldErrors?.slug).toBeDefined();
    }
    expect(db.project.create).not.toHaveBeenCalled();
  });

  it("rejects unsafe link schemes", async () => {
    const result = await saveProject(null, input({ projectUrl: "javascript:alert(1)" }), "draft");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.projectUrl).toBeDefined();
  });

  it("lets drafts be saved without the full story", async () => {
    db.project.create.mockResolvedValue(savedRow());
    const result = await saveProject(null, input({ problem: "", solution: "", result: "" }), "draft");
    expect(result.success).toBe(true);
    expect(db.project.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "DRAFT", updatedById: "admin-1" }) }),
    );
  });

  it("refuses to publish an incomplete story", async () => {
    const result = await saveProject(null, input({ result: "" }), "publish");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.result).toBeDefined();
    expect(db.project.create).not.toHaveBeenCalled();
  });

  it("publishes, stamps publishedAt, writes relations, and revalidates", async () => {
    db.project.create.mockResolvedValue(savedRow({ status: "PUBLISHED" }));
    const result = await saveProject(null, input(), "publish");
    expect(result.success).toBe(true);
    const data = db.project.create.mock.calls[0]?.[0].data;
    expect(data.status).toBe("PUBLISHED");
    expect(data.publishedAt).toBeInstanceOf(Date);
    expect(db.projectTechnology.createMany).toHaveBeenCalledWith({
      data: [{ projectId: "p1", technologyId: "tech-1" }],
    });
    expect(db.projectMedia.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ projectId: "p1", displayOrder: 0 }),
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/", "layout");
  });

  it("keeps the current status on a plain save", async () => {
    db.project.findFirst.mockResolvedValue({ status: "PUBLISHED", publishedAt: new Date("2026-01-01") });
    db.project.update.mockResolvedValue(savedRow({ status: "PUBLISHED" }));
    await saveProject("p1", input(), "save");
    expect(db.project.update.mock.calls[0]?.[0].data.status).toBe("PUBLISHED");
  });

  it("maps a duplicate slug to a slug field error", async () => {
    const { Prisma } = await import("@prisma/client");
    db.project.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", { code: "P2002", clientVersion: "6" }),
    );
    const result = await saveProject(null, input(), "draft");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.slug?.[0]).toMatch(/already uses/);
  });
});

describe("status and deletion", () => {
  it("publishing via status requires a complete story", async () => {
    db.project.findFirst.mockResolvedValue({ ...savedRow(), shortDescription: "x", problem: "", solution: "y", result: "z" });
    const result = await setProjectStatus("p1", "PUBLISHED");
    expect(result.success).toBe(false);
    expect(db.project.update).not.toHaveBeenCalled();
  });

  it("archiving hides a project without deleting it", async () => {
    db.project.findFirst.mockResolvedValue({ ...savedRow({ status: "PUBLISHED" }), shortDescription: "x", problem: "y", solution: "y", result: "z", publishedAt: new Date() });
    db.project.update.mockResolvedValue(savedRow({ status: "ARCHIVED" }));
    const result = await setProjectStatus("p1", "ARCHIVED");
    expect(result.success).toBe(true);
    expect(db.project.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "ARCHIVED" }) }));
    expect(db.project.delete).not.toHaveBeenCalled();
  });

  it("trash is a soft delete", async () => {
    db.project.update.mockResolvedValue(savedRow());
    await trashProject("p1");
    expect(db.project.update.mock.calls[0]?.[0].data.deletedAt).toBeInstanceOf(Date);
    expect(db.project.delete).not.toHaveBeenCalled();
  });

  it("restored projects come back as drafts", async () => {
    db.project.update.mockResolvedValue(savedRow());
    await restoreProject("p1");
    expect(db.project.update.mock.calls[0]?.[0].data).toMatchObject({ deletedAt: null, status: "DRAFT" });
  });

  it("only permanently deletes projects already in the trash", async () => {
    db.project.findUnique.mockResolvedValue({ ...savedRow(), deletedAt: null });
    const blocked = await deleteProjectPermanently("p1");
    expect(blocked.success).toBe(false);
    expect(db.project.delete).not.toHaveBeenCalled();

    db.project.findUnique.mockResolvedValue({ ...savedRow(), deletedAt: new Date() });
    const ok = await deleteProjectPermanently("p1");
    expect(ok.success).toBe(true);
    expect(db.project.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });
});

describe("reorderProjects", () => {
  it("assigns displayOrder by position", async () => {
    db.project.update.mockImplementation((args: unknown) => args);
    await reorderProjects(["b", "a", "c"]);
    expect(db.project.update).toHaveBeenNthCalledWith(1, { where: { id: "b" }, data: { displayOrder: 0 } });
    expect(db.project.update).toHaveBeenNthCalledWith(3, { where: { id: "c" }, data: { displayOrder: 2 } });
  });

  it("rejects duplicate ids", async () => {
    const result = await reorderProjects(["a", "a"]);
    expect(result.success).toBe(false);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});
