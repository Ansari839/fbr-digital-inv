"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Key, CheckCircle2, AlertCircle } from "lucide-react";

export default function PasswordRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<{ id: string, password: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (requestId: string, userId: string) => {
    setResettingId(requestId);
    setTempPassword(null);
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, userId }),
      });
      const data = await res.json();
      
      if (data.success) {
        setTempPassword({ id: requestId, password: data.temporaryPassword });
        // Update local list
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, status: 'COMPLETED' } : req
        ));
      } else {
        alert(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Failed to reset password", error);
      alert("Error resetting password");
    } finally {
      setResettingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Password Reset Requests</h1>
          <p className="text-slate-500 mt-1">Manage client forgot password requests</p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Key className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No requests</h3>
            <p className="mt-1 text-slate-500">There are currently no password reset requests.</p>
          </div>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white">
                  
                  <div className="flex flex-col gap-2 mb-4 md:mb-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{request.user.name || 'Unknown User'}</h3>
                      {request.status === 'PENDING' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      <span className="font-medium">{request.user.email}</span> • Requested on {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {tempPassword?.id === request.id ? (
                      <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg">
                        <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Temporary Password</p>
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-mono font-bold text-slate-900">{tempPassword?.password}</code>
                        </div>
                        <p className="text-xs text-emerald-700 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1 inline" /> Share securely with client. They must change it upon login.
                        </p>
                      </div>
                    ) : (
                      request.status === 'PENDING' && (
                        <Button 
                          onClick={() => handleResetPassword(request.id, request.userId)}
                          disabled={resettingId === request.id}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          {resettingId === request.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Key className="h-4 w-4 mr-2" />
                          )}
                          Generate Temporary Password
                        </Button>
                      )
                    )}
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
