"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Loader2, Save } from "lucide-react";

export default function SmtpSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    host: "smtp.example.com",
    port: "587",
    secure: false,
    user: "admin@example.com",
    pass: "",
    fromEmail: "admin@example.com",
    fromName: "FBR Digital Invoicing"
  });

  useEffect(() => {
    const fetchSmtp = async () => {
      try {
        const res = await fetch("/api/admin/smtp");
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            setFormData({
              host: data.host,
              port: data.port.toString(),
              secure: data.secure,
              user: data.user,
              pass: data.pass,
              fromEmail: data.fromEmail,
              fromName: data.fromName
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSmtp();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-indigo-100">
            <Mail className="h-6 w-6" />
          </div>
          Email & SMTP Configuration
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Configure global outgoing mail server credentials for password resets and notifications.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SMTP Host</label>
              <Input required value={formData.host} onChange={e => setFormData({...formData, host: e.target.value})} placeholder="e.g. smtp.gmail.com" className="h-11 bg-slate-50 focus:bg-white" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SMTP Port</label>
              <Input required type="number" value={formData.port} onChange={e => setFormData({...formData, port: e.target.value})} placeholder="587" className="h-11 bg-slate-50 focus:bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SMTP Username</label>
              <Input required type="text" value={formData.user} onChange={e => setFormData({...formData, user: e.target.value})} placeholder="your-email@example.com" className="h-11 bg-slate-50 focus:bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SMTP Password</label>
              <Input required type="password" value={formData.pass} onChange={e => setFormData({...formData, pass: e.target.value})} placeholder="••••••••" className="h-11 bg-slate-50 focus:bg-white" />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Sender Email (From)</label>
              <Input required type="email" value={formData.fromEmail} onChange={e => setFormData({...formData, fromEmail: e.target.value})} placeholder="noreply@syncpro.pk" className="h-11 bg-slate-50 focus:bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Sender Name</label>
              <Input required type="text" value={formData.fromName} onChange={e => setFormData({...formData, fromName: e.target.value})} placeholder="FBR Digital Invoicing" className="h-11 bg-slate-50 focus:bg-white" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="secure"
              checked={formData.secure}
              onChange={e => setFormData({...formData, secure: e.target.checked})}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="secure" className="text-sm font-medium text-slate-700">Use Secure Connection (SSL/TLS)</label>
          </div>

        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center text-sm font-medium text-emerald-600 transition-opacity duration-300" style={{ opacity: success ? 1 : 0 }}>
            <CheckCircle className="w-5 h-5 mr-2" />
            Settings saved successfully!
          </div>
          <Button type="submit" disabled={saving} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl px-8">
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
