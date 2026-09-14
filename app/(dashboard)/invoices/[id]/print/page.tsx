"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

// In a real app, this data would come from the database based on the ID
const DUMMY_INVOICE = {
  id: "017",
  date: "15-08-2026",
  fbrInvoiceNo: "4220108920827DIU8ET0V439174",
  seller: {
    name: "FABTEX INTERNATIONAL",
    ntn: "1038354",
    strn: "11-90-9999-329-55",
    address: "PLOT No. F - 96, OFF HUB RIVER ROAD, SITE, Karachi West Site Town"
  },
  buyer: {
    name: "HUSSAIN ENTERPRISES",
    ntnCnic: "3042306",
    address: "OFFICE # 01, 1st FLOOR, MASHA ALLAH PLAZA, STREET # 2, KARKHANA BAZAR, FAISALABAD, FAISALABAD LYALLPUR TOWN"
  },
  items: [
    {
      sNo: 1,
      desc: "NYLON YARN",
      hsCode: "5402.4500",
      uom: "KG",
      qty: 234.21,
      unitPrice: 840.00,
      valueExcl: 196737.24,
      salesTaxPercent: 18.00,
      salesTaxAmount: 35412.70,
      furtherTaxPercent: 0.00,
      furtherTaxAmount: 0.00,
      total: 232149.94
    }
  ]
};

export default function InvoicePrintPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
    // Auto trigger print dialog after small delay to let QR code render
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const totalValueExcl = DUMMY_INVOICE.items.reduce((a, b) => a + b.valueExcl, 0);
  const totalSalesTax = DUMMY_INVOICE.items.reduce((a, b) => a + b.salesTaxAmount, 0);
  const totalFurtherTax = DUMMY_INVOICE.items.reduce((a, b) => a + b.furtherTaxAmount, 0);
  const grandTotal = DUMMY_INVOICE.items.reduce((a, b) => a + b.total, 0);
  const whtAmount = 232.15; // Hardcoded dummy logic matching PDF
  const finalInvoiceValue = grandTotal + whtAmount;

  return (
    <div className="bg-white min-h-screen">
      {/* Non-Printable Controls */}
      <div className="print:hidden p-4 bg-slate-100 border-b flex justify-between items-center mb-8">
        <p className="text-sm text-slate-500">Printing A4 FBR Default Format...</p>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 bg-white border rounded text-sm hover:bg-slate-50">Back</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Print Now</button>
        </div>
      </div>

      {/* Printable Area A4 */}
      <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-8 font-sans text-slate-900 border print:border-0 shadow-lg print:shadow-none">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div className="w-1/4">
            {/* Dummy Logo Placeholder */}
            <div className="h-20 w-20 bg-blue-900 flex items-center justify-center text-white font-bold italic text-3xl">
              F
            </div>
            <p className="text-[10px] text-blue-900 mt-1 font-semibold tracking-tighter">FABTEX INTERNATIONAL</p>
          </div>
          
          <div className="w-2/4 text-center">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">{DUMMY_INVOICE.seller.name}</h1>
            <div className="text-sm font-medium space-y-0.5">
              <p>NTN: <span className="font-normal">{DUMMY_INVOICE.seller.ntn}</span></p>
              <p>STRN: <span className="font-normal">{DUMMY_INVOICE.seller.strn}</span></p>
              <p className="text-xs font-normal mt-2">{DUMMY_INVOICE.seller.address}</p>
            </div>
          </div>

          <div className="w-1/4 flex justify-end">
            <div className="bg-slate-200 px-4 py-2 text-center h-fit mt-12">
              <p className="font-bold tracking-widest text-sm">SALES TAX INVOICE</p>
            </div>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="flex justify-between mb-6">
          <div className="w-1/2 pr-4 space-y-2">
            <h2 className="font-bold text-lg">{DUMMY_INVOICE.buyer.name}</h2>
            <p className="font-bold text-sm">NTN / CNIC: <span className="font-normal">{DUMMY_INVOICE.buyer.ntnCnic}</span></p>
            <p className="text-xs max-w-sm uppercase">{DUMMY_INVOICE.buyer.address}</p>
          </div>
          
          <div className="w-1/2 pl-4 flex flex-col items-end space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4 w-64">
              <p className="font-bold">Invoice Date:</p>
              <p>{DUMMY_INVOICE.date}</p>
              
              <p className="font-bold">Invoice Ref No:</p>
              <p>{DUMMY_INVOICE.id}</p>
            </div>
            
            <div className="w-64 pt-2">
              <p className="font-bold">FBR Invoice No:</p>
              <p className="font-bold text-xs break-all">{DUMMY_INVOICE.fbrInvoiceNo}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs text-center border-collapse border border-slate-900 mb-2">
          <thead className="font-bold bg-slate-50">
            <tr>
              <th className="border border-slate-900 p-2 w-8">S.#</th>
              <th className="border border-slate-900 p-2 text-left">Description</th>
              <th className="border border-slate-900 p-2">HS Code</th>
              <th className="border border-slate-900 p-2">UOM</th>
              <th className="border border-slate-900 p-2">Qty</th>
              <th className="border border-slate-900 p-2">Unit<br/>Price</th>
              <th className="border border-slate-900 p-2">Value Excl.<br/>S/Tax</th>
              <th className="border border-slate-900 p-2">Sales Tax<br/>((18.00%))</th>
              <th className="border border-slate-900 p-2">Further<br/>Sales Tax<br/>((0.00%))</th>
              <th className="border border-slate-900 p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_INVOICE.items.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-slate-900 p-2">{item.sNo}</td>
                <td className="border border-slate-900 p-2 text-left">{item.desc}</td>
                <td className="border border-slate-900 p-2">{item.hsCode}</td>
                <td className="border border-slate-900 p-2">{item.uom}</td>
                <td className="border border-slate-900 p-2">{item.qty.toFixed(2)}</td>
                <td className="border border-slate-900 p-2">{item.unitPrice.toFixed(2)}</td>
                <td className="border border-slate-900 p-2">{item.valueExcl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="border border-slate-900 p-2">{item.salesTaxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="border border-slate-900 p-2">{item.furtherTaxAmount.toFixed(2)}</td>
                <td className="border border-slate-900 p-2">{item.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            ))}
            {/* Empty space filler */}
            <tr>
              <td className="border-x border-slate-900 p-2 h-32"></td>
              <td className="border-x border-slate-900 p-2 h-32"></td>
              <td className="border-x border-slate-900 p-2 h-32"></td>
              <td className="border-x border-slate-900 p-2 h-32"></td>
              <td className="border-x border-slate-900 p-2 h-32"></td>
              <td className="border-x border-slate-900 p-2 h-32"></td>
              <td className="border-x border-slate-900 p-2 h-32"></td>
              <td className="border-x border-slate-900 p-2 h-32"></td>
              <td className="border-x border-slate-900 p-2 h-32"></td>
              <td className="border-x border-slate-900 p-2 h-32"></td>
            </tr>
            {/* Totals */}
            <tr className="font-bold">
              <td colSpan={4} className="border border-slate-900 p-2 text-right">TOTALS:</td>
              <td className="border border-slate-900 p-2">{DUMMY_INVOICE.items.reduce((a,b)=>a+b.qty,0).toFixed(2)}</td>
              <td className="border border-slate-900 p-2"></td>
              <td className="border border-slate-900 p-2">{totalValueExcl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              <td className="border border-slate-900 p-2">{totalSalesTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              <td className="border border-slate-900 p-2">{totalFurtherTax.toFixed(2)}</td>
              <td className="border border-slate-900 p-2">{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Top */}
        <div className="mt-8 flex justify-between items-start">
          <div className="w-1/2 pr-8">
            <p className="text-sm font-medium mb-4">Remarks:</p>
            <p className="font-bold text-sm mb-2">FBR Invoice Number: {DUMMY_INVOICE.fbrInvoiceNo}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="border p-2 w-32 flex flex-col items-center justify-center">
                <span className="text-blue-700 font-bold italic text-lg">FBR</span>
                <span className="bg-blue-700 text-white text-xs font-bold px-2 py-0.5">DIGITAL</span>
                <span className="text-[6px] mt-0.5 font-bold">INVOICING SYSTEM</span>
              </div>
              <div className="border p-1 border-slate-300">
                <QRCodeSVG value={DUMMY_INVOICE.fbrInvoiceNo} size={80} level="M" />
              </div>
            </div>
          </div>
          
          <div className="w-1/2 pl-8 space-y-4 text-sm mt-4">
            <div className="flex justify-between border-b pb-2">
              <span>Value Including Sales Tax</span>
              <span className="font-medium">{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between border-b border-black pb-2">
              <span>W.H.T. 236G (0.10%)</span>
              <span className="font-medium">{whtAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-bold text-lg">Total Invoice Value</span>
              <span className="font-bold text-lg">{finalInvoiceValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 bg-slate-50 p-4 border border-slate-100 text-xs">
          <span className="font-bold">Amount in Words:</span> TWO HUNDRED AND THIRTY-TWO THOUSAND THREE HUNDRED AND EIGHTY-TWO RUPEES AND NINE PAISE ONLY
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-8 pb-4">
          This is a computer-generated FBR Digital Invoice and does not require any signature and/or stamp.
        </p>

      </div>
    </div>
  );
}
