"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function SyncLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sync-logs");
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-indigo-100">
              <AlertCircle className="h-6 w-6" />
            </div>
            FBR Sync Errors & Logs
          </h1>
          <p className="text-slate-500 mt-2 font-medium">View the latest 100 API requests made to the FBR IRIS system across all clients.</p>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Timestamp</TableHead>
                <TableHead className="font-bold text-slate-700">Client / Invoice</TableHead>
                <TableHead className="font-bold text-slate-700">Endpoint</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="font-bold text-slate-700">Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const isError = !log.statusCode || log.statusCode >= 400 || (log.responseBody && JSON.stringify(log.responseBody).includes("Error"));
                return (
                  <TableRow key={log.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {log.invoice ? (
                        <div>
                          <div className="font-bold text-slate-800">{log.invoice.businessUnit?.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-1">INV-{log.invoice.serialNumber}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-sm">System</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-slate-600">
                      {log.endpoint}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-bold ${isError ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {log.statusCode || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-xs font-mono bg-slate-100 p-2 rounded-lg text-slate-600 border border-slate-200" title={JSON.stringify(log.responseBody)}>
                        {JSON.stringify(log.responseBody) || "No response"}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                    No sync logs found in the system.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
