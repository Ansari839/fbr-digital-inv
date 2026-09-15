"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            go back to login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we will send a reset request to the administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-md bg-emerald-50 p-4 border border-emerald-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-emerald-800">Request submitted successfully</h3>
                    <div className="mt-2 text-sm text-emerald-700">
                      <p>
                        The system administrator has been notified. They will generate a temporary password for you shortly.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link href="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                        <span aria-hidden="true">&larr;</span> Back to login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
                    {error}
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting request...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
