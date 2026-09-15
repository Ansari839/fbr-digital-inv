"use client";

import { usePathname } from "next/navigation";

interface PrintWrapperProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function PrintWrapper({ children, sidebar }: PrintWrapperProps) {
  const pathname = usePathname();
  const isPrintPage = pathname?.startsWith("/print/");
  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname?.startsWith("/admin");

  // Print, Login, and Admin pages get a bare layout without the client sidebar
  if (isPrintPage || isLoginPage || isAdminPage) {
    return (
      <div className="min-h-screen bg-white h-full">
        {children}
      </div>
    );
  }

  // All other pages get the full dashboard layout
  return (
    <div className="h-full flex overflow-hidden bg-[#f4f7f6] text-slate-800">
      {sidebar}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200/60 py-3 px-6 flex flex-col items-center justify-center text-center shadow-[0_-2px_10px_rgba(0,0,0,0.02)] shrink-0 z-10">
          <p className="text-xs text-slate-500 font-medium">
            Developed by <span className="font-bold text-[var(--primary)]">MS Techs</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
