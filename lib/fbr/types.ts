export type Environment = 'sandbox' | 'production';

export interface InvoiceItem {
  hsCode: string;
  productDescription: string;
  rate: string;
  uoM: string;
  quantity: number;
  totalValues: number;
  valueSalesExcludingST: number;
  fixedNotifiedValueOrRetailPrice: number;
  salesTaxApplicable: number;
  salesTaxWithheldAtSource: number;
  extraTax?: number;
  furtherTax?: number;
  sroScheduleNo?: string;
  fedPayable?: number;
  discount?: number;
  saleType: string;
  sroItemSerialNo?: string;
}

export interface InvoicePayload {
  invoiceType: 'Sale Invoice' | 'Debit Note';
  invoiceDate: string; // YYYY-MM-DD
  sellerNTNCNIC: string;
  sellerBusinessName: string;
  sellerProvince: string;
  sellerAddress: string;
  buyerNTNCNIC?: string;
  buyerBusinessName: string;
  buyerProvince: string;
  buyerAddress: string;
  buyerRegistrationType: 'Registered' | 'Unregistered';
  invoiceRefNo?: string;
  scenarioId?: string; // only for sandbox
  items: InvoiceItem[];
}

export interface InvoiceStatus {
  itemSNo: string;
  statusCode: string;
  status: string;
  invoiceNo: string | null;
  errorCode?: string;
  error: string;
}

export interface ValidationResponse {
  statusCode: string;
  status: string;
  errorCode?: string;
  error: string;
  invoiceStatuses: InvoiceStatus[] | null;
}

export interface FBRResponse {
  invoiceNumber?: string;
  dated: string;
  validationResponse: ValidationResponse;
}
