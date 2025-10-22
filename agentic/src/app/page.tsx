import Link from 'next/link';

export default function Home() {
  return (
    <section className="grid gap-16 lg:grid-cols-2 lg:items-center">
      <div className="space-y-8">
        <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
          Two-sided marketplace
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Post once. Match fast. Hire the right talent.
        </h1>
        <p className="text-lg text-slate-600">
          Agentic Jobs helps employers distribute roles across job boards and instantly
          surface qualified candidates. Job seekers get a curated feed tailored to their
          skills and career goals.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup?role=EMPLOYER"
            className="rounded-md bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Get started as employer
          </Link>
          <Link
            href="/signup?role=SEEKER"
            className="rounded-md border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          >
            Join as job seeker
          </Link>
        </div>
      </div>
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Why Agentic?</h2>
        <ul className="space-y-4 text-sm text-slate-600">
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            Distribute new roles to multiple job boards with a single submission.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            Smart skill matching keeps seekers focused on the most relevant openings.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            Track applicants, conversations, and job performance from one dashboard.
          </li>
        </ul>
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm">
          <p className="font-semibold text-slate-800">MVP Credentials</p>
          <p className="text-slate-600">Employer: employer@acme.com / employer123</p>
          <p className="text-slate-600">Seeker: jane@example.com / seeker123</p>
          <p className="text-slate-600">Admin: admin@example.com / admin123</p>
        </div>
      </div>
    </section>
  );
}
