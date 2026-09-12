"use client";

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

export default function InvoicePrintPage({ params }: { params: { id: string } }) {
  // In a real app, fetch invoice details using `params.id`
  const invoice = {
    id: params.id,
    fbrIrn: "7000007DI1747119701593",
    date: new Date().toLocaleDateString(),
    buyerName: "ABC Corporation",
    buyerNtn: "1234567-8",
    totalAmount: 150000,
    items: [
      { desc: "Industrial Machine Parts", qty: 10, rate: 10000, amount: 100000, hsCode: "8431.4300", uom: "U" },
      { desc: "Service Charges", qty: 1, rate: 50000, amount: 50000, hsCode: "9802.4000", uom: "U" },
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:py-0">
      {/* Hide controls when printing */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          Print A4 Invoice
        </Button>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg p-12 print:shadow-none print:p-0 print:max-w-full">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">SALES TAX INVOICE</h1>
            <p className="text-sm text-gray-500 mt-1">Invoice #{invoice.id}</p>
            <p className="text-sm text-gray-500">Date: {invoice.date}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800">MY COMPANY PVT LTD</h2>
            <p className="text-gray-600 text-sm mt-1">NTN: 7654321-0 | STRN: 327787611234</p>
            <p className="text-gray-600 text-sm">123 Business Avenue, Karachi</p>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
          <p className="font-bold text-lg text-gray-800">{invoice.buyerName}</p>
          <p className="text-gray-600">NTN / CNIC: {invoice.buyerNtn}</p>
        </div>

        {/* Line Items Table */}
        <div className="mt-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 font-semibold text-gray-700">Item Description</th>
                <th className="py-3 font-semibold text-gray-700">HS Code</th>
                <th className="py-3 font-semibold text-gray-700">UOM</th>
                <th className="py-3 font-semibold text-gray-700 text-right">Qty</th>
                <th className="py-3 font-semibold text-gray-700 text-right">Rate (Rs)</th>
                <th className="py-3 font-semibold text-gray-700 text-right">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-0">
                  <td className="py-4 text-gray-800">{item.desc}</td>
                  <td className="py-4 text-gray-600">{item.hsCode}</td>
                  <td className="py-4 text-gray-600">{item.uom}</td>
                  <td className="py-4 text-gray-800 text-right">{item.qty}</td>
                  <td className="py-4 text-gray-800 text-right">{item.rate.toLocaleString()}</td>
                  <td className="py-4 text-gray-800 text-right font-medium">{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total & FBR QR Code Section */}
        <div className="mt-12 flex justify-between items-end border-t pt-8">
          
          <div className="flex flex-col items-start space-y-3">
            {invoice.fbrIrn ? (
              <>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">FBR Verification QR Code</p>
                <div className="p-2 bg-white border rounded-md">
                  <QRCodeSVG value={invoice.fbrIrn} size={100} />
                </div>
                <p className="text-xs text-gray-400 mt-1">IRN: {invoice.fbrIrn}</p>
              </>
            ) : (
              <div className="text-red-500 border border-red-200 p-4 rounded-md">
                <p className="font-bold text-sm">Offline Invoice</p>
                <p className="text-xs">No FBR IRN available yet.</p>
              </div>
            )}
          </div>

          <div className="w-1/3">
            <div className="flex justify-between items-center py-2 text-lg font-bold text-gray-900 border-t-2 border-gray-800">
              <span>Total Amount:</span>
              <span>Rs. {invoice.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-xs text-gray-400 border-t pt-4">
          <p>Thank you for your business. This is a computer-generated FBR integrated digital invoice.</p>
        </div>

      </div>
    </div>
  );
}
