"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Loader2, Lock, Clock, Eye, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Timer Component
const InvoiceTimer = ({ fbrTimestamp }: { fbrTimestamp: string | null }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number, expired: boolean }>({ hours: 0, minutes: 0, seconds: 0, expired: false });
  
  useEffect(() => {
    if (!fbrTimestamp) return;
    
    const calculateTimeLeft = () => {
      // 72 hours in milliseconds
      const timeLimit = 72 * 60 * 60 * 1000;
      
      const fbrTime = new Date(fbrTimestamp).getTime();
      const now = new Date().getTime();
      const difference = (fbrTime + timeLimit) - now;
      
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
      }
      
      return {
        hours: Math.floor((difference / (1000 * 60 * 60))),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false
      };
    };

    // Initial calc
    setTimeLeft(calculateTimeLeft() || { hours: 0, minutes: 0, seconds: 0, expired: false });
    
    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining) {
        setTimeLeft(remaining);
        if (remaining.expired) {
          clearInterval(timer);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [fbrTimestamp]);

  if (!fbrTimestamp) {
    return <Badge variant="outline" className="bg-slate-100 text-slate-500">Not Synced</Badge>;
  }

  if (timeLeft.expired) {
    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1">
        <Lock className="h-3 w-3" /> Locked
      </Badge>
    );
  }

  const isWarning = timeLeft.hours < 24;

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${isWarning ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
      {isWarning ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
    </Badge>
  );
};


export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        if (Array.isArray(data)) {
          setInvoices(data);
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-slate-500 mt-1">Manage and view all your issued invoices</p>
        </div>
        <Link href="/invoices/new">
          <Button className="bg-[var(--primary)] hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-48">Invoice Ref & IRN</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-center w-32">Status</TableHead>
                <TableHead className="text-center w-40">Time Left (72h)</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <Loader2 className="h-6 w-6 text-[var(--primary)] animate-spin mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Loading invoices...</p>
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">No invoices found</h3>
                    <p className="text-xs text-slate-500 mt-1">You haven't created any invoices yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => {
                  const fbrTime = inv.fbrTimestamp ? new Date(inv.fbrTimestamp).getTime() : new Date(inv.createdAt).getTime();
                  const expired = new Date().getTime() > (fbrTime + (72 * 60 * 60 * 1000));
                  const displayStatus = expired ? 'Submitted' : (inv.status === 'Submitted' ? 'Pending' : inv.status);
                  
                  return (
                  <TableRow key={inv.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        {inv.serialNumber ? String(inv.serialNumber).padStart(3, '0') : 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {inv.fbrIrn || 'Pending IRN'}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{inv.party?.name || 'Walk-in Customer'}</div>
                      <div className="text-xs text-slate-500">{inv.party?.ntnOrCnic || 'Unregistered'}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rs {parseFloat(inv.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={
                        displayStatus === 'Submitted' || displayStatus === 'Success' || displayStatus === 'Synced' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        displayStatus === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        displayStatus === 'Draft' ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700 border-red-200'
                      }>
                        {displayStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <InvoiceTimer fbrTimestamp={inv.fbrTimestamp} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/api/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[var(--primary)] hover:bg-slate-100">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
