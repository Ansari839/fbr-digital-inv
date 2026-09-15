"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Server, Database, CheckCircle, Edit2, Loader2, Save, X, Activity, Cpu } from "lucide-react";

export default function VpsInfrastructurePage() {
  const [vpsData, setVpsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    hostname: "srv1.syncpro.pk",
    ipAddress: "192.168.1.100",
    provider: "Hostinger (Singapore)",
    vCpu: "4 Cores (AMD EPYC)",
    ram: "8 GB DDR4",
    storageMb: "100000",
    status: "Online",
    startDate: "2024-01-01",
    renewalDate: "2027-01-01"
  });
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState<any>(null);

  const fetchVpsData = async () => {
    try {
      const res = await fetch("/api/admin/vps");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setVpsData(data);
          setEditForm({
            hostname: data.hostname,
            ipAddress: data.ipAddress,
            provider: data.provider,
            vCpu: data.vCpu,
            ram: data.ram,
            storageMb: data.storageMb.toString(),
            status: data.status,
            startDate: data.startDate,
            renewalDate: data.renewalDate
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVpsData();
    
    // Health polling
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/admin/server-health");
        if (res.ok) setHealth(await res.json());
      } catch(e) {}
    };
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/vps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        await fetchVpsData();
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">VPS Infrastructure</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Monitor and manage your core hosting resources</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 h-11 px-6 rounded-xl transition-all hover:-translate-y-0.5">
            <Edit2 className="w-4 h-4 mr-2" /> <span className="font-semibold text-sm">Edit Details</span>
          </Button>
        )}
      </div>

      {!vpsData && !isEditing && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Server className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No VPS Details Found</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't configured the server specifications yet. These details are used to dedicate storage for clients.</p>
          <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8 rounded-xl">Setup VPS Details</Button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden ring-1 ring-slate-200/50">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Configure Server Details</h3>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="h-10 text-slate-500 hover:bg-slate-200/50 rounded-xl">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button type="submit" className="h-10 bg-indigo-600 text-white shadow-sm rounded-xl px-6" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-100 pb-2"><Server className="w-4 h-4" /> Network</h4>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Hostname</label>
                <Input required value={editForm.hostname} onChange={e => setEditForm({...editForm, hostname: e.target.value})} placeholder="srv1.domain.com" className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">IP Address</label>
                <Input required value={editForm.ipAddress} onChange={e => setEditForm({...editForm, ipAddress: e.target.value})} placeholder="192.168.1.1" className="h-11 font-mono text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Provider & Location</label>
                <Input required value={editForm.provider} onChange={e => setEditForm({...editForm, provider: e.target.value})} placeholder="Hostinger (Singapore)" className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white" />
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-100 pb-2"><CheckCircle className="w-4 h-4" /> Specs & Quota</h4>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Compute (vCPU)</label>
                <Input required value={editForm.vCpu} onChange={e => setEditForm({...editForm, vCpu: e.target.value})} placeholder="4 Cores" className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Memory (RAM)</label>
                <Input required value={editForm.ram} onChange={e => setEditForm({...editForm, ram: e.target.value})} placeholder="8 GB" className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Total Storage Limit</label>
                <div className="relative">
                  <Input required type="number" value={editForm.storageMb} onChange={e => setEditForm({...editForm, storageMb: e.target.value})} className="h-11 font-mono bg-slate-50 border-slate-200 rounded-xl focus:bg-white" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MB</span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2 border-b border-amber-100 pb-2"><Database className="w-4 h-4" /> Lifecycle</h4>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Status</label>
                <select className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm bg-slate-50 focus:bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                  <option value="Online">Online & Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Start Date</label>
                <Input required type="date" value={editForm.startDate} onChange={e => setEditForm({...editForm, startDate: e.target.value})} className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Renewal Date</label>
                <Input required type="date" value={editForm.renewalDate} onChange={e => setEditForm({...editForm, renewalDate: e.target.value})} className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white text-slate-700" />
              </div>
            </div>
          </div>
        </form>
      ) : vpsData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
            <CardHeader className="pb-2 relative z-10 text-white">
              <div className="flex justify-between items-center border-b border-white/20 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white/90">Host Information</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                  <Server className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 relative z-10 text-white pt-2">
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Hostname</p>
                <p className="font-semibold text-lg">{vpsData.hostname}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">IP Address</p>
                <p className="font-mono text-sm bg-black/20 px-3 py-1.5 rounded-lg w-fit shadow-inner border border-white/10">{vpsData.ipAddress}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Provider & Location</p>
                <p className="font-medium">{vpsData.provider}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
            <CardHeader className="pb-2 relative z-10 text-white">
              <div className="flex justify-between items-center border-b border-white/20 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white/90">Specifications</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 relative z-10 text-white pt-2">
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Compute (vCPU)</p>
                <p className="font-semibold text-lg">{vpsData.vCpu}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Memory (RAM)</p>
                <p className="font-semibold text-lg">{vpsData.ram}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Total Allocated Storage</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold text-2xl tracking-tight">{(vpsData.storageMb / 1024).toFixed(1)} GB</p>
                  <p className="text-white/60 font-medium text-sm">({vpsData.storageMb} MB)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
            <CardHeader className="pb-2 relative z-10 text-white">
              <div className="flex justify-between items-center border-b border-white/20 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white/90">Status & Lifecycle</CardTitle>
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                  <Database className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 relative z-10 text-white pt-2">
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Current Status</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md font-bold text-sm shadow-sm gap-2">
                  <span className={`relative flex h-2 w-2`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${vpsData.status === 'Online' ? 'bg-emerald-300' : 'bg-rose-300'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${vpsData.status === 'Online' ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                  </span>
                  {vpsData.status}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Server Start Date</p>
                <p className="font-semibold text-lg">{new Date(vpsData.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Next Renewal</p>
                <p className="font-semibold text-lg">{new Date(vpsData.renewalDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Live Health Metrics Section */}
      {!isEditing && health && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" /> Live Server Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Metrics */}
            <Card className="shadow-sm border border-slate-200">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">CPU Usage</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{health.cpu.usagePercentage}%</p>
                  </div>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2">
                  <div className={`h-2.5 rounded-full ${parseFloat(health.cpu.usagePercentage) > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, Math.max(0, parseFloat(health.cpu.usagePercentage)))}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-3">Across {health.cpu.cores} Cores</p>
              </CardContent>
            </Card>

            {/* RAM Metrics */}
            <Card className="shadow-sm border border-slate-200">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Memory (RAM)</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{health.memory.usagePercentage}%</p>
                  </div>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2">
                  <div className={`h-2.5 rounded-full ${parseFloat(health.memory.usagePercentage) > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Math.max(0, parseFloat(health.memory.usagePercentage)))}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-3">{health.memory.usedGb} GB used of {health.memory.totalGb} GB</p>
              </CardContent>
            </Card>

            {/* Uptime */}
            <Card className="shadow-sm border border-slate-200">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">System Uptime</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{health.uptime.days}<span className="text-lg font-medium text-slate-500">d</span> {health.uptime.hours}<span className="text-lg font-medium text-slate-500">h</span></p>
                  </div>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium mt-4 bg-slate-50 py-2 px-3 rounded-md border border-slate-100 inline-block">
                  Running for {health.uptime.formatted}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
