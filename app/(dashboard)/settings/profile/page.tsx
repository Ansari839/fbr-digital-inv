"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/theme-provider';
import { Building2, Palette, Save, CheckCircle2, Loader2 } from 'lucide-react';

export default function SettingsProfilePage() {
  const { themeColor, setThemeColor } = useTheme();
  
  const [business, setBusiness] = useState({
    id: '',
    name: '',
    ntn: '',
    strn: '',
    logoUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/settings/profile');
        const data = await res.json();
        if (data) {
          setBusiness({
            id: data.id || '',
            name: data.name || '',
            ntn: data.ntn || '',
            strn: data.strn || '',
            logoUrl: data.logoUrl || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  const themes = [
    { id: 'default', name: 'Emerald (Default)', hex: '#1a7368' },
    { id: 'blue', name: 'Ocean Blue', hex: '#2563eb' },
    { id: 'purple', name: 'Amethyst', hex: '#7c3aed' },
    { id: 'slate', name: 'Dark Slate', hex: '#334155' },
    { id: 'rose', name: 'Crimson Rose', hex: '#e11d48' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your business profile and app appearance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Business Profile */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-500" />
                <CardTitle className="text-xl">Business Profile</CardTitle>
              </div>
              <CardDescription>
                This information is used on your generated FBR Invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input 
                      id="businessName" 
                      value={business.name} 
                      onChange={(e) => setBusiness({...business, name: e.target.value})}
                      placeholder="E.g. FBR SyncPro Inc." 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ntn">National Tax Number (NTN)</Label>
                      <Input 
                        id="ntn" 
                        value={business.ntn} 
                        onChange={(e) => setBusiness({...business, ntn: e.target.value})}
                        placeholder="E.g. 1234567-8" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="strn">Sales Tax Reg. Number (STRN)</Label>
                      <Input 
                        id="strn" 
                        value={business.strn} 
                        onChange={(e) => setBusiness({...business, strn: e.target.value})}
                        placeholder="E.g. 3277876111111" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Business Logo URL</Label>
                    <Input 
                      id="logoUrl" 
                      value={business.logoUrl} 
                      onChange={(e) => setBusiness({...business, logoUrl: e.target.value})}
                      placeholder="https://example.com/logo.png" 
                    />
                    <p className="text-xs text-slate-500">Provide an image URL to display your logo on the sidebar and invoices.</p>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    {saveSuccess && (
                      <span className="text-emerald-600 flex items-center text-sm mr-4">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Saved Successfully
                      </span>
                    )}
                    <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Profile
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Theme */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-slate-500" />
                <CardTitle className="text-xl">Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize the sidebar and accent colors.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeColor(t.id as any)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      themeColor === t.id ? 'border-[var(--primary)] bg-slate-50' : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full" style={{ backgroundColor: t.hex }} />
                      <span className="font-medium text-slate-700">{t.name}</span>
                    </div>
                    {themeColor === t.id && <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
