"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import toWords from "number-to-words";

export default function InvoicePrintPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then((r) => r.json())
      .then((d) => setInvoice(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!invoice || isLoading) return;
    const t = setTimeout(() => window.print(), 700);
    return () => clearTimeout(t);
  }, [invoice, isLoading]);

  if (isLoading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p style={{ fontFamily: "Arial", color: "#333" }}>Loading invoice…</p>
      </div>
    );

  if (!invoice)
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
        <h2>Invoice Not Found</h2>
        <button onClick={() => router.back()} style={{ marginTop: "16px", padding: "8px 20px", background: "#1e3b70", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Back
        </button>
      </div>
    );

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

  const intP  = Math.floor(final_);
  const decP  = Math.round((final_ - intP) * 100);
  const words = (
    toWords.toWords(intP).toUpperCase() +
    " RUPEES AND " +
    (decP > 0 ? toWords.toWords(decP).toUpperCase() + " PAISE" : "ZERO PAISE") +
    " ONLY"
  );

  const f   = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dt  = new Date(invoice.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-");
  const ref = invoice.id.slice(-6).toUpperCase();

  /* Company avatar */
  const buName   = invoice.businessUnit?.name || "CO";
  const initials = buName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  const avatarColors = ["#1a3f7a", "#0d6e4f", "#7c2d12", "#4a1d96", "#065f46", "#831843", "#1e40af"];
  const avatarBg = avatarColors[buName.length % avatarColors.length];

  /* Shared cell style */
  const C = (extra?: object) => ({ border: "1px solid #000", padding: "4px 4px", fontSize: "10.5px", ...extra });

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @page { size: A4 portrait; margin: 0; }
        body { margin: 0; background: #fff; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* ── Screen controls (hidden on print) ── */}
      <div className="no-print" style={{
        background: "#f1f5f9", borderBottom: "1px solid #cbd5e1",
        padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "Arial, sans-serif"
      }}>
        <span style={{ fontSize: "13px", color: "#64748b" }}>📄 FBR A4 Print Preview</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => router.back()} style={{
            padding: "7px 16px", border: "1px solid #cbd5e1", borderRadius: "4px",
            background: "#fff", cursor: "pointer", fontSize: "13px"
          }}>← Back</button>
          <button onClick={() => window.print()} style={{
            padding: "7px 20px", borderRadius: "4px",
            background: "#1e3b70", color: "#fff", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600"
          }}>🖨 Print / Save PDF</button>
        </div>
      </div>

      {/* ── A4 WRAPPER (screen only — for print @page handles sizing) ── */}
      <div style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "14mm 14mm 12mm",
        background: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
        color: "#000",
        boxShadow: "0 0 24px rgba(0,0,0,.2)",
      }}>

        {/* ══ HEADER ══ */}
        <div style={{ display: "flex", alignItems: "flex-start", borderBottom: "2px solid #000", paddingBottom: "12px", marginBottom: "14px" }}>

          {/* Company Avatar — top-left logo placeholder */}
          <div style={{ width: "110px", flexShrink: 0 }}>
            <div style={{
              width: "62px", height: "62px", borderRadius: "6px",
              backgroundColor: avatarBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: "900", fontSize: "22px", fontFamily: "Arial, sans-serif",
              letterSpacing: "1px"
            }}>
              {initials}
            </div>
            <p style={{ fontSize: "6.5px", fontWeight: "700", color: avatarBg, marginTop: "4px",
              textTransform: "uppercase", lineHeight: "1.3", maxWidth: "100px" }}>
              {buName}
            </p>
          </div>

          {/* Center: Company name + NTN / STRN / Address */}
          <div style={{ flex: 1, textAlign: "center", padding: "0 8px" }}>
            <h1 style={{
              fontSize: "28px", fontWeight: "900", color: "#1a3f7a",
              margin: "0 0 8px", letterSpacing: "1px", textTransform: "uppercase",
              lineHeight: "1"
            }}>
              {buName}
            </h1>
            <p style={{ margin: "3px 0", fontSize: "12px" }}>
              <strong>NTN:</strong> {invoice.businessUnit?.ntn}
            </p>
            <p style={{ margin: "3px 0", fontSize: "12px" }}>
              <strong>STRN:</strong> {invoice.businessUnit?.strn || "11-90-9999-329-55"}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "11px" }}>
              PLOT No. F - 96, OFF HUB RIVER ROAD, SITE, Karachi West Site Town
            </p>
          </div>

          {/* Right: SALES TAX INVOICE gray box — aligned to bottom of header */}
          <div style={{ width: "130px", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignSelf: "stretch" }}>
            <div style={{
              backgroundColor: "#c8c8c8",
              padding: "8px 12px",
              textAlign: "center"
            }}>
              <p style={{ fontWeight: "700", fontSize: "12px", margin: 0, whiteSpace: "nowrap", letterSpacing: "0.3px" }}>
                SALES TAX INVOICE
              </p>
            </div>
          </div>
        </div>

        {/* ══ BUYER + META ══ */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ flex: 1, paddingRight: "16px" }}>
            <p style={{ fontWeight: "700", fontSize: "14px", margin: "0 0 5px", textTransform: "uppercase" }}>
              {invoice.party?.name || "BUYER NAME"}
            </p>
            <p style={{ fontWeight: "700", margin: "3px 0", fontSize: "12px" }}>
              NTN / CNIC: <span style={{ fontWeight: "400" }}>{invoice.party?.ntnOrCnic}</span>
            </p>
            <p style={{ textTransform: "uppercase", margin: "3px 0", fontSize: "11px", lineHeight: "1.5", maxWidth: "320px" }}>
              {[invoice.partyAddress?.addressLine, invoice.partyAddress?.province].filter(Boolean).join(", ")}
            </p>
          </div>
          <div style={{ minWidth: "210px", flexShrink: 0 }}>
            <table style={{ borderSpacing: 0, marginLeft: "auto", fontSize: "12px", width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: "700", paddingRight: "10px", paddingBottom: "5px", whiteSpace: "nowrap" }}>Invoice Date:</td>
                  <td style={{ paddingBottom: "5px" }}>{dt}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "700", paddingRight: "10px", paddingBottom: "5px", whiteSpace: "nowrap" }}>Invoice Ref No:</td>
                  <td style={{ paddingBottom: "5px" }}>{ref}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "700", paddingRight: "10px", verticalAlign: "top", whiteSpace: "nowrap" }}>FBR Invoice No:</td>
                  <td style={{ fontWeight: "700", fontSize: "10.5px", wordBreak: "break-all" }}>
                    {invoice.fbrIrn || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ LINE ITEMS TABLE ══ */}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "11px" }}>
          <colgroup>
            <col style={{ width: "26px" }} />
            <col />
            <col style={{ width: "62px" }} />
            <col style={{ width: "32px" }} />
            <col style={{ width: "46px" }} />
            <col style={{ width: "50px" }} />
            <col style={{ width: "70px" }} />
            <col style={{ width: "66px" }} />
            <col style={{ width: "58px" }} />
            <col style={{ width: "72px" }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: "#efefef" }}>
              {[
                { label: "S.#",                               align: "center" },
                { label: "Description",                       align: "left"   },
                { label: "HS Code",                           align: "center" },
                { label: "UOM",                               align: "center" },
                { label: "Qty",                               align: "center" },
                { label: "Unit\nPrice",                       align: "center" },
                { label: "Value Excl.\nS/Tax",                align: "center" },
                { label: "Sales Tax\n((18.00%))",             align: "center" },
                { label: "Further\nSales Tax\n((0.00%))",     align: "center" },
                { label: "Total",                             align: "right"  },
              ].map((h, i) => (
                <th key={i} style={C({ backgroundColor: "#efefef", fontWeight: "700",
                  textAlign: h.align as any, whiteSpace: "pre-line", lineHeight: "1.3",
                  padding: "5px 3px", fontSize: "10.5px" }) as any}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, i: number) => (
              <tr key={i}>
                <td style={C({ textAlign: "center" }) as any}>{i + 1}</td>
                <td style={C({ textAlign: "left", textTransform: "uppercase", wordBreak: "break-word" }) as any}>{r.item?.name || "ITEM"}</td>
                <td style={C({ textAlign: "center" }) as any}>{r.hsCode}</td>
                <td style={C({ textAlign: "center" }) as any}>{r.item?.uom || "EA"}</td>
                <td style={C({ textAlign: "center" }) as any}>{r.qty.toFixed(2)}</td>
                <td style={C({ textAlign: "right" }) as any}>{r.rate.toFixed(2)}</td>
                <td style={C({ textAlign: "right" }) as any}>{f(r.excl)}</td>
                <td style={C({ textAlign: "right" }) as any}>{f(r.stax)}</td>
                <td style={C({ textAlign: "center" }) as any}>0.00</td>
                <td style={C({ textAlign: "right" }) as any}>{f(r.total)}</td>
              </tr>
            ))}
            {/* blank filler rows */}
            {Array.from({ length: Math.max(0, 3 - rows.length) }).map((_, i) => (
              <tr key={`b${i}`} style={{ height: "28px" }}>
                {Array(10).fill(null).map((__, j) => <td key={j} style={C() as any} />)}
              </tr>
            ))}
            {/* TOTALS row */}
            <tr style={{ fontWeight: "700", backgroundColor: "#f8f8f8" }}>
              <td colSpan={4} style={C({ textAlign: "right", fontSize: "11px" }) as any}>TOTALS:</td>
              <td style={C({ textAlign: "center" }) as any}>{totQty.toFixed(2)}</td>
              <td style={C() as any} />
              <td style={C({ textAlign: "right" }) as any}>{f(totExcl)}</td>
              <td style={C({ textAlign: "right" }) as any}>{f(totStax)}</td>
              <td style={C({ textAlign: "center" }) as any}>0.00</td>
              <td style={C({ textAlign: "right" }) as any}>{f(grand)}</td>
            </tr>
          </tbody>
        </table>

        {/* ══ FOOTER ══ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "18px" }}>
          {/* Left */}
          <div style={{ flex: 1, paddingRight: "20px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "12px" }}>Remarks:</p>
            <p style={{ fontWeight: "700", margin: "0 0 14px", fontSize: "11px" }}>
              FBR Invoice Number: {invoice.fbrIrn || "N/A"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fbr-logo.png" alt="FBR Digital Invoicing System"
                style={{ width: "80px", height: "80px", objectFit: "contain" }} />
              <div style={{ border: "1px solid #bbb", padding: "4px", background: "#fff" }}>
                <QRCodeSVG value={invoice.fbrIrn || invoice.id} size={70} level="M" />
              </div>
            </div>
          </div>

          {/* Right: value summary */}
          <div style={{ minWidth: "220px", flexShrink: 0, fontSize: "12.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ccc", paddingBottom: "6px", marginBottom: "6px", paddingTop: "2px" }}>
              <span>Value Including Sales Tax</span>
              <span>{f(grand)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #000", paddingBottom: "6px", marginBottom: "6px" }}>
              <span>W.H.T. 236G (0.10%)</span>
              <span>{f(wht)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "2px" }}>
              <span style={{ fontWeight: "700", fontSize: "14px" }}>Total Invoice Value</span>
              <span style={{ fontWeight: "700", fontSize: "14px" }}>{f(final_)}</span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div style={{ marginTop: "20px", backgroundColor: "#f0f0f0", border: "1px solid #ddd", padding: "8px 12px", fontSize: "11px", lineHeight: "1.6" }}>
          <strong>Amount in Words:</strong> {words}
        </div>

        <p style={{ textAlign: "center", fontSize: "10px", color: "#333", marginTop: "20px" }}>
          This is a computer-generated FBR Digital Invoice and does not require any signature and/or stamp.
        </p>

      </div>
    </>
  );
}
