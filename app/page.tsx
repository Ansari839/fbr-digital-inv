"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, CheckCircle, AlertCircle, Settings, BarChart3, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalSales = 1250000;
  const offlineCount = 2;
  const deletionLimit = 250000;
  const currentDeletions = 45000;
  const deletionPercent = (currentDeletions / deletionLimit) * 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">FI</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-800 tracking-tight">FBR Invoicing</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">My Company Pvt Ltd</span>
            <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
            <p className="text-slate-500 mt-1">Overview of your sales and PRAL integration status.</p>
          </div>
          <Link href="/invoices/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium rounded-md px-6">
              <PlusIcon className="mr-2 h-4 w-4" /> Create New Invoice
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Sales */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-500">Total Sales ({currentMonth})</CardTitle>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">
                Rs. {totalSales.toLocaleString()}
              </div>
              <p className="text-sm text-emerald-600 font-medium flex items-center mt-2">
                <TrendingUp className="mr-1 h-3 w-3" /> +12.4% vs last month
              </p>
            </CardContent>
          </Card>

          {/* Pending Offline */}
          <Card className={`bg-white border-slate-200 shadow-sm rounded-xl ${offlineCount > 0 ? 'ring-1 ring-amber-500/50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-500">Pending Invoices (Offline)</CardTitle>
                <AlertCircle className={`h-4 w-4 ${offlineCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-slate-900 tracking-tight">{offlineCount}</div>
                {offlineCount > 0 && (
                  <Link href="/invoices/offline">
                    <Button variant="outline" size="sm" className="h-8 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                      Review & Sync
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deletion Limit */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-500">Deletion Quota Used</CardTitle>
                <span className="text-xs font-medium text-slate-400">10% Limit</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                Rs. {currentDeletions.toLocaleString()}
              </div>
              <p className="text-sm text-slate-500 mt-1">of Rs. {deletionLimit.toLocaleString()} max</p>
              
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${deletionPercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${deletionPercent}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Links */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Link href="/invoices/new" className="group block">
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all rounded-xl h-full p-6">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-900 flex items-center">
                  New Sales Invoice <ArrowRight className="ml-1.5 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                </h4>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Generate a real-time FBR invoice with built-in validation and payload generation.
                </p>
              </Card>
            </Link>

            <Link href="/settings/returns" className="group block">
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all rounded-xl h-full p-6">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-900 flex items-center">
                  Sales Tax Returns <ArrowRight className="ml-1.5 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                </h4>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Lock Annexure-C for the current month and establish next month's deletion limits.
                </p>
              </Card>
            </Link>

            <Link href="/settings/business-profile" className="group block">
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all rounded-xl h-full p-6">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Settings className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-900 flex items-center">
                  Settings <ArrowRight className="ml-1.5 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                </h4>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Configure PRAL environment tokens (Sandbox/Prod) and business profile data.
                </p>
              </Card>
            </Link>

          </div>
        </div>

      </main>
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
