'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

export default function PostJobPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login?redirect=/employer/post');
      return;
    }

    if (user.role !== 'EMPLOYER' && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return <p className="text-sm text-slate-500">Loading account…</p>;
  }

  if (!user || (user.role !== 'EMPLOYER' && user.role !== 'ADMIN')) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title,
      description,
      skills: skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      location,
      salary: salary || undefined,
    };

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Failed to post job');
      }

      const data = await response.json();
      setSuccessMessage(
        `Job posted. ${data.matches?.length ?? 0} matching seekers notified in your dashboard.`
      );
      setTitle('');
      setDescription('');
      setSkills('');
      setLocation('');
      setSalary('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Post a new job</h1>
        <p className="text-sm text-slate-600">
          Share a role once and distribute it across your connected job boards.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            Job title
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[150px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="skills" className="text-sm font-medium text-slate-700">
            Desired skills (comma separated)
          </label>
          <input
            id="skills"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="React, Node.js, SQL"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="location" className="text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Remote, New York, etc."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="salary" className="text-sm font-medium text-slate-700">
            Salary range
          </label>
          <input
            id="salary"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            placeholder="$120k - $150k"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {successMessage ? (
          <p className="text-sm text-green-600">{successMessage}</p>
        ) : null}
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Publishing…' : 'Publish job'}
        </button>
      </form>
    </div>
  );
}
