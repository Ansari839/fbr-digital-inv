import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import toWords from 'number-to-words';
import path from 'path';

const NAVY  = '#1a3f7a';
const BLACK = '#000000';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BLACK,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 36,
    backgroundColor: '#ffffff',
  },

  /* ══ SECTION 1: Logo + Company name ══
     Logo top-left | Company name+NTN+STRN+Address center | (right empty)
     Followed by a thin black horizontal line
  */
  sec1: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },

  logoArea: { width: 90, flexShrink: 0 },
  logoAvatar: {
    width: 60, height: 60,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent' // User wants no box background, or use actual image
  },
  logoInitials: { color: NAVY, fontFamily: 'Helvetica-Bold', fontSize: 24 }, // changed to navy since no bg
  logoSubName: { fontSize: 6, fontFamily: 'Helvetica-Bold', marginTop: 4, textTransform: 'uppercase', color: NAVY },
  
  centerArea: { flex: 1, alignItems: 'center' },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: NAVY,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  ntnLine:  { fontSize: 10, marginBottom: 4 },
  ntnLbl:   { fontFamily: 'Helvetica-Bold' },
  strnLine: { fontSize: 10, marginBottom: 5 },
  strnLbl:  { fontFamily: 'Helvetica-Bold' },
  addressLine: { fontSize: 9.5, textAlign: 'center' },

  /* ══ SECTION 2: SALES TAX INVOICE box (right-aligned, below first line) ══ */
  sec2: { alignItems: 'flex-end', marginTop: 8, marginBottom: 8 },
  salesTaxBox: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  salesTaxText: { fontFamily: 'Helvetica-Bold', fontSize: 13, letterSpacing: 0.5 },

  /* Dividers */
  hr: { borderBottomWidth: 1, borderBottomColor: BLACK, marginTop: 4, marginBottom: 0 },
  hrThick: { borderBottomWidth: 1, borderBottomColor: BLACK },

  /* ══ SECTION 3: Buyer info left | Invoice meta right ══ */
  sec3: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 18 },

  buyerCol: { flex: 1, paddingRight: 20 },
  buyerName: { fontFamily: 'Helvetica-Bold', fontSize: 10, textTransform: 'uppercase', marginBottom: 8 },
  buyerRow:  { fontSize: 9, marginBottom: 8 },
  buyerBold: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  buyerAddr: { fontSize: 8.5, textTransform: 'uppercase', lineHeight: 1.6 },

  metaCol: { width: 150, flexShrink: 0 },
  metaRow:  { flexDirection: 'row', marginBottom: 8 },
  metaRowCol: { flexDirection: 'column', marginBottom: 8 },
  metaLbl:  { fontFamily: 'Helvetica-Bold', fontSize: 9, width: 85 },
  metaVal:  { fontSize: 9, flex: 1 },
  metaValBold: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginTop: 4 },

  /* ══ TABLE ══ */
  table: { borderWidth: 1, borderColor: BLACK, marginBottom: 0 },
  tHeadRow: { flexDirection: 'row', backgroundColor: '#efefef' },
  tRow:     { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BLACK },
  tRowTot:  { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BLACK, backgroundColor: '#fafafa' },

  /* header cells */
  th:     { fontFamily: 'Helvetica-Bold', fontSize: 8.5, textAlign: 'center', paddingVertical: 5, paddingHorizontal: 2, borderRightWidth: 1, borderRightColor: BLACK },
  thL:    { fontFamily: 'Helvetica-Bold', fontSize: 8.5, textAlign: 'left',   paddingVertical: 5, paddingHorizontal: 3, borderRightWidth: 1, borderRightColor: BLACK },
  thLast: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, textAlign: 'right',  paddingVertical: 5, paddingHorizontal: 3 },
  /* data cells */
  td:     { fontSize: 9, textAlign: 'center', paddingVertical: 5, paddingHorizontal: 2, borderRightWidth: 1, borderRightColor: BLACK },
  tdL:    { fontSize: 9, textAlign: 'left',   paddingVertical: 5, paddingHorizontal: 3, borderRightWidth: 1, borderRightColor: BLACK, textTransform: 'uppercase' },
  tdR:    { fontSize: 9, textAlign: 'right',  paddingVertical: 5, paddingHorizontal: 3, borderRightWidth: 1, borderRightColor: BLACK },
  tdLast: { fontSize: 9, textAlign: 'right',  paddingVertical: 5, paddingHorizontal: 3 },
  /* bold (totals) */
  tdb:     { fontFamily: 'Helvetica-Bold', fontSize: 9, textAlign: 'right',  paddingVertical: 5, paddingHorizontal: 3, borderRightWidth: 1, borderRightColor: BLACK },
  tdbLast: { fontFamily: 'Helvetica-Bold', fontSize: 9, textAlign: 'right',  paddingVertical: 5, paddingHorizontal: 3 },
  /* blank rows */
  blankRow:  { height: 24, flexDirection: 'row', borderTopWidth: 1, borderTopColor: BLACK },
  blankCell: { borderRightWidth: 1, borderRightColor: BLACK },

  /* ══ FOOTER ══ */
  footerRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 14 },
  footerLeft: { flex: 1, paddingRight: 16 },
  remarksLbl: { fontSize: 10, marginBottom: 5 },
  fbrNum:     { fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 12 },
  fbrLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fbrLogoImg: { width: 62, height: 62 },
  qrBorder:   { borderWidth: 1, borderColor: '#bbb' },

  footerRight:    { width: 190, flexShrink: 0, marginTop: 32 },
  sumRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 6, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  sumRowBold:     { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 6, marginBottom: 6, borderBottomWidth: 1.5, borderBottomColor: BLACK },
  sumRowFinal:    { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2 },
  sumLbl:         { fontSize: 10 },
  sumVal:         { fontSize: 10 },
  sumLblBold:     { fontFamily: 'Helvetica-Bold', fontSize: 12 },
  sumValBold:     { fontFamily: 'Helvetica-Bold', fontSize: 12 },

  /* Words box */
  wordsBox:  { marginTop: 16, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd', padding: 8 },
  wordsTxt:  { fontSize: 9.5, lineHeight: 1.5 },
  wordsBold: { fontFamily: 'Helvetica-Bold', fontSize: 9.5 },

  footerNote: { marginTop: 16, textAlign: 'center', fontSize: 9, color: '#333' },
  footerNoteLine: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#ccc' },
});

/* Column % widths — must total 100% */
const W = { sn:'4%', desc:'22%', hs:'11%', uom:'5%', qty:'7%', unit:'8%', excl:'12%', stax:'11%', further:'9%', total:'11%' };

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AVATAR_COLORS = ['#1a3f7a','#0d6e4f','#7c2d12','#4a1d96','#065f46','#831843','#1e40af'];

export function InvoicePDF({ invoice }: { invoice: any }) {
  const rows = (invoice.lineItems || []).map((li: any) => {
    const qty = Number(li.quantity), rate = Number(li.rate);
    const taxRate = Number(li.item?.taxRate ?? 18);
    const excl = qty * rate, stax = (excl * taxRate) / 100;
    return { ...li, qty, rate, excl, stax, total: excl + stax };
  });

  const totQty  = rows.reduce((a: number, r: any) => a + r.qty,  0);
  const totExcl = rows.reduce((a: number, r: any) => a + r.excl, 0);
  const totStax = rows.reduce((a: number, r: any) => a + r.stax, 0);
  const grand   = totExcl + totStax;
  const wht     = invoice.applyWht !== false ? grand * 0.001 : 0;
  const final_  = grand + wht;

  const intP = Math.floor(final_), decP = Math.round((final_ - intP) * 100);
  const words = toWords.toWords(intP).toUpperCase() + ' RUPEES AND ' +
    (decP > 0 ? toWords.toWords(decP).toUpperCase() + ' PAISE' : 'ZERO PAISE') + ' ONLY';

  const dt  = new Date(invoice.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
  const ref = invoice.serialNumber ? String(invoice.serialNumber).padStart(3, '0') : invoice.id.slice(-6).toUpperCase();
  const buName   = invoice.businessUnit?.name || 'COMPANY';
  const initials = buName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  const avatarBg = AVATAR_COLORS[buName.length % AVATAR_COLORS.length];
  const blankCount = Math.max(0, 3 - rows.length);
  const fbrLogo = path.join(process.cwd(), 'public', 'fbr-logo.png');

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ══ SECTION 1: Logo | Company Name | (right empty) ══ */}
        <View style={s.sec1}>
          {/* Left: Company logo/avatar */}
          <View style={s.logoArea}>
            <View style={s.logoAvatar}>
              <Text style={s.logoInitials}>{initials}</Text>
            </View>
            <Text style={s.logoSubName}>{buName}</Text>
          </View>

          {/* Center: Name + NTN + STRN + Address */}
          <View style={s.centerArea}>
            <Text style={s.companyName}>{buName}</Text>
            <Text style={s.ntnLine}>
              <Text style={s.ntnLbl}>NTN: </Text>{invoice.businessUnit?.ntn}
            </Text>
            <Text style={s.strnLine}>
              <Text style={s.strnLbl}>STRN: </Text>{invoice.businessUnit?.strn || '11-90-9999-329-55'}
            </Text>
            <Text style={s.addressLine}>
              {[invoice.businessUnit?.address, invoice.businessUnit?.province].filter(Boolean).join(', ') || 'Address not provided'}
            </Text>
          </View>

          {/* Right: empty to balance */}
          <View style={{ width: 80, flexShrink: 0 }} />
        </View>

        {/* ══ SECTION 2: SALES TAX INVOICE box — right aligned ══ */}
        <View style={s.sec2}>
          <View style={s.salesTaxBox}>
            <Text style={s.salesTaxText}>SALES TAX INVOICE</Text>
          </View>
        </View>

        {/* ── Divider line 2 ── */}
        <View style={s.hrThick} />

        {/* ══ SECTION 3: Buyer left | Invoice meta right ══ */}
        <View style={s.sec3}>
          <View style={s.buyerCol}>
            <Text style={s.buyerName}>{invoice.party?.name || 'BUYER NAME'}</Text>
            <Text style={s.buyerRow}>
              <Text style={s.buyerBold}>NTN / CNIC: </Text>
              {invoice.party?.ntnOrCnic}
            </Text>
            <Text style={s.buyerAddr}>
              {[invoice.partyAddress?.addressLine, invoice.partyAddress?.province].filter(Boolean).join(', ')}
            </Text>
          </View>

          <View style={s.metaCol}>
            <View style={s.metaRow}>
              <Text style={s.metaLbl}>Invoice Date:</Text>
              <Text style={s.metaVal}>{dt}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLbl}>Invoice Ref No:</Text>
              <Text style={s.metaVal}>{ref}</Text>
            </View>
            <View style={s.metaRowCol}>
              <Text style={s.metaLbl}>FBR Invoice No:</Text>
              <Text style={s.metaValBold}>{invoice.fbrIrn || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* ── Divider before table ── */}
        <View style={[s.hr, { marginBottom: 0 }]} />

        {/* ══ TABLE ══ */}
        <View style={s.table}>
          {/* Header row */}
          <View style={s.tHeadRow}>
            <Text style={[s.th,  { width: W.sn }]}>S.#</Text>
            <Text style={[s.thL, { width: W.desc }]}>Description</Text>
            <Text style={[s.th,  { width: W.hs }]}>HS Code</Text>
            <Text style={[s.th,  { width: W.uom }]}>UOM</Text>
            <Text style={[s.th,  { width: W.qty }]}>Qty</Text>
            <Text style={[s.th,  { width: W.unit }]}>{'Unit\nPrice'}</Text>
            <Text style={[s.th,  { width: W.excl }]}>{'Value Excl.\nS/Tax'}</Text>
            <Text style={[s.th,  { width: W.stax }]}>{'Sales Tax\n((18.00%))'}</Text>
            <Text style={[s.th,  { width: W.further }]}>{'Further\nSales Tax\n((0.00%))'}</Text>
            <Text style={[s.thLast, { width: W.total }]}>Total</Text>
          </View>

          {/* Data rows */}
          {rows.map((r: any, i: number) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.td,  { width: W.sn }]}>{i + 1}</Text>
              <Text style={[s.tdL, { width: W.desc }]}>{r.item?.name || 'ITEM'}</Text>
              <Text style={[s.td,  { width: W.hs }]}>{r.hsCode}</Text>
              <Text style={[s.td,  { width: W.uom }]}>{r.item?.uom || 'EA'}</Text>
              <Text style={[s.td,  { width: W.qty }]}>{r.qty.toFixed(2)}</Text>
              <Text style={[s.tdR, { width: W.unit }]}>{r.rate.toFixed(2)}</Text>
              <Text style={[s.tdR, { width: W.excl }]}>{fmt(r.excl)}</Text>
              <Text style={[s.tdR, { width: W.stax }]}>{fmt(r.stax)}</Text>
              <Text style={[s.td,  { width: W.further }]}>0.00</Text>
              <Text style={[s.tdLast, { width: W.total }]}>{fmt(r.total)}</Text>
            </View>
          ))}

          {/* Blank filler rows */}
          {Array.from({ length: blankCount }).map((_, i) => (
            <View key={`b${i}`} style={s.blankRow}>
              <View style={[s.blankCell, { width: W.sn }]} />
              <View style={[s.blankCell, { width: W.desc }]} />
              <View style={[s.blankCell, { width: W.hs }]} />
              <View style={[s.blankCell, { width: W.uom }]} />
              <View style={[s.blankCell, { width: W.qty }]} />
              <View style={[s.blankCell, { width: W.unit }]} />
              <View style={[s.blankCell, { width: W.excl }]} />
              <View style={[s.blankCell, { width: W.stax }]} />
              <View style={[s.blankCell, { width: W.further }]} />
              <View style={{ width: W.total }} />
            </View>
          ))}

          {/* TOTALS row */}
          <View style={s.tRowTot}>
            <Text style={[s.tdb, { width: '39%', textAlign: 'right' }]}>TOTALS:</Text>
            <Text style={[s.tdb, { width: W.qty, textAlign: 'center' }]}>{totQty.toFixed(2)}</Text>
            <Text style={[s.tdb, { width: W.unit }]}>{' '}</Text>
            <Text style={[s.tdb, { width: W.excl }]}>{fmt(totExcl)}</Text>
            <Text style={[s.tdb, { width: W.stax }]}>{fmt(totStax)}</Text>
            <Text style={[s.tdb, { width: W.further, textAlign: 'center' }]}>0.00</Text>
            <Text style={[s.tdbLast, { width: W.total }]}>{fmt(grand)}</Text>
          </View>
        </View>

        {/* ══ FOOTER ══ */}
        <View style={s.footerRow}>
          {/* Left: Remarks + FBR logo + QR */}
          <View style={s.footerLeft}>
            <Text style={s.remarksLbl}>Remarks:</Text>
            <Text style={s.fbrNum}>FBR Invoice Number: {invoice.fbrIrn || 'N/A'}</Text>
            <View style={s.fbrLogoRow}>
              <Image src={fbrLogo} style={s.fbrLogoImg} />
              <View style={s.qrBorder}>
                <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${invoice.fbrIrn || invoice.id}`} style={{ width: 60, height: 60 }} />
              </View>
            </View>
          </View>

          {/* Right: value summary */}
          <View style={s.footerRight}>
            <View style={[s.sumRow, invoice.applyWht === false ? { borderBottomWidth: 1.5, borderBottomColor: BLACK } : {}]}>
              <Text style={s.sumLbl}>Value Including Sales Tax</Text>
              <Text style={s.sumVal}>{fmt(grand)}</Text>
            </View>
            {invoice.applyWht !== false && (
              <View style={s.sumRowBold}>
                <Text style={s.sumLbl}>W.H.T. 236G (0.10%)</Text>
                <Text style={s.sumVal}>{fmt(wht)}</Text>
              </View>
            )}
            <View style={s.sumRowFinal}>
              <Text style={s.sumLblBold}>Total Invoice Value</Text>
              <Text style={s.sumValBold}>{fmt(final_)}</Text>
            </View>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={s.wordsBox}>
          <Text style={s.wordsTxt}>
            <Text style={s.wordsBold}>Amount in Words: </Text>
            {words}
          </Text>
        </View>

        {/* Footer note with top line */}
        <View style={s.footerNoteLine} />
        <Text style={s.footerNote}>
          This is a computer-generated FBR Digital Invoice and does not require any signature and/or stamp.
        </Text>

      </Page>
    </Document>
  );
}
