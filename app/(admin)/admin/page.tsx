"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Database, Users, Loader2, Wallet, TrendingUp, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          setStats(await res.json());
        } else {
          setError(`HTTP Error: ${res.status} ${res.statusText}`);
        }
      } catch (err: any) {
        setError(`Fetch Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md font-mono text-sm border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">SaaS Overview</h1>
        <p className="text-slate-500 mt-1">Real-time metrics and revenue generation</p>
      </div>

      {stats && (
        <>
          {/* Colorful Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Revenue Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 z-0"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
              <CardContent className="p-6 relative z-10 text-white">
                <div className="flex items-center justify-between pb-4">
                  <p className="text-sm font-medium text-white/80">Monthly Recurring Revenue</p>
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-black">Rs {stats.monthlyIncome?.toLocaleString()}</div>
                <p className="text-sm text-indigo-200 mt-2 flex items-center gap-1 font-medium">
                  <TrendingUp className="h-4 w-4" /> +12.5% from last month
                </p>
              </CardContent>
            </Card>

            {/* Clients Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 z-0"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
              <CardContent className="p-6 relative z-10 text-white">
                <div className="flex items-center justify-between pb-4">
                  <p className="text-sm font-medium text-white/80">Total Active Clients</p>
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-black">{stats.totalClients}</div>
                <p className="text-sm text-teal-100 mt-2 flex items-center gap-1 font-medium">
                  Across all pricing tiers
                </p>
              </CardContent>
            </Card>

            {/* Allocated Storage Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 z-0"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
              <CardContent className="p-6 relative z-10 text-white">
                <div className="flex items-center justify-between pb-4">
                  <p className="text-sm font-medium text-white/80">Dedicated Storage</p>
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-black">{Math.round(stats.totalAllocatedStorageMb / 1024)} <span className="text-xl font-bold">GB</span></div>
                <p className="text-sm text-blue-100 mt-2 flex items-center gap-1 font-medium">
                  Of {Math.round(stats.vpsTotalStorageMb / 1024)} GB Total VPS Capacity
                </p>
              </CardContent>
            </Card>

            {/* Invoice Quota Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 z-0"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
              <CardContent className="p-6 relative z-10 text-white">
                <div className="flex items-center justify-between pb-4">
                  <p className="text-sm font-medium text-white/80">Total Invoices Quota</p>
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-black">{stats.totalMonthlyInvoiceQuota.toLocaleString()}</div>
                <p className="text-sm text-orange-100 mt-2 flex items-center gap-1 font-medium">
                  Allowed across all clients / month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800">Revenue Growth</CardTitle>
                <p className="text-sm text-slate-500">Monthly Recurring Revenue (MRR) projection</p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis tickFormatter={(val) => `Rs ${val/1000}k`} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                        itemStyle={{ color: '#818cf8' }}
                        formatter={(value: any) => [`Rs ${value?.toLocaleString()}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Clients List */}
            <Card className="col-span-1 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800">Recent Signups</CardTitle>
                <p className="text-sm text-slate-500">Latest clients joined the platform</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stats.recentClients?.map((client: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                          ${client.planTier.toLowerCase() === 'enterprise' ? 'bg-orange-100 text-orange-700' : 
                            client.planTier.toLowerCase() === 'growth' ? 'bg-indigo-100 text-indigo-700' : 
                            'bg-emerald-100 text-emerald-700'}
                        `}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{client.name}</p>
                          <p className="text-xs font-medium text-slate-500">{client.planTier} Plan</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600">{client.amount}</p>
                        <p className="text-xs font-medium text-slate-500">/mo</p>
                      </div>
                    </div>
                  ))}
                  
                  {(!stats.recentClients || stats.recentClients.length === 0) && (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No clients yet</p>
                    </div>
                  )}
                </div>
                
                {stats.recentClients?.length > 0 && (
                  <button className="w-full mt-8 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                    View all clients <ArrowUpRight className="h-4 w-4" />
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
