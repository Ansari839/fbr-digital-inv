"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Play, Save, Plus, Trash2, AlertCircle, Loader2, CheckSquare, Search } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';

export default function NewInvoicePage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  
  // Holiday & Date Restriction State
  const [holidays, setHolidays] = useState<any[]>([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayAlertMessage, setHolidayAlertMessage] = useState('');
  const [forceIssueReason, setForceIssueReason] = useState('');
  const [pendingAction, setPendingAction] = useState<'dryRun' | 'post' | null>(null);
  
  // Add Customer Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', ntnOrCnic: '', isRegistered: true, province: '', address: '' });

  // Custom Message Modal State
  const [messageModal, setMessageModal] = useState<{show: boolean, type: 'success' | 'error' | 'info', title: string, message: string, payload?: string}>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showMessage = (type: 'success' | 'error' | 'info', title: string, message: string, payload?: any) => {
    setMessageModal({
      show: true,
      type,
      title,
      message,
      payload: payload ? JSON.stringify(payload, null, 2) : undefined
    });
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (Array.isArray(data)) setInventoryItems(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/holidays');
      const data = await res.json();
      if (Array.isArray(data)) setHolidays(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchInventoryItems();
    fetchHolidays();
  }, []);

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
  const [ntnNotFound, setNtnNotFound] = useState(false);

  // Line Items & Stock tracking
  const [items, setItems] = useState<any[]>([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [selectedItemsFromPicker, setSelectedItemsFromPicker] = useState<string[]>([]);
  const [negativeStockReason, setNegativeStockReason] = useState('');
  
  const hasNegativeStock = items.some(item => (parseFloat(item.stockQty) - item.quantity) < 0);

  const openItemPicker = () => {
    setSelectedItemsFromPicker([]);
    setItemSearchQuery('');
    setShowItemPicker(true);
  };

  const confirmItemSelection = () => {
    const newItemsToAdd = inventoryItems
      .filter(i => selectedItemsFromPicker.includes(i.id))
      .map(i => ({
        ...i,
        quantity: 1,
        // use defaultRate from DB
        rate: parseFloat(i.defaultRate) || 0
      }));
    
    setItems([...items, ...newItemsToAdd]);
    setShowItemPicker(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleNTNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBuyerNTNCNIC(val);
    
    // Auto-fill logic
    const found = customers.find(c => c.ntnOrCnic === val);
    if (found) {
      setNtnNotFound(false);
      setBuyerBusinessName(found.name);
      setBuyerRegistrationType(found.isRegistered ? 'Registered' : 'Unregistered');
      
      const defaultAddress = found.addresses?.[0];
      if (defaultAddress) {
        setBuyerProvince(defaultAddress.province || '');
        setBuyerAddress(defaultAddress.addressLine || '');
      }
    } else {
      setNtnNotFound(val.length >= 7);
    }
  };

  const handleBusinessNameSelect = (name: string) => {
    const found = customers.find(c => c.name === name);
    if (found) {
      setBuyerBusinessName(found.name);
      setBuyerNTNCNIC(found.ntnOrCnic);
      setNtnNotFound(false);
      setBuyerRegistrationType(found.isRegistered ? 'Registered' : 'Unregistered');
      
      const defaultAddress = found.addresses?.[0];
      if (defaultAddress) {
        setBuyerProvince(defaultAddress.province || '');
        setBuyerAddress(defaultAddress.addressLine || '');
      }
    } else {
      setBuyerBusinessName(name);
    }
  };

  const handleSaveNewCustomer = async () => {
    setIsSavingCustomer(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      if (res.ok) {
        const created = await res.json();
        await fetchCustomers();
        
        // Auto-select the newly created customer
        setBuyerNTNCNIC(created.ntnOrCnic);
        setBuyerBusinessName(created.name);
        setBuyerRegistrationType(created.isRegistered ? 'Registered' : 'Unregistered');
        setBuyerProvince(created.addresses?.[0]?.province || '');
        setBuyerAddress(created.addresses?.[0]?.addressLine || '');
        
        setNtnNotFound(false);
        setShowAddCustomerModal(false);
        setNewCustomer({ name: '', ntnOrCnic: '', isRegistered: true, province: '', address: '' });
      } else {
        showMessage('error', 'Error', "Failed to save customer. Please try again.");
      }
    } catch (err) {
      showMessage('error', 'Error', "An unexpected error occurred while saving the customer.");
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const generateFbrPayload = () => {
    return {
      invoiceType,
      invoiceDate,
      sellerNTNCNIC: '7654321', // In real app, fetch from session/business unit
      sellerBusinessName: 'My Company Pvt Ltd',
      sellerProvince: 'Sindh',
      sellerAddress: '123 Business Avenue, Karachi',
      
      buyerRegistrationType,
      ...(buyerRegistrationType === 'Registered' && { buyerNTNCNIC }),
      buyerBusinessName,
      buyerProvince,
      buyerAddress,
      
      scenarioId: 'SN001', // Sandbox only
      items: items.map(item => {
        const qty = Number(item.quantity || 0);
        const rate = Number(item.rate || 0);
        const taxRate = parseFloat(item.taxRate) || 0;
        
        const valueExclTax = Number((qty * rate).toFixed(2));
        const taxAmount = Number(((valueExclTax * taxRate) / 100).toFixed(2));
        const totalValue = Number((valueExclTax + taxAmount).toFixed(2));
        
        return {
          hsCode: item.hsCode,
          productDescription: item.name,
          rate: `${taxRate}%`,
          uoM: item.uom,
          quantity: Number(qty.toFixed(4)), // Qty can sometimes have 4 decimals
          totalValues: totalValue,
          valueSalesExcludingST: valueExclTax,
          fixedNotifiedValueOrRetailPrice: 0,
          salesTaxApplicable: taxAmount,
          salesTaxWithheldAtSource: 0,
          extraTax: 0,
          furtherTax: 0,
          sroScheduleNo: "",
          fedPayable: 0,
          discount: 0,
          saleType: item.saleType,
          sroItemSerialNo: ""
        };
      })
    };
  };

  const validateInvoiceDate = (inputDate: string, cachedHolidays: any[], forceIssue = false, forceReason = '') => {
    const dateObj = new Date(inputDate);
    const dayOfWeek = dateObj.getDay(); 

    if (dayOfWeek === 0) {
      if (!forceIssue) {
        return { allowed: false, message: "Warning: Selected date is a Sunday. Invoicing on Sundays requires a valid reason." };
      }
      if (forceIssue && (!forceReason || forceReason.trim().length < 5)) {
        return { allowed: false, message: "Please enter a valid reason (min 5 characters) to force issue on a Sunday." };
      }
      return { allowed: true };
    }

    const matchedHoliday = cachedHolidays.find(h => h.date === inputDate);
    if (matchedHoliday) {
        if (!forceIssue) {
            return { allowed: false, message: `Alert: Selected date is an official gazetted holiday (${matchedHoliday.name}).` };
        }
        if (forceIssue && (!forceReason || forceReason.trim().length < 5)) {
            return { allowed: false, message: "Please enter a valid reason (min 5 characters) to force issue on an official holiday." };
        }
        return { allowed: true };
    }

    return { allowed: true };
  };

  const handleDryRunVerify = () => {
    // Validations
    if (!buyerBusinessName || !buyerProvince || !buyerAddress) {
      showMessage('error', 'Validation Error', "Please fill in all required buyer information (Name, Province, Address).");
      return;
    }
    if (buyerRegistrationType === 'Registered' && !buyerNTNCNIC) {
      showMessage('error', 'Validation Error', "NTN/CNIC is required when Buyer is Registered.");
      return;
    }

    if (items.length === 0) {
      showMessage('error', 'Validation Error', "Please add at least one line item to the invoice.");
      return;
    }
    
    if (hasNegativeStock && !negativeStockReason) {
      showMessage('error', 'Warning', "Please provide a reason for negative stock before verifying.");
      return;
    }

    // Holiday & Sunday Validation Engine
    const validation = validateInvoiceDate(invoiceDate, holidays, forceIssueReason.trim().length >= 5, forceIssueReason);
    if (!validation.allowed) {
      setHolidayAlertMessage(validation.message || '');
      setPendingAction('dryRun');
      setShowHolidayModal(true);
      return;
    }

    setIsVerifying(true);
    
    const payload = generateFbrPayload();
    if (forceIssueReason.trim().length >= 5) {
      (payload as any).forceIssueReason = forceIssueReason.trim(); // Just append it to payload for visual testing
    }
    
    setTimeout(() => {
      setIsVerifying(false);
      showMessage(
        'success', 
        'Validation Success', 
        'Form structure matched FBR Payload Schema! You can review the exact JSON payload below:',
        payload
      );
    }, 1000);
  };

  const handlePostToFBR = () => {
    // Validations
    if (!buyerBusinessName || !buyerProvince || !buyerAddress) {
      showMessage('error', 'Validation Error', "Please fill in all required buyer information (Name, Province, Address).");
      return;
    }
    if (buyerRegistrationType === 'Registered' && !buyerNTNCNIC) {
      showMessage('error', 'Validation Error', "NTN/CNIC is required when Buyer is Registered.");
      return;
    }

    if (items.length === 0) {
      showMessage('error', 'Validation Error', "Please add at least one line item before posting.");
      return;
    }
    
    // Holiday & Sunday Validation Engine
    const validation = validateInvoiceDate(invoiceDate, holidays, forceIssueReason.trim().length >= 5, forceIssueReason);
    if (!validation.allowed) {
      setHolidayAlertMessage(validation.message || '');
      setPendingAction('post');
      setShowHolidayModal(true);
      return;
    }

    const payload = generateFbrPayload();
    if (forceIssueReason.trim().length >= 5) {
      (payload as any).forceIssueReason = forceIssueReason.trim();
    }
    showMessage(
      'info',
      'Post to FBR',
      'This action will post the following payload to FBR APIs. (Simulation)',
      payload
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Customer</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} placeholder="e.g. ABC Corp" />
              </div>
              <div>
                <Label>NTN / CNIC</Label>
                <Input value={newCustomer.ntnOrCnic} onChange={e => setNewCustomer({...newCustomer, ntnOrCnic: e.target.value})} placeholder="e.g. 1234567-8" />
              </div>
              <div>
                <Label>Registration Type</Label>
                <Select value={newCustomer.isRegistered ? 'true' : 'false'} onValueChange={v => setNewCustomer({...newCustomer, isRegistered: v === 'true'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Registered</SelectItem>
                    <SelectItem value="false">Unregistered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <Label>Province</Label>
                  <Input value={newCustomer.province} onChange={e => setNewCustomer({...newCustomer, province: e.target.value})} placeholder="e.g. Sindh" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label>Address</Label>
                  <Input value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} placeholder="e.g. Karachi" />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddCustomerModal(false)}>Cancel</Button>
                <Button onClick={handleSaveNewCustomer} disabled={isSavingCustomer || !newCustomer.name || !newCustomer.ntnOrCnic} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSavingCustomer ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holiday / Date Override Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-[55] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border-t-4 border-amber-500 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Date Restriction Warning
            </h3>
            <p className="text-sm text-slate-600 mb-4">{holidayAlertMessage}</p>
            <div className="space-y-2">
              <Label>Reason for Force Issue</Label>
              <Input 
                placeholder="Enter valid reason (min 5 characters)..." 
                value={forceIssueReason}
                onChange={e => setForceIssueReason(e.target.value)}
                className="focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => {
                setShowHolidayModal(false);
                setPendingAction(null);
                setForceIssueReason(''); // Reset if they cancel
              }}>Cancel</Button>
              <Button onClick={() => {
                setShowHolidayModal(false);
                if (pendingAction === 'dryRun') handleDryRunVerify();
                if (pendingAction === 'post') handlePostToFBR();
              }} disabled={forceIssueReason.trim().length < 5} className="bg-amber-500 hover:bg-amber-600 text-white">
                Proceed Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Item Picker Modal */}
      {showItemPicker && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-[var(--primary)]" />
                Select Items to Add
              </h3>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or HS Code..."
                value={itemSearchQuery}
                onChange={e => setItemSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex-1 overflow-y-auto mb-4 border rounded-md border-slate-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 w-10"></th>
                    <th className="px-4 py-2 font-medium">Item Details</th>
                    <th className="px-4 py-2 font-medium text-center">In Stock</th>
                    <th className="px-4 py-2 font-medium text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryItems.filter(i => i.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) || i.hsCode.includes(itemSearchQuery)).map(item => {
                    const isSelected = selectedItemsFromPicker.includes(item.id);
                    return (
                      <tr 
                        key={item.id} 
                        className={`cursor-pointer hover:bg-slate-50 ${isSelected ? 'bg-emerald-50/50' : ''}`}
                        onClick={() => {
                          if (isSelected) setSelectedItemsFromPicker(selectedItemsFromPicker.filter(id => id !== item.id));
                          else setSelectedItemsFromPicker([...selectedItemsFromPicker, item.id]);
                        }}
                      >
                        <td className="px-4 py-2">
                          <input type="checkbox" checked={isSelected} readOnly className="h-4 w-4 text-[var(--primary)] rounded border-slate-300 focus:ring-[var(--primary)]" />
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium text-slate-900">{item.name} {item.internalName ? `(${item.internalName})` : ''}</div>
                          <div className="text-xs text-slate-500">HS: {item.hsCode} | UOM: {item.uom}</div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Badge variant="outline" className={parseFloat(item.stockQty) <= 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}>
                            {parseFloat(item.stockQty)}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right font-medium">Rs {parseFloat(item.defaultRate).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowItemPicker(false)}>Cancel</Button>
              <Button onClick={confirmItemSelection} disabled={selectedItemsFromPicker.length === 0} className="bg-[var(--primary)] hover:opacity-90 text-white">
                Add {selectedItemsFromPicker.length} Items
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message/Alert Modal */}
      {messageModal.show && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full overflow-hidden flex flex-col">
            <div className={`px-6 py-4 border-b flex items-center gap-3 ${
              messageModal.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 
              messageModal.type === 'error' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
            }`}>
              {messageModal.type === 'success' && <CheckSquare className="h-6 w-6 text-emerald-600" />}
              {messageModal.type === 'error' && <AlertCircle className="h-6 w-6 text-red-600" />}
              {messageModal.type === 'info' && <FileText className="h-6 w-6 text-blue-600" />}
              <h3 className={`text-lg font-bold ${
                messageModal.type === 'success' ? 'text-emerald-900' : 
                messageModal.type === 'error' ? 'text-red-900' : 'text-blue-900'
              }`}>
                {messageModal.title}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <p className="text-slate-700 mb-4">{messageModal.message}</p>
              {messageModal.payload && (
                <div className="bg-slate-900 rounded-md p-4 overflow-x-auto">
                  <pre className="text-xs text-emerald-400 font-mono">
                    {messageModal.payload}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button onClick={() => setMessageModal({...messageModal, show: false})} className={
                messageModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                messageModal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={handlePostToFBR}>
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
            <div className="space-y-4">
              <Label htmlFor="invoiceType" className="text-slate-700">Invoice Type</Label>
              <Select value={invoiceType} onValueChange={(v) => v && setInvoiceType(v)}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
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
            <div className="space-y-3">
              <Label htmlFor="buyerRegistrationType">Registration Type</Label>
              <Select value={buyerRegistrationType} onValueChange={(v) => v && setBuyerRegistrationType(v)}>
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
              <Input id="buyerNTNCNIC" placeholder="7-digit NTN" value={buyerNTNCNIC} onChange={handleNTNChange} />
              {ntnNotFound && (
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  Not found. 
                  <button onClick={() => { setNewCustomer({ ...newCustomer, ntnOrCnic: buyerNTNCNIC }); setShowAddCustomerModal(true); }} className="text-blue-600 hover:underline font-medium">Add new</button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerBusinessName">Business Name</Label>
              <Combobox 
                options={customers.map(c => ({ label: c.name, value: c.name }))}
                value={buyerBusinessName}
                onChange={handleBusinessNameSelect}
                onAdd={(name) => {
                  setNewCustomer({ ...newCustomer, name, ntnOrCnic: buyerNTNCNIC });
                  setShowAddCustomerModal(true);
                }}
                placeholder="Select or add business"
              />
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
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-visible">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50 rounded-t-xl">
            <CardTitle className="text-lg font-semibold text-slate-800">4. Line Items</CardTitle>
            <Button onClick={openItemPicker} variant="outline" size="sm" className="h-8 border-[var(--primary)]/30 text-[var(--primary)] bg-emerald-50 hover:bg-emerald-100">
              <Plus className="mr-1 h-3 w-3" /> Select Items
            </Button>
          </CardHeader>
          <div className="overflow-x-auto min-h-[200px]">
            <Table>
              <TableHeader className="bg-slate-50 text-slate-600">
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="min-w-[250px]">Item Details</TableHead>
                  <TableHead className="w-32">Qty</TableHead>
                  <TableHead className="w-32">Rate (Rs)</TableHead>
                  <TableHead className="w-32 text-right">Value</TableHead>
                  <TableHead className="w-24 text-right">Tax</TableHead>
                  <TableHead className="w-32 text-right">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                      No items added yet. Click <strong>Select Items</strong> to add products from your inventory.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => {
                    const qty = item.quantity || 0;
                    const rate = item.rate || 0;
                    const taxRate = parseFloat(item.taxRate) || 0;
                    const valueExclTax = qty * rate;
                    const taxAmount = (valueExclTax * taxRate) / 100;
                    const totalValue = valueExclTax + taxAmount;
                    
                    const currentStock = parseFloat(item.stockQty);
                    const remainingStock = currentStock - qty;
                    const isNegative = remainingStock < 0;

                    return (
                      <TableRow key={index} className="align-top hover:bg-slate-50/50">
                        <TableCell className="pt-4 font-medium text-slate-500">{index + 1}</TableCell>
                        <TableCell className="pt-4 space-y-1">
                          <div className="font-semibold text-slate-800">{item.name} {item.internalName ? <span className="font-normal text-slate-500 text-xs">({item.internalName})</span> : ''}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 px-1 py-0">{item.hsCode}</Badge>
                            <span>{item.uom}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] uppercase text-emerald-600 bg-emerald-50 px-1 rounded">{item.saleType.split(' ')[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="pt-3">
                          <div className="relative flex flex-col gap-1.5">
                            <Input 
                              type="number" 
                              min="1"
                              value={item.quantity || ''} 
                              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} 
                              className="h-9 text-sm focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]" 
                            />
                            <div className={`text-[10px] px-1.5 py-0.5 rounded flex items-center justify-between border ${isNegative ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                              <span>Stock: {currentStock}</span>
                              <span>Rem: {remainingStock}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="pt-3">
                          <Input 
                            type="number" 
                            value={item.rate || ''} 
                            onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)} 
                            className="h-9 text-sm focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]" 
                          />
                        </TableCell>
                        <TableCell className="pt-4 text-right font-medium text-slate-700">
                          {valueExclTax.toLocaleString()}
                        </TableCell>
                        <TableCell className="pt-4 text-right">
                          <div className="text-sm font-medium text-slate-700">{taxAmount.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">@{taxRate}%</div>
                        </TableCell>
                        <TableCell className="pt-4 text-right font-bold text-[var(--primary)]">
                          {totalValue.toLocaleString()}
                        </TableCell>
                        <TableCell className="pt-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            
            {hasNegativeStock && (
              <div className="p-4 bg-red-50/50 border-t border-red-100 m-4 rounded-lg flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Warning: Some items will result in negative stock. Please provide a reason below.
                </div>
                <Input 
                  required
                  placeholder="e.g. Stock received but purchase invoice pending..."
                  value={negativeStockReason}
                  onChange={e => setNegativeStockReason(e.target.value)}
                  className="bg-white border-red-200 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            )}
          </div>
        </Card>

      </main>
    </div>
  );
}
