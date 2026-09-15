"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, FileText, UploadCloud, UserCircle2, ChevronDown, List, Users, Package, Archive, Settings } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState({ name: 'FBR SYNCPRO', logoUrl: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/settings/profile');
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) {
            setProfile({ name: data.name.toUpperCase(), logoUrl: data.logoUrl });
          }
        }
      } catch (e) {}
    };
    fetchProfile();
  }, []);

  return (
    <aside className="hidden md:flex w-64 bg-[var(--sidebar)] text-white flex-col h-full border-r border-white/10 shrink-0">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          {profile.logoUrl ? (
            <img src={profile.logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded bg-white p-1" />
          ) : (
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
          <span className="text-xl font-bold tracking-wide truncate max-w-[150px]">{profile.name}</span>
        </div>
      </div>

      {/* User Info Snippet (Optional if following exact design closely) */}
      <div className="px-6 py-4">
        <p className="text-sm font-semibold text-white/90 truncate">{profile.name}</p>
        <p className="text-xs text-white/50 truncate">admin@syncpro.pk</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
            pathname === "/" 
              ? "bg-white/15 text-white shadow-sm" 
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <Link 
          href="/invoices/new" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
            pathname.startsWith("/invoices/new") 
              ? "bg-white/15 text-white shadow-sm" 
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          Create Invoice
        </Link>

        <Link 
          href="/settings/returns" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
            pathname.startsWith("/settings/returns") 
              ? "bg-white/15 text-white shadow-sm" 
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          Import Invoice
        </Link>

        <Link 
          href="/invoices" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
            pathname === "/invoices" 
              ? "bg-white/15 text-white shadow-sm" 
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <List className="h-4 w-4" />
          Invoices List
        </Link>

        <Link 
          href="/customers" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors mt-4 ${
            pathname.startsWith("/customers") 
              ? "bg-white/15 text-white shadow-sm" 
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          Customers
        </Link>

        <Link 
          href="/items" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
            pathname.startsWith("/items") 
              ? "bg-white/15 text-white shadow-sm" 
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Package className="h-4 w-4" />
          Items
        </Link>
        
        <Link 
          href="/stock" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
            pathname.startsWith("/stock") 
              ? "bg-white/15 text-white shadow-sm" 
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Archive className="h-4 w-4" />
          Stock Report
        </Link>
        
        <Link 
          href="/settings/profile" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors mt-8 ${
            pathname.startsWith("/settings/profile") 
              ? "bg-white/15 text-white shadow-sm" 
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        {/* Example Changelog Link */}
        <Link 
          href="/changelog" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-base font-medium transition-colors ${
            pathname.startsWith("/changelog") 
              ? "bg-white/15 text-white shadow-sm" 
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <List className="h-4 w-4" />
          Changelog
        </Link>

      </nav>

      {/* Footer User Dropdown */}
      <div className="p-4 border-t border-white/10">
        <button className="flex items-center justify-between w-full px-4 py-2 hover:bg-white/10 rounded-md transition-colors">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-bold text-sm">
              A
            </div>
            <span className="text-sm font-medium text-white/90">Admin</span>
          </div>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </button>
      </div>

    </aside>
  );
}
