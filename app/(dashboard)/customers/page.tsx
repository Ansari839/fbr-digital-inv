"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, Plus, Trash2, Download, UploadCloud, Search } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ntn, setNtn] = useState('');
  const [province, setProvince] = useState('');
  const [address, setAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
        console.error('Expected array of customers, got:', data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = selectedCustomerId ? `/api/customers/${selectedCustomerId}` : '/api/customers';
      const method = selectedCustomerId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ntnOrCnic: ntn, province, address, isRegistered })
      });
      
      if (res.ok) {
        cancelEdit();
        fetchCustomers(); // Refresh list
      }
    } catch (err) {
      alert("Error saving customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setSelectedCustomerId(null);
    setName('');
    setNtn('');
    setProvince('');
    setAddress('');
    setIsRegistered(true);
  };

  const handleRowClick = (c: any) => {
    setSelectedCustomerId(c.id);
    setName(c.name);
    setNtn(c.ntnOrCnic);
    setIsRegistered(c.isRegistered);
    if (c.addresses && c.addresses.length > 0) {
      setProvince(c.addresses[0].province);
      setAddress(c.addresses[0].addressLine);
    } else {
      setProvince('');
      setAddress('');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) {
      alert("Error deleting");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/customers/bulk', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully imported ${data.imported} customers!`);
        fetchCustomers();
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      // reset file input
      e.target.value = '';
    }
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.ntnOrCnic?.includes(searchQuery)
  ) : [];

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-[var(--primary)]" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customers Directory</h1>
            <p className="text-sm text-slate-500">Manage your buyers and their NTN/CNIC profiles</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="/api/customers/bulk/template" download>
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Get Excel Template
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
            <Button className="bg-[var(--primary)] hover:opacity-90 text-white shadow-sm w-full">
              {isUploading ? <Loader text="" /> : <UploadCloud className="h-4 w-4 mr-2" />}
              {isUploading ? 'Uploading...' : 'Bulk Import'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add/Edit Customer Form */}
        <Card className="shadow-sm border-slate-200 lg:col-span-1 h-fit">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg">{selectedCustomerId ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business/Buyer Name</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]" 
                  placeholder="e.g. Acme Corp" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NTN / CNIC</label>
                <input 
                  required
                  type="text" 
                  value={ntn}
                  onChange={e => setNtn(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]" 
                  placeholder="e.g. 1234567-8" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
                <select 
                  required
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                >
                  <option value="">Select Province...</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="KPK">Khyber Pakhtunkhwa (KPK)</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad">Islamabad (Federal)</option>
                  <option value="Gilgit Baltistan">Gilgit Baltistan</option>
                  <option value="AJK">AJK</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                <input 
                  required
                  type="text" 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]" 
                  placeholder="e.g. Office 5, Main Street, Karachi" 
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="reg" 
                  checked={isRegistered}
                  onChange={e => setIsRegistered(e.target.checked)}
                  className="h-4 w-4 text-[var(--primary)] rounded border-slate-300 focus:ring-[var(--primary)]"
                />
                <label htmlFor="reg" className="text-sm text-slate-700 cursor-pointer">Sales Tax Registered (STRN)</label>
              </div>

              <div className="flex gap-3 mt-6">
                <Button disabled={isSubmitting} type="submit" className="flex-1 bg-[var(--primary)] hover:opacity-90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  {selectedCustomerId ? 'Update' : 'Save'} Customer
                </Button>
                {selectedCustomerId && (
                  <Button type="button" variant="outline" onClick={cancelEdit} className="flex-1">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Customer List */}
        <Card className="shadow-sm border-slate-200 lg:col-span-2 flex flex-col h-full">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Registered Customers</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or NTN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] rounded-b-lg">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3">Customer Details</th>
                  <th className="px-4 py-3">NTN / CNIC</th>
                  <th className="px-4 py-3">Province</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr><td colSpan={5} className="p-4 text-center"><Loader text="Loading customers..." /></td></tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr><td colSpan={5} className="p-0"><EmptyState title="No customers found" description={searchQuery ? "No matching records found for your search." : "Add your first customer using the form on the left side."} /></td></tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => handleRowClick(c)}
                      className={`transition-colors cursor-pointer group ${selectedCustomerId === c.id ? 'bg-[var(--primary)]/5' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500 max-w-[200px] truncate" title={c.addresses?.[0]?.addressLine}>
                          {c.addresses && c.addresses.length > 0 ? c.addresses[0].addressLine : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.ntnOrCnic}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {c.addresses?.[0]?.province || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {c.isRegistered ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none pointer-events-none font-medium">Registered</Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 border-slate-200 shadow-none pointer-events-none font-medium bg-slate-50">Unregistered</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={(e) => handleDelete(e, c.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors inline-flex opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
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
