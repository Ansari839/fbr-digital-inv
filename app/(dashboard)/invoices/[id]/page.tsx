"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // In a real application, fetch these from your DB based on `params.id`
  const fbrTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); 
  const isReturnFiled = false; // Check if TaxReturnPeriod for this invoice's month has isFiled = true
  const fbrIrn = "7000007DI1747119701593"; // If null, the invoice is offline and cannot be modified
  const totalAmount = 50000;
  const previousMonthSalesLimit = 100000; // 10% of last month's sales
  const currentMonthDeletedSum = 60000; // How much has been deleted so far this month

  useEffect(() => {
    if (isReturnFiled) {
      setIsLocked(true);
      setTimeLeft('00:00:00');
      return;
    }

    const calculateTimeLeft = () => {
      const postedAtDate = new Date(fbrTimestamp);
      const postedAt = postedAtDate.getTime();
      const now = new Date().getTime();
      
      const endOfMonthDate = new Date(postedAtDate.getFullYear(), postedAtDate.getMonth() + 1, 0, 23, 59, 59, 999);
      const endOfMonth = endOfMonthDate.getTime();
      
      const lockTime = Math.min(postedAt + 72 * 60 * 60 * 1000, endOfMonth);
      const diffInMs = lockTime - now;
      
      if (diffInMs <= 0) {
        setIsLocked(true);
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(diffInMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [fbrTimestamp, isReturnFiled]);

  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    setIsCanceling(true);
    // In real app, call API to cancel and verify 10% limit server-side
    setTimeout(() => {
      setIsCanceling(false);
      setIsCancelModalOpen(false);
      setIsLocked(true); // Lock it locally
    }, 1500);
  };

  const exceedsLimit = (currentMonthDeletedSum + totalAmount) > previousMonthSalesLimit;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoice Details</h1>
        <Badge variant={isLocked ? "default" : "secondary"}>
          {isLocked ? (isReturnFiled ? "Return Filed / Locked" : "Confirmed / Valid") : "Pending 72-hr Window"}
        </Badge>
      </div>

      {!fbrIrn && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p className="font-semibold">Offline Restriction</p>
          <p className="text-sm">This invoice has not yet received an FBR IRN. You cannot cancel or edit it until it is successfully posted to FBR.</p>
        </div>
      )}

      <Card className={isLocked ? "border-green-500 shadow-sm" : "border-yellow-500 shadow-sm"}>
        <CardHeader>
          <CardTitle>Correction Window (Bona Fide Mistake)</CardTitle>
          <CardDescription>Only for punch errors/wrong NTN before goods delivery.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLocked ? (
            <div className="p-4 bg-green-50 text-green-800 rounded-md">
              <p className="font-semibold">Window Expired</p>
              <p className="text-sm">This invoice is locked because the 72-hour window expired or the monthly return was filed. Any changes now require Commissioner Inland Revenue approval.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <div>
                <p className="font-semibold text-lg">Time Remaining: {timeLeft}</p>
                <p className="text-sm">You can still edit or cancel this invoice.</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" className="border-yellow-600 text-yellow-700" disabled={!fbrIrn}>Edit Invoice</Button>
                <Button variant="destructive" onClick={handleCancelClick} disabled={!fbrIrn}>Cancel Invoice</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Commercial Adjustments (180 Days)</CardTitle>
          <CardDescription>For Sales Returns, Discounts, or adjustments after goods delivery.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">If goods were delivered and returned, you must issue a Credit Note instead of Canceling the invoice.</p>
          <Button variant="secondary" disabled={!isLocked}>
            Issue Debit/Credit Note
          </Button>
          {!isLocked && <p className="text-xs text-muted-foreground mt-2">Available after the 72-hour correction window is closed.</p>}
        </CardContent>
      </Card>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this invoice? This is only for bona fide mistakes before goods delivery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {exceedsLimit && (
              <div className="p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-200">
                <strong>Warning: 10% Limit Exceeded</strong><br/>
                Canceling this invoice will bring your total monthly deletions to Rs. {(currentMonthDeletedSum + totalAmount).toLocaleString()}, which exceeds your 10% allowed limit (Rs. {previousMonthSalesLimit.toLocaleString()}). FBR will likely reject this request.
              </div>
            )}
            <p className="text-sm text-gray-600">
              <strong>Credit Note vs Cancel:</strong> If the customer has already received the goods and is returning them, do NOT cancel. Wait for the 72-hour lock and issue a Credit Note.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={isCanceling}>
              {isCanceling ? "Canceling..." : "Proceed to Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
