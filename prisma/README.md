# Prisma / Database

This directory holds the Prisma schema (`schema.prisma`) and SQL migrations for
the Elite Portfolio's Neon PostgreSQL database.

The app accesses the database exclusively through the shared client singleton at
[`src/lib/prisma.ts`](../src/lib/prisma.ts) (Requirement 17.3).

## Generate the client

The Prisma client is generated into `node_modules/@prisma/client` and is required
for type-safe queries. It is generated without needing a live database:

```bash
npx prisma generate
```

## Applying migrations (requires a live Neon database)

A baseline migration is checked in at `migrations/0_init/migration.sql`. It was
produced with `prisma migrate diff` and is **not** yet applied to any database.

Once a real Neon connection string is configured in `.env` as `DATABASE_URL`
(copy from `.env.example`), apply the schema with one of the following:

- **Fresh database (recommended for a new Neon branch):** baseline the checked-in
  migration so Prisma records it as already representing the initial schema, then
  deploy:

  ```bash
  # Mark the baseline migration as applied (run once on a fresh DB), then deploy.
  npx prisma migrate resolve --applied 0_init
  npx prisma migrate deploy
  ```

  Alternatively, on a brand-new empty database you can simply run:

  ```bash
  npx prisma migrate deploy
  ```

- **Local/iterative development:** let Prisma create and apply migrations
  interactively (this connects to the database):

  ```bash
  npx prisma migrate dev
  ```

> Note: `prisma migrate dev` / `deploy` require a reachable `DATABASE_URL`. They
> were intentionally **not** run during scaffolding because no live Neon database
> is configured in this environment. The schema has been validated
> (`prisma validate`) and the client generated (`prisma generate`).

## Seeding

Seed data is implemented in two files:

- [`seed-data.ts`](./seed-data.ts) — the canonical sample dataset, exported as
  plain typed constants with **no side effects**. It is imported by both the
  seed runner and the invariant tests in
  [`src/lib/seed-data.test.ts`](../src/lib/seed-data.test.ts).
- [`seed.ts`](./seed.ts) — the executable runner. It is **idempotent**: it clears
  the content tables it owns and re-inserts the dataset, so it can be run
  repeatedly without producing duplicates.

The runner is wired to Prisma via the `prisma.seed` key in `package.json`
(`tsx prisma/seed.ts`). Once a reachable `DATABASE_URL` (Neon) is configured in
`.env` and the schema has been applied (see above), seed the database with:

```bash
npx prisma db seed
# or the convenience script:
npm run db:seed
```

> Note: `prisma db seed` requires a reachable `DATABASE_URL`. It was intentionally
> **not** run during this task because no live Neon database is configured in this
> environment. The seed data and runner type-check and lint cleanly, and the
> dataset invariants are covered by unit tests.

### What gets seeded

| Model       | Count | Notes                                                                 |
| ----------- | ----- | --------------------------------------------------------------------- |
| Project     | 6     | 4 featured (distinct `order`) + 2 non-featured; mixed GitHub/Live links |
| Skill       | 16    | 4 per category across FRONTEND, BACKEND, CLOUD, AI                    |
| Experience  | 3     | 1 current role (`endDate = null`)                                     |
| Testimonial | 3     | with avatar+logo, avatar-only, and no media                           |
| Post        | 5     | 3 PUBLISHED (with `publishedAt`) + 2 DRAFT                            |

These counts satisfy the requirements exercised by downstream sections:
3.3 (projects with/without links), 6.2 (testimonials with/without media), and
7.4 (published vs. draft posts).
