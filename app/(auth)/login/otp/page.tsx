'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(30);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  function onChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (res.ok && data?.success) {
        router.push('/dashboard');
      } else {
        setError(data?.error || 'Invalid code');
      }
    } catch (err) {
      setError('Unable to verify code');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (resendIn > 0 || resending) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const res = await fetch('/api/auth/otp/resend', { method: 'POST' });
      const data = await res.json().catch(() => ({ success: false }));
      if (res.ok && data?.success) {
        setInfo('A new code has been sent.');
        setResendIn(30);
      } else {
        setError(data?.error || 'Unable to resend code');
      }
    } catch (err) {
      setError('Unable to resend code');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <div className="mb-4 flex justify-center">
          <Image src="/logo.svg" alt="SNBC" width={160} height={40} priority className="h-8 w-auto" />
        </div>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mb-2 inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] hover:opacity-80"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          Back to login
        </button>
        <h1 className="text-xl font-semibold text-[color:var(--foreground)]">Enter verification code</h1>
        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">We sent a 6-digit code to your device</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)]">One-time code</label>
            <input
              inputMode="numeric"
              pattern="\d{6}"
              placeholder="123456"
              className="mt-1 w-full tracking-widest text-center text-lg rounded border border-[var(--input)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={otp}
              onChange={(e) => onChange(e.target.value)}
              required
            />
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">6 digits</p>
          </div>
          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>
          )}
          {info && (
            <div className="rounded border border-[var(--border)] bg-[var(--muted)] p-2 text-sm text-[color:var(--foreground)]">{info}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[var(--primary)] px-4 py-2 text-[color:var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            Verify
          </button>
          <div className="flex items-center justify-between text-xs text-[color:var(--muted-foreground)]">
            <span>{resendIn > 0 ? `Resend available in ${resendIn}s` : 'You can request a new code.'}</span>
            <button
              type="button"
              onClick={onResend}
              disabled={resendIn > 0 || resending}
              className={`underline ${resendIn > 0 || resending ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
              aria-disabled={resendIn > 0 || resending}
            >
              Resend code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





