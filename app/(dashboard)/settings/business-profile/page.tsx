"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BusinessProfilePage() {
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Business Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your company details and FBR Integration settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issuer Details</CardTitle>
          <CardDescription>This information will appear on your generated invoices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Enter Company Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ntn">NTN</Label>
              <Input id="ntn" placeholder="7-digit NTN" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="strn">STRN</Label>
              <Input id="strn" placeholder="Sales Tax Registration Number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo URL</Label>
              <Input id="logo" placeholder="https://..." />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save Details</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FBR Integration Settings</CardTitle>
          <CardDescription>Manage your API connection to PRAL / IRIS.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-md border flex items-center justify-between">
            <div>
              <p className="font-semibold">Current Environment: <span className="uppercase text-primary">{environment}</span></p>
              <p className="text-sm text-muted-foreground">
                In sandbox, your invoices will not be stored permanently on FBR.
              </p>
            </div>
            <Button 
              variant={environment === 'sandbox' ? "default" : "destructive"}
              onClick={() => setEnvironment(env => env === 'sandbox' ? 'production' : 'sandbox')}
            >
              Switch to {environment === 'sandbox' ? 'Production' : 'Sandbox'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sandboxToken">Sandbox Token</Label>
            <Input id="sandboxToken" type="password" placeholder="Enter Sandbox Bearer Token" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prodToken">Production Token</Label>
            <Input id="prodToken" type="password" placeholder="Enter Production Bearer Token" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
