import React from 'react';

export const ModernTemplate = ({ invoice }: { invoice: any }) => {
  if (!invoice) return null;

  const { businessUnit, party, lineItems } = invoice;

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white mx-auto shadow-lg print:shadow-none p-10 text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-[var(--primary)] pb-6 mb-8">
        <div>
          {businessUnit?.logoUrl ? (
            <img src={businessUnit.logoUrl} alt="Logo" className="h-16 object-contain mb-2" />
          ) : (
            <div className="h-16 w-16 bg-[var(--primary)] rounded text-white flex items-center justify-center font-bold text-xl mb-2">
              LOGO
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900">{businessUnit?.name || 'SELLER NAME'}</h1>
          <p className="text-sm text-slate-500">NTN: {businessUnit?.ntn || 'N/A'}</p>
          {businessUnit?.strn && <p className="text-sm text-slate-500">STRN: {businessUnit.strn}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-slate-200 mb-2">INVOICE</h2>
          <div className="text-sm">
            <p><span className="font-semibold">Invoice No:</span> {invoice.fbrIrn || 'DRAFT'}</p>
            <p><span className="font-semibold">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p><span className="font-semibold">Status:</span> {invoice.status}</p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-2">Billed To</h3>
        <h4 className="text-lg font-bold text-slate-800">{party?.name || 'Customer'}</h4>
        <p className="text-sm text-slate-600">NTN/CNIC: {party?.ntnOrCnic || 'Unregistered'}</p>
        <p className="text-sm text-slate-600 max-w-xs">{invoice.partyAddress?.addressLine}, {invoice.partyAddress?.province}</p>
      </div>

      {/* Table */}
      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="bg-slate-100 border-y border-slate-300">
            <th className="py-3 px-2 font-semibold text-sm">Description</th>
            <th className="py-3 px-2 font-semibold text-sm">HS Code</th>
            <th className="py-3 px-2 text-right font-semibold text-sm">Qty</th>
            <th className="py-3 px-2 text-right font-semibold text-sm">Rate</th>
            <th className="py-3 px-2 text-right font-semibold text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems?.map((item: any, idx: number) => {
            const amount = parseFloat(item.quantity) * parseFloat(item.rate);
            return (
              <tr key={idx} className="border-b border-slate-200">
                <td className="py-3 px-2 text-sm">{item.item?.name || 'Item'}</td>
                <td className="py-3 px-2 text-sm text-slate-500">{item.hsCode}</td>
                <td className="py-3 px-2 text-right text-sm">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-sm">{parseFloat(item.rate).toLocaleString()}</td>
                <td className="py-3 px-2 text-right text-sm font-medium">{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2">
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-sm text-slate-600">Subtotal:</span>
            <span className="font-semibold">{parseFloat(invoice.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-slate-800">
            <span className="text-sm text-slate-600">Total Tax:</span>
            <span className="font-semibold">0.00</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-lg font-bold text-[var(--primary)]">Total Amount:</span>
            <span className="text-lg font-bold text-[var(--primary)]">Rs {parseFloat(invoice.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      {/* FBR Footer */}
      <div className="border-t border-slate-200 pt-6 mt-auto">
        <div className="flex justify-between items-end">
          <div className="text-xs text-slate-500 max-w-md">
            <p className="font-semibold mb-1">FBR Digital Invoicing Compliant</p>
            <p>IRN: {invoice.fbrIrn || 'Pending'}</p>
            <p>Generated At: {invoice.fbrTimestamp ? new Date(invoice.fbrTimestamp).toLocaleString() : 'N/A'}</p>
          </div>
          <div className="h-20 w-20 bg-slate-100 border border-slate-300 flex items-center justify-center">
            <span className="text-[10px] text-slate-400 text-center leading-tight">FBR<br/>QR Code<br/>Area</span>
          </div>
        </div>
      </div>

    </div>
  );
};
