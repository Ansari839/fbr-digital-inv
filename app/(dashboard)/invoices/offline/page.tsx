"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function OfflineSyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineInvoices, setOfflineInvoices] = useState([
    { id: 'INV-101', date: '2026-09-11 14:30:00', amount: 50000, age: '25 Hours' },
    { id: 'INV-102', date: '2026-09-11 15:45:00', amount: 25000, age: '23 Hours' },
  ]);

  const handleSyncAll = () => {
    setIsSyncing(true);
    // In real app, loop through invoices, POST /postinvoicedata, update fbrIrn
    setTimeout(() => {
      setOfflineInvoices([]);
      setIsSyncing(false);
    }, 2000);
  };

  const hasExpired = offlineInvoices.some(inv => parseInt(inv.age) > 24);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Offline Sync Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage and upload invoices generated while the internet was down.</p>
      </div>

      {hasExpired && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
          <p className="font-bold">CRITICAL: 24-Hour Rule Violated</p>
          <p className="text-sm">You have invoices that are older than 24 hours and haven't been synced to FBR. The system has blocked the creation of new invoices until these are successfully synced.</p>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Invoices</CardTitle>
            <CardDescription>Invoices waiting to be transmitted to PRAL.</CardDescription>
          </div>
          <Button onClick={handleSyncAll} disabled={isSyncing || offlineInvoices.length === 0}>
            {isSyncing ? "Syncing..." : `Sync All (${offlineInvoices.length})`}
          </Button>
        </CardHeader>
        <CardContent>
          {offlineInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">All invoices are synced! No offline data pending.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Offline Age</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offlineInvoices.map((inv) => {
                  const isExpired = parseInt(inv.age) > 24;
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.id}</TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell>Rs. {inv.amount.toLocaleString()}</TableCell>
                      <TableCell className={isExpired ? "text-red-600 font-bold" : ""}>{inv.age}</TableCell>
                      <TableCell>
                        <Badge variant={isExpired ? "destructive" : "secondary"}>
                          {isExpired ? "Expired (>24h)" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
