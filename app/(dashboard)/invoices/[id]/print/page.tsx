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
        <p>Loading…</p>
      </div>
    );

  if (!invoice)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Invoice Not Found</h2>
        <button onClick={() => router.back()}>Back</button>
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

  const totQty   = rows.reduce((s: number, r: any) => s + r.qty,   0);
  const totExcl  = rows.reduce((s: number, r: any) => s + r.excl,  0);
  const totStax  = rows.reduce((s: number, r: any) => s + r.stax,  0);
  const grand    = totExcl + totStax;
  const wht      = grand * 0.001;
  const final_   = grand + wht;

  const intP  = Math.floor(final_);
  const decP  = Math.round((final_ - intP) * 100);
  const words = (
    toWords.toWords(intP).toUpperCase() +
    " RUPEES AND " +
    (decP > 0 ? toWords.toWords(decP).toUpperCase() + " PAISE" : "ZERO PAISE") +
    " ONLY"
  );

  const f  = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dt = new Date(invoice.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-");
  const ref = invoice.id.slice(-6).toUpperCase();

  /* ── Shared cell style ── */
  const td = (extra?: object): object => ({
    border: "1px solid #000",
    padding: "5px 5px",
    fontSize: "11px",
    ...extra,
  });

  return (
    <>
      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        * { box-sizing: border-box; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Force hide browser header/footer text */
          html { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* ── Screen controls ── */}
      <div className="no-print" style={{
        background: "#f1f5f9", borderBottom: "1px solid #cbd5e1",
        padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ fontSize: "13px", color: "#64748b" }}>FBR A4 Print Preview</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => router.back()} style={{
            padding: "7px 16px", border: "1px solid #cbd5e1", borderRadius: "4px",
            background: "#fff", cursor: "pointer", fontSize: "13px"
          }}>Back</button>
          <button onClick={() => window.print()} style={{
            padding: "7px 16px", borderRadius: "4px",
            background: "#1e3b70", color: "#fff", border: "none", cursor: "pointer", fontSize: "13px"
          }}>Print / Save PDF</button>
        </div>
      </div>

      {/* ═══════════════════════ A4 SHEET ═══════════════════════ */}
      <div style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        background: "#fff",
        padding: "12mm 14mm 12mm",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
        color: "#000",
        boxShadow: "0 0 18px rgba(0,0,0,.15)",
      }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "0", paddingBottom: "12px", borderBottom: "1.5px solid #000" }}>

          {/* Company avatar (initials) — seller's own logo area, NOT FBR logo */}
          <div style={{ minWidth: "110px" }}>
            {(() => {
              const name = invoice.businessUnit?.name || "CO";
              const initials = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
              const colors = ["#1a3f7a","#0d6e4f","#7c2d12","#4a1d96","#065f46","#831843","#1e40af"];
              const bg = colors[name.length % colors.length];
              return (
                <>
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "8px",
                    backgroundColor: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: "900", fontSize: "22px",
                    fontFamily: "Arial, sans-serif"
                  }}>
                    {initials}
                  </div>
                  <p style={{ fontSize: "7px", fontWeight: "700", color: bg, marginTop: "4px", textTransform: "uppercase", lineHeight: "1.3" }}>
                    {name}
                  </p>
                </>
              );
            })()}
          </div>

          {/* Center: company name + details */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <h1 style={{
              fontSize: "26px", fontWeight: "900", color: "#1a3f7a",
              margin: "0 0 8px", letterSpacing: "0.5px", textTransform: "uppercase"
            }}>
              {invoice.businessUnit?.name || "COMPANY NAME"}
            </h1>
            <p style={{ margin: "3px 0", fontWeight: "700" }}>
              NTN: <span style={{ fontWeight: "400" }}>{invoice.businessUnit?.ntn}</span>
            </p>
            <p style={{ margin: "3px 0", fontWeight: "700" }}>
              STRN: <span style={{ fontWeight: "400" }}>{invoice.businessUnit?.strn || "11-90-9999-329-55"}</span>
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "11px" }}>
              PLOT No. F - 96, OFF HUB RIVER ROAD, SITE, Karachi West Site Town
            </p>
          </div>

          {/* Right: SALES TAX INVOICE box — plain gray, no side border */}
          <div style={{ minWidth: "130px", display: "flex", justifyContent: "flex-end", alignItems: "flex-end", paddingBottom: "0" }}>
            <div style={{
              backgroundColor: "#d0d0d0",
              padding: "7px 14px",
              marginTop: "auto"
            }}>
              <p style={{ fontWeight: "700", fontSize: "12px", margin: 0, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                SALES TAX INVOICE
              </p>
            </div>
          </div>
        </div>

        {/* ── BUYER + META ── */}
        <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0 12px" }}>
          {/* Buyer left */}
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: "700", fontSize: "14px", margin: "0 0 5px", textTransform: "uppercase" }}>
              {invoice.party?.name || "BUYER NAME"}
            </p>
            <p style={{ fontWeight: "700", margin: "3px 0" }}>
              NTN / CNIC: <span style={{ fontWeight: "400" }}>{invoice.party?.ntnOrCnic}</span>
            </p>
            <p style={{ textTransform: "uppercase", margin: "3px 0", fontSize: "11px", lineHeight: "1.5", maxWidth: "340px" }}>
              {[invoice.partyAddress?.addressLine, invoice.partyAddress?.province].filter(Boolean).join(", ")}
            </p>
          </div>

          {/* Invoice meta right */}
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
                  <td style={{ fontWeight: "700", fontSize: "11px", wordBreak: "break-all", maxWidth: "140px" }}>
                    {invoice.fbrIrn || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px" }}>
          <thead>
            <tr style={{ backgroundColor: "#efefef" }}>
              {[
                { label: "S.#",                      w: "30px",  align: "center" },
                { label: "Description",              w: "auto",  align: "left"   },
                { label: "HS Code",                  w: "72px",  align: "center" },
                { label: "UOM",                      w: "38px",  align: "center" },
                { label: "Qty",                      w: "48px",  align: "center" },
                { label: "Unit\nPrice",              w: "52px",  align: "center" },
                { label: "Value Excl.\nS/Tax",       w: "72px",  align: "center" },
                { label: "Sales Tax\n((18.00%))",    w: "72px",  align: "center" },
                { label: "Further\nSales Tax\n((0.00%))", w: "60px", align: "center" },
                { label: "Total",                    w: "76px",  align: "center" },
              ].map((h, i) => (
                <th key={i} style={{
                  ...td({ backgroundColor: "#efefef", fontWeight: "700", textAlign: h.align as any,
                         whiteSpace: "pre-line", lineHeight: "1.3", width: h.w, padding: "5px 4px" })
                }}>
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

            {/* blank rows to fill space like in PDF */}
            {Array.from({ length: Math.max(0, 3 - rows.length) }).map((_, i) => (
              <tr key={`blank-${i}`} style={{ height: "28px" }}>
                {Array(10).fill(null).map((__, j) => (
                  <td key={j} style={td() as any}></td>
                ))}
              </tr>
            ))}

            {/* Totals */}
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

        {/* ── FOOTER SECTION ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "18px" }}>

          {/* Left: Remarks + FBR + QR */}
          <div style={{ flex: 1, paddingRight: "30px" }}>
            <p style={{ margin: "0 0 6px" }}>Remarks:</p>
            <p style={{ fontWeight: "700", margin: "0 0 14px", fontSize: "11.5px" }}>
              FBR Invoice Number: {invoice.fbrIrn || "N/A"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Real FBR logo image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fbr-logo.png" alt="FBR Digital Invoicing System"
                style={{ width: "80px", height: "80px", objectFit: "contain" }} />
              {/* QR Code */}
              <div style={{ border: "1px solid #ccc", padding: "4px", background: "#fff" }}>
                <QRCodeSVG value={invoice.fbrIrn || invoice.id} size={72} level="M" />
              </div>
            </div>
          </div>

          {/* Right: value summary */}
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
        <div style={{
          marginTop: "22px",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ddd",
          padding: "8px 12px",
          fontSize: "11px",
          lineHeight: "1.5"
        }}>
          <strong>Amount in Words:</strong> {words}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", fontSize: "10px", color: "#333", marginTop: "22px", marginBottom: "0" }}>
          This is a computer-generated FBR Digital Invoice and does not require any signature and/or stamp.
        </p>

      </div>
    </>
  );
}
