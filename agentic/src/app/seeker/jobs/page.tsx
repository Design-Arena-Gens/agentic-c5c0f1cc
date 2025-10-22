'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: string | null;
  matchScore?: number | null;
  skills: string[];
  employer: { id: string; name: string; email: string };
};

export default function SeekerJobsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login?redirect=/seeker/jobs');
      return;
    }
    if (user.role !== 'SEEKER' && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const loadJobs = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (locationFilter) params.set('location', locationFilter);
      if (user?.role === 'SEEKER') params.set('seekerId', user.id);

      try {
        const response = await fetch(`/api/jobs?${params.toString()}`);
        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error ?? 'Failed to load jobs');
        }
        const data = await response.json();
        const mapped = (data.jobs ?? []).map((job: Job) => ({
          ...job,
          skills: Array.isArray(job.skills) ? job.skills : [],
        }));
        setJobs(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load jobs');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user, router, search, locationFilter, authLoading]);

  const handleApply = async (event: FormEvent<HTMLFormElement>, jobId: string) => {
    event.preventDefault();
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, message: applicationMessage || 'Excited to apply!' }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Failed to apply');
      }

      setSubmitStatus('Application sent');
      setActiveJobId(null);
      setApplicationMessage('');
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Unable to submit application');
    }
  };

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }, [jobs]);

  if (authLoading) {
    return <p className="text-sm text-slate-500">Loading account…</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Recommended roles</h1>
        <p className="text-sm text-slate-600">
          Jobs curated for your skills and preferences. Apply with one click and keep track of your pipeline.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Keyword
          </label>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="product, react, lead"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Location
          </label>
          <input
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            placeholder="Remote, Austin, etc."
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-end sm:col-span-1">
          <button
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
            onClick={() => {
              setSearch('');
              setLocationFilter('');
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {submitStatus ? <p className="text-sm text-blue-600">{submitStatus}</p> : null}

      <div className="space-y-6">
        {sortedJobs.map((job) => (
          <div key={job.id} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{job.title}</h2>
                <p className="text-sm text-slate-600">{job.location}</p>
                <p className="text-xs text-slate-500">Posted by {job.employer.name}</p>
              </div>
              <div className="text-right text-sm text-slate-500">
                {job.matchScore != null ? (
                  <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    Match score {(job.matchScore * 100).toFixed(0)}%
                  </p>
                ) : null}
                {job.salary ? <p className="mt-2 text-xs">{job.salary}</p> : null}
              </div>
            </div>
            <p className="text-sm text-slate-600">{job.description}</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {skill}
                </span>
              ))}
            </div>
            <div className="space-y-3">
              {activeJobId === job.id ? (
                <form className="space-y-3" onSubmit={(event) => handleApply(event, job.id)}>
                  <textarea
                    value={applicationMessage}
                    onChange={(event) => setApplicationMessage(event.target.value)}
                    placeholder="Introduce yourself"
                    className="min-h-[120px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Submit application
                    </button>
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-500 hover:text-slate-700"
                      onClick={() => {
                        setActiveJobId(null);
                        setApplicationMessage('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="rounded-md border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                  onClick={() => setActiveJobId(job.id)}
                >
                  Apply now
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && sortedJobs.length === 0 ? (
          <p className="text-sm text-slate-500">No jobs match your filters yet.</p>
        ) : null}
      </div>
    </div>
  );
}
