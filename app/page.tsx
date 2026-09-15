"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FileText, CheckCircle, AlertCircle, Edit, Printer, Plus, Server, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock Data for the chart
const chartData = [
  { name: 'Jul', Total: 400, Success: 0, Failed: 0 },
  { name: 'Aug', Total: 450, Success: 440, Failed: 10 },
  { name: 'Sep', Total: 0, Success: 0, Failed: 0 },
];

export default function DashboardPage() {
  const [fromDate, setFromDate] = useState('2025-08-01');
  const [toDate, setToDate] = useState('2025-09-29');
  
  // Quota State
  const [quota, setQuota] = useState<{ maxStorageMb: number, storageUsedMb: number, planTier: string } | null>(null);

  useEffect(() => {
    // In a real app we'd handle 401 redirect to login here, or use NextAuth's useSession
    fetch('/api/dashboard/quota')
      .then(res => res.json())
      .then(data => setQuota(data))
      .catch(console.error);
  }, []);

  const storagePercentage = quota ? Math.min(100, Math.round((quota.storageUsedMb / quota.maxStorageMb) * 100)) : 0;
  const isStorageWarning = storagePercentage > 80;
  const isStorageDanger = storagePercentage >= 100;

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
                <p className="text-xs text-slate-500 mt-0.5">Hostinger VPS Allocated Limit</p>
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
              <span className="text-3xl font-light text-slate-800">483</span>
            </div>
            <div className="mt-6 space-y-3 border-t border-blue-100/50 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="font-bold text-slate-800">162,595,622.28</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Excl. ST</span>
                <span className="font-bold text-slate-800">136,359,021.25</span>
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
              <span className="text-3xl font-light text-slate-800">482</span>
            </div>
            <div className="mt-6 space-y-3 border-t border-emerald-100/50 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="font-bold text-slate-800">162,041,637.95</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Excl. ST</span>
                <span className="font-bold text-slate-800">135,889,543.00</span>
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
              <span className="text-3xl font-light text-slate-800">1</span>
            </div>
            <div className="mt-6 space-y-3 border-t border-red-100/50 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="font-bold text-slate-800">553,984.33</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Excl. ST</span>
                <span className="font-bold text-slate-800">469,478.25</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Tax Summary */}
        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm rounded-xl border-t-4 border-t-slate-800 hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-slate-800 text-lg pt-1">Sales Tax</h3>
              <span className="text-2xl font-normal text-slate-800">26,152,094.95</span>
            </div>
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Sale Tax</span>
                <span className="font-bold text-slate-800">24,460,117.75</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Further Tax</span>
                <span className="font-bold text-slate-800">1,691,977.20</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Extra Tax</span>
                <span className="font-bold text-slate-800">0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Middle Section (Chart & Table) */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Chart Area */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <div className="flex items-end gap-3 mb-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium mb-1">From Month</span>
              <Input type="month" value="2025-07" readOnly className="h-9 text-xs bg-white w-[130px] rounded-md shadow-sm border-slate-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium mb-1">To Month</span>
              <Input type="month" value="2025-09" readOnly className="h-9 text-xs bg-white w-[130px] rounded-md shadow-sm border-slate-200" />
            </div>
            <Button className="h-9 px-4 bg-[var(--primary)] hover:opacity-90 text-white text-xs shadow-sm rounded-md">Filter</Button>
          </div>
          
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-5 flex-1 min-h-[380px] w-full flex flex-col">
            <div className="flex-1 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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

        {/* Table Area */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[1.15rem] font-bold text-slate-800 tracking-tight leading-9">Recent Invoices</h2>
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
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3 text-right">GST</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">2025-08-30</td>
                  <td className="px-4 py-3 text-slate-400">06273615263746352</td>
                  <td className="px-4 py-3 text-right">932.05</td>
                  <td className="px-4 py-3 text-right">326,217.5</td>
                  <td className="px-4 py-3 text-right">58,719.15</td>
                  <td className="px-4 py-3 text-right">384,936.65</td>
                  <td className="px-4 py-3 text-center"><Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-normal">Draft</Badge></td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-slate-600 border-slate-200"><Printer className="h-3 w-3 mr-1" /> Print</Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-slate-600 border-slate-200"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors bg-slate-50/50">
                  <td className="px-4 py-3">2025-08-30</td>
                  <td className="px-4 py-3 text-slate-400">06273615263743214</td>
                  <td className="px-4 py-3 text-right">130.85</td>
                  <td className="px-4 py-3 text-right">45,797.5</td>
                  <td className="px-4 py-3 text-right">8,243.55</td>
                  <td className="px-4 py-3 text-right">54,041.05</td>
                  <td className="px-4 py-3 text-center"><Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-normal">Draft</Badge></td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-slate-600 border-slate-200"><Printer className="h-3 w-3 mr-1" /> Print</Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-slate-600 border-slate-200"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">2025-08-30</td>
                  <td className="px-4 py-3 text-slate-400">06756453423123454</td>
                  <td className="px-4 py-3 text-right">54,135</td>
                  <td className="px-4 py-3 text-right">9,202,950</td>
                  <td className="px-4 py-3 text-right">1,656,531</td>
                  <td className="px-4 py-3 text-right">10,859,481</td>
                  <td className="px-4 py-3 text-center"><Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-normal">Draft</Badge></td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-slate-600 border-slate-200"><Printer className="h-3 w-3 mr-1" /> Print</Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-slate-600 border-slate-200"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-900">
                <tr>
                  <td colSpan={2} className="px-4 py-3.5">Totals</td>
                  <td className="px-4 py-3.5 text-right">116,197.9</td>
                  <td className="px-4 py-3.5 text-right">11,709,965</td>
                  <td className="px-4 py-3.5 text-right">2,107,793.7</td>
                  <td className="px-4 py-3.5 text-right">13,817,758.7</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
