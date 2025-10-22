'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

type Applicant = {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: string | null;
  message?: string | null;
};

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: string | null;
  createdAt: string;
  skills: string[];
  applications: { id: string; message: string | null; seeker: Applicant }[];
};

export default function EmployerDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login?redirect=/employer/dashboard');
      return;
    }
    if (user.role !== 'EMPLOYER' && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/employer/jobs', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error ?? 'Failed to load jobs');
        }

        const data = await response.json();
        setJobs(Array.isArray(data.jobs) ? (data.jobs as Job[]) : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, token, router, authLoading]);

  const totalApplicants = jobs.reduce((sum, job) => sum + job.applications.length, 0);

  if (authLoading) {
    return <p className="text-sm text-slate-500">Loading account…</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Employer dashboard</h1>
          <p className="text-sm text-slate-600">
            Track your open roles, review applicants, and manage pipeline.
          </p>
        </div>
        <Link
          href="/employer/post"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Post a job
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open roles</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{jobs.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Applicants</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totalApplicants}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Avg applicants / job</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {jobs.length > 0 ? (totalApplicants / jobs.length).toFixed(1) : '0.0'}
          </p>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading jobs…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-6">
        {jobs.map((job) => (
          <div key={job.id} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{job.title}</h2>
                <p className="text-sm text-slate-600">{job.location}</p>
              </div>
              <div className="text-sm text-slate-500">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
            <p className="text-sm text-slate-600">{job.description}</p>
            <div className="flex flex-wrap gap-2">
              {(job.skills ?? []).map((skill) => (
                <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {skill}
                </span>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Applicants ({job.applications.length})
              </h3>
              <div className="mt-3 space-y-3">
                {job.applications.length === 0 ? (
                  <p className="text-sm text-slate-500">No applicants yet.</p>
                ) : (
                  job.applications.map((application) => (
                    <div key={application.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {application.seeker.name}{' '}
                          <span className="font-normal text-slate-500">({application.seeker.email})</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Skills: {(application.seeker.skills ?? []).join(', ') || 'No skills listed'}
                        </p>
                        {application.message ? (
                          <p className="text-sm text-slate-600">“{application.message}”</p>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
