import { 
  Patient, 
  Bundle, 
  Observation, 
  Condition, 
  MedicationRequest, 
  AllergyIntolerance,
  Encounter,
  Coverage,
  DiagnosticReport,
  Practitioner,
  Organization,
  FHIRSearchParams,
  TokenResponse,
  SmartConfiguration,
  FHIRCredentials
} from './types';

export interface FHIRClientConfig {
  baseUrl: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  credentials?: FHIRCredentials;
}

export interface FHIRResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export class FHIRClient {
  private baseUrl: string;
  private accessToken?: string;
  private clientId?: string;
  private clientSecret?: string;
  private credentials?: FHIRCredentials;

  constructor(config: FHIRClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = config.accessToken;
    this.credentials = config.credentials;
  }

  // Authentication Methods
  async getSmartConfiguration(): Promise<FHIRResponse<SmartConfiguration>> {
    try {
      const response = await fetch(`${this.baseUrl}/.well-known/smart-configuration`);
      
      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch SMART configuration: ${response.status}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getCapabilityStatement(): Promise<FHIRResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/metadata`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch capability statement: ${response.status}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<FHIRResponse<TokenResponse>> {
    try {
      const smartConfig = await this.getSmartConfiguration();
      if (!smartConfig.success || !smartConfig.data?.token_endpoint) {
        return {
          success: false,
          error: 'Unable to get token endpoint from SMART configuration'
        };
      }

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: this.clientId || ''
      });

      if (this.clientSecret) {
        body.append('client_secret', this.clientSecret);
      }

      if (codeVerifier) {
        body.append('code_verifier', codeVerifier);
      }

      const response = await fetch(smartConfig.data.token_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Token exchange failed: ${response.status}`,
          statusCode: response.status
        };
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;

      return {
        success: true,
        data: tokenData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Helper Methods
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/fhir+json',
      'Content-Type': 'application/fhir+json'
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private buildSearchUrl(resourceType: string, params?: FHIRSearchParams): string {
    const url = new URL(`${this.baseUrl}/${resourceType}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    return url.toString();
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    body?: any
  ): Promise<FHIRResponse<T>> {
    try {
      const config: RequestInit = {
        method,
        headers: this.getHeaders()
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Patient Operations
  async getPatient(id: string): Promise<FHIRResponse<Patient>> {
    const url = `${this.baseUrl}/Patient/${id}`;
    return this.makeRequest<Patient>('GET', url);
  }

  async searchPatients(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('Patient', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  async createPatient(patient: Partial<Patient>): Promise<FHIRResponse<Patient>> {
    const url = `${this.baseUrl}/Patient`;
    return this.makeRequest<Patient>('POST', url, patient);
  }

  async updatePatient(id: string, patient: Partial<Patient>): Promise<FHIRResponse<Patient>> {
    const url = `${this.baseUrl}/Patient/${id}`;
    return this.makeRequest<Patient>('PUT', url, patient);
  }

  async deletePatient(id: string): Promise<FHIRResponse<void>> {
    const url = `${this.baseUrl}/Patient/${id}`;
    return this.makeRequest<void>('DELETE', url);
  }

  // Observation Operations (Vital Signs, Lab Results)
  async getObservation(id: string): Promise<FHIRResponse<Observation>> {
    const url = `${this.baseUrl}/Observation/${id}`;
    return this.makeRequest<Observation>('GET', url);
  }

  async searchObservations(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('Observation', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  async createObservation(observation: Partial<Observation>): Promise<FHIRResponse<Observation>> {
    const url = `${this.baseUrl}/Observation`;
    return this.makeRequest<Observation>('POST', url, observation);
  }

  // Condition Operations (Diagnoses)
  async getCondition(id: string): Promise<FHIRResponse<Condition>> {
    const url = `${this.baseUrl}/Condition/${id}`;
    return this.makeRequest<Condition>('GET', url);
  }

  async searchConditions(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('Condition', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  async createCondition(condition: Partial<Condition>): Promise<FHIRResponse<Condition>> {
    const url = `${this.baseUrl}/Condition`;
    return this.makeRequest<Condition>('POST', url, condition);
  }

  // MedicationRequest Operations
  async getMedicationRequest(id: string): Promise<FHIRResponse<MedicationRequest>> {
    const url = `${this.baseUrl}/MedicationRequest/${id}`;
    return this.makeRequest<MedicationRequest>('GET', url);
  }

  async searchMedicationRequests(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('MedicationRequest', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  async createMedicationRequest(medicationRequest: Partial<MedicationRequest>): Promise<FHIRResponse<MedicationRequest>> {
    const url = `${this.baseUrl}/MedicationRequest`;
    return this.makeRequest<MedicationRequest>('POST', url, medicationRequest);
  }

  // AllergyIntolerance Operations
  async getAllergyIntolerance(id: string): Promise<FHIRResponse<AllergyIntolerance>> {
    const url = `${this.baseUrl}/AllergyIntolerance/${id}`;
    return this.makeRequest<AllergyIntolerance>('GET', url);
  }

  async searchAllergyIntolerances(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('AllergyIntolerance', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  async createAllergyIntolerance(allergy: Partial<AllergyIntolerance>): Promise<FHIRResponse<AllergyIntolerance>> {
    const url = `${this.baseUrl}/AllergyIntolerance`;
    return this.makeRequest<AllergyIntolerance>('POST', url, allergy);
  }

  // Encounter Operations (Appointments)
  async getEncounter(id: string): Promise<FHIRResponse<Encounter>> {
    const url = `${this.baseUrl}/Encounter/${id}`;
    return this.makeRequest<Encounter>('GET', url);
  }

  async searchEncounters(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('Encounter', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  async createEncounter(encounter: Partial<Encounter>): Promise<FHIRResponse<Encounter>> {
    const url = `${this.baseUrl}/Encounter`;
    return this.makeRequest<Encounter>('POST', url, encounter);
  }

  async updateEncounter(id: string, encounter: Partial<Encounter>): Promise<FHIRResponse<Encounter>> {
    const url = `${this.baseUrl}/Encounter/${id}`;
    return this.makeRequest<Encounter>('PUT', url, encounter);
  }

  // Coverage Operations (Insurance)
  async getCoverage(id: string): Promise<FHIRResponse<Coverage>> {
    const url = `${this.baseUrl}/Coverage/${id}`;
    return this.makeRequest<Coverage>('GET', url);
  }

  async searchCoverage(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('Coverage', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  // DiagnosticReport Operations
  async getDiagnosticReport(id: string): Promise<FHIRResponse<DiagnosticReport>> {
    const url = `${this.baseUrl}/DiagnosticReport/${id}`;
    return this.makeRequest<DiagnosticReport>('GET', url);
  }

  async searchDiagnosticReports(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('DiagnosticReport', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  // Practitioner Operations
  async getPractitioner(id: string): Promise<FHIRResponse<Practitioner>> {
    const url = `${this.baseUrl}/Practitioner/${id}`;
    return this.makeRequest<Practitioner>('GET', url);
  }

  async searchPractitioners(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('Practitioner', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  // Organization Operations
  async getOrganization(id: string): Promise<FHIRResponse<Organization>> {
    const url = `${this.baseUrl}/Organization/${id}`;
    return this.makeRequest<Organization>('GET', url);
  }

  async searchOrganizations(params?: FHIRSearchParams): Promise<FHIRResponse<Bundle>> {
    const url = this.buildSearchUrl('Organization', params);
    return this.makeRequest<Bundle>('GET', url);
  }

  // Test connection
  async testConnection(): Promise<FHIRResponse<any>> {
    try {
      const capabilityResponse = await this.getCapabilityStatement();
      if (capabilityResponse.success) {
        return {
          success: true,
          data: {
            status: 'connected',
            server: capabilityResponse.data?.software?.name || 'Unknown',
            version: capabilityResponse.data?.fhirVersion || 'Unknown'
          }
        };
      }
      return capabilityResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

// Factory function for creating client instances
export function createFHIRClient(config: FHIRClientConfig): FHIRClient {
  return new FHIRClient(config);
}

// Default Practice Fusion configuration for development
export const PRACTICE_FUSION_CONFIG = {
  baseUrl: 'https://api.practicefusion.com/fhir/dstu2', // This would need to be updated with actual endpoint
  clientId: process.env.NEXT_PUBLIC_PRACTICE_FUSION_CLIENT_ID || '',
  clientSecret: process.env.PRACTICE_FUSION_CLIENT_SECRET || ''
};

// Default Oracle Health configuration for development
export const ORACLE_HEALTH_CONFIG = {
  baseUrl: 'https://api.oracle.com/health/fhir', // This would need to be updated with actual endpoint
  clientId: process.env.NEXT_PUBLIC_ORACLE_HEALTH_CLIENT_ID || '',
  clientSecret: process.env.ORACLE_HEALTH_CLIENT_SECRET || ''
};