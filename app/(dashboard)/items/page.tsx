"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { EmptyState } from '@/components/ui/empty-state';
import { Combobox } from '@/components/ui/combobox';
import { Package, Plus, ArrowUpCircle, Trash2, Search, Download, UploadCloud, Loader2 } from 'lucide-react';

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [internalName, setInternalName] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [defaultRate, setDefaultRate] = useState('0');
  const [uom, setUom] = useState('');
  const [itemType, setItemType] = useState('Physical');
  const [taxRate, setTaxRate] = useState('18');
  const [saleType, setSaleType] = useState('Goods at standard rate (default)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hsCodeList, setHsCodeList] = useState<any[]>([]);
  const [uomList, setUomList] = useState<any[]>([]);

  // Stock IN State
  const [stockModalItem, setStockModalItem] = useState<any | null>(null);
  const [stockAddQty, setStockAddQty] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const hsRes = await fetch('/api/hscodes');
      setHsCodeList(await hsRes.json());
      const uomRes = await fetch('/api/uoms');
      setUomList(await uomRes.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchItems();
    fetchDropdowns();
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = selectedItemId ? `/api/items/${selectedItemId}` : '/api/items';
      const method = selectedItemId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          internalName,
          hsCode, 
          defaultRate: parseFloat(defaultRate),
          uom,
          itemType,
          taxRate: parseFloat(taxRate),
          saleType
        })
      });
      
      const resData = await res.json();
      
      if (res.ok) {
        cancelEdit();
        fetchItems(); // Refresh list
      } else {
        alert("Error: " + (resData.details || resData.error || "Failed to save item"));
      }
    } catch (err) {
      alert("Error saving item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setSelectedItemId(null);
    setName('');
    setInternalName('');
    setHsCode('');
    setDefaultRate('0');
    setUom('');
    setItemType('Physical');
    setTaxRate('18');
    setSaleType('Goods at standard rate (default)');
  };

  const handleRowClick = (item: any) => {
    setSelectedItemId(item.id);
    setName(item.name);
    setInternalName(item.internalName || '');
    setHsCode(item.hsCode);
    setDefaultRate(item.defaultRate);
    setUom(item.uom);
    setItemType(item.itemType || 'Physical');
    setTaxRate(item.taxRate?.toString() || '18');
    setSaleType(item.saleType || 'Goods at standard rate (default)');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      alert("Error deleting item");
    }
  };

  const handleStockIn = async () => {
    if (!stockModalItem || !stockAddQty) return;
    setIsAddingStock(true);
    try {
      await fetch('/api/items/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: stockModalItem.id, qty: parseFloat(stockAddQty) })
      });
      setStockModalItem(null);
      setStockAddQty('');
      fetchItems();
    } catch (err) {
      alert("Error adding stock");
    } finally {
      setIsAddingStock(false);
    }
  };

  const handleAddHsCode = async (code: string) => {
    const res = await fetch('/api/hscodes', { method: 'POST', body: JSON.stringify({ code }) });
    if (res.ok) fetchDropdowns();
  };

  const handleAddUom = async (code: string) => {
    const res = await fetch('/api/uoms', { method: 'POST', body: JSON.stringify({ code }) });
    if (res.ok) fetchDropdowns();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/items/bulk', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully imported ${data.imported} items!`);
        fetchItems();
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.hsCode.includes(searchQuery)
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-[#1a7368]" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Items & Stock</h1>
            <p className="text-sm text-slate-500">Manage your inventory, pricing, and HS Codes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="/api/items/bulk/template" download>
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Excel Template
            </Button>
          </a>
          
          <div className="relative">
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <Button className="bg-[#1a7368] hover:bg-[#155b52] text-white shadow-sm w-full">
              {isUploading ? <Loader text="" /> : <UploadCloud className="h-4 w-4 mr-2" />}
              {isUploading ? 'Uploading...' : 'Bulk Import'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Add/Edit Item Form */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg">{selectedItemId ? 'Edit Product/Service' : 'Add New Product/Service'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Item Type</label>
                <div className="flex p-1 bg-slate-100/80 rounded-lg w-fit border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setItemType('Physical')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                      itemType === 'Physical' 
                        ? 'bg-white shadow-sm text-[#1a7368] ring-1 ring-slate-200/50' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    Physical Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemType('Service')}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                      itemType === 'Service' 
                        ? 'bg-white shadow-sm text-[#1a7368] ring-1 ring-slate-200/50' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    Service
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Name (For FBR Invoice)</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7368]/20 focus:border-[#1a7368]" 
                    placeholder="e.g. Polyester Yarn" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Internal Variant / SKU (Optional)</label>
                  <input 
                    type="text" 
                    value={internalName}
                    onChange={e => setInternalName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7368]/20 focus:border-[#1a7368]" 
                    placeholder="e.g. DEN FDY DTY" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">HS Code</label>
                  <Combobox 
                    options={hsCodeList.map(h => ({ label: h.description, value: h.code }))}
                    value={hsCode}
                    onChange={setHsCode}
                    onAdd={handleAddHsCode}
                    placeholder="e.g. 5402.3300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">UOM</label>
                  <Combobox 
                    options={uomList.map(u => ({ label: u.description, value: u.code }))}
                    value={uom}
                    onChange={setUom}
                    onAdd={handleAddUom}
                    placeholder="e.g. PCS"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (Excl. Tax)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">Rs</span>
                    <input 
                      required
                      type="number" 
                      value={defaultRate}
                      onChange={e => setDefaultRate(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7368]/20 focus:border-[#1a7368]" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                  <div className="relative">
                    <input 
                      required
                      type="number" 
                      value={taxRate}
                      onChange={e => setTaxRate(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7368]/20 focus:border-[#1a7368]" 
                      placeholder="e.g. 18" 
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sale Type (FBR)</label>
                <select 
                  value={saleType}
                  onChange={e => setSaleType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a7368]/20 focus:border-[#1a7368]"
                >
                  <option value="Goods at standard rate (default)">Goods at standard rate (18%)</option>
                  <option value="Goods at Reduced Rate">Goods at Reduced Rate</option>
                  <option value="Exempt Goods">Exempt Goods</option>
                  <option value="Goods at zero-rate">Goods at zero-rate (0%)</option>
                  <option value="3rd Schedule Goods">3rd Schedule Goods</option>
                  <option value="Services (FED in ST Mode)">Services (FED in ST Mode)</option>
                </select>
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button disabled={isSubmitting} type="submit" className="bg-[#1a7368] hover:bg-[#155b52] text-white">
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    {selectedItemId ? 'Update' : 'Save'} Item
                  </Button>
                  {selectedItemId && (
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
            </form>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Inventory Directory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or HS Code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7368]/20 focus:border-[#1a7368]"
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-slate-100 text-slate-600 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 font-medium">Item Name</th>
                  <th className="px-6 py-3 font-medium">HS Code</th>
                  <th className="px-6 py-3 font-medium">UOM</th>
                  <th className="px-6 py-3 font-medium">Pricing & Tax</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr><td colSpan={4} className="p-0"><Loader text="Loading items..." /></td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan={4} className="p-0"><EmptyState title="Inventory is empty" description={searchQuery ? "No matching items found for your search." : "Add your first product or service using the form on the left."} /></td></tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => handleRowClick(item)}
                      className={`transition-colors cursor-pointer ${selectedItemId === item.id ? 'bg-[#1a7368]/10' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{item.name}</span>
                            {item.itemType === 'Service' && <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-1 py-0 text-[10px]">Service</Badge>}
                          </div>
                          {item.internalName && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm w-fit">
                              Var: {item.internalName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono text-slate-600 bg-slate-50">{item.hsCode}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {item.uom}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">Rs {parseFloat(item.defaultRate).toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-1">Tax: {item.taxRate}%</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={(e) => handleDelete(e, item.id)} className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors relative z-10">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
