'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

export default function SeekerProfilePage() {
  const { user, token, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login?redirect=/seeker/profile');
      return;
    }
    if (user.role !== 'SEEKER' && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error ?? 'Failed to load profile');
        }
        const data = await response.json();
        const current = data.user;
        setName(current.name ?? '');
        setSkills(Array.isArray(current.skills) ? current.skills.join(', ') : '');
        setExperience(current.experience ?? '');
        setPreferredRole(current.preferredRole ?? '');
        setPreferredLocation(current.preferredLocation ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, token, router, authLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          skills: skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean),
          experience,
          preferredRole,
          preferredLocation,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Failed to update profile');
      }

      const data = await response.json();
      updateUser(data.user);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update profile');
    }
  };

  if (authLoading) {
    return <p className="text-sm text-slate-500">Loading account…</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Your profile</h1>
        <p className="text-sm text-slate-600">
          Keep your skills and preferences up to date to get the best matching roles.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="skills" className="text-sm font-medium text-slate-700">
            Skills (comma separated)
          </label>
          <input
            id="skills"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="experience" className="text-sm font-medium text-slate-700">
            Experience summary
          </label>
          <textarea
            id="experience"
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            className="min-h-[120px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="preferredRole" className="text-sm font-medium text-slate-700">
            Preferred role
          </label>
          <input
            id="preferredRole"
            value={preferredRole}
            onChange={(event) => setPreferredRole(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="preferredLocation" className="text-sm font-medium text-slate-700">
            Preferred location
          </label>
          <input
            id="preferredLocation"
            value={preferredLocation}
            onChange={(event) => setPreferredLocation(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
