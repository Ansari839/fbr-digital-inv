"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, Users, Server, LogOut, Settings, Key, Mail, AlertCircle } from 'lucide-react';
import { ThemeProvider } from "@/components/theme-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar matching the client portal styling */}
      <aside className="hidden md:flex w-64 bg-[var(--sidebar)] text-white flex-col h-full border-r border-white/10 shrink-0">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-white" />
            <span className="text-xl font-bold tracking-wide">Super Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
              pathname === "/admin" 
                ? "bg-white/15 text-white shadow-sm" 
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          
          <Link 
            href="/admin/clients" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
              pathname.startsWith("/admin/clients") 
                ? "bg-white/15 text-white shadow-sm" 
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" /> Clients Management
          </Link>

          <Link 
            href="/admin/requests" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
              pathname.startsWith("/admin/requests") 
                ? "bg-white/15 text-white shadow-sm" 
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Key className="h-4 w-4" /> Password Requests
          </Link>

          <Link 
            href="/admin/sync-logs" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
              pathname.startsWith("/admin/sync-logs") 
                ? "bg-white/15 text-white shadow-sm" 
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <AlertCircle className="h-4 w-4" /> Sync Errors
          </Link>

          <Link 
            href="/admin/vps" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
              pathname.startsWith("/admin/vps") 
                ? "bg-white/15 text-white shadow-sm" 
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Server className="h-4 w-4" /> VPS Infrastructure
          </Link>
          
          <Link 
            href="/admin/smtp" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
              pathname.startsWith("/admin/smtp") 
                ? "bg-white/15 text-white shadow-sm" 
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Mail className="h-4 w-4" /> Email & SMTP
          </Link>

          <Link 
            href="/admin/settings" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
              pathname.startsWith("/admin/settings") 
                ? "bg-white/15 text-white shadow-sm" 
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          
          <div className="pt-8 pb-2 px-2">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">System</p>
          </div>
          
          <Link 
            href="/" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors text-slate-300 hover:bg-white/10 hover:text-white`}
          >
            <Settings className="h-4 w-4" /> App Portal
          </Link>
        </nav>

        {/* Footer User Dropdown */}
        <div className="p-4 border-t border-white/10">
          <Link href="/login" className="flex items-center justify-between w-full px-4 py-2 hover:bg-white/10 rounded-md transition-colors text-white">
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-20 bg-background border-b border-border flex items-center px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            {pathname === '/admin' ? 'Dashboard' : 
             pathname.startsWith('/admin/clients') ? 'Clients Management' :
             pathname.startsWith('/admin/vps') ? 'VPS Infrastructure' :
             pathname.startsWith('/admin/smtp') ? 'Email & SMTP' :
             pathname.startsWith('/admin/sync-logs') ? 'Sync Errors' :
             pathname.startsWith('/admin/settings') ? 'Settings' :
             pathname.startsWith('/admin/requests') ? 'Password Requests' : 'Admin Panel'}
          </h1>
        </div>
        <div className="min-h-[calc(100vh-5rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
