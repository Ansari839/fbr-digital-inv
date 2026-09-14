"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PremiumInvoiceBuilder() {
  const [isChecking, setIsChecking] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const status = localStorage.getItem("fbr_premium_unlocked");
    if (status === "true") {
      setIsUnlocked(true);
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-500 h-8 w-8" /></div>;
  }

  if (!isUnlocked) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Lock className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Premium Feature Locked</h2>
        <p className="text-slate-500 mt-2 text-center max-w-md">You need a valid License PIN to access the Drag & Drop Custom Invoice Builder.</p>
        <Button onClick={() => router.push('/settings/premium')} className="mt-6 bg-slate-900">
          Unlock with PIN
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h1 className="font-bold text-lg">Premium Invoice Builder</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Exit Builder</Button>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white">Save Template</Button>
        </div>
      </header>

      <main className="flex-1 flex p-4 gap-4 overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-64 bg-white border rounded-lg p-4 flex flex-col gap-3 overflow-y-auto shadow-sm">
          <h3 className="font-semibold text-sm text-slate-500 mb-2">DRAG COMPONENTS</h3>
          <div className="p-3 border rounded border-dashed text-center text-sm cursor-grab hover:bg-slate-50">Company Logo</div>
          <div className="p-3 border rounded border-dashed text-center text-sm cursor-grab hover:bg-slate-50">Header Text Block</div>
          <div className="p-3 border rounded border-dashed text-center text-sm cursor-grab hover:bg-slate-50">Buyer Info Box</div>
          <div className="p-3 border rounded border-dashed text-center text-sm cursor-grab hover:bg-slate-50">FBR QR Code</div>
          <div className="p-3 border rounded border-dashed text-center text-sm cursor-grab hover:bg-slate-50">Data Table</div>
          <div className="p-3 border rounded border-dashed text-center text-sm cursor-grab hover:bg-slate-50">Footer Note</div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-white border rounded-lg shadow-sm flex flex-col items-center overflow-y-auto p-8 relative">
          <div className="absolute top-4 right-4 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">A4 CANVAS</div>
          <div className="w-[210mm] min-h-[297mm] border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50/50">
            <p className="text-slate-400 font-medium">Drag components here to build your custom invoice</p>
          </div>
        </div>
      </main>
    </div>
  );
}
