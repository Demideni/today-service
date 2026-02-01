export default function Home() {
  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">AutoService SaaS</h1>
      <p className="text-sm opacity-80">
        MVP: mechanic tasks + checklists + required photos (before/after) + public client tracking link.
      </p>
      <div className="flex gap-3">
        <a className="underline" href="/register">Register</a>
        <a className="underline" href="/login">Login</a>
        <a className="underline" href="/app">Open App</a>
      </div>
    </main>
  );
}
