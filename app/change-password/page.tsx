"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      // Hard refresh to reload the session and redirect to dashboard
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute top-[60%] right-[10%] w-[30%] h-[40%] rounded-full bg-rose-600/20 blur-[100px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">
          Update Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          For security reasons, you must change your temporary password before accessing the dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Card className="border-white/10 bg-white/10 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Action Required
            </CardTitle>
            <CardDescription className="text-slate-300">
              Please choose a strong, secure password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="password" className="text-slate-200">New Password</Label>
                <div className="mt-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-slate-200">Confirm New Password</Label>
                <div className="mt-2">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded-md p-3">
                  {error}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  disabled={isLoading || !password || !confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
