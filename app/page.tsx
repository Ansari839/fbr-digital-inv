"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FileText, CheckCircle, AlertCircle, Edit, Printer, Plus, Server, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Quota State
  const [quota, setQuota] = useState<{ maxStorageMb: number, storageUsedMb: number, planTier: string } | null>(null);
  
  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<'active' | 'submitted'>('active');

  useEffect(() => {
    fetch('/api/dashboard/quota')
      .then(res => res.json())
      .then(data => {
        if(!data.error) setQuota(data);
      })
      .catch(console.error);

    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const storagePercentage = quota ? Math.min(100, Math.round((quota.storageUsedMb / quota.maxStorageMb) * 100)) : 0;
  const isStorageWarning = storagePercentage > 80;
  const isStorageDanger = storagePercentage >= 100;

  const formatMoney = (val: number | undefined) => {
    if (val === undefined) return "...";
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const recentInvoices = stats?.recentInvoices || [];
  
  // Logic: 
  // - "Active" are those with remainingHours > 0
  // - "Submitted" are those with remainingHours <= 0
  const activeInvoices = recentInvoices.filter((inv: any) => inv.remainingHours > 0);
  const submittedInvoices = recentInvoices.filter((inv: any) => inv.remainingHours <= 0);

  // Sort Active invoices by closest to expire (lowest remainingHours first)
  activeInvoices.sort((a: any, b: any) => a.remainingHours - b.remainingHours);

  const displayedInvoices = activeTab === 'active' ? activeInvoices : submittedInvoices;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FBR SyncPro</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome to your <span className="font-semibold text-slate-700">FBR Digital Invoicing</span> portal</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 font-medium">From Date:</span>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 w-40 text-sm bg-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 font-medium">To Date:</span>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 w-40 text-sm bg-white" />
          </div>
          <Button className="h-9 px-6 bg-[var(--primary)] hover:opacity-90 text-white">Filter</Button>
        </div>
      </div>

      {/* Storage Quota Bar */}
      {quota && (
        <Card className={`border ${isStorageDanger ? 'border-red-200 bg-red-50' : isStorageWarning ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'} shadow-sm`}>
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${isStorageDanger ? 'bg-red-100 text-red-600' : isStorageWarning ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  Storage Quota 
                  <Badge variant="outline" className="text-[10px] uppercase font-bold h-5 px-1.5">{quota.planTier} Plan</Badge>
                </h3>
              </div>
            </div>
            
            <div className="flex-1 max-w-xl">
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className={isStorageDanger ? 'text-red-700' : isStorageWarning ? 'text-amber-700' : 'text-slate-600'}>
                  {quota.storageUsedMb.toFixed(2)} MB Used
                </span>
                <span className="text-slate-500">{quota.maxStorageMb} MB Total</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isStorageDanger ? 'bg-red-500' : isStorageWarning ? 'bg-amber-500' : 'bg-blue-500'} transition-all duration-500`}
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
              {isStorageWarning && (
                <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${isStorageDanger ? 'text-red-600 font-bold' : 'text-amber-600'}`}>
                  <AlertTriangle className="h-3 w-3" />
                  {isStorageDanger ? 'Storage limit exceeded! You cannot create new invoices.' : 'Approaching storage limit. Please consider upgrading your plan.'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* 4 Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Total Entries */}
            <Card className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100 shadow-sm rounded-xl border-t-4 border-t-blue-500 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Total Entries</h3>
                  </div>
                  <span className="text-3xl font-light text-slate-800">{stats?.cards?.total?.count ?? 0}</span>
                </div>
                <div className="mt-6 space-y-3 border-t border-blue-100/50 pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Amount</span>
                    <span className="font-bold text-slate-800">{formatMoney(stats?.cards?.total?.amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Excl. ST</span>
                    <span className="font-bold text-slate-800">{formatMoney(stats?.cards?.total?.exclST)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Successful Entries */}
            <Card className="bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100 shadow-sm rounded-xl border-t-4 border-t-emerald-500 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Successful Entries</h3>
                  </div>
                  <span className="text-3xl font-light text-slate-800">{stats?.cards?.success?.count ?? 0}</span>
                </div>
                <div className="mt-6 space-y-3 border-t border-emerald-100/50 pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Amount</span>
                    <span className="font-bold text-slate-800">{formatMoney(stats?.cards?.success?.amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Excl. ST</span>
                    <span className="font-bold text-slate-800">{formatMoney(stats?.cards?.success?.exclST)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Failed Entries */}
            <Card className="bg-gradient-to-br from-red-50/50 to-white border-red-100 shadow-sm rounded-xl border-t-4 border-t-red-500 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-sm">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Failed Entries</h3>
                  </div>
                  <span className="text-3xl font-light text-slate-800">{stats?.cards?.failed?.count ?? 0}</span>
                </div>
                <div className="mt-6 space-y-3 border-t border-red-100/50 pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Amount</span>
                    <span className="font-bold text-slate-800">{formatMoney(stats?.cards?.failed?.amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Excl. ST</span>
                    <span className="font-bold text-slate-800">{formatMoney(stats?.cards?.failed?.exclST)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sales Tax Summary */}
            <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm rounded-xl border-t-4 border-t-slate-800 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-800 text-lg pt-1">Sales Tax</h3>
                  <span className="text-2xl font-normal text-slate-800">{formatMoney(stats?.cards?.taxes?.salesTax)}</span>
                </div>
                <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Sale Tax</span>
                    <span className="font-bold text-slate-800">{formatMoney(stats?.cards?.taxes?.salesTax)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Further Tax</span>
                    <span className="font-bold text-slate-800">{formatMoney(stats?.cards?.taxes?.furtherTax)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Extra Tax</span>
                    <span className="font-bold text-slate-800">{formatMoney(stats?.cards?.taxes?.extraTax)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Middle Section (Table & Chart) */}
          <div className="flex flex-col gap-6 items-stretch">
            
            {/* Table Area (Full Width) */}
            <div className="w-full flex flex-col">
              <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-[1.15rem] font-bold text-slate-800 tracking-tight leading-9">Recent Invoices</h2>
                  <div className="flex bg-slate-100 p-1 rounded-md">
                    <button 
                      onClick={() => setActiveTab('active')} 
                      className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${activeTab === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Active ({activeInvoices.length})
                    </button>
                    <button 
                      onClick={() => setActiveTab('submitted')} 
                      className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${activeTab === 'submitted' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Submitted ({submittedInvoices.length})
                    </button>
                  </div>
                </div>
                <Link href="/invoices/new">
                  <Button className="h-9 bg-[var(--primary)] hover:opacity-90 text-white text-xs shadow-sm rounded-md px-5">
                    Add Invoice
                  </Button>
                </Link>
              </div>
              
              <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Inv. Date</th>
                      <th className="px-4 py-3">FBR Inv. #</th>
                      <th className="px-4 py-3">Buyer Name</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Value</th>
                      <th className="px-4 py-3 text-right">GST</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {displayedInvoices.length > 0 ? (
                      displayedInvoices.map((inv: any, i: number) => (
                        <tr key={inv.id} className={`hover:bg-slate-50 transition-colors ${i % 2 !== 0 ? 'bg-slate-50/50' : ''}`}>
                          <td className="px-4 py-3">{inv.date}</td>
                          <td className="px-4 py-3 text-slate-400">{inv.fbrInvNum}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{inv.buyerName}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(inv.qty)} <span className="text-[10px] text-slate-400">{inv.uom}</span></td>
                          <td className="px-4 py-3 text-right">{formatMoney(inv.value)}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(inv.gst)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatMoney(inv.total)}</td>
                          <td className="px-4 py-3 text-center">
                            {activeTab === 'active' ? (
                              <Badge variant="outline" className="font-medium bg-blue-50 text-blue-700 border-blue-200 px-2.5 py-0.5 gap-1.5 inline-flex items-center">
                                <Clock className="w-3 h-3" />
                                {Math.floor(inv.remainingHours)}h left
                              </Badge>
                            ) : (
                              <Badge variant="outline" className={`font-normal ${
                                inv.status === 'Submitted' || inv.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                inv.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {inv.status === 'Pending' ? 'Submitted' : inv.status}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 flex gap-2 justify-center">
                            {activeTab === 'active' ? (
                              <>
                                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-slate-600 border-slate-200"><Printer className="h-3 w-3 mr-1" /> Print</Button>
                                <Link href={`/invoices/${inv.id}`}>
                                  <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-slate-600 border-slate-200"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                                </Link>
                              </>
                            ) : (
                              <span className="text-slate-300 text-[10px] italic">Actions Locked</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-500">No invoices found in this view.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            {/* Chart Area (Full Width Below Table) */}
            <div className="w-full flex flex-col">
              <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-5 w-full flex flex-col h-[350px]">
                <h2 className="text-[1.05rem] font-bold text-slate-800 tracking-tight mb-4">Monthly Analytics</h2>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                      <Legend verticalAlign="top" align="left" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '20px', paddingLeft: '15px', color: '#475569' }} />
                      <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="Success" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>


          </div>
        </>
      )}

    </div>
  );
}
