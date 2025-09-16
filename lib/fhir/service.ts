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
  HumanName,
  ContactPoint,
  Address,
  CodeableConcept,
  Identifier,
  Period
} from './types';
import { FHIRClient, FHIRResponse } from './client';

// Transformed data types for the UI (similar to Supabase interfaces)
export interface UIPatient {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  phone?: string;
  email?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
  mrn?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UIEncounter {
  id: string;
  patientId: string;
  status: string;
  type?: string;
  date: string;
  endDate?: string;
  reason?: string;
  practitioner?: string;
  location?: string;
  serviceProvider?: string;
}

export interface UIObservation {
  id: string;
  patientId: string;
  encounterId?: string;
  category: string;
  code: string;
  display: string;
  status: string;
  effectiveDate: string;
  value?: string;
  unit?: string;
  interpretation?: string;
  performer?: string;
}

export interface UICondition {
  id: string;
  patientId: string;
  encounterId?: string;
  code: string;
  display: string;
  clinicalStatus?: string;
  verificationStatus?: string;
  severity?: string;
  onsetDate?: string;
  recordedDate?: string;
  asserter?: string;
}

export interface UIMedicationRequest {
  id: string;
  patientId: string;
  encounterId?: string;
  medication: string;
  status: string;
  intent: string;
  priority?: string;
  authoredDate: string;
  requester?: string;
  dosage?: string;
  dispenseQuantity?: number;
  dispenseUnit?: string;
}

export interface UIAllergyIntolerance {
  id: string;
  patientId: string;
  substance: string;
  category?: string;
  criticality?: string;
  clinicalStatus?: string;
  type?: string;
  onsetDate?: string;
  reactions?: string[];
  notes?: string;
}

export interface UICoverage {
  id: string;
  patientId: string;
  subscriberId?: string;
  status: string;
  type?: string;
  period?: string;
  network?: string;
  payorName?: string;
}

// FHIR Service Class
export class FHIRService {
  private client: FHIRClient;

  constructor(client: FHIRClient) {
    this.client = client;
  }

  // Helper methods to transform FHIR resources to UI-friendly objects
  private transformPatient(fhirPatient: Patient): UIPatient {
    const name = this.extractHumanName(fhirPatient.name?.[0]);
    const telecom = fhirPatient.telecom || [];
    const address = fhirPatient.address?.[0];
    
    const phone = telecom.find(t => t.system === 'phone')?.value;
    const email = telecom.find(t => t.system === 'email')?.value;
    
    const mrn = fhirPatient.identifier?.find(id => 
      id.type?.coding?.some(c => c.code === 'MR')
    )?.value;

    return {
      id: fhirPatient.id!,
      first_name: name.given || '',
      last_name: name.family || '',
      middle_name: name.middle || '',
      date_of_birth: fhirPatient.birthDate || '',
      gender: fhirPatient.gender || 'unknown',
      phone,
      email,
      street_address: address?.line?.join(', '),
      city: address?.city,
      state: address?.state,
      postal_code: address?.postalCode,
      country: address?.country,
      active: fhirPatient.active ?? true,
      mrn: mrn,
      created_at: fhirPatient.meta?.lastUpdated || new Date().toISOString(),
      updated_at: fhirPatient.meta?.lastUpdated || new Date().toISOString()
    };
  }

  private extractHumanName(name?: HumanName): { given: string; family: string; middle?: string } {
    if (!name) return { given: '', family: '' };
    
    const given = name.given?.[0] || '';
    const middle = name.given?.[1];
    const family = name.family || '';
    
    return { given, family, middle };
  }

  private transformEncounter(fhirEncounter: Encounter): UIEncounter {
    const type = fhirEncounter.type?.[0]?.text || fhirEncounter.type?.[0]?.coding?.[0]?.display;
    const reasonCode = fhirEncounter.reasonCode?.[0]?.text || fhirEncounter.reasonCode?.[0]?.coding?.[0]?.display;
    const practitioner = fhirEncounter.participant?.find(p => 
      p.type?.[0]?.coding?.[0]?.code === 'ATND'
    )?.individual?.display;

    return {
      id: fhirEncounter.id!,
      patientId: this.extractReferenceId(fhirEncounter.subject?.reference),
      status: fhirEncounter.status,
      type,
      date: fhirEncounter.period?.start || new Date().toISOString(),
      endDate: fhirEncounter.period?.end,
      reason: reasonCode,
      practitioner,
      serviceProvider: fhirEncounter.serviceProvider?.display
    };
  }

  private transformObservation(fhirObservation: Observation): UIObservation {
    const category = fhirObservation.category?.[0]?.coding?.[0]?.display || 'Unknown';
    const code = fhirObservation.code?.coding?.[0]?.code || '';
    const display = fhirObservation.code?.text || fhirObservation.code?.coding?.[0]?.display || '';
    
    let value = '';
    let unit = '';
    
    if (fhirObservation.valueQuantity) {
      value = fhirObservation.valueQuantity.value?.toString() || '';
      unit = fhirObservation.valueQuantity.unit || '';
    } else if (fhirObservation.valueString) {
      value = fhirObservation.valueString;
    } else if (fhirObservation.valueCodeableConcept) {
      value = fhirObservation.valueCodeableConcept.text || fhirObservation.valueCodeableConcept.coding?.[0]?.display || '';
    }

    return {
      id: fhirObservation.id!,
      patientId: this.extractReferenceId(fhirObservation.subject?.reference),
      encounterId: this.extractReferenceId(fhirObservation.encounter?.reference),
      category,
      code,
      display,
      status: fhirObservation.status,
      effectiveDate: fhirObservation.effectiveDateTime || fhirObservation.effectivePeriod?.start || '',
      value,
      unit,
      interpretation: fhirObservation.interpretation?.[0]?.text,
      performer: fhirObservation.performer?.[0]?.display
    };
  }

  private transformCondition(fhirCondition: Condition): UICondition {
    const code = fhirCondition.code?.coding?.[0]?.code || '';
    const display = fhirCondition.code?.text || fhirCondition.code?.coding?.[0]?.display || '';

    return {
      id: fhirCondition.id!,
      patientId: this.extractReferenceId(fhirCondition.subject.reference),
      encounterId: this.extractReferenceId(fhirCondition.encounter?.reference),
      code,
      display,
      clinicalStatus: fhirCondition.clinicalStatus?.coding?.[0]?.code,
      verificationStatus: fhirCondition.verificationStatus?.coding?.[0]?.code,
      severity: fhirCondition.severity?.text || fhirCondition.severity?.coding?.[0]?.display,
      onsetDate: fhirCondition.onsetDateTime || fhirCondition.onsetPeriod?.start,
      recordedDate: fhirCondition.recordedDate,
      asserter: fhirCondition.asserter?.display
    };
  }

  private transformMedicationRequest(fhirMedRequest: MedicationRequest): UIMedicationRequest {
    const medication = fhirMedRequest.medicationCodeableConcept?.text || 
                     fhirMedRequest.medicationCodeableConcept?.coding?.[0]?.display ||
                     fhirMedRequest.medicationReference?.display || '';

    const dosage = fhirMedRequest.dosageInstruction?.[0]?.text;

    return {
      id: fhirMedRequest.id!,
      patientId: this.extractReferenceId(fhirMedRequest.subject.reference),
      encounterId: this.extractReferenceId(fhirMedRequest.encounter?.reference),
      medication,
      status: fhirMedRequest.status,
      intent: fhirMedRequest.intent,
      priority: fhirMedRequest.priority,
      authoredDate: fhirMedRequest.authoredOn || '',
      requester: fhirMedRequest.requester?.display,
      dosage,
      dispenseQuantity: fhirMedRequest.dispenseRequest?.quantity?.value,
      dispenseUnit: fhirMedRequest.dispenseRequest?.quantity?.unit
    };
  }

  private transformAllergyIntolerance(fhirAllergy: AllergyIntolerance): UIAllergyIntolerance {
    const substance = fhirAllergy.code?.text || fhirAllergy.code?.coding?.[0]?.display || '';
    const reactions = fhirAllergy.reaction?.flatMap(r => 
      r.manifestation.map(m => m.text || m.coding?.[0]?.display || '')
    ).filter(Boolean);

    return {
      id: fhirAllergy.id!,
      patientId: this.extractReferenceId(fhirAllergy.patient.reference),
      substance,
      category: fhirAllergy.category?.[0],
      criticality: fhirAllergy.criticality,
      clinicalStatus: fhirAllergy.clinicalStatus?.coding?.[0]?.code,
      type: fhirAllergy.type,
      onsetDate: fhirAllergy.onsetDateTime || fhirAllergy.onsetPeriod?.start,
      reactions,
      notes: fhirAllergy.note?.[0]?.text
    };
  }

  private transformCoverage(fhirCoverage: Coverage): UICoverage {
    return {
      id: fhirCoverage.id!,
      patientId: this.extractReferenceId(fhirCoverage.beneficiary.reference),
      subscriberId: fhirCoverage.subscriberId,
      status: fhirCoverage.status,
      type: fhirCoverage.type?.text || fhirCoverage.type?.coding?.[0]?.display,
      period: fhirCoverage.period ? `${fhirCoverage.period.start} - ${fhirCoverage.period.end}` : undefined,
      network: fhirCoverage.network,
      payorName: fhirCoverage.payor?.[0]?.display
    };
  }

  private extractReferenceId(reference?: string): string {
    if (!reference) return '';
    const parts = reference.split('/');
    return parts[parts.length - 1];
  }

  private transformBundleEntries<T, U>(
    bundle: Bundle, 
    transformer: (resource: T) => U
  ): U[] {
    return bundle.entry?.map(entry => transformer(entry.resource as T)) || [];
  }

  // Patient Operations
  async getPatients(params?: { 
    search?: string; 
    limit?: number; 
    family?: string; 
    given?: string;
    identifier?: string;
  }): Promise<FHIRResponse<UIPatient[]>> {
    const searchParams: any = {
      _count: params?.limit || 50
    };

    if (params?.search) {
      searchParams.name = params.search;
    }
    if (params?.family) {
      searchParams.family = params.family;
    }
    if (params?.given) {
      searchParams.given = params.given;
    }
    if (params?.identifier) {
      searchParams.identifier = params.identifier;
    }

    const response = await this.client.searchPatients(searchParams);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiPatients = this.transformBundleEntries(response.data!, this.transformPatient.bind(this));
    
    return {
      success: true,
      data: uiPatients
    };
  }

  async getPatient(id: string): Promise<FHIRResponse<UIPatient>> {
    const response = await this.client.getPatient(id);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiPatient = this.transformPatient(response.data!);
    
    return {
      success: true,
      data: uiPatient
    };
  }

  async createPatient(patientData: Partial<UIPatient>): Promise<FHIRResponse<UIPatient>> {
    const fhirPatient: Partial<Patient> = {
      resourceType: 'Patient',
      active: patientData.active ?? true,
      name: [{
        family: patientData.last_name,
        given: [patientData.first_name, patientData.middle_name].filter(Boolean) as string[]
      }],
      gender: patientData.gender,
      birthDate: patientData.date_of_birth,
      telecom: [
        ...(patientData.phone ? [{ system: 'phone' as const, value: patientData.phone }] : []),
        ...(patientData.email ? [{ system: 'email' as const, value: patientData.email }] : [])
      ],
      address: patientData.street_address ? [{
        line: [patientData.street_address],
        city: patientData.city,
        state: patientData.state,
        postalCode: patientData.postal_code,
        country: patientData.country
      }] : undefined
    };

    const response = await this.client.createPatient(fhirPatient);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiPatient = this.transformPatient(response.data!);
    
    return {
      success: true,
      data: uiPatient
    };
  }

  async updatePatient(id: string, patientData: Partial<UIPatient>): Promise<FHIRResponse<UIPatient>> {
    const fhirPatient: Partial<Patient> = {
      resourceType: 'Patient',
      id,
      active: patientData.active,
      name: [{
        family: patientData.last_name,
        given: [patientData.first_name, patientData.middle_name].filter(Boolean) as string[]
      }],
      gender: patientData.gender,
      birthDate: patientData.date_of_birth,
      telecom: [
        ...(patientData.phone ? [{ system: 'phone' as const, value: patientData.phone }] : []),
        ...(patientData.email ? [{ system: 'email' as const, value: patientData.email }] : [])
      ],
      address: patientData.street_address ? [{
        line: [patientData.street_address],
        city: patientData.city,
        state: patientData.state,
        postalCode: patientData.postal_code,
        country: patientData.country
      }] : undefined
    };

    const response = await this.client.updatePatient(id, fhirPatient);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiPatient = this.transformPatient(response.data!);
    
    return {
      success: true,
      data: uiPatient
    };
  }

  async deletePatient(id: string): Promise<FHIRResponse<void>> {
    try {
      const response = await this.client.deletePatient(id);
      
      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to delete patient',
          statusCode: response.statusCode
        };
      }

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        statusCode: 500
      };
    }
  }

  // Encounter Operations
  async getEncounters(params?: { 
    patientId?: string; 
    date?: string;
    status?: string;
    limit?: number; 
  }): Promise<FHIRResponse<UIEncounter[]>> {
    const searchParams: any = {
      _count: params?.limit || 50
    };

    if (params?.patientId) {
      searchParams.patient = params.patientId;
    }
    if (params?.date) {
      searchParams.date = params.date;
    }
    if (params?.status) {
      searchParams.status = params.status;
    }

    const response = await this.client.searchEncounters(searchParams);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiEncounters = this.transformBundleEntries(response.data!, this.transformEncounter.bind(this));
    
    return {
      success: true,
      data: uiEncounters
    };
  }

  // Clinical Operations
  async getObservations(params?: { 
    patientId?: string; 
    category?: string;
    code?: string;
    date?: string;
    limit?: number; 
  }): Promise<FHIRResponse<UIObservation[]>> {
    const searchParams: any = {
      _count: params?.limit || 50
    };

    if (params?.patientId) {
      searchParams.patient = params.patientId;
    }
    if (params?.category) {
      searchParams.category = params.category;
    }
    if (params?.code) {
      searchParams.code = params.code;
    }
    if (params?.date) {
      searchParams.date = params.date;
    }

    const response = await this.client.searchObservations(searchParams);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiObservations = this.transformBundleEntries(response.data!, this.transformObservation.bind(this));
    
    return {
      success: true,
      data: uiObservations
    };
  }

  async getVitalSigns(patientId: string): Promise<FHIRResponse<UIObservation[]>> {
    return this.getObservations({ 
      patientId, 
      category: 'vital-signs',
      limit: 100 
    });
  }

  async getLabResults(patientId: string): Promise<FHIRResponse<UIObservation[]>> {
    return this.getObservations({ 
      patientId, 
      category: 'laboratory',
      limit: 100 
    });
  }

  async getConditions(patientId: string): Promise<FHIRResponse<UICondition[]>> {
    const response = await this.client.searchConditions({ 
      patient: patientId,
      _count: 100 
    });
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiConditions = this.transformBundleEntries(response.data!, this.transformCondition.bind(this));
    
    return {
      success: true,
      data: uiConditions
    };
  }

  async getMedications(patientId: string): Promise<FHIRResponse<UIMedicationRequest[]>> {
    const response = await this.client.searchMedicationRequests({ 
      patient: patientId,
      _count: 100 
    });
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiMedications = this.transformBundleEntries(response.data!, this.transformMedicationRequest.bind(this));
    
    return {
      success: true,
      data: uiMedications
    };
  }

  async getAllergies(patientId: string): Promise<FHIRResponse<UIAllergyIntolerance[]>> {
    const response = await this.client.searchAllergyIntolerances({ 
      patient: patientId,
      _count: 100 
    });
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiAllergies = this.transformBundleEntries(response.data!, this.transformAllergyIntolerance.bind(this));
    
    return {
      success: true,
      data: uiAllergies
    };
  }

  // Insurance/Coverage Operations
  async getCoverage(patientId: string): Promise<FHIRResponse<UICoverage[]>> {
    const response = await this.client.searchCoverage({ 
      beneficiary: `Patient/${patientId}`,
      _count: 10 
    });
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiCoverage = this.transformBundleEntries(response.data!, this.transformCoverage.bind(this));
    
    return {
      success: true,
      data: uiCoverage
    };
  }

  async searchEncounters(params: {
    patientId?: string;
    date?: string;
    status?: string;
    limit?: number;
  }): Promise<FHIRResponse<UIEncounter[]>> {
    const searchParams: any = {};
    
    if (params.patientId) searchParams.patient = params.patientId;
    if (params.date) searchParams.date = params.date;
    if (params.status) searchParams.status = params.status;
    if (params.limit) searchParams._count = params.limit;

    const response = await this.client.searchEncounters(searchParams);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiEncounters = this.transformBundleEntries(response.data!, this.transformEncounter.bind(this));
    
    return {
      success: true,
      data: uiEncounters
    };
  }

  // Clinical Operations - Create Methods
  async createObservation(data: {
    patientId: string;
    category: string;
    code: string;
    value: any;
    unit?: string;
    notes?: string;
    status?: string;
  }): Promise<FHIRResponse<UIObservation>> {
    const observation: Observation = {
      resourceType: 'Observation',
      status: (data.status as any) || 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: data.category,
          display: data.category
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: data.code,
          display: data.code
        }]
      },
      subject: {
        reference: `Patient/${data.patientId}`
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: data.unit ? {
        value: parseFloat(data.value),
        unit: data.unit,
        system: 'http://unitsofmeasure.org',
        code: data.unit
      } : undefined,
      valueString: !data.unit ? String(data.value) : undefined,
      note: data.notes ? [{
        text: data.notes
      }] : undefined
    };

    const response = await this.client.createObservation(observation);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiObservation = this.transformObservation(response.data!);
    
    return {
      success: true,
      data: uiObservation
    };
  }

  async searchObservations(params: {
    patient?: string | null;
    category?: string | null;
    code?: string | null;
    date?: string | null;
    limit?: number;
  }): Promise<FHIRResponse<UIObservation[]>> {
    const searchParams: any = {};
    
    if (params.patient) searchParams.patient = params.patient;
    if (params.category) searchParams.category = params.category;
    if (params.code) searchParams.code = params.code;
    if (params.date) searchParams.date = params.date;
    if (params.limit) searchParams._count = params.limit;

    const response = await this.client.searchObservations(searchParams);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiObservations = this.transformBundleEntries(response.data!, this.transformObservation.bind(this));
    
    return {
      success: true,
      data: uiObservations
    };
  }

  async createCondition(data: {
    patientId: string;
    code: string;
    display: string;
    clinicalStatus?: string;
    verificationStatus?: string;
    severity?: string;
    onsetDate?: string;
    notes?: string;
  }): Promise<FHIRResponse<UICondition>> {
    const condition: Condition = {
      resourceType: 'Condition',
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: data.clinicalStatus || 'active'
        }]
      },
      verificationStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: data.verificationStatus || 'confirmed'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: data.code,
          display: data.display
        }]
      },
      subject: {
        reference: `Patient/${data.patientId}`
      },
      onsetDateTime: data.onsetDate || new Date().toISOString(),
      recordedDate: new Date().toISOString(),
      note: data.notes ? [{
        text: data.notes
      }] : undefined
    };

    const response = await this.client.createCondition(condition);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiCondition = this.transformCondition(response.data!);
    
    return {
      success: true,
      data: uiCondition
    };
  }

  async createMedicationRequest(data: {
    patientId: string;
    medication: string;
    dosage: string;
    quantity?: number;
    refills?: number;
    instructions?: string;
  }): Promise<FHIRResponse<UIMedicationRequest>> {
    const medicationRequest: MedicationRequest = {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [{
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: data.medication,
          display: data.medication
        }]
      },
      subject: {
        reference: `Patient/${data.patientId}`
      },
      authoredOn: new Date().toISOString(),
      dosageInstruction: [{
        text: data.dosage,
        patientInstruction: data.instructions
      }],
      dispenseRequest: data.quantity ? {
        quantity: {
          value: data.quantity,
          unit: 'tablet',
          system: 'http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm',
          code: 'TAB'
        },
        numberOfRepeatsAllowed: data.refills || 0
      } : undefined
    };

    const response = await this.client.createMedicationRequest(medicationRequest);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiMedicationRequest = this.transformMedicationRequest(response.data!);
    
    return {
      success: true,
      data: uiMedicationRequest
    };
  }

  async createAllergyIntolerance(data: {
    patientId: string;
    allergen: string;
    reaction?: string;
    severity?: string;
    type?: string;
    category?: string;
    notes?: string;
  }): Promise<FHIRResponse<UIAllergyIntolerance>> {
    const allergyIntolerance: AllergyIntolerance = {
      resourceType: 'AllergyIntolerance',
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
          code: 'active'
        }]
      },
      verificationStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
          code: 'confirmed'
        }]
      },
      type: (data.type as any) || 'allergy',
      category: [(data.category as any) || 'medication'],
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: data.allergen,
          display: data.allergen
        }]
      },
      patient: {
        reference: `Patient/${data.patientId}`
      },
      recordedDate: new Date().toISOString(),
      reaction: data.reaction || data.severity ? [{
        manifestation: [{
          coding: [{
            system: 'http://snomed.info/sct',
            code: data.reaction || 'unknown',
            display: data.reaction || 'unknown'
          }]
        }],
        severity: (data.severity as any) || 'mild'
      }] : undefined,
      note: data.notes ? [{
        text: data.notes
      }] : undefined
    };

    const response = await this.client.createAllergyIntolerance(allergyIntolerance);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error,
        statusCode: response.statusCode
      };
    }

    const uiAllergy = this.transformAllergyIntolerance(response.data!);
    
    return {
      success: true,
      data: uiAllergy
    };
  }

  // Test Connection
  async testConnection(): Promise<FHIRResponse<any>> {
    return this.client.testConnection();
  }
}