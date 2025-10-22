'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

type Application = {
  id: string;
  message: string | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    employer: {
      name: string;
      email: string;
    };
  };
};

export default function SeekerApplicationsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login?redirect=/seeker/applications');
      return;
    }
    if (user.role !== 'SEEKER' && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const loadApplications = async () => {
      try {
        const response = await fetch('/api/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error ?? 'Failed to load applications');
        }
        const data = await response.json();
        setApplications(data.applications ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load applications');
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
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
        <h1 className="text-3xl font-semibold text-slate-900">Your applications</h1>
        <p className="text-sm text-slate-600">
          Track the jobs you’ve applied to and stay on top of in-progress conversations.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-4">
        {applications.map((application) => (
          <div key={application.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{application.job.title}</h2>
                <p className="text-sm text-slate-600">{application.job.location}</p>
                <p className="text-xs text-slate-500">{application.job.employer.name}</p>
              </div>
              <p className="text-xs text-slate-500">
                Applied {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            {application.message ? (
              <p className="text-sm text-slate-600">“{application.message}”</p>
            ) : null}
          </div>
        ))}

        {!loading && applications.length === 0 ? (
          <p className="text-sm text-slate-500">You have not applied to any jobs yet.</p>
        ) : null}
      </div>
    </div>
  );
}
