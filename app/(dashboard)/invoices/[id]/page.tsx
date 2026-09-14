"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ModernTemplate } from '@/components/invoice-templates/ModernTemplate';
import { ClassicTemplate } from '@/components/invoice-templates/ClassicTemplate';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft, Loader2, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ViewInvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState('modern');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check premium status
    const status = localStorage.getItem("fbr_premium_unlocked");
    if (status === "true") setIsPremium(true);
  }, []);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
        }
      } catch (error) {
        console.error('Failed to fetch', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <Link href="/invoices"><Button className="mt-4">Back to Invoices</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white flex flex-col">
      {/* Non-printable Action Bar */}
      <div className="bg-white border-b shadow-sm p-4 flex items-center justify-between print:hidden sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium">Select Layout:</span>
            <Select value={layout} onValueChange={(v) => v && setLayout(v)}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200">
                <SelectValue placeholder="Select Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern (Colored)</SelectItem>
                <SelectItem value="classic">Classic (Black & White)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-[var(--primary)] text-white">
              <Printer className="h-4 w-4 mr-2" />
              Print / Save PDF
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Print Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/invoices/${id}/print`} className="cursor-pointer w-full">
                FBR Default (A4 PDF)
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href={isPremium ? `/invoices/${id}/builder` : `/settings/premium`} className="cursor-pointer w-full flex justify-between items-center">
                <span>Custom Builder</span>
                {isPremium ? (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">PRO</span>
                ) : (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">LOCKED</span>
                )}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Invoice Document Wrapper */}
      <div className="flex-1 overflow-auto py-8 print:py-0 print:overflow-visible flex justify-center">
        {layout === 'modern' ? (
          <ModernTemplate invoice={invoice} />
        ) : (
          <ClassicTemplate invoice={invoice} />
        )}
      </div>
    </div>
  );
}
