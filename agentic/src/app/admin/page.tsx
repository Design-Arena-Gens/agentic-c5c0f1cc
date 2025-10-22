'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

type Overview = {
  counts: {
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
  };
  users: { id: string; name: string; email: string; role: string; createdAt: string }[];
  jobs: {
    id: string;
    title: string;
    location: string;
    createdAt: string;
    employer: { id: string; name: string; email: string };
  }[];
  applications: {
    id: string;
    createdAt: string;
    job: { id: string; title: string };
    seeker: { id: string; name: string; email: string };
  }[];
};

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login?redirect=/admin');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const loadOverview = async () => {
      try {
        const response = await fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error ?? 'Failed to load admin overview');
        }
        const data = await response.json();
        setOverview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load admin data');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [user, token, router, authLoading]);

  if (authLoading) {
    return <p className="text-sm text-slate-500">Loading account…</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Admin control center</h1>
        <p className="text-sm text-slate-600">
          Monitor marketplace health, growth, and operational metrics.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {overview ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Users</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {overview.counts.totalUsers}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Jobs</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {overview.counts.totalJobs}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Applications</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {overview.counts.totalApplications}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="lg:col-span-1 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Latest users</h2>
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                {overview.users.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-slate-800">{entry.name}</p>
                    <p className="text-xs text-slate-500">{entry.email}</p>
                    <p className="text-xs text-slate-400">Role: {entry.role}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="lg:col-span-2 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Recent jobs</h2>
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                {overview.jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-slate-800">{job.title}</p>
                    <p className="text-xs text-slate-500">
                      {job.location} · {job.employer.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Recent applications</h2>
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              {overview.applications.slice(0, 8).map((application) => (
                <div key={application.id} className="border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                  <p className="text-sm font-medium text-slate-800">
                    {application.seeker.name}
                    <span className="ml-2 text-xs text-slate-500">{application.seeker.email}</span>
                  </p>
                  <p className="text-xs text-slate-500">Applied to {application.job.title}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(application.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
