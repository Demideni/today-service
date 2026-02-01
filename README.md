# AutoService (MVP)

Web/PWA app for auto repair shops:
- Organizations (shops) + staff
- Work orders + tasks
- Task statuses
- Step checklist
- Photo gates (BEFORE required to start, AFTER required to finish)
- Client tracking link `/t/<token>` (read-only)

## Local setup

1) Install deps:
```bash
npm i
```

2) Create `.env`:
```bash
cp .env.example .env
```

Required:
- `DATABASE_URL` (Postgres)
- `JWT_SECRET` (any long random string)

Optional (for photos):
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_PUBLIC_BASEURL`

3) Migrate DB:
```bash
npx prisma migrate dev --name init
```

If you already migrated earlier and pulled new schema changes:
```bash
npx prisma migrate dev --name add_assignee_relation
```

4) Run:
```bash
npm run dev
```

## App routes

- `/register` – create a shop + owner user (+ demo work order)
- `/login` – login
- `/app` – dashboard (manager view, assign tasks)
- `/app/tasks` – “My tasks” (mechanic view)
- `/t/<token>` – client progress link

## Notes

Photo uploads require S3-compatible storage (AWS S3 / Cloudflare R2 / MinIO).
Without S3 env vars, the app still works, but uploads will show an error.
