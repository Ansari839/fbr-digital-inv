"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, UploadCloud, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ImportInvoicePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{
    validFbrPayloads?: any[];
    quarantinedErrors?: any[];
  } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleDownloadTemplate = () => {
    window.location.href = '/api/bulk-upload/template';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResults(null);
      setSendSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        alert(data.error || 'Failed to process file');
      }
    } catch (err) {
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendToFBR = async () => {
    setIsSending(true);
    // Mock FBR Transmission Delay
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
    }, 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bulk Import Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">Upload an Excel file to bulk generate and transmit FBR JSON payloads</p>
        </div>
        <Button onClick={handleDownloadTemplate} variant="outline" className="h-9 border-slate-200 text-slate-700 bg-white shadow-sm">
          <FileDown className="h-4 w-4 mr-2 text-[var(--primary)]" />
          Download Sample Template
        </Button>
      </div>

      {/* Upload Zone */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 py-12 px-6">
            <UploadCloud className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Upload your filled template</h3>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
              Select the .xlsx file containing your bulk invoice data. We will validate the FBR rules before processing.
            </p>
            
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                id="excel-upload" 
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="excel-upload"
                className="cursor-pointer h-9 px-4 inline-flex items-center justify-center rounded-md bg-white border border-slate-200 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Choose File
              </label>
              <span className="text-sm text-slate-500">
                {file ? file.name : 'No file chosen'}
              </span>
            </div>

            {file && (
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="mt-6 bg-[var(--primary)] hover:opacity-90 text-white px-8"
              >
                {isUploading ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : 'Upload & Validate'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          
          {/* Errors Table */}
          {results.quarantinedErrors && results.quarantinedErrors.length > 0 && (
            <Card className="bg-white border-red-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-red-50 border-b border-red-100 pb-4">
                <CardTitle className="text-red-800 text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> 
                  Validation Errors ({results.quarantinedErrors.length})
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white border-b border-slate-100 text-slate-600">
                    <tr>
                      <th className="px-6 py-3 font-medium">Row #</th>
                      <th className="px-6 py-3 font-medium">Invoice No</th>
                      <th className="px-6 py-3 font-medium">Error Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {results.quarantinedErrors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-red-50/30">
                        <td className="px-6 py-3">{err.row}</td>
                        <td className="px-6 py-3 font-mono text-xs">{err.invoiceNo || 'N/A'}</td>
                        <td className="px-6 py-3 text-red-600">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Valid Payloads Preview */}
          {results.validFbrPayloads && results.validFbrPayloads.length > 0 && (
            <Card className="bg-white border-emerald-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> 
                  Valid Invoices Ready for FBR ({results.validFbrPayloads.length})
                </CardTitle>
                
                {!sendSuccess ? (
                  <Button 
                    onClick={handleSendToFBR} 
                    disabled={isSending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-9"
                  >
                    {isSending ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Transmitting...</>
                    ) : 'Process & Send to FBR'}
                  </Button>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 pointer-events-none px-3 py-1 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1 inline-block" /> Successfully Transmitted
                  </Badge>
                )}
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white border-b border-slate-100 text-slate-600">
                    <tr>
                      <th className="px-6 py-3 font-medium">Invoice No</th>
                      <th className="px-6 py-3 font-medium">Buyer</th>
                      <th className="px-6 py-3 font-medium text-center">Items</th>
                      <th className="px-6 py-3 font-medium text-right">Tax Charged</th>
                      <th className="px-6 py-3 font-medium text-right">Total Gross</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {results.validFbrPayloads.map((inv: any, idx: number) => (
                      <tr key={idx} className="hover:bg-emerald-50/30">
                        <td className="px-6 py-3 font-mono text-xs font-semibold">{inv.InvoiceNumber}</td>
                        <td className="px-6 py-3">
                          <div className="font-medium text-slate-800">{inv.BuyerName}</div>
                          <div className="text-xs text-slate-500">{inv.BuyerNTN || inv.BuyerCNIC}</div>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <Badge variant="outline" className="bg-slate-50">{inv.Items?.length || 0}</Badge>
                        </td>
                        <td className="px-6 py-3 text-right font-medium">
                          {inv.TotalTaxCharged.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-slate-900">
                          {inv.TotalGrossAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        </div>
      )}

    </div>
  );
}
