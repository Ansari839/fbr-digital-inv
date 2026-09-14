"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, CheckCircle2, Lock, Sparkles } from "lucide-react";

export default function PremiumSettingsPage() {
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const status = localStorage.getItem("fbr_premium_unlocked");
    if (status === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    const correctPin = process.env.NEXT_PUBLIC_PREMIUM_PIN;
    
    if (!correctPin) {
      setError("System configuration error: Premium PIN is not set on the server.");
      return;
    }

    if (pin === correctPin) {
      localStorage.setItem("fbr_premium_unlocked", "true");
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Invalid PIN. Please contact support to purchase a valid license key.");
    }
  };

  const handleRevoke = () => {
    localStorage.removeItem("fbr_premium_unlocked");
    setIsUnlocked(false);
    setPin("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Premium Features</h1>
        <p className="text-slate-500 mt-1">Manage your license key to unlock advanced invoicing tools.</p>
      </div>

      <Card className={`border-2 ${isUnlocked ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            {isUnlocked ? (
              <><Sparkles className="h-6 w-6 text-amber-500" /> Premium Unlocked</>
            ) : (
              <><Lock className="h-6 w-6 text-slate-400" /> Feature Locked</>
            )}
          </CardTitle>
          <CardDescription>
            {isUnlocked 
              ? "You have full access to Custom Invoice Builders, Drag & Drop formatting, and premium layouts." 
              : "Enter your License PIN to unlock the Drag & Drop Custom Invoice Builder."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUnlocked ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex gap-3 text-emerald-800">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900">License Active</p>
                  <p className="text-sm mt-1">Your device is currently authenticated for premium features. Custom Invoice Templates are now available when printing invoices.</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleRevoke} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Revoke License
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="pin">License PIN</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    id="pin" 
                    type="password" 
                    placeholder="Enter your PIN..." 
                    className="pl-9"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  />
                </div>
                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              </div>
              <Button onClick={handleUnlock} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                Unlock Features
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
