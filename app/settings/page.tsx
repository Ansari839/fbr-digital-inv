"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [env, setEnv] = useState("SANDBOX");
  const [sandboxToken, setSandboxToken] = useState("");
  const [prodToken, setProdToken] = useState("");

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/settings/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsUnlocked(true);
        fetchSettings();
      } else {
        setAuthError(data.error || "Incorrect password");
      }
    } catch (err) {
      setAuthError("An error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/iris");
      if (res.ok) {
        const data = await res.json();
        setEnv(data.irisEnvironment || "SANDBOX");
        setSandboxToken(data.irisSandboxToken || "");
        setProdToken(data.irisProductionToken || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/iris", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          irisEnvironment: env,
          irisSandboxToken: sandboxToken,
          irisProductionToken: prodToken
        })
      });
      
      if (res.ok) {
        alert("Settings saved successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-6 mt-10">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-slate-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-slate-600" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>
              Please enter your password to view and manage your FBR IRIS API Credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUnlock} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Password</Label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your login password"
                  required
                />
              </div>
              {authError && <p className="text-sm text-red-500 font-medium">{authError}</p>}
              <Button type="submit" className="w-full bg-[var(--primary)] text-white" disabled={authLoading}>
                {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                Unlock Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FBR IRIS Settings</h1>
        <p className="text-slate-500 mt-1">Manage your API integration tokens for Digital Invoicing</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 space-y-6">
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Environment Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Active Environment</h3>
                  <p className="text-sm text-slate-500">Select which endpoint your invoices will be sent to</p>
                </div>
                <div className="flex bg-slate-200 p-1 rounded-md">
                  <button 
                    onClick={() => setEnv("SANDBOX")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${env === "SANDBOX" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Sandbox
                  </button>
                  <button 
                    onClick={() => setEnv("PRODUCTION")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${env === "PRODUCTION" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Production
                  </button>
                </div>
              </div>

              {/* Tokens */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Sandbox API Token
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-mono uppercase">Testing</span>
                  </Label>
                  <Input 
                    type="text" 
                    value={sandboxToken} 
                    onChange={e => setSandboxToken(e.target.value)} 
                    placeholder="Enter your IRIS Sandbox Token" 
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">Used when Active Environment is set to Sandbox.</p>
                </div>

                <div className="space-y-2 mt-6">
                  <Label className="flex items-center gap-2">
                    Production API Token
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono uppercase">Live</span>
                  </Label>
                  <Input 
                    type="password" 
                    value={prodToken} 
                    onChange={e => setProdToken(e.target.value)} 
                    placeholder="Enter your IRIS Production Token" 
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">Used when Active Environment is set to Production. Kept hidden for security.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="bg-[var(--primary)] text-white w-32">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
