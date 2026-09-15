"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database, Loader2, Edit2, AlertTriangle, Search, Filter, Trash2, Building2, Download } from "lucide-react";

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/clients");
      if (res.ok) {
        setClients(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (client: any) => {
    setEditingId(client.id);
    setEditForm({
      planTier: client.planTier || "Starter",
      monthlyFee: client.monthlyFee ?? 0,
      paymentStatus: client.paymentStatus || "Paid",
      maxStorageMb: client.maxStorageMb ?? 500,
      maxInvoicesPerMonth: client.maxInvoicesPerMonth ?? 100,
      isActive: client.isActive ?? true
    });
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm })
      });
      if (res.ok) {
        setEditingId(null);
        fetchClients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete the client "${name}" and ALL of their data? This action cannot be undone.`)) {
      try {
        const res = await fetch(`/api/admin/clients?id=${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          fetchClients();
        } else {
          const data = await res.json();
          alert(data.error || "Failed to delete client");
        }
      } catch (err: any) {
        alert(err.message || "An error occurred");
      }
    }
  };

  const handleExportCSV = () => {
    if (clients.length === 0) return;
    const headers = ["Company Name,NTN,Plan Tier,Storage Quota (MB),Monthly Fee (Rs),Payment Status,Status"];
    const rows = clients.map(c => 
      `"${c.name}","${c.ntn}","${c.planTier}","${c.maxStorageMb}","${c.monthlyFee || 0}","${c.paymentStatus || 'Paid'}","${c.isActive ? 'Active' : 'Suspended'}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "", ntn: "", email: "", password: "", adminName: "", planTier: "Starter", monthlyFee: "1000", paymentStatus: "Paid", maxStorageMb: "500"
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm)
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({ name: "", ntn: "", email: "", password: "", adminName: "", planTier: "Starter", monthlyFee: "1000", paymentStatus: "Paid", maxStorageMb: "500" });
        fetchClients();
      } else {
        const data = await res.json();
        setAddError(data.error || "Failed to create client");
      }
    } catch (err: any) {
      setAddError(err.message || "An error occurred");
    } finally {
      setAdding(false);
    }
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.ntn.includes(searchQuery));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clients Directory</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Manage business units, billing tiers, and VPS storage allocations</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportCSV} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm h-11 px-5 rounded-xl transition-all">
            <Download className="w-4 h-4 mr-2" /> <span className="font-semibold text-sm">Export CSV</span>
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 h-11 px-6 rounded-xl transition-all hover:-translate-y-0.5">
            <span className="font-semibold text-sm">Provision New Client</span>
          </Button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create New Client</h2>
                  <p className="text-xs text-slate-500 font-medium">Provision a new business unit and admin account</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-200/50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <form id="add-client-form" onSubmit={handleAddSubmit} className="space-y-5">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Business Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Company Name</label>
                      <Input required value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} placeholder="e.g. Acme Corp" className="h-10 bg-slate-50" />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">NTN Number</label>
                      <Input required value={addForm.ntn} onChange={e => setAddForm({...addForm, ntn: e.target.value})} placeholder="1234567-8" className="h-10 bg-slate-50 font-mono text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Admin Account</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-semibold text-slate-600">Contact Person Name</label>
                      <Input required value={addForm.adminName} onChange={e => setAddForm({...addForm, adminName: e.target.value})} placeholder="e.g. Ali Ahmed" className="h-10 bg-slate-50" />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Email Address</label>
                      <Input required type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} placeholder="admin@acme.com" className="h-10 bg-slate-50" />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Password</label>
                      <Input required type="password" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} placeholder="••••••••" className="h-10 bg-slate-50" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Plan & Quota</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Subscription Tier</label>
                      <select className="w-full h-10 border border-slate-200 rounded-md px-3 text-sm bg-slate-50 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow" value={addForm.planTier} onChange={e => setAddForm({...addForm, planTier: e.target.value})}>
                        <option value="Starter">Starter (100 Invoices)</option>
                        <option value="Growth">Growth (1000 Invoices)</option>
                        <option value="Enterprise">Enterprise (Unlimited)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Monthly Fee (Rs)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">Rs</span>
                        <Input required type="number" value={addForm.monthlyFee} onChange={e => setAddForm({...addForm, monthlyFee: e.target.value})} className="h-10 bg-slate-50 pl-8 pr-3 font-mono text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Payment Status</label>
                      <select required className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm bg-slate-50 focus:bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" value={addForm.paymentStatus} onChange={e => setAddForm({...addForm, paymentStatus: e.target.value})}>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Unpaid">Unpaid</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Max Storage (MB)</label>
                      <div className="relative">
                        <Input required type="number" value={addForm.maxStorageMb} onChange={e => setAddForm({...addForm, maxStorageMb: e.target.value})} className="h-10 bg-slate-50 pr-12 font-mono text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">MB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {addError && (
                  <div className="flex items-start gap-2 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}
              </form>
            </div>

            <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="h-10 font-medium bg-white hover:bg-slate-100">
                Cancel
              </Button>
              <Button type="submit" form="add-client-form" className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm shadow-indigo-200 px-6" disabled={adding}>
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Provisioning...
                  </>
                ) : (
                  "Create Client"
                )}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Main Table Section */}
      <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200/50">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by company name or NTN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-xl text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 rounded-xl bg-white border-slate-200 text-slate-600 shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-slate-400" />
              Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-slate-100">
                <TableHead className="font-semibold text-slate-600">Company Profile</TableHead>
                <TableHead className="font-semibold text-slate-600">Subscription</TableHead>
                <TableHead className="font-semibold text-slate-600">Storage Usage</TableHead>
                <TableHead className="font-semibold text-slate-600">Monthly Quota</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                      <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                      <p className="text-sm font-medium">Loading clients database...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                      <Building2 className="h-12 w-12 text-slate-200" />
                      <p className="text-sm font-medium text-slate-500">No clients found matching your criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.map((client) => {
                const storagePercent = Math.min(100, (client.storageUsedMb / client.maxStorageMb) * 100);
                const isEditing = editingId === client.id;

                return (
                  <TableRow key={client.id} className="hover:bg-indigo-50/30 transition-colors border-slate-100">
                    <TableCell>
                      <div className="flex items-center gap-4 py-2">
                        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-white
                          ${client.planTier.toLowerCase() === 'enterprise' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 
                            client.planTier.toLowerCase() === 'growth' ? 'bg-gradient-to-br from-indigo-400 to-violet-500 text-white' : 
                            'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'}
                        `}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{client.name}</div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <span className="text-slate-400">NTN:</span> {client.ntn}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <select 
                            className="w-32 h-9 border border-slate-300 rounded-lg px-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={editForm.planTier}
                            onChange={e => setEditForm({...editForm, planTier: e.target.value})}
                          >
                            <option value="Starter">Starter</option>
                            <option value="Growth">Growth</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">Rs</span>
                            <Input 
                              type="number" 
                              className="w-24 h-8 text-xs rounded-lg" 
                              value={editForm.monthlyFee ?? ""}
                              onChange={e => setEditForm({...editForm, monthlyFee: e.target.value})}
                            />
                            <select 
                              className="w-20 h-8 border border-slate-300 rounded-lg px-1 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={editForm.paymentStatus}
                              onChange={e => setEditForm({...editForm, paymentStatus: e.target.value})}
                            >
                              <option value="Paid">Paid</option>
                              <option value="Overdue">Overdue</option>
                              <option value="Unpaid">Unpaid</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="outline" className={`uppercase text-[10px] font-bold px-2.5 py-0.5
                            ${client.planTier.toLowerCase() === 'enterprise' ? 'border-orange-200 text-orange-700 bg-orange-50' : 
                              client.planTier.toLowerCase() === 'growth' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' : 
                              'border-emerald-200 text-emerald-700 bg-emerald-50'}
                          `}>
                            {client.planTier}
                          </Badge>
                          <span className="text-xs font-semibold text-slate-600 mt-1">
                            Rs {client.monthlyFee?.toLocaleString() || 0} / mo
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1
                            ${client.paymentStatus === 'Overdue' ? 'bg-rose-100 text-rose-700' : 
                              client.paymentStatus === 'Unpaid' ? 'bg-amber-100 text-amber-700' : 
                              'bg-emerald-100 text-emerald-700'}
                          `}>
                            {client.paymentStatus || 'Paid'}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-24 h-9 text-sm rounded-lg" 
                            value={editForm.maxStorageMb}
                            onChange={e => setEditForm({...editForm, maxStorageMb: e.target.value})}
                          />
                          <span className="text-xs font-semibold text-slate-500">MB</span>
                        </div>
                      ) : (
                        <div className="w-44">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                            <span>{client.storageUsedMb.toFixed(1)} MB Used</span>
                            <span className="text-slate-900">{client.maxStorageMb} MB</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${storagePercent > 85 ? 'bg-red-500' : storagePercent > 60 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${storagePercent}%` }} 
                            />
                          </div>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-24 h-9 text-sm rounded-lg" 
                            value={editForm.maxInvoicesPerMonth}
                            onChange={e => setEditForm({...editForm, maxInvoicesPerMonth: e.target.value})}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                          <span>{client.maxInvoicesPerMonth}</span>
                          <span className="text-xs text-slate-400 font-medium">/ mo</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <select 
                          className="w-28 h-9 border border-slate-300 rounded-lg px-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={editForm.isActive ? "true" : "false"}
                          onChange={e => setEditForm({...editForm, isActive: e.target.value === "true"})}
                        >
                          <option value="true">Active</option>
                          <option value="false">Suspended</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            {client.isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${client.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          </span>
                          <span className={`text-xs font-bold ${client.isActive ? 'text-emerald-700' : 'text-red-700'}`}>
                            {client.isActive ? "Active" : "Suspended"}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-9 rounded-lg font-medium text-slate-600">Cancel</Button>
                          <Button size="sm" className="h-9 rounded-lg bg-indigo-600 shadow-sm" onClick={() => handleSave(client.id)}>Save</Button>
                        </div>
                      ) : (
                        <div className="flex justify-end items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={() => handleEdit(client)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => handleDelete(client.id, client.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
