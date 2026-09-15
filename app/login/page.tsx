"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background gradients/blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute top-[60%] right-[10%] w-[30%] h-[40%] rounded-full bg-emerald-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 mx-4">
        
        {/* Left side: Branding / Illustration */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-900/40 to-slate-900/80 border-r border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">SyncPro</h1>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              FBR Digital <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Invoicing</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Manage your business with seamlessly integrated FBR digital invoicing. Fast, secure, and fully compliant with the latest tax regulations.
            </p>
          </div>
          <div className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} MS Techs. All rights reserved.
          </div>
        </div>

        {/* Right side: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto space-y-8">
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h3>
              <p className="text-sm text-slate-500">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              {error && (
                <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
