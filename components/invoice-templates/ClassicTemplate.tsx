import React from 'react';

export const ClassicTemplate = ({ invoice }: { invoice: any }) => {
  if (!invoice) return null;

  const { businessUnit, party, lineItems } = invoice;

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white mx-auto shadow-lg print:shadow-none p-12 text-black border border-slate-200 print:border-none">
      
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-8">
        {businessUnit?.logoUrl && (
          <img src={businessUnit.logoUrl} alt="Logo" className="h-16 object-contain mx-auto mb-2" />
        )}
        <h1 className="text-3xl font-serif font-bold uppercase tracking-widest">{businessUnit?.name || 'SELLER NAME'}</h1>
        <p className="text-sm mt-1">NTN: {businessUnit?.ntn || 'N/A'} {businessUnit?.strn ? ` | STRN: ${businessUnit.strn}` : ''}</p>
      </div>

      {/* Info Blocks */}
      <div className="flex justify-between mb-8">
        <div className="w-1/2">
          <h3 className="font-bold underline mb-2">BILL TO:</h3>
          <p className="font-semibold">{party?.name || 'Customer'}</p>
          <p className="text-sm">NTN/CNIC: {party?.ntnOrCnic || 'Unregistered'}</p>
          <p className="text-sm">{invoice.partyAddress?.addressLine}</p>
          <p className="text-sm">{invoice.partyAddress?.province}</p>
        </div>
        <div className="w-1/3 border border-black p-4">
          <h2 className="text-xl font-bold text-center border-b border-black pb-2 mb-2">TAX INVOICE</h2>
          <div className="text-sm grid grid-cols-2 gap-1">
            <span className="font-semibold">Inv No:</span> <span>{invoice.fbrIrn || 'DRAFT'}</span>
            <span className="font-semibold">Date:</span> <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
            <span className="font-semibold">Status:</span> <span>{invoice.status}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left border-collapse border border-black mb-8">
        <thead>
          <tr className="bg-gray-100 border-b border-black">
            <th className="py-2 px-2 border-r border-black font-bold text-sm text-center w-10">S.No</th>
            <th className="py-2 px-2 border-r border-black font-bold text-sm">Description of Goods/Services</th>
            <th className="py-2 px-2 border-r border-black font-bold text-sm text-center">HS Code</th>
            <th className="py-2 px-2 border-r border-black font-bold text-sm text-right">Qty</th>
            <th className="py-2 px-2 border-r border-black font-bold text-sm text-right">Unit Price</th>
            <th className="py-2 px-2 font-bold text-sm text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems?.map((item: any, idx: number) => {
            const amount = parseFloat(item.quantity) * parseFloat(item.rate);
            return (
              <tr key={idx} className="border-b border-black">
                <td className="py-2 px-2 border-r border-black text-sm text-center">{idx + 1}</td>
                <td className="py-2 px-2 border-r border-black text-sm">{item.item?.name || 'Item'}</td>
                <td className="py-2 px-2 border-r border-black text-sm text-center">{item.hsCode}</td>
                <td className="py-2 px-2 border-r border-black text-sm text-right">{item.quantity}</td>
                <td className="py-2 px-2 border-r border-black text-sm text-right">{parseFloat(item.rate).toLocaleString()}</td>
                <td className="py-2 px-2 text-sm text-right font-medium">{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <table className="w-1/2 border-collapse border border-black">
          <tbody>
            <tr className="border-b border-black">
              <td className="py-2 px-4 font-bold">Total Excl. Tax</td>
              <td className="py-2 px-4 text-right border-l border-black">{parseFloat(invoice.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="py-2 px-4 font-bold">Total Sales Tax</td>
              <td className="py-2 px-4 text-right border-l border-black">0.00</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="py-2 px-4 font-bold text-lg">GRAND TOTAL</td>
              <td className="py-2 px-4 text-right border-l border-black font-bold text-lg">Rs {parseFloat(invoice.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-black pt-4 mt-auto">
        <div className="flex justify-between items-center">
          <div className="text-xs">
            <p className="font-bold">FBR IRN: {invoice.fbrIrn || 'Pending'}</p>
            <p>Timestamp: {invoice.fbrTimestamp ? new Date(invoice.fbrTimestamp).toLocaleString() : 'N/A'}</p>
            <p className="mt-2 text-gray-600 italic">This is a computer generated invoice and requires no physical signature.</p>
          </div>
          <div className="h-24 w-24 border-2 border-black flex items-center justify-center">
             <span className="text-[10px] text-black text-center font-bold leading-tight">FBR<br/>QR</span>
          </div>
        </div>
      </div>

    </div>
  );
};
