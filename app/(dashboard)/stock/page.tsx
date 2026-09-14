"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { EmptyState } from '@/components/ui/empty-state';
import { Archive, Plus, ArrowUpCircle, Search } from 'lucide-react';

export default function StockReportPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Stock IN Modal State
  const [stockModalItem, setStockModalItem] = useState<any | null>(null);
  const [stockAddQty, setStockAddQty] = useState('');
  const [stockRef, setStockRef] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(false);

  // History Modal State
  const [historyModalItem, setHistoryModalItem] = useState<any | null>(null);

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleStockIn = async () => {
    if (!stockModalItem || !stockAddQty) return;
    setIsAddingStock(true);
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId: stockModalItem.id, 
          quantity: parseFloat(stockAddQty),
          reference: stockRef
        })
      });
      if (res.ok) {
        setStockModalItem(null);
        setStockAddQty('');
        setStockRef('');
        fetchStock();
      } else {
        const data = await res.json();
        alert("Error: " + (data.details || data.error));
      }
    } catch (err) {
      alert("Error adding stock");
    } finally {
      setIsAddingStock(false);
    }
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (i.internalName && i.internalName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 relative">
      
      {/* Stock IN Modal Overlay */}
      {stockModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Stock IN</h3>
            <p className="text-sm text-slate-500 mb-4">Item: <span className="font-semibold text-slate-700">{stockModalItem.name}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity to Add</label>
                <input 
                  type="number" 
                  min="1"
                  value={stockAddQty}
                  onChange={e => setStockAddQty(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7368]" 
                  placeholder="e.g. 50" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Reference (Optional)</label>
                <input 
                  type="text" 
                  value={stockRef}
                  onChange={e => setStockRef(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7368]" 
                  placeholder="e.g. INV-1234" 
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setStockModalItem(null)}>Cancel</Button>
                <Button onClick={handleStockIn} disabled={isAddingStock || !stockAddQty} className="bg-[#1a7368] hover:bg-[#155b52] text-white">
                  {isAddingStock ? 'Saving...' : 'Confirm Stock IN'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal Overlay */}
      {historyModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-5xl w-full p-6 max-h-[85vh] flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Item Stock Ledger</h3>
            <p className="text-sm text-slate-500 mb-6">Item: <span className="font-semibold text-slate-700">{historyModalItem.name}</span> {historyModalItem.internalName ? `(${historyModalItem.internalName})` : ''}</p>
            
            <div className="flex-1 overflow-y-auto mb-4 border rounded-md border-slate-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Ref / Particulars</th>
                    <th className="px-4 py-2 font-medium text-right text-emerald-600">IN</th>
                    <th className="px-4 py-2 font-medium text-right text-red-600">OUT</th>
                    <th className="px-4 py-2 font-medium text-right text-blue-600">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyModalItem.stockTransactions?.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-500">No transactions found</td></tr>
                  ) : (
                    (() => {
                      let runningBalance = 0;
                      return historyModalItem.stockTransactions?.map((tx: any) => {
                        const qty = parseFloat(tx.quantity);
                        if (tx.type === 'IN') runningBalance += qty;
                        else if (tx.type === 'OUT') runningBalance -= qty;
                        
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 whitespace-nowrap text-slate-600">{new Date(tx.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-slate-700">{tx.reference || 'Initial / Manual Entry'}</td>
                            <td className="px-4 py-2 text-right font-medium text-emerald-600">{tx.type === 'IN' ? qty : '-'}</td>
                            <td className="px-4 py-2 text-right font-medium text-red-600">{tx.type === 'OUT' ? qty : '-'}</td>
                            <td className="px-4 py-2 text-right font-bold text-blue-600">{runningBalance}</td>
                          </tr>
                        );
                      });
                    })()
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setHistoryModalItem(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Archive className="h-8 w-8 text-[#1a7368]" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Report</h1>
          <p className="text-sm text-slate-500">Manage internal inventory and stock additions</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg">Physical Inventory</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or variant..."
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
                <th className="px-6 py-3 font-medium">Variant / SKU</th>
                <th className="px-6 py-3 font-medium">UOM</th>
                <th className="px-6 py-3 font-medium text-center">In Stock</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="p-0"><Loader text="Loading stock..." /></td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={5} className="p-0"><EmptyState title="No items found" description="You have no physical products to display." /></td></tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      {item.internalName ? (
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {item.internalName}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {item.uom}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className={`font-mono text-sm px-3 py-1 ${parseFloat(item.stockQty) <= 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {parseFloat(item.stockQty)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => setHistoryModalItem(item)} size="sm" variant="outline" className="h-8">
                          History
                        </Button>
                        <Button onClick={() => setStockModalItem(item)} size="sm" variant="outline" className="h-8 text-[#1a7368] border-[#1a7368]/30 hover:bg-[#1a7368]/5">
                          <ArrowUpCircle className="h-4 w-4 mr-1.5" />
                          Stock IN
                        </Button>
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
  );
}
