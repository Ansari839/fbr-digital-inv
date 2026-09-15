import React from 'react';
import Link from 'next/link';
import { Shield, LayoutDashboard, Users, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <Shield className="h-5 w-5 text-indigo-400 mr-2" />
          <span className="font-bold text-white tracking-tight">Super Admin</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 bg-indigo-500/10 text-indigo-400 rounded-md font-medium text-sm">
            <Users className="h-4 w-4" /> Clients Management
          </Link>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-md font-medium text-sm transition-colors">
            <LayoutDashboard className="h-4 w-4" /> App Portal
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors w-full">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
