import { Environment, InvoicePayload, FBRResponse } from './types';

interface FBRClientConfig {
  environment: Environment;
  sandboxToken: string;
  productionToken: string;
  sandboxBaseUrl: string;
  productionBaseUrl: string;
}

const defaultConfig: FBRClientConfig = {
  environment: (process.env.FBR_ENVIRONMENT as Environment) || 'sandbox',
  sandboxToken: process.env.FBR_SANDBOX_TOKEN || '',
  productionToken: process.env.FBR_PRODUCTION_TOKEN || '',
  sandboxBaseUrl: process.env.FBR_SANDBOX_BASE_URL || 'https://gw.fbr.gov.pk/di_data/v1/di',
  productionBaseUrl: process.env.FBR_PRODUCTION_BASE_URL || 'https://gw.fbr.gov.pk/di_data/v1/di',
};

export class FBRClient {
  private config: FBRClientConfig;

  constructor(config: Partial<FBRClientConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private getBaseUrl(): string {
    return this.config.environment === 'sandbox'
      ? this.config.sandboxBaseUrl
      : this.config.productionBaseUrl;
  }

  private getToken(): string {
    return this.config.environment === 'sandbox'
      ? this.config.sandboxToken
      : this.config.productionToken;
  }

  private async request<T>(endpoint: string, payload: any): Promise<T> {
    const url = `${this.getBaseUrl()}/${endpoint}`;
    const token = this.getToken();

    if (!token) {
      throw new Error(`FBR token for ${this.config.environment} is not configured.`);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        
        throw new Error(
          `FBR API Error (${response.status}): ${
            typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
          }`
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      console.error(`FBR API request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  public async validateInvoice(payload: InvoicePayload): Promise<FBRResponse> {
    const endpoint = this.config.environment === 'sandbox' 
      ? 'validateinvoicedata_sb' 
      : 'validateinvoicedata';
    return this.request<FBRResponse>(endpoint, payload);
  }

  public async postInvoice(payload: InvoicePayload): Promise<FBRResponse> {
    const endpoint = this.config.environment === 'sandbox' 
      ? 'postinvoicedata_sb' 
      : 'postinvoicedata';
    return this.request<FBRResponse>(endpoint, payload);
  }
}

// Export a singleton instance for general use
export const fbrClient = new FBRClient();
