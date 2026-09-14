"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, UploadCloud, UserCircle2, ChevronDown, List, Users, Package, Archive } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 bg-[#113136] text-white flex-col h-full border-r border-[#1a444a] shrink-0">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-[#1a444a]/50">
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-xl font-bold tracking-wide">XELENT INVOICE</span>
        </div>
      </div>

      {/* User Info Snippet (Optional if following exact design closely) */}
      <div className="px-6 py-4">
        <p className="text-sm font-semibold text-white/90">Xelent Invoice</p>
        <p className="text-xs text-white/50 truncate">admin@xelent.pk</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname === "/" 
              ? "bg-[#1f565b] text-emerald-400 shadow-sm" 
              : "text-slate-300 hover:bg-[#1a444a] hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <Link 
          href="/invoices/new" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname.startsWith("/invoices/new") 
              ? "bg-[#1f565b] text-emerald-400 shadow-sm" 
              : "text-slate-300 hover:bg-[#1a444a] hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          Create Invoice
        </Link>

        <Link 
          href="/settings/returns" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname.startsWith("/settings/returns") 
              ? "bg-[#1f565b] text-emerald-400 shadow-sm" 
              : "text-slate-300 hover:bg-[#1a444a] hover:text-white"
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          Import Invoice
        </Link>

        <Link 
          href="/invoices" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname === "/invoices" 
              ? "bg-[#1f565b] text-emerald-400 shadow-sm" 
              : "text-slate-300 hover:bg-[#1a444a] hover:text-white"
          }`}
        >
          <List className="h-4 w-4" />
          Invoices List
        </Link>

        <Link 
          href="/customers" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors mt-4 ${
            pathname.startsWith("/customers") 
              ? "bg-[#1f565b] text-emerald-400 shadow-sm" 
              : "text-slate-300 hover:bg-[#1a444a] hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          Customers
        </Link>

        <Link 
          href="/items" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname.startsWith("/items") 
              ? "bg-[#1f565b] text-emerald-400 shadow-sm" 
              : "text-slate-300 hover:bg-[#1a444a] hover:text-white"
          }`}
        >
          <Package className="h-4 w-4" />
          Items
        </Link>
        
        <Link 
          href="/stock" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname.startsWith("/stock") 
              ? "bg-[#1f565b] text-emerald-400 shadow-sm" 
              : "text-slate-300 hover:bg-[#1a444a] hover:text-white"
          }`}
        >
          <Archive className="h-4 w-4" />
          Stock Report
        </Link>
        
        <Link 
          href="/changelog" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors mt-8 ${
            pathname.startsWith("/changelog") 
              ? "bg-[#1f565b] text-emerald-400 shadow-sm" 
              : "text-slate-300 hover:bg-[#1a444a] hover:text-white"
          }`}
        >
          <List className="h-4 w-4" />
          Changelog
        </Link>

      </nav>

      {/* Footer User Dropdown */}
      <div className="p-4 border-t border-[#1a444a]/50">
        <button className="flex items-center justify-between w-full px-4 py-2 hover:bg-[#1a444a] rounded-md transition-colors">
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
