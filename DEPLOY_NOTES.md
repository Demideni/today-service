# Deploy notes (Render + DreamHost DNS)

## New features added
- Mobile-style bottom tab bar (bigger buttons)
- Team invites + roles
- Task chat
- Mechanic knowledge base templates (auto-seeded on first registration)
- Public booking page `/book/<orgSlug>` + manager bookings list
- Public marketplace `/market`

## IMPORTANT: Prisma migration required
I updated `prisma/schema.prisma` (added tables: Invite, TaskMessage, BookingRequest, Listing, WorkTemplate, etc. + `Organization.slug`).

Before deploy works, you MUST generate and run a migration:

```bash
npx prisma migrate dev --name add-invites-chat-bookings-market
```

On Render, set Build Command to include migrations, for example:
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

## Environment variables
- `DATABASE_URL` (Render Postgres)
- `JWT_SECRET` (random long string)
- `PUBLIC_BASE_URL` (your domain, e.g. https://today-service.com) — used for invite links

## Public pages
- Booking: `/book/<orgSlug>` (orgSlug is created automatically from org name)
- Marketplace: `/market`
