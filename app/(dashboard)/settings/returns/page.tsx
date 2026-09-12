"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReturnsSettingsPage() {
  const [isFiling, setIsFiling] = useState(false);
  const [monthStatus, setMonthStatus] = useState<'pending' | 'filed'>('pending');

  const currentMonthYear = new Date().toISOString().slice(0, 7); // e.g. "2026-09"

  const handleFileReturn = async () => {
    setIsFiling(true);
    // In a real app, this would call an API:
    // POST /api/fbr/returns/lock { monthYear: '2026-09' }
    // which calculates totalSales for all invoices in 2026-09 and creates a TaxReturnPeriod record
    setTimeout(() => {
      setMonthStatus('filed');
      setIsFiling(false);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sales Tax Returns</h1>
        <p className="text-muted-foreground mt-2">Manage your monthly sales tax return filings and lock periods.</p>
      </div>

      <Card className={monthStatus === 'filed' ? "border-green-500" : ""}>
        <CardHeader>
          <CardTitle>Current Month: {currentMonthYear}</CardTitle>
          <CardDescription>
            Filing a return will instantly lock all invoices for this month. 
            No cancellations or edits will be allowed, even if the 72-hour window has not expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthStatus === 'filed' ? (
            <div className="p-4 bg-green-50 text-green-800 rounded-md">
              <p className="font-semibold">Return Filed</p>
              <p className="text-sm">All invoices for {currentMonthYear} are now locked. The total sales have been recorded to enforce the 10% deletion limit for next month.</p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <p className="font-semibold">Action Required at Month End</p>
              <p className="text-sm">Please review your Annexure-C before marking this month as filed.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="destructive" 
            disabled={monthStatus === 'filed' || isFiling}
            onClick={handleFileReturn}
          >
            {isFiling ? "Locking Month..." : "Mark Return as Filed (Lock Invoices)"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
