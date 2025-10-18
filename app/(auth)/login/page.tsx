'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (res.ok && data?.success) {
        router.push('/login/otp');
      } else {
        setError(data?.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('Unable to reach authentication service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left: full-bleed banner */}
      <div className="relative min-h-[40vh] md:min-h-screen">
        <Image
          src="/banner.png"
          alt="Login banner"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Right: centered form */}
      <div className="flex items-center justify-center p-6 bg-[var(--card)]">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Image src="/logo.svg" alt="SNBC" width={160} height={40} priority className="h-8 w-auto" />
          </div>
          <h1 className="text-xl font-semibold text-[color:var(--foreground)]">Log In</h1>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">Use your SNBC credentials to continue</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)]">Username</label>
              <input
                className="mt-1 w-full rounded border border-[var(--input)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)]">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded border border-[var(--input)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-[color:var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
              aria-busy={loading}
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                </svg>
              )}
              <span>Continue</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}






