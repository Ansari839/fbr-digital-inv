"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export default function ViewInvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const status = localStorage.getItem("fbr_premium_unlocked");
    if (status === "true") setIsPremium(true);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then(r => r.json())
      .then(d => setInvoice(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <Link href="/invoices"><Button className="mt-4">Back to Invoices</Button></Link>
      </div>
    );
  }

  /* ── Calculations ── */
  const rows = invoice.lineItems.map((li: any) => {
    const qty     = Number(li.quantity);
    const rate    = Number(li.rate);
    const taxRate = Number(li.item?.taxRate ?? 18);
    const excl    = qty * rate;
    const stax    = (excl * taxRate) / 100;
    return { ...li, qty, rate, excl, stax, total: excl + stax };
  });

  const totQty  = rows.reduce((s: number, r: any) => s + r.qty,  0);
  const totExcl = rows.reduce((s: number, r: any) => s + r.excl, 0);
  const totStax = rows.reduce((s: number, r: any) => s + r.stax, 0);
  const grand   = totExcl + totStax;
  const wht     = grand * 0.001;
  const final_  = grand + wht;

  const f   = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dt  = new Date(invoice.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-");
  const ref = invoice.id.slice(-6).toUpperCase();

  /* Company initials avatar */
  const initials = (invoice.businessUnit?.name || "CO")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  /* Avatar bg colour — deterministic from name */
  const avatarColors = ["#1a3f7a","#0d6e4f","#7c2d12","#1e3a5f","#4a1d96","#065f46","#831843","#1e40af"];
  const avatarBg = avatarColors[(invoice.businessUnit?.name || "").length % avatarColors.length];

  const td = (extra?: object) => ({
    border: "1px solid #000", padding: "5px 5px", fontSize: "11px", ...extra
  });

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      {/* ── Action Bar ── */}
      <div className="bg-white border-b shadow-sm p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <span className="text-sm font-medium text-slate-600">
            Invoice Preview — FBR Format
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="bg-[var(--primary)] text-white inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 cursor-pointer">
              <Printer className="h-4 w-4 mr-2" />
              Print / Save PDF
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Print Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener noreferrer" className="cursor-pointer w-full">
                  FBR Default (A4 PDF)
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={isPremium ? `/invoices/${id}/builder` : `/settings/premium`}
                  className="cursor-pointer w-full flex justify-between items-center"
                >
                  <span>Custom Builder</span>
                  {isPremium
                    ? <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">PRO</span>
                    : <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">LOCKED</span>
                  }
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Invoice Document ── */}
      <div className="flex-1 overflow-auto py-8 flex justify-center">
        <div style={{
          width: "210mm",
          minHeight: "297mm",
          background: "#fff",
          padding: "20mm 18mm 16mm",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "12px",
          color: "#000",
          boxShadow: "0 4px 32px rgba(0,0,0,.18)",
        }}>

          {/* ── HEADER ── */}
          <div style={{ display: "flex", alignItems: "flex-start", paddingBottom: "12px", borderBottom: "1.5px solid #000", marginBottom: "14px" }}>

            {/* Company avatar / logo */}
            <div style={{ minWidth: "110px" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "8px",
                backgroundColor: avatarBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: "900", fontSize: "22px", letterSpacing: "1px",
                fontFamily: "Arial, sans-serif"
              }}>
                {initials}
              </div>
              <p style={{ fontSize: "7px", fontWeight: "700", color: avatarBg, marginTop: "4px", textTransform: "uppercase", lineHeight: "1.3" }}>
                {invoice.businessUnit?.name || "COMPANY"}
              </p>
            </div>

            {/* Center: Company name + details */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#1a3f7a", margin: "0 0 8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {invoice.businessUnit?.name || "COMPANY NAME"}
              </h1>
              <p style={{ margin: "3px 0", fontWeight: "700" }}>NTN: <span style={{ fontWeight: "400" }}>{invoice.businessUnit?.ntn}</span></p>
              <p style={{ margin: "3px 0", fontWeight: "700" }}>STRN: <span style={{ fontWeight: "400" }}>{invoice.businessUnit?.strn || "—"}</span></p>
              <p style={{ margin: "6px 0 0", fontSize: "11px" }}>
                PLOT No. F - 96, OFF HUB RIVER ROAD, SITE, Karachi West Site Town
              </p>
            </div>

            {/* SALES TAX INVOICE box */}
            <div style={{ minWidth: "130px", display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
              <div style={{ backgroundColor: "#d0d0d0", padding: "7px 14px" }}>
                <p style={{ fontWeight: "700", fontSize: "12px", margin: 0, whiteSpace: "nowrap" }}>SALES TAX INVOICE</p>
              </div>
            </div>
          </div>

          {/* ── BUYER + META ── */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: "700", fontSize: "14px", margin: "0 0 5px", textTransform: "uppercase" }}>{invoice.party?.name || "BUYER NAME"}</p>
              <p style={{ fontWeight: "700", margin: "3px 0" }}>NTN / CNIC: <span style={{ fontWeight: "400" }}>{invoice.party?.ntnOrCnic}</span></p>
              <p style={{ textTransform: "uppercase", margin: "3px 0", fontSize: "11px", lineHeight: "1.5", maxWidth: "340px" }}>
                {[invoice.partyAddress?.addressLine, invoice.partyAddress?.province].filter(Boolean).join(", ")}
              </p>
            </div>
            <div style={{ minWidth: "220px" }}>
              <table style={{ borderSpacing: 0, marginLeft: "auto", fontSize: "12px" }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: "700", paddingRight: "16px", paddingBottom: "4px" }}>Invoice Date:</td>
                    <td style={{ paddingBottom: "4px" }}>{dt}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "700", paddingRight: "16px", paddingBottom: "4px" }}>Invoice Ref No:</td>
                    <td style={{ paddingBottom: "4px" }}>{ref}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "700", paddingRight: "16px", verticalAlign: "top" }}>FBR Invoice No:</td>
                    <td style={{ fontWeight: "700", fontSize: "11px", wordBreak: "break-all", maxWidth: "140px" }}>{invoice.fbrIrn || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TABLE ── */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px" }}>
            <thead>
              <tr style={{ backgroundColor: "#efefef" }}>
                {[
                  { label: "S.#",               w: "30px",  align: "center" },
                  { label: "Description",        w: "auto",  align: "left"   },
                  { label: "HS Code",            w: "72px",  align: "center" },
                  { label: "UOM",                w: "38px",  align: "center" },
                  { label: "Qty",                w: "48px",  align: "center" },
                  { label: "Unit\nPrice",        w: "52px",  align: "center" },
                  { label: "Value Excl.\nS/Tax", w: "72px",  align: "center" },
                  { label: "Sales Tax\n((18.00%))", w: "72px", align: "center" },
                  { label: "Further\nSales Tax\n((0.00%))", w: "60px", align: "center" },
                  { label: "Total",              w: "76px",  align: "right"  },
                ].map((h, i) => (
                  <th key={i} style={{ ...td({ backgroundColor: "#efefef", fontWeight: "700", textAlign: h.align as any, whiteSpace: "pre-line", lineHeight: "1.3", width: h.w, padding: "5px 4px" }) }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, i: number) => (
                <tr key={i}>
                  <td style={td({ textAlign: "center" }) as any}>{i + 1}</td>
                  <td style={td({ textAlign: "left", textTransform: "uppercase" }) as any}>{r.item?.name || "ITEM"}</td>
                  <td style={td({ textAlign: "center" }) as any}>{r.hsCode}</td>
                  <td style={td({ textAlign: "center" }) as any}>{r.item?.uom || "EA"}</td>
                  <td style={td({ textAlign: "center" }) as any}>{r.qty.toFixed(2)}</td>
                  <td style={td({ textAlign: "right" }) as any}>{r.rate.toFixed(2)}</td>
                  <td style={td({ textAlign: "right" }) as any}>{f(r.excl)}</td>
                  <td style={td({ textAlign: "right" }) as any}>{f(r.stax)}</td>
                  <td style={td({ textAlign: "center" }) as any}>0.00</td>
                  <td style={td({ textAlign: "right" }) as any}>{f(r.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 3 - rows.length) }).map((_, i) => (
                <tr key={`blank-${i}`} style={{ height: "28px" }}>
                  {Array(10).fill(null).map((__, j) => <td key={j} style={td() as any}></td>)}
                </tr>
              ))}
              <tr style={{ fontWeight: "700", backgroundColor: "#fafafa" }}>
                <td colSpan={4} style={td({ textAlign: "right" }) as any}>TOTALS:</td>
                <td style={td({ textAlign: "center" }) as any}>{totQty.toFixed(2)}</td>
                <td style={td() as any}></td>
                <td style={td({ textAlign: "right" }) as any}>{f(totExcl)}</td>
                <td style={td({ textAlign: "right" }) as any}>{f(totStax)}</td>
                <td style={td({ textAlign: "center" }) as any}>0.00</td>
                <td style={td({ textAlign: "right" }) as any}>{f(grand)}</td>
              </tr>
            </tbody>
          </table>

          {/* ── FOOTER ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "18px" }}>
            <div style={{ flex: 1, paddingRight: "30px" }}>
              <p style={{ margin: "0 0 6px" }}>Remarks:</p>
              <p style={{ fontWeight: "700", margin: "0 0 14px", fontSize: "11.5px" }}>FBR Invoice Number: {invoice.fbrIrn || "N/A"}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {/* FBR official logo in footer */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/fbr-logo.png" alt="FBR Digital Invoicing System" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
                <div style={{ border: "1px solid #ccc", padding: "4px", background: "#fff" }}>
                  <QRCodeSVG value={invoice.fbrIrn || invoice.id} size={72} level="M" />
                </div>
              </div>
            </div>

            <div style={{ minWidth: "230px", fontSize: "13px", marginTop: "34px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ccc", paddingBottom: "6px", marginBottom: "6px" }}>
                <span>Value Including Sales Tax</span>
                <span>{f(grand)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: "6px", marginBottom: "6px" }}>
                <span>W.H.T. 236G (0.10%)</span>
                <span>{f(wht)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "700", fontSize: "15px" }}>Total Invoice Value</span>
                <span style={{ fontWeight: "700", fontSize: "15px" }}>{f(final_)}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div style={{ marginTop: "22px", backgroundColor: "#f0f0f0", border: "1px solid #ddd", padding: "8px 12px", fontSize: "11px" }}>
            <strong>Amount in Words:</strong> {invoice.fbrIrn ? "SEE PRINT VERSION FOR FULL AMOUNT" : "—"}
          </div>

          <p style={{ textAlign: "center", fontSize: "10px", color: "#555", marginTop: "22px" }}>
            This is a computer-generated FBR Digital Invoice and does not require any signature and/or stamp.
          </p>

        </div>
      </div>
    </div>
  );
}
