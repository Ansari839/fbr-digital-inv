"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Loader2, Edit2, AlertTriangle, CheckCircle } from "lucide-react";

export default function SuperAdminDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

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
      planTier: client.planTier,
      maxStorageMb: client.maxStorageMb,
      maxInvoicesPerMonth: client.maxInvoicesPerMonth,
      isActive: client.isActive
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients & Quota Management</h1>
          <p className="text-slate-500">Allocate Hostinger VPS resources and manage client packages</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Add New Client</Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Storage Allocation</TableHead>
              <TableHead>Invoice Quota</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : clients.map((client) => {
              const storagePercent = Math.min(100, (client.storageUsedMb / client.maxStorageMb) * 100);
              const isEditing = editingId === client.id;

              return (
                <TableRow key={client.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="font-semibold text-slate-900">{client.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">NTN: {client.ntn}</div>
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <select 
                        className="border border-slate-300 rounded p-1 text-sm bg-white"
                        value={editForm.planTier}
                        onChange={e => setEditForm({...editForm, planTier: e.target.value})}
                      >
                        <option value="Starter">Starter</option>
                        <option value="Growth">Growth</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    ) : (
                      <Badge variant="outline" className="uppercase text-[10px] bg-slate-100">{client.planTier}</Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          className="w-20 h-8 text-sm" 
                          value={editForm.maxStorageMb}
                          onChange={e => setEditForm({...editForm, maxStorageMb: e.target.value})}
                        />
                        <span className="text-xs text-slate-500">MB</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 w-40">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>{client.storageUsedMb.toFixed(1)} MB</span>
                          <span className="font-medium text-slate-900">{client.maxStorageMb} MB</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${storagePercent > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${storagePercent}%` }} 
                          />
                        </div>
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <Input 
                        type="number" 
                        className="w-24 h-8 text-sm" 
                        value={editForm.maxInvoicesPerMonth}
                        onChange={e => setEditForm({...editForm, maxInvoicesPerMonth: e.target.value})}
                      />
                    ) : (
                      <span className="text-sm font-medium">{client.maxInvoicesPerMonth} / mo</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <select 
                        className="border border-slate-300 rounded p-1 text-sm bg-white"
                        value={editForm.isActive ? "true" : "false"}
                        onChange={e => setEditForm({...editForm, isActive: e.target.value === "true"})}
                      >
                        <option value="true">Active</option>
                        <option value="false">Suspended</option>
                      </select>
                    ) : (
                      <Badge variant="outline" className={client.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                        {client.isActive ? "Active" : "Suspended"}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-8">Cancel</Button>
                        <Button size="sm" className="h-8 bg-indigo-600" onClick={() => handleSave(client.id)}>Save</Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => handleEdit(client)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
