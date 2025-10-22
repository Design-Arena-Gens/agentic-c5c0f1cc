'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

const roles = [
  { value: 'EMPLOYER' as const, label: 'Employer' },
  { value: 'SEEKER' as const, label: 'Job Seeker' },
];

function SignupPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<'EMPLOYER' | 'SEEKER'>(
    (params.get('role') as 'EMPLOYER' | 'SEEKER') ?? 'EMPLOYER'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const seekerSelected = useMemo(() => role === 'SEEKER', [role]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload: Record<string, unknown> = {
      name,
      email,
      password,
      role,
    };

    if (seekerSelected) {
      payload.skills =
        skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean) ?? [];
      payload.experience = experience;
      payload.preferredRole = preferredRole;
      payload.preferredLocation = preferredLocation;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Failed to create account');
      }

      const data = await response.json();
      login(data.user, data.token);

      if (seekerSelected) {
        router.push('/seeker/jobs');
      } else {
        router.push('/employer/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">
          Choose your role and start hiring or applying in minutes.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-3">
          {roles.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                role === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
              }`}
              onClick={() => setRole(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Work email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
            minLength={6}
          />
        </div>

        {seekerSelected ? (
          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-1">
              <label htmlFor="skills" className="text-sm font-medium text-slate-700">
                Skills (comma separated)
              </label>
              <input
                id="skills"
                type="text"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="React, Node.js, Product Design"
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
                className="min-h-[100px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="preferredRole" className="text-sm font-medium text-slate-700">
                Preferred role
              </label>
              <input
                id="preferredRole"
                type="text"
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
                type="text"
                value={preferredLocation}
                onChange={(event) => setPreferredLocation(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <SignupPageContent />
    </Suspense>
  );
}
