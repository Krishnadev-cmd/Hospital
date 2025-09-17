# Hospital EHR Management System

A comprehensive Electronic Health Records (EHR) system built with Next.js 15, integrating with FHIR R4 APIs to provide a complete healthcare management dashboard with enterprise-grade architecture and security.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![FHIR](https://img.shields.io/badge/FHIR-R4-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC)
![Oracle Health](https://img.shields.io/badge/Oracle%20Health-API-red)

## 📋 Overview

A modern, responsive Electronic Health Records system designed for healthcare providers. Features comprehensive patient management, appointment scheduling, clinical documentation, billing operations, and FHIR R4-compliant data integration with Oracle Health APIs and HAPI FHIR test servers.

**Live Demo**: [https://hospital-er7fuy9dc-kdisop2003-gmailcoms-projects.vercel.app](https://hospital-er7fuy9dc-kdisop2003-gmailcoms-projects.vercel.app)



## 📚 API Discovery Document

### Complete Endpoint Discovery

Our EHR system integrates with multiple FHIR R4 compliant APIs to provide comprehensive healthcare functionality:

#### Oracle Health FHIR API Endpoints
- **Base URL**: `https://fhir-ehr-code.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d`
- **Authentication**: OAuth 2.0 with PKCE flow
- **FHIR Version**: R4

**Patient Management Endpoints:**
```
GET    /Patient              - Search patients with advanced filters
GET    /Patient/{id}         - Retrieve specific patient record
POST   /Patient              - Create new patient record
PUT    /Patient/{id}         - Update patient information
DELETE /Patient/{id}         - Deactivate patient record
```

**Appointment Management Endpoints:**
```
GET    /Appointment          - Search appointments by date/provider
GET    /Appointment/{id}     - Retrieve appointment details
POST   /Appointment          - Schedule new appointment
PUT    /Appointment/{id}     - Reschedule or update appointment
DELETE /Appointment/{id}     - Cancel appointment
```

**Clinical Data Endpoints:**
```
GET    /Observation          - Retrieve vital signs, lab results
POST   /Observation          - Record new observations
GET    /MedicationRequest    - Get medication prescriptions
POST   /MedicationRequest    - Create medication orders
GET    /AllergyIntolerance   - Patient allergy information
POST   /AllergyIntolerance   - Record new allergies
GET    /Condition            - Patient conditions and diagnoses
POST   /Condition            - Document new conditions
```

**Encounter & Billing Endpoints:**
```
GET    /Encounter            - Healthcare encounters/visits
POST   /Encounter            - Create new encounters
GET    /Coverage             - Insurance coverage information
GET    /Account              - Financial accounts and billing
```

#### HAPI FHIR Test Server Endpoints
- **Base URL**: `https://hapi.fhir.org/baseR4`
- **Authentication**: Open test server (no auth required)
- **FHIR Version**: R4

**Available Resources:**
- All FHIR R4 resources (Patient, Observation, Medication, etc.)
- Search capabilities with full FHIR search syntax
- Bundle operations for complex transactions
- Terminology services (CodeSystem, ValueSet)

### API Capabilities and Limitations

#### Oracle Health API Capabilities
✅ **Strengths:**
- Production-grade patient data access
- Real-time appointment scheduling
- Comprehensive clinical data integration
- Secure OAuth 2.0 authentication
- FHIR R4 compliance
- High availability and reliability

⚠️ **Limitations:**
- Rate limiting: 100 requests/minute
- Requires valid healthcare provider credentials
- Limited to specific organizational data
- Some advanced FHIR features not supported
- Sandbox environment restrictions

#### HAPI FHIR Test Server Capabilities
✅ **Strengths:**
- Complete FHIR R4 specification support
- No authentication required for testing
- Excellent for development and prototyping
- Full CRUD operations on all resources
- Advanced search capabilities
- Bundle transaction support

⚠️ **Limitations:**
- Test data only (not production)
- Data may be reset periodically
- No persistent storage guarantees
- Limited to 1000 requests/hour
- No real patient data

### Integration Architecture Decisions

#### Hybrid API Strategy
```typescript
// Primary: Oracle Health for production data
// Fallback: HAPI FHIR for testing and development

const apiConfig = {
  production: {
    baseUrl: process.env.ORACLE_HEALTH_BASE_URL,
    auth: 'oauth2-pkce'
  },
  development: {
    baseUrl: 'https://hapi.fhir.org/baseR4',
    auth: 'none'
  }
}
```

#### Service Layer Architecture
- **Abstraction Layer**: Common interface for all FHIR operations
- **Provider Pattern**: Switchable API providers based on environment
- **Caching Strategy**: Redis for frequently accessed data
- **Error Handling**: Graceful degradation with retry mechanisms

## 🛠️ Implementation Guide

### Integration Architecture

#### Core Integration Patterns

**1. Service Abstraction Pattern**
```typescript
// lib/fhir/service.ts
export class FHIRService {
  private client: FHIRClient;
  
  constructor(config: FHIRConfig) {
    this.client = new FHIRClient(config);
  }
  
  async getPatients(params: SearchParams): Promise<FHIRResponse<UIPatient[]>> {
    // Unified interface for all FHIR providers
  }
}
```

**2. Provider Strategy Pattern**
```typescript
// lib/fhir/client.ts
export class FHIRClient {
  private provider: OracleHealthProvider | HAPIFHIRProvider;
  
  constructor(config: FHIRConfig) {
    this.provider = config.environment === 'production' 
      ? new OracleHealthProvider(config)
      : new HAPIFHIRProvider(config);
  }
}
```

### Command Processing Logic

#### Request Processing Pipeline
```typescript
// Request Flow: UI → Service Layer → Client → Provider → API
export class RequestProcessor {
  async processRequest<T>(
    resource: string,
    operation: CRUDOperation,
    data?: any
  ): Promise<FHIRResponse<T>> {
    try {
      // 1. Validate input parameters
      const validatedData = await this.validate(data);
      
      // 2. Transform UI data to FHIR format
      const fhirData = this.transformToFHIR(validatedData);
      
      // 3. Execute API call with retry logic
      const response = await this.executeWithRetry(
        () => this.client.request(resource, operation, fhirData)
      );
      
      // 4. Transform FHIR response to UI format
      const uiData = this.transformFromFHIR(response.data);
      
      // 5. Cache successful responses
      await this.cacheResponse(resource, uiData);
      
      return { success: true, data: uiData };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
```

#### Error Processing Chain
```typescript
export class ErrorHandler {
  async handleError(error: FHIRError): Promise<FHIRResponse> {
    const errorChain = [
      this.handleNetworkError,
      this.handleAuthError,
      this.handleValidationError,
      this.handleFHIRError,
      this.handleGenericError
    ];
    
    for (const handler of errorChain) {
      const result = await handler(error);
      if (result.handled) return result.response;
    }
    
    return this.fallbackError(error);
  }
}
```

### State Management Approach

#### React Query Integration
```typescript
// hooks/useFHIRData.ts
export function useFHIRData<T>(
  resource: string,
  params?: SearchParams
) {
  return useQuery({
    queryKey: [resource, params],
    queryFn: () => fhirService.search<T>(resource, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      return failureCount < 3 && !isAuthError(error);
    }
  });
}
```

#### Global State Management
```typescript
// context/FHIRContext.tsx
interface FHIRContextState {
  currentPatient: UIPatient | null;
  selectedEncounter: UIEncounter | null;
  userSession: UserSession | null;
  apiStatus: 'connected' | 'disconnected' | 'error';
}

export const FHIRProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(fhirReducer, initialState);
  
  return (
    <FHIRContext.Provider value={{ state, dispatch }}>
      {children}
    </FHIRContext.Provider>
  );
};
```

#### Local State Synchronization
```typescript
// hooks/usePatientSync.ts
export function usePatientSync(patientId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/fhir/patients/${patientId}/events`);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      queryClient.setQueryData(['patient', patientId], update);
    };
    
    return () => eventSource.close();
  }, [patientId, queryClient]);
}
```

### Error Handling Strategies

#### Multi-Layer Error Handling

**1. Network Level**
```typescript
class NetworkErrorHandler {
  async handleNetworkError(error: AxiosError): Promise<ErrorResult> {
    if (error.code === 'NETWORK_ERROR') {
      // Retry with exponential backoff
      return this.retryWithBackoff(error.config);
    }
    
    if (error.response?.status === 429) {
      // Rate limit: wait and retry
      await this.waitForRateLimit(error.response.headers);
      return this.retry(error.config);
    }
    
    return { handled: false };
  }
}
```

**2. Authentication Level**
```typescript
class AuthErrorHandler {
  async handleAuthError(error: FHIRError): Promise<ErrorResult> {
    if (error.status === 401) {
      // Token expired: refresh and retry
      await this.refreshToken();
      return this.retry(error.originalRequest);
    }
    
    if (error.status === 403) {
      // Insufficient permissions: redirect to auth
      this.redirectToLogin();
      return { handled: true, response: this.permissionError() };
    }
    
    return { handled: false };
  }
}
```

**3. FHIR Specification Level**
```typescript
class FHIRErrorHandler {
  async handleFHIRError(error: FHIROperationOutcome): Promise<ErrorResult> {
    const issues = error.issue || [];
    
    for (const issue of issues) {
      switch (issue.severity) {
        case 'fatal':
          return this.handleFatalError(issue);
        case 'error':
          return this.handleValidationError(issue);
        case 'warning':
          this.logWarning(issue);
          break;
      }
    }
    
    return { handled: true, response: this.fhirError(error) };
  }
}
```

**4. User Interface Level**
```typescript
// components/ErrorBoundary.tsx
export class FHIRErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorInfo: {
        type: error.name,
        message: error.message,
        stack: error.stack
      }
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback errorInfo={this.state.errorInfo} />;
    }
    
    return this.props.children;
  }
}
```

### Performance Optimizations

#### Caching Strategy
```typescript
// lib/cache/FHIRCache.ts
export class FHIRCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry || Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  set<T>(key: string, data: T, customTTL?: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (customTTL || this.TTL)
    });
  }
}
```

#### Request Optimization
```typescript
// lib/optimization/RequestBatcher.ts
export class RequestBatcher {
  private batchQueue: BatchRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  
  async batchRequest<T>(
    resource: string,
    ids: string[]
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ resource, ids, resolve, reject });
      
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(this.processBatch.bind(this), 100);
      }
    });
  }
  
  private async processBatch(): Promise<void> {
    const currentBatch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = null;
    
    // Group requests by resource type
    const groupedRequests = this.groupByResource(currentBatch);
    
    // Execute batch requests
    for (const [resource, requests] of groupedRequests) {
      await this.executeBatchForResource(resource, requests);
    }
  }
}
```

#### Component Optimization
```typescript
// hooks/useVirtualizedList.ts
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, items.length);
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, scrollTop, containerHeight]);
  
```

## ⚙️ Code Requirements

### Development Environment Setup

#### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (or yarn 1.22.0+)
- **TypeScript**: Version 5.0.0 or higher
- **Next.js**: Version 15.0.0 (App Router)
- **React**: Version 18.0.0 or higher

#### Runtime Dependencies
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.263.1",
    "next": "15.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.7",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "15.0.3",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

#### Environment Configuration
```bash
# .env.local (Required Environment Variables)

# FHIR API Configuration
NEXT_PUBLIC_FHIR_BASE_URL=https://hapi.fhir.org/baseR4
NEXT_PUBLIC_ORACLE_HEALTH_URL=https://fhir-ehr-code.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d

# Oracle Health API Credentials (Production)
ORACLE_HEALTH_CLIENT_ID=your-client-id
ORACLE_HEALTH_CLIENT_SECRET=your-client-secret
ORACLE_HEALTH_REDIRECT_URI=http://localhost:3000/auth/callback

# Application Configuration
NEXT_PUBLIC_APP_NAME=Hospital EHR System
NEXT_PUBLIC_APP_VERSION=2.1.0
NEXT_PUBLIC_API_TIMEOUT=30000

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_MOCK_DATA=false

# Security Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key

# Database Configuration (Optional)
DATABASE_URL=postgresql://username:password@localhost:5432/hospital_ehr
REDIS_URL=redis://localhost:6379

# Logging Configuration
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_TRACKING=true
```

### Project Structure Requirements

#### Mandatory Directory Structure
```
hospital/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes (FHIR endpoints)
│   │   └── fhir/                 # FHIR API implementation
│   │       ├── patients/         # Patient management endpoints
│   │       ├── encounters/       # Appointment/encounter endpoints
│   │       ├── observations/     # Vital signs and lab results
│   │       ├── medications/      # Medication management
│   │       ├── conditions/       # Patient conditions
│   │       ├── allergies/        # Allergy management
│   │       └── billing/          # Billing and insurance
│   ├── dashboard/                # Main application dashboard
│   ├── patients/                 # Patient management pages
│   ├── appointments/             # Appointment management
│   ├── clinical/                 # Clinical workflow pages
│   └── billing/                  # Billing and financial pages
├── components/                   # React components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── patients/                 # Patient-specific components
│   ├── appointments/             # Appointment components
│   ├── clinical/                 # Clinical workflow components
│   ├── billing/                  # Billing components
│   └── reports/                  # Reporting components
├── lib/                          # Utility libraries
│   ├── fhir/                     # FHIR client and services
│   ├── services/                 # Business logic services
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Helper functions
├── public/                       # Static assets
├── postman/                      # API testing collections
└── docs/                         # Documentation
```

#### Core File Requirements

**1. FHIR Service Layer (`lib/fhir/service.ts`)**
```typescript
// Required interface for all FHIR operations
export interface FHIRService {
  // Patient operations
  searchPatients(params: SearchParams): Promise<FHIRResponse<UIPatient[]>>;
  getPatient(id: string): Promise<FHIRResponse<UIPatient>>;
  createPatient(patient: UIPatient): Promise<FHIRResponse<UIPatient>>;
  updatePatient(id: string, patient: UIPatient): Promise<FHIRResponse<UIPatient>>;
  
  // Clinical operations
  recordVitals(patientId: string, vitals: VitalsData): Promise<FHIRResponse<UIObservation[]>>;
  prescribeMedication(prescription: MedicationRequest): Promise<FHIRResponse<UIMedicationRequest>>;
  addClinicalNote(patientId: string, note: ClinicalNote): Promise<FHIRResponse<UICondition>>;
  
  // Appointment operations
  searchEncounters(params: EncounterSearchParams): Promise<FHIRResponse<UIEncounter[]>>;
  createEncounter(encounter: UIEncounter): Promise<FHIRResponse<UIEncounter>>;
  updateEncounter(id: string, encounter: UIEncounter): Promise<FHIRResponse<UIEncounter>>;
  
  // Billing operations
  checkEligibility(eligibilityRequest: EligibilityRequest): Promise<FHIRResponse<EligibilityResponse>>;
  createInvoice(invoice: InvoiceData): Promise<FHIRResponse<UIInvoice>>;
  getCoverage(patientId: string): Promise<FHIRResponse<UICoverage[]>>;
}
```

**2. Type Definitions (`lib/types/index.ts`)**
```typescript
// Core UI types that match FHIR resources
export interface UIPatient {
  id: string;
  identifier: string;
  name: {
    family: string;
    given: string[];
  };
  birthDate: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  phone?: string;
  email?: string;
  address?: {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    memberId: string;
    groupNumber: string;
  };
}

export interface UIEncounter {
  id: string;
  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
  class: {
    code: string;
    display: string;
  };
  type: {
    code: string;
    display: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  period: {
    start: string;
    end?: string;
  };
  practitioner?: {
    reference: string;
    display: string;
  };
  location?: {
    reference: string;
    display: string;
  };
  reasonCode?: {
    coding: {
      system: string;
      code: string;
      display: string;
    }[];
  };
}

// Additional required types for all healthcare workflows
export interface UIObservation { /* ... */ }
export interface UIMedicationRequest { /* ... */ }
export interface UICondition { /* ... */ }
export interface UIAllergyIntolerance { /* ... */ }
export interface UICoverage { /* ... */ }
export interface UIInvoice { /* ... */ }
```

**3. API Route Pattern (`app/api/fhir/[resource]/route.ts`)**
```typescript
// Standard pattern for all FHIR API routes
import { NextRequest, NextResponse } from 'next/server';
import { fhirService } from '@/lib/fhir/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    
    const response = await fhirService.searchResource(params);
    
    if (!response.success) {
      return NextResponse.json(
        { error: response.error },
        { status: response.statusCode || 500 }
      );
    }
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('[FHIR API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const response = await fhirService.createResource(data);
    
    if (!response.success) {
      return NextResponse.json(
        { error: response.error },
        { status: response.statusCode || 500 }
      );
    }
    
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('[FHIR API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Component Architecture Requirements

#### Component Design Patterns

**1. Container/Presentational Pattern**
```typescript
// Container Component (Smart Component)
export function PatientListContainer() {
  const [patients, setPatients] = useState<UIPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadPatients();
  }, []);
  
  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fhir/patients');
      
      if (!response.ok) {
        throw new Error('Failed to load patients');
      }
      
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PatientListPresentation 
      patients={patients}
      loading={loading}
      error={error}
      onRefresh={loadPatients}
    />
  );
}

// Presentational Component (Dumb Component)
interface PatientListPresentationProps {
  patients: UIPatient[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function PatientListPresentation({
  patients,
  loading,
  error,
  onRefresh
}: PatientListPresentationProps) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={onRefresh} />;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patients</h2>
        <Button onClick={onRefresh}>Refresh</Button>
      </div>
      
      <div className="grid gap-4">
        {patients.map(patient => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
}
```

**2. Modal Component Pattern**
```typescript
// Required modal pattern for all forms
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BaseModal({ isOpen, onClose, title, children }: BaseModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Usage example
export function CreatePatientModal({ isOpen, onClose, onPatientCreated }: {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: UIPatient) => void;
}) {
  const [formData, setFormData] = useState<Partial<UIPatient>>({});
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/fhir/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to create patient');
      
      const patient = await response.json();
      onPatientCreated(patient);
      onClose();
    } catch (error) {
      console.error('Error creating patient:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create New Patient">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
        <button type="submit" disabled={loading} className="w-full btn-primary">
          {loading ? 'Creating...' : 'Create Patient'}
        </button>
      </form>
    </BaseModal>
  );
}
```

### Data Validation Requirements

#### Input Validation Schema
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const PatientSchema = z.object({
  name: z.object({
    family: z.string().min(1, 'Last name is required'),
    given: z.array(z.string().min(1, 'First name is required')).min(1)
  }),
  birthDate: z.string().refine(date => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed < new Date();
  }, 'Invalid birth date'),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  phone: z.string().optional().refine(phone => {
    if (!phone) return true;
    return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
  }, 'Invalid phone number format'),
  email: z.string().email().optional(),
  identifier: z.string().min(1, 'Patient identifier is required')
});

export const VitalsSchema = z.object({
  temperature: z.number().min(85).max(115).optional(),
  systolicBP: z.number().min(60).max(250).optional(),
  diastolicBP: z.number().min(30).max(150).optional(),
  heartRate: z.number().min(30).max(250).optional(),
  respiratoryRate: z.number().min(5).max(60).optional(),
  weight: z.number().min(0.1).max(1000).optional(),
  height: z.number().min(10).max(300).optional()
});

export const AppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  appointmentType: z.string().min(1, 'Appointment type is required'),
  scheduledDateTime: z.string().refine(date => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed > new Date();
  }, 'Appointment must be in the future'),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  practitioner: z.string().optional(),
  location: z.string().optional(),
  reason: z.string().min(1, 'Reason for visit is required')
});
```

### Testing Requirements

#### Unit Testing Setup
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Required Test Patterns
```typescript
// __tests__/components/PatientList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientListContainer } from '@/components/patients/PatientList';

describe('PatientList', () => {
  it('should load and display patients', async () => {
    render(<PatientListContainer />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Patients')).toBeInTheDocument();
    });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
  
  it('should handle search functionality', async () => {
    const user = userEvent.setup();
    render(<PatientListContainer />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search patients...')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search patients...');
    await user.type(searchInput, 'John');
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });
});

// __tests__/api/patients.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/fhir/patients/route';

describe('/api/fhir/patients', () => {
  it('GET should return patients list', async () => {
    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
  
  it('POST should create new patient', async () => {
    const patientData = {
      name: { family: 'Doe', given: ['John'] },
      birthDate: '1990-01-01',
      gender: 'male',
      identifier: 'PAT-123'
    };
    
    const { req } = createMocks({
      method: 'POST',
      body: patientData
    });
    
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.name.family).toBe('Doe');
  });
});
```

### Performance Requirements

#### Code Splitting Strategy
```typescript
// Dynamic imports for large components
const PatientList = dynamic(() => import('@/components/patients/PatientList'), {
  loading: () => <LoadingSkeleton />,
  ssr: false
});

const ReportsModule = dynamic(() => import('@/components/reports/Reports'), {
  loading: () => <div>Loading reports...</div>
});

// Route-level code splitting
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {children}
    </Suspense>
  );
}
```

#### Caching Requirements
```typescript
// lib/cache/index.ts
class CacheManager {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();

// Usage in API routes
export async function GET(request: NextRequest) {
  const cacheKey = `patients_${request.url}`;
  
  // Check cache first
  let patients = cacheManager.get<UIPatient[]>(cacheKey);
  
  if (!patients) {
    // Fetch from FHIR API
    patients = await fhirService.searchPatients();
    cacheManager.set(cacheKey, patients, 10 * 60 * 1000); // 10 minutes
  }
  
  return NextResponse.json(patients);
}
```

### Security Requirements

#### Authentication & Authorization
```typescript
// lib/auth/middleware.ts
export async function validateRequest(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return { error: 'Missing authorization token', status: 401 };
  }
  
  try {
    const payload = await verifyJWT(token);
    
    // Check user permissions
    if (!hasRequiredPermissions(payload, request.url)) {
      return { error: 'Insufficient permissions', status: 403 };
    }
    
    return { user: payload, status: 200 };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const auth = await validateRequest(request);
  
  if (auth.status !== 200) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  
  // Process authenticated request
}
```

#### Data Sanitization
```typescript
// lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

export function sanitizePatientData(patient: Partial<UIPatient>): Partial<UIPatient> {
  return {
    ...patient,
    name: patient.name ? {
      family: sanitizeInput(patient.name.family),
      given: patient.name.given?.map(name => sanitizeInput(name))
    } : undefined,
    phone: patient.phone ? sanitizeInput(patient.phone) : undefined,
    email: patient.email ? sanitizeInput(patient.email) : undefined
  };
}
```

### Deployment Requirements

#### Build Configuration
```typescript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/fhir/:path*',
        destination: '/api/fhir/:path*',
      },
    ];
  },
};

export default nextConfig;
```

#### Production Checklist
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS policies set
- [ ] Rate limiting implemented
- [ ] Error monitoring enabled
- [ ] Health check endpoints
- [ ] Database migrations run
- [ ] Cache warming strategies
- [ ] CDN configuration
- [ ] Security headers configured



### 🏥 Core EHR Functionality### ✅ Core Healthcare Workflows

- **Patient Management**: Complete patient registration, profiles, and medical history

- **Appointment Scheduling**: Comprehensive appointment booking and management system#### Patient Management

- **Clinical Operations**: Vital signs, clinical notes, and medication management- **Search & Retrieve**: Advanced patient search by name, ID, phone, email with fuzzy matching

- **Billing & Insurance**: Financial management, insurance claims, and payment tracking- **View Patient Records**: Complete patient demographics, contact information, and medical history

- **Reports & Analytics**: Healthcare analytics, patient demographics, and financial reports- **Update Demographics**: Edit patient contact information, addresses, and emergency contacts

- **CRUD Operations**: Full Create, Read, Update, Delete operations for patient records

### 🔐 Authentication & Security- **Data Validation**: Comprehensive form validation with error handling

- **Supabase Auth**: Secure authentication with Google OAuth

- **Row Level Security**: Database-level security policies#### Appointment Scheduling

- **PKCE Flow**: Enhanced security for OAuth flows- **View Appointments**: Filter by date, provider, patient, and status

- **Book New Appointments**: Create appointments with availability checking

## Tech Stack- **Reschedule/Cancel**: Modify or cancel existing appointments

- **Conflict Resolution**: Check for scheduling conflicts and overlaps

### Frontend- **Provider Availability**: Check practitioner schedules and availability

- **Next.js 15** with App Router and Turbopack- **Today's Schedule**: Quick view of current day appointments

- **React 18** with TypeScript

- **Tailwind CSS** for styling#### Clinical Operations (Architecture Ready)

- **Radix UI** for accessible components- **Vital Signs Recording**: Framework for height, weight, blood pressure, temperature

- **Lab Results Management**: Structure for diagnostic reports and lab data

### Backend & Database- **Medication Management**: CRUD operations for prescriptions and medication lists

- **Supabase** (PostgreSQL + Authentication)- **Clinical Notes**: Interface for adding and managing clinical documentation

- **Real-time subscriptions**- **Allergy Management**: Track and manage patient allergies and reactions

- **Row Level Security (RLS)**

#### Billing & Administrative (Framework)

## Getting Started- **Insurance Verification**: Structure for checking coverage and eligibility

- **Payment Processing**: Framework for billing and payment management

### Prerequisites- **Reporting**: Basic analytics and reporting capabilities

- Node.js 18+ 

- npm or yarn## 🏗️ Technical Architecture

- Supabase account

### Frontend Stack

### Installation- **Next.js 15** with App Router and Turbopack

- **TypeScript** for type safety

1. **Clone the repository**- **Tailwind CSS** for styling

```bash- **Radix UI** components for accessibility

git clone <repository-url>- **Lucide React** for icons

cd hospital-ehr-system- **React Hook Form** with Zod validation

```

### Backend Integration

2. **Install dependencies**- **Oracle Health FHIR R4 APIs**

```bash- **Comprehensive FHIR Resource Types**:

npm install  - Patient, Appointment, Practitioner

```  - Observation, MedicationRequest, AllergyIntolerance

  - Coverage, Encounter, DiagnosticReport

3. **Environment Setup**- **Secure Authentication** with OAuth2/PKCE flow

Create a `.env.local` file:- **Error Handling** with retry mechanisms

```env- **Pagination** support for large datasets

# FHIR Server Configuration
FHIR_BASE_URL=your-fhir-server-url
FHIR_CLIENT_ID=your-fhir-client-id
FHIR_CLIENT_SECRET=your-fhir-client-secret
FHIR_ACCESS_TOKEN=your-access-token

### Security Features

```- **Supabase Authentication** with Google OAuth

- **PKCE Flow** for secure authorization

4. **Database Setup**- **Environment Variables** for sensitive configuration

Run the SQL schema in your FHIR server (see `FHIR-SERVER-SETUP.md`)- **Input Validation** and sanitization

- **Error Boundaries** and graceful degradation

5. **Start the development server**

```bash## 📁 Project Structure

npm run dev

``````

hospital/

## Application Structure├── app/                    # Next.js App Router

│   ├── dashboard/         # Main EHR dashboard

```│   ├── api/              # API route handlers

├── app/                   # Next.js app directory│   ├── auth/             # Authentication pages

│   ├── dashboard/         # Main dashboard│   └── login/            # Login interface

│   └── login/            # Authentication├── components/            # React components

├── components/           │   ├── dashboard/        # Dashboard components

│   ├── patients/         # Patient management│   ├── patients/         # Patient management UI

│   ├── appointments/     # Appointment components│   ├── appointments/     # Appointment scheduling

│   ├── clinical/         # Clinical operations│   ├── clinical/         # Clinical operations

│   ├── billing/          # Billing management│   ├── billing/          # Billing interfaces

│   └── reports/          # Analytics and reports│   └── ui/              # Reusable UI components

├── lib/├── lib/                  # Core libraries

│   ├── api/             # FHIR API integration

│   └── types/           # TypeScript definitions│   ├── types/           # TypeScript definitions

└── database/│   └── utils/           # Utility functions

    └── schema.sql        # Database schema└── public/              # Static assets

``````



## License## 🚀 Getting Started



MIT License - see LICENSE file for details.### Prerequisites
- Node.js 18+ 
- npm or yarn
- Oracle Health API credentials (or use demo mode)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd hospital
npm install
```

2. **Configure environment variables:**
```bash
# .env.local
FHIR_BASE_URL=your-fhir-server-url
FHIR_CLIENT_ID=your-fhir-client-id
FHIR_CLIENT_SECRET=your-fhir-client-secret
FHIR_ACCESS_TOKEN=your-access-token

# EHR API Configuration
NEXT_PUBLIC_EHR_BASE_URL=https://fhir-ehr-code.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d
NEXT_PUBLIC_EHR_CLIENT_ID=your-client-id
EHR_CLIENT_SECRET=your-client-secret
EHR_API_KEY=your-api-key

# Development
NEXT_PUBLIC_USE_MOCK_DATA=true
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open in browser:**
```
http://localhost:3000 (or 3001 if 3000 is busy)
```

## 🔐 Authentication Flow

1. **Initial Access**: Navigate to the application
2. **Login Required**: Redirected to Google OAuth login
3. **OAuth Flow**: Secure PKCE authentication via FHIR-compliant identity providers
4. **Session Management**: Persistent sessions with auto-refresh
5. **Dashboard Access**: Full EHR functionality after authentication

## 📊 Dashboard Features

### Overview Section
- **Key Metrics**: Patient count, appointments, pending results, revenue
- **Recent Activity**: Latest appointments and tasks
- **Quick Actions**: One-click access to common functions

### Patient Management
- **Advanced Search**: Multi-field patient lookup
- **Patient Cards**: Rich information display with contact details
- **Quick Actions**: View, edit, or create patient records
- **Pagination**: Efficient handling of large patient lists

### Real-time Updates
- **Live Data**: Real-time synchronization with EHR systems
- **Status Indicators**: Visual feedback for all operations
- **Error Handling**: Graceful degradation and retry mechanisms

## 🔧 API Integration

### FHIR Compliance
- **FHIR R4 Standard** implementation
- **Resource Mapping** between UI forms and FHIR resources
- **Search Parameters** for efficient queries
- **Bundle Handling** for complex operations

### Error Handling
- **Network Resilience**: Retry mechanisms and timeouts
- **User Feedback**: Clear error messages and recovery options
- **Fallback Mode**: Mock data for development and testing

### Performance
- **Lazy Loading**: Components load on demand
- **Pagination**: Efficient data fetching
- **Caching**: Intelligent caching strategies
- **Debounced Search**: Optimized search performance

## 🎨 UI/UX Design

### Design System
- **Consistent Styling**: Tailwind CSS with custom components
- **Accessibility**: WCAG compliant with screen reader support
- **Responsive Design**: Mobile-first approach
- **Loading States**: Smooth transitions and feedback

### User Experience
- **Intuitive Navigation**: Clear information hierarchy
- **Quick Actions**: Common tasks easily accessible
- **Visual Feedback**: Status indicators and progress bars
- **Error Recovery**: Clear paths to resolve issues

## 🧪 Development Mode

### Mock Data
- **Patient Records**: Sample patient data for testing
- **Appointments**: Mock appointment schedules
- **API Responses**: Simulated EHR API responses
- **Error States**: Testing error handling scenarios

### Features Available in Demo
- **Patient Search**: Find and view patient records
- **Patient Details**: Complete patient information display
- **Dashboard Metrics**: Sample healthcare analytics
- **Navigation**: Full dashboard navigation experience

## 🔜 Future Enhancements

### Planned Features
1. **Clinical Workflows**: Complete vital signs and lab results
2. **Billing Integration**: Insurance verification and claims
3. **Reporting Suite**: Advanced analytics and dashboards
4. **Mobile App**: React Native companion app
5. **Real-time Notifications**: WebSocket integration
6. **Multi-tenant Support**: Hospital and clinic management

### Technical Improvements
1. **Offline Support**: Progressive Web App capabilities
2. **Performance**: Advanced caching and optimization
3. **Testing**: Comprehensive test suite
4. **Documentation**: API documentation and user guides
5. **Deployment**: Production deployment guides

## 📞 Support

For technical support or questions about implementation:
- Review the API documentation
- Check environment configuration
- Verify authentication setup
- Test with mock data first

This EHR system demonstrates enterprise-grade healthcare software development with modern web technologies, FHIR compliance, and comprehensive security measures.
