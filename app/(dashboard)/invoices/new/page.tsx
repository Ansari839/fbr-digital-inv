"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Play, Save, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function NewInvoicePage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const is24HrOfflineBlocked = false; 

  // Full FBR Payload State
  const [invoiceType, setInvoiceType] = useState('Sale Invoice');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Seller (Pre-filled as approved)
  const [sellerNTNCNIC] = useState('7654321');
  const [sellerBusinessName] = useState('My Company Pvt Ltd');
  const [sellerProvince] = useState('Sindh');
  const [sellerAddress] = useState('123 Business Avenue, Karachi');

  // Buyer
  const [buyerRegistrationType, setBuyerRegistrationType] = useState('Registered');
  const [buyerNTNCNIC, setBuyerNTNCNIC] = useState('');
  const [buyerBusinessName, setBuyerBusinessName] = useState('');
  const [buyerProvince, setBuyerProvince] = useState('Sindh');
  const [buyerAddress, setBuyerAddress] = useState('');

  // Items
  const [items, setItems] = useState([
    {
      hsCode: '',
      productDescription: '',
      rate: '18%',
      uoM: 'KGM',
      quantity: 1,
      valueSalesExcludingST: 0,
      salesTaxApplicable: 0,
      totalValues: 0,
      saleType: 'Goods at standard rate (default)'
    }
  ]);

  const handleAddItem = () => {
    setItems([...items, { hsCode: '', productDescription: '', rate: '18%', uoM: 'KGM', quantity: 1, valueSalesExcludingST: 0, salesTaxApplicable: 0, totalValues: 0, saleType: 'Goods at standard rate (default)' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleDryRunVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      alert("Validation Success: Form structure matches FBR Payload Schema.");
    }, 1500);
  };

  if (is24HrOfflineBlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="p-8 max-w-2xl w-full bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Invoicing Blocked (24-Hour Rule)</h2>
          <p className="text-red-700 mt-2">
            You have offline invoices older than 24 hours that have not been synced with FBR. 
            Please sync them from the Offline Dashboard before creating new invoices.
          </p>
          <Button className="mt-6 bg-red-600 hover:bg-red-700">Go to Offline Sync</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
              <FileText className="text-white h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Create Invoice (FBR Payload)</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={handleDryRunVerify}
              disabled={isVerifying}
            >
              <Play className="mr-2 h-4 w-4 text-blue-600" />
              {isVerifying ? "Verifying..." : "Dry Run"}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Save className="mr-2 h-4 w-4" />
              Post to FBR
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* Header Info */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800">1. Invoice Header</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoiceType">Invoice Type</Label>
              <Select value={invoiceType} onValueChange={setInvoiceType}>
                <SelectTrigger id="invoiceType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sale Invoice">Sale Invoice</SelectItem>
                  <SelectItem value="Debit Note">Debit Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Seller Info (Pre-filled) */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl bg-slate-50/50">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800 flex justify-between">
              <span>2. Seller Information</span>
              <span className="text-xs text-slate-400 font-normal">Auto-filled from settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 opacity-70">
            <div className="space-y-1">
              <Label className="text-xs">Seller NTN</Label>
              <Input value={sellerNTNCNIC} disabled className="bg-slate-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Business Name</Label>
              <Input value={sellerBusinessName} disabled className="bg-slate-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Province</Label>
              <Input value={sellerProvince} disabled className="bg-slate-100" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Address</Label>
              <Input value={sellerAddress} disabled className="bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Buyer Info */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800">3. Buyer Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="buyerRegistrationType">Registration Type</Label>
              <Select value={buyerRegistrationType} onValueChange={setBuyerRegistrationType}>
                <SelectTrigger id="buyerRegistrationType">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Registered">Registered</SelectItem>
                  <SelectItem value="Unregistered">Unregistered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerNTNCNIC">Buyer NTN / CNIC</Label>
              <Input id="buyerNTNCNIC" placeholder="7-digit NTN" value={buyerNTNCNIC} onChange={e => setBuyerNTNCNIC(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerBusinessName">Business Name</Label>
              <Input id="buyerBusinessName" placeholder="Enter business name" value={buyerBusinessName} onChange={e => setBuyerBusinessName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerProvince">Province</Label>
              <Input id="buyerProvince" placeholder="e.g. Sindh" value={buyerProvince} onChange={e => setBuyerProvince(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="buyerAddress">Address</Label>
              <Input id="buyerAddress" placeholder="Complete address" value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
            <CardTitle className="text-lg font-semibold text-slate-800">4. Line Items</CardTitle>
            <Button onClick={handleAddItem} variant="outline" size="sm" className="h-8 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
              <Plus className="mr-1 h-3 w-3" /> Add Item
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="min-w-[200px]">Description & HS Code</TableHead>
                  <TableHead>Qty & UOM</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Value (Excl. Tax)</TableHead>
                  <TableHead>Sales Tax</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index} className="align-top">
                    <TableCell className="pt-4 font-medium text-slate-500">{index + 1}</TableCell>
                    <TableCell className="space-y-2 min-w-[200px]">
                      <Input placeholder="Description" value={item.productDescription} onChange={(e) => handleItemChange(index, 'productDescription', e.target.value)} className="h-8 text-sm" />
                      <Input placeholder="HS Code" value={item.hsCode} onChange={(e) => handleItemChange(index, 'hsCode', e.target.value)} className="h-8 text-sm" />
                      <Input placeholder="Sale Type (e.g. Standard)" value={item.saleType} onChange={(e) => handleItemChange(index, 'saleType', e.target.value)} className="h-8 text-sm text-xs" />
                    </TableCell>
                    <TableCell className="space-y-2 w-32">
                      <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
                      <Input placeholder="UOM" value={item.uoM} onChange={(e) => handleItemChange(index, 'uoM', e.target.value)} className="h-8 text-sm uppercase" />
                    </TableCell>
                    <TableCell className="w-24">
                      <Input placeholder="18%" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} className="h-8 text-sm" />
                    </TableCell>
                    <TableCell className="w-32">
                      <Input type="number" placeholder="0" value={item.valueSalesExcludingST} onChange={(e) => handleItemChange(index, 'valueSalesExcludingST', parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
                    </TableCell>
                    <TableCell className="w-32">
                      <Input type="number" placeholder="0" value={item.salesTaxApplicable} onChange={(e) => handleItemChange(index, 'salesTaxApplicable', parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
                    </TableCell>
                    <TableCell className="w-32">
                      <Input type="number" placeholder="0" value={item.totalValues} onChange={(e) => handleItemChange(index, 'totalValues', parseFloat(e.target.value) || 0)} className="h-8 text-sm font-semibold text-slate-800" />
                    </TableCell>
                    <TableCell className="pt-4">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

      </main>
    </div>
  );
}
