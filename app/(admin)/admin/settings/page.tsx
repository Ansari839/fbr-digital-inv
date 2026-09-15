"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { Palette, Save, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { themeColor, setThemeColor } = useTheme();
  
  const [business, setBusiness] = useState({
    id: '',
    name: '',
    ntn: '',
    strn: '',
    logoUrl: '',
    themeColor: 'default'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/settings/profile?t=${Date.now()}`);
        const data = await res.json();
        if (data) {
          setBusiness({
            id: data.id || '',
            name: data.name || '',
            ntn: data.ntn || '',
            strn: data.strn || '',
            logoUrl: data.logoUrl || '',
            themeColor: data.themeColor || 'default'
          });
          setThemeColor(data.themeColor || 'default');
        }
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save changes');
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Super Admin Settings</h1>
        <p className="text-slate-500 mt-1">Configure global appearance for the system.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-xl">Theme & Appearance</CardTitle>
              </div>
              <Button onClick={handleSave} disabled={isSaving || isLoading} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
            <CardDescription className="pt-2">
              Select the global theme color for the application. This applies to both the Admin Panel and the Client Portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
               <div className="flex justify-center py-8">
                 <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
               </div>
            ) : (
              <div className="space-y-4">
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Theme saved successfully!
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setThemeColor(t.id as any);
                        setBusiness({...business, themeColor: t.id});
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        themeColor === t.id ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: t.hex }} />
                        <span className="font-semibold text-slate-700">{t.name}</span>
                      </div>
                      {themeColor === t.id && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
