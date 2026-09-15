"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Play, Save, Plus, Trash2, AlertCircle, Loader2, CheckSquare, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import toWords from 'number-to-words';

export default function NewInvoicePage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  
  // Holiday & Date Restriction State
  const [holidays, setHolidays] = useState<any[]>([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayAlertMessage, setHolidayAlertMessage] = useState('');
  const [forceIssueReason, setForceIssueReason] = useState('');
  const [pendingAction, setPendingAction] = useState<'dryRun' | 'post' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');
  const [matchedInvoiceDetails, setMatchedInvoiceDetails] = useState<any>(null);
  
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

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/settings/profile');
      if (res.ok) setProfile(await res.json());
    } catch (e) {}
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch (error) {}
  };

  const fetchInventoryItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (Array.isArray(data)) setInventoryItems(data);
    } catch (error) {}
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/holidays');
      const data = await res.json();
      if (Array.isArray(data)) setHolidays(data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchProfile();
    fetchCustomers();
    fetchInventoryItems();
    fetchHolidays();
  }, []);

  // Full FBR Payload State
  const [invoiceType, setInvoiceType] = useState('Sale Invoice');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [applyWht, setApplyWht] = useState(true);
  
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

  const handleBusinessNameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    if (name === 'ADD_NEW') {
      setShowAddCustomerModal(true);
      return;
    }
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
      sellerNTNCNIC: profile?.ntn || '7654321', 
      sellerBusinessName: profile?.name || 'My Company Pvt Ltd',
      sellerProvince: 'Sindh',
      sellerAddress: '123 Business Avenue, Karachi',
      
      buyerRegistrationType,
      ...(buyerRegistrationType === 'Registered' && { buyerNTNCNIC }),
      buyerBusinessName,
      buyerProvince,
      buyerAddress,
      
      scenarioId: 'SN001',
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
          quantity: Number(qty.toFixed(4)), 
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

    const validation = validateInvoiceDate(invoiceDate, holidays, forceIssueReason.trim().length >= 5, forceIssueReason);
    if (!validation.allowed) {
      setHolidayAlertMessage(validation.message || '');
      setPendingAction('dryRun');
      setShowHolidayModal(true);
      return;
    }

    runDuplicateCheck('dryRun');
  };

  const proceedWithDryRun = () => {
    setIsVerifying(true);
    setShowDuplicateWarning(false);
    
    const payload = generateFbrPayload();
    if (forceIssueReason.trim().length >= 5) {
      (payload as any).forceIssueReason = forceIssueReason.trim(); 
    }
    
    setTimeout(() => {
      setIsVerifying(false);
      setIsSubmitting(false);
      showMessage(
        'success', 
        'Validation Success', 
        'Form structure matched FBR Payload Schema! You can review the exact JSON payload below:',
        payload
      );
    }, 1000);
  };

  const proceedWithPost = async () => {
    setIsSubmitting(true);
    setShowDuplicateWarning(false);
    const payload = generateFbrPayload();
    if (forceIssueReason.trim().length >= 5) {
      (payload as any).forceIssueReason = forceIssueReason.trim();
    }
    
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload,
          buyerNTNCNIC,
          buyerBusinessName,
          buyerProvince,
          buyerAddress,
          forceIssueReason,
          items,
          applyWht
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showMessage('success', 'Success', 'Invoice created and simulated FBR sync successfully!');
        setTimeout(() => {
          window.open(`/api/invoices/${data.invoice.id}/pdf`, '_blank');
          router.push('/invoices');
        }, 1500);
      } else {
        setIsSubmitting(false);
        showMessage('error', 'Error', data.error || 'Failed to save invoice');
      }
    } catch (e) {
      setIsSubmitting(false);
      showMessage('error', 'Error', 'Failed to connect to the server');
    }
  };

  const handlePostToFBR = async () => {
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
    
    const validation = validateInvoiceDate(invoiceDate, holidays, forceIssueReason.trim().length >= 5, forceIssueReason);
    if (!validation.allowed) {
      setHolidayAlertMessage(validation.message || '');
      setPendingAction('post');
      setShowHolidayModal(true);
      return;
    }

    runDuplicateCheck('post');
  };

  const runDuplicateCheck = async (actionType: 'dryRun' | 'post') => {
    setIsSubmitting(true);
    try {
      const totalAmount = items.reduce((acc, item) => {
        const valueExcl = item.quantity * item.rate;
        const tax = (valueExcl * parseFloat(item.taxRate || 0)) / 100;
        return acc + valueExcl + tax;
      }, 0);

      const checkRes = await fetch('/api/invoices/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: buyerNTNCNIC || buyerBusinessName,
          totalAmount,
          items: items.map(i => ({ itemId: i.id, quantity: i.quantity, rate: i.rate }))
        })
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.isDuplicate) {
          setIsSubmitting(false);
          setDuplicateMessage(checkData.message);
          setMatchedInvoiceDetails(checkData.matchedInvoice);
          setPendingAction(actionType);
          setShowDuplicateWarning(true);
          return;
        }
      }
    } catch (e) {
      console.error("Duplicate check failed", e);
    }
    
    if (actionType === 'dryRun') {
      proceedWithDryRun();
    } else {
      proceedWithPost();
    }
  };

  // Calculations for display
  const totQty = items.reduce((a, i) => a + Number(i.quantity || 0), 0);
  const totExcl = items.reduce((a, i) => a + (Number(i.quantity || 0) * Number(i.rate || 0)), 0);
  const totStax = items.reduce((a, i) => a + ((Number(i.quantity || 0) * Number(i.rate || 0) * Number(i.taxRate || 0)) / 100), 0);
  const grand = totExcl + totStax;
  const whtAmount = applyWht ? grand * 0.001 : 0;
  const finalAmount = grand + whtAmount;

  const intP = Math.floor(finalAmount);
  const decP = Math.round((finalAmount - intP) * 100);
  const words = toWords.toWords(intP).toUpperCase() + ' RUPEES AND ' +
    (decP > 0 ? toWords.toWords(decP).toUpperCase() + ' PAISE' : 'ZERO PAISE') + ' ONLY';

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-slate-200 font-sans text-slate-900 pb-20">
      
      {/* Modals remain structurally the same */}
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
                <div>
                  <Label>Province</Label>
                  <Input value={newCustomer.province} onChange={e => setNewCustomer({...newCustomer, province: e.target.value})} placeholder="e.g. Sindh" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} placeholder="e.g. Karachi" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddCustomerModal(false)}>Cancel</Button>
                <Button onClick={handleSaveNewCustomer} disabled={isSavingCustomer || !newCustomer.name || !newCustomer.ntnOrCnic} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSavingCustomer ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHolidayModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-[55] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border-t-4 border-amber-500">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" /> Date Restriction
            </h3>
            <p className="text-sm text-slate-600 mb-4">{holidayAlertMessage}</p>
            <div className="space-y-2">
              <Label>Reason for Force Issue</Label>
              <Input placeholder="Enter reason..." value={forceIssueReason} onChange={e => setForceIssueReason(e.target.value)} />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => { setShowHolidayModal(false); setPendingAction(null); }}>Cancel</Button>
              <Button onClick={() => {
                setShowHolidayModal(false);
                if (pendingAction === 'dryRun') handleDryRunVerify();
                if (pendingAction === 'post') handlePostToFBR();
              }} disabled={forceIssueReason.trim().length < 5} className="bg-amber-500 text-white">Proceed</Button>
            </div>
          </div>
        </div>
      )}

      {showDuplicateWarning && (
        <div className="fixed inset-0 bg-slate-900/50 z-[55] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border-t-4 border-red-500">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" /> Duplicate Alert!
            </h3>
            <p className="text-sm text-slate-600 mb-4 font-medium">Ye invoice duplicate lag rahi hai.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowDuplicateWarning(false); setPendingAction(null); }}>Cancel</Button>
              <Button onClick={() => pendingAction === 'dryRun' ? proceedWithDryRun() : proceedWithPost()} className="bg-red-600 text-white">Post Anyway</Button>
            </div>
          </div>
        </div>
      )}

      {showItemPicker && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2"><CheckSquare className="h-5 w-5 text-blue-600"/> Select Items</h3>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search..." value={itemSearchQuery} onChange={e => setItemSearchQuery(e.target.value)} className="w-full h-9 pl-9 pr-3 border rounded-md text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto mb-4 border rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b sticky top-0">
                  <tr>
                    <th className="px-4 py-2 w-10"></th>
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2 text-center">Stock</th>
                    <th className="px-4 py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inventoryItems.filter(i => i.name.toLowerCase().includes(itemSearchQuery.toLowerCase())).map(item => {
                    const isSelected = selectedItemsFromPicker.includes(item.id);
                    return (
                      <tr key={item.id} className="cursor-pointer hover:bg-slate-50" onClick={() => {
                        if (isSelected) setSelectedItemsFromPicker(selectedItemsFromPicker.filter(id => id !== item.id));
                        else setSelectedItemsFromPicker([...selectedItemsFromPicker, item.id]);
                      }}>
                        <td className="px-4 py-2"><input type="checkbox" checked={isSelected} readOnly /></td>
                        <td className="px-4 py-2">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-slate-500">HS: {item.hsCode} | UOM: {item.uom}</div>
                        </td>
                        <td className="px-4 py-2 text-center">{parseFloat(item.stockQty)}</td>
                        <td className="px-4 py-2 text-right">Rs {parseFloat(item.defaultRate).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowItemPicker(false)}>Cancel</Button>
              <Button onClick={confirmItemSelection} disabled={selectedItemsFromPicker.length===0} className="bg-blue-600 text-white">Add Items</Button>
            </div>
          </div>
        </div>
      )}

      {messageModal.show && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
            <h3 className="font-bold text-lg mb-2">{messageModal.title}</h3>
            <p className="text-slate-700 mb-4">{messageModal.message}</p>
            {messageModal.payload && (
              <pre className="text-xs bg-slate-900 text-emerald-400 p-4 rounded overflow-auto max-h-[50vh]">{messageModal.payload}</pre>
            )}
            <div className="flex justify-end mt-4"><Button onClick={() => setMessageModal({...messageModal, show: false})}>Close</Button></div>
          </div>
        </div>
      )}

      {/* Sticky Top Navbar */}
      <header className="bg-white border-b border-slate-300 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[950px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-md font-semibold text-slate-700">Invoice Editor</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-8 text-xs border-slate-300" onClick={handleDryRunVerify} disabled={isVerifying || isSubmitting}>
              <Play className="mr-1 h-3 w-3 text-blue-600" /> {isVerifying ? "Verifying..." : "Dry Run"}
            </Button>
            <Button className="h-8 text-xs bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={handlePostToFBR} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
              {isSubmitting ? "Posting..." : "Post to FBR"}
            </Button>
          </div>
        </div>
      </header>

      {/* A4 Canvas */}
      <main className="max-w-[950px] mx-auto mt-8 px-4">
        <div className="bg-white shadow-2xl shadow-slate-300/50 rounded-sm p-10 md:p-14 min-h-[1100px] relative border border-slate-200">
          
          {/* Section 1: Header */}
          <div className="flex justify-between items-start mb-6 border-b border-black pb-8">
            <div className="w-[100px] shrink-0">
               <div className="h-[80px] w-[80px] bg-slate-50 flex items-center justify-center text-[#1a3f7a] font-bold text-3xl border border-slate-200 rounded">
                 {profile?.logoUrl ? <img src={profile.logoUrl} className="max-w-full max-h-full" alt="Logo" /> : profile?.name?.[0]?.toUpperCase()}
               </div>
               {profile && <div className="text-[9px] font-bold text-[#1a3f7a] mt-1 text-center uppercase">{profile.name}</div>}
            </div>
            
            <div className="flex-1 text-center px-4">
               <h1 className="text-2xl font-bold uppercase tracking-wide mb-1 text-[#1a3f7a]">{profile?.name || 'COMPANY NAME PVT LTD'}</h1>
               <div className="text-xs text-slate-800 space-y-0.5">
                 <p><span className="font-bold">NTN:</span> {profile?.ntn || '1234567-8'}</p>
                 <p><span className="font-bold">STRN:</span> {profile?.strn || '11-90-9999-329-55'}</p>
                 <p className="text-slate-600 text-[11px] mt-1">PLOT No. F - 96, OFF HUB RIVER ROAD, SITE, Karachi West</p>
               </div>
            </div>

            <div className="w-[120px] text-right shrink-0 mt-2">
               <div className="bg-slate-200 px-3 py-1.5 inline-block font-bold text-[11px] tracking-wider uppercase text-slate-800 border border-slate-300">
                 SALES TAX INVOICE
               </div>
            </div>
          </div>

          {/* Section 2: Buyer & Meta */}
          <div className="flex justify-between gap-8 mb-8">
             {/* Buyer Info */}
             <div className="flex-1 max-w-sm">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Billed To</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-[9px] uppercase text-slate-500 font-bold mb-1 block">NTN / CNIC</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={buyerNTNCNIC} 
                        onChange={handleNTNChange} 
                        placeholder="Search NTN..." 
                        className="h-7 text-xs bg-slate-50 border-slate-200 font-mono shadow-inner w-32" 
                      />
                      {ntnNotFound && <span className="text-[10px] text-amber-600 self-center font-medium bg-amber-50 px-2 py-0.5 rounded">New Buyer!</span>}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px] uppercase text-slate-500 font-bold mb-1 block">Business Name / Name</Label>
                    <Select value={buyerBusinessName} onValueChange={(v) => handleBusinessNameSelect({target: {value: v}} as any)}>
                      <SelectTrigger className="h-7 text-xs bg-slate-50 border-slate-200 shadow-inner">
                        <SelectValue placeholder="Select or type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        <SelectItem value="ADD_NEW" className="text-blue-600 font-bold">+ Add New Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[9px] uppercase text-slate-500 font-bold mb-1 block">Address & Province</Label>
                    <div className="flex gap-2">
                      <Input value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} placeholder="Address" className="h-7 text-xs bg-slate-50 border-slate-200 flex-1 shadow-inner" />
                      <Input value={buyerProvince} onChange={e => setBuyerProvince(e.target.value)} placeholder="Prov" className="h-7 text-xs w-20 bg-slate-50 border-slate-200 shadow-inner" />
                    </div>
                  </div>
                </div>
             </div>

             {/* Invoice Meta */}
             <div className="w-56">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 mb-2 border-b border-slate-100 pb-1">Invoice Details</h3>
                <div className="space-y-3 bg-slate-50 p-3 rounded border border-slate-100">
                   <div className="flex flex-col">
                     <Label className="text-[9px] uppercase font-bold text-slate-500 mb-1">Invoice Date</Label>
                     <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="h-7 text-xs bg-white border-slate-200 shadow-inner" />
                   </div>
                   <div className="flex flex-col">
                     <Label className="text-[9px] uppercase font-bold text-slate-500 mb-1">Invoice Type</Label>
                     <Select value={invoiceType} onValueChange={(v) => v && setInvoiceType(v)}>
                       <SelectTrigger className="h-7 text-xs bg-white border-slate-200 shadow-inner">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Sale Invoice">Sale Invoice</SelectItem>
                         <SelectItem value="Debit Note">Debit Note</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                     <input type="checkbox" checked={applyWht} onChange={e => setApplyWht(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600" />
                     <Label className="text-[10px] font-bold text-slate-700">Apply W.H.T (0.10%)</Label>
                   </div>
                </div>
             </div>
          </div>

          {/* Section 3: Line Items Table */}
          <div className="border border-black">
             <table className="w-full text-xs text-left">
               <thead className="bg-[#efefef] text-slate-900 border-b border-black">
                  <tr>
                     <th className="px-2 py-1.5 border-r border-black font-bold w-8 text-center text-[10px]">S.#</th>
                     <th className="px-2 py-1.5 border-r border-black font-bold text-[10px]">Description</th>
                     <th className="px-2 py-1.5 border-r border-black font-bold w-16 text-[10px]">HS Code</th>
                     <th className="px-2 py-1.5 border-r border-black font-bold w-16 text-center text-[10px]">Qty</th>
                     <th className="px-2 py-1.5 border-r border-black font-bold w-20 text-right text-[10px]">Unit Price</th>
                     <th className="px-2 py-1.5 border-r border-black font-bold w-24 text-right text-[10px]">Value Excl.</th>
                     <th className="px-2 py-1.5 border-r border-black font-bold w-20 text-right text-[10px]">Tax (18%)</th>
                     <th className="px-2 py-1.5 font-bold w-24 text-right text-[10px]">Total</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-black/20">
                  {items.map((item, index) => {
                    const qty = Number(item.quantity || 0);
                    const rate = Number(item.rate || 0);
                    const taxRate = Number(item.taxRate || 0);
                    const excl = qty * rate;
                    const tax = (excl * taxRate) / 100;
                    const total = excl + tax;
                    
                    return (
                      <tr key={index} className="group hover:bg-blue-50/50">
                        <td className="px-2 py-1 border-r border-black text-center align-middle relative">
                          <span className="group-hover:hidden">{index + 1}</span>
                          <button onClick={() => handleRemoveItem(index)} className="hidden group-hover:block mx-auto text-red-500 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                        <td className="px-2 py-1 border-r border-black font-medium">{item.name}</td>
                        <td className="px-2 py-1 border-r border-black font-mono text-[10px]">{item.hsCode}</td>
                        <td className="px-0 py-0 border-r border-black align-middle">
                          <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full h-full px-2 py-1.5 bg-transparent text-center focus:outline-none focus:bg-blue-50 text-xs" />
                        </td>
                        <td className="px-0 py-0 border-r border-black align-middle">
                          <input type="number" min="0" step="0.01" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className="w-full h-full px-2 py-1.5 bg-transparent text-right focus:outline-none focus:bg-blue-50 text-xs" />
                        </td>
                        <td className="px-2 py-1.5 border-r border-black text-right bg-slate-50/30">{fmt(excl)}</td>
                        <td className="px-2 py-1.5 border-r border-black text-right bg-slate-50/30">{fmt(tax)}</td>
                        <td className="px-2 py-1.5 text-right font-medium bg-slate-50/30">{fmt(total)}</td>
                      </tr>
                    );
                  })}
                  
                  {/* Add Item Row */}
                  <tr>
                    <td colSpan={8} className="p-0 border-t border-black">
                      <button onClick={openItemPicker} className="w-full h-8 flex items-center justify-center gap-1 text-[11px] font-bold text-blue-600 bg-slate-50 hover:bg-blue-50 transition-colors">
                        <Plus className="h-3 w-3" /> Click to Add Inventory Item
                      </button>
                    </td>
                  </tr>
                  
                  {/* Empty filler rows if items < 3 to keep layout height */}
                  {Array.from({ length: Math.max(0, 3 - items.length) }).map((_, i) => (
                     <tr key={`fill-${i}`} className="h-8 border-t border-black/20">
                       <td className="border-r border-black"></td><td className="border-r border-black"></td>
                       <td className="border-r border-black"></td><td className="border-r border-black"></td>
                       <td className="border-r border-black"></td><td className="border-r border-black"></td>
                       <td className="border-r border-black"></td><td></td>
                     </tr>
                  ))}
               </tbody>
               
               {/* TOTALS FOOTER */}
               <tfoot className="border-t border-black bg-[#fafafa]">
                 <tr>
                   <td colSpan={3} className="px-2 py-2 border-r border-black text-right font-bold text-[11px]">TOTALS:</td>
                   <td className="px-2 py-2 border-r border-black text-center font-bold text-[11px]">{totQty.toFixed(2)}</td>
                   <td className="px-2 py-2 border-r border-black"></td>
                   <td className="px-2 py-2 border-r border-black text-right font-bold text-[11px]">{fmt(totExcl)}</td>
                   <td className="px-2 py-2 border-r border-black text-right font-bold text-[11px]">{fmt(totStax)}</td>
                   <td className="px-2 py-2 text-right font-bold text-[12px]">{fmt(grand)}</td>
                 </tr>
               </tfoot>
             </table>
          </div>

          {/* Negative Stock Warning */}
          {hasNegativeStock && (
             <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs">
                <p className="font-bold text-red-700 flex items-center gap-1 mb-2"><AlertCircle className="h-4 w-4" /> Negative Stock Detected</p>
                <Input value={negativeStockReason} onChange={e => setNegativeStockReason(e.target.value)} placeholder="Enter reason for allowing negative stock..." className="h-7 text-xs border-red-200 focus-visible:ring-red-500" />
             </div>
          )}

          {/* Footer Totals & Words */}
          <div className="flex justify-between items-start mt-8 pt-4">
             <div className="flex-1 pr-12">
                <div className="bg-slate-100 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Amount in Words:</span>
                  <p className="text-xs font-bold mt-1 text-slate-800 leading-relaxed">{words}</p>
                </div>
             </div>
             
             <div className="w-[250px]">
                <div className="space-y-2 text-xs">
                  <div className={`flex justify-between pb-1 ${!applyWht ? 'border-b-2 border-black font-bold' : 'border-b border-slate-300'}`}>
                    <span>Value Including Sales Tax</span>
                    <span>{fmt(grand)}</span>
                  </div>
                  {applyWht && (
                    <div className="flex justify-between pb-1 border-b-2 border-black font-bold">
                      <span>W.H.T 236G (0.10%)</span>
                      <span>{fmt(whtAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 text-sm font-bold text-[#1a3f7a]">
                    <span>Total Invoice Value</span>
                    <span>{fmt(finalAmount)}</span>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <div className="w-1/2 mx-auto border-t border-slate-300 mb-2"></div>
            <p className="text-[9px] text-slate-500">This is a computer-generated FBR Digital Invoice template preview and does not require any signature.</p>
          </div>

        </div>
      </main>

    </div>
  );
}
