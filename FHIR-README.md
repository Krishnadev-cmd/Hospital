# Hospital EHR Integration Dashboard

A comprehensive Electronic Health Records (EHR) integration dashboard built with Next.js and FHIR (Fast Healthcare Interoperability Resources) standards.

## 🏥 Features

### Core Functionality
- **Patient Management**: Search, create, and update patient records using FHIR Patient resources
- **Appointment Scheduling**: Manage encounters and appointments through FHIR Encounter resources
- **Clinical Operations**: Record vitals, diagnoses, medications, and allergies using FHIR clinical resources
- **Billing Operations**: Manage insurance coverage and billing information through FHIR Coverage resources
- **Real-time Dashboard**: Live statistics and patient data visualization

### FHIR Integration
- **FHIR R4 Compliance**: Full support for FHIR R4 standard
- **SMART-on-FHIR**: OAuth2 authentication with EHR systems
- **Multiple EHR Support**: Compatible with PracticeFusion, Oracle Health, and other FHIR-compliant systems
- **Comprehensive Resources**: Support for Patient, Observation, Condition, MedicationRequest, AllergyIntolerance, Encounter, Coverage, and more

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FHIR server access (PracticeFusion, Oracle Health, or any FHIR R4 compliant server)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd hospital
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env.local` file in the root directory:
```env
# FHIR Server Configuration
FHIR_BASE_URL=https://api.practicefusion.com/fhir/R4
FHIR_CLIENT_ID=your-client-id
FHIR_CLIENT_SECRET=your-client-secret
# OR use direct access token
FHIR_ACCESS_TOKEN=your-access-token

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Access the application**
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 FHIR Configuration

### Using the Configuration Dashboard

1. Navigate to the **Configuration** section in the dashboard
2. Enter your FHIR server details:
   - **FHIR Base URL**: Your EHR system's FHIR endpoint
   - **Client ID**: OAuth2 client identifier
   - **Client Secret**: OAuth2 client secret
   - **Access Token**: Direct bearer token (alternative to client credentials)

3. Test the connection using the built-in connection tester
4. Save configuration for persistent use

### Supported EHR Systems

#### PracticeFusion
```env
FHIR_BASE_URL=https://api.practicefusion.com/fhir/R4
FHIR_CLIENT_ID=your-pf-client-id
FHIR_CLIENT_SECRET=your-pf-client-secret
```

#### Oracle Health (Cerner)
```env
FHIR_BASE_URL=https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d
FHIR_ACCESS_TOKEN=your-access-token
```

#### Epic (with proper credentials)
```env
FHIR_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
FHIR_CLIENT_ID=your-epic-client-id
FHIR_CLIENT_SECRET=your-epic-client-secret
```

## 📚 API Documentation

### FHIR API Endpoints

#### Patients
- `GET /api/fhir/patients` - Search patients
- `POST /api/fhir/patients` - Create new patient
- `GET /api/fhir/patients/[id]` - Get specific patient
- `PUT /api/fhir/patients/[id]` - Update patient
- `GET /api/fhir/patients/[id]/vitals` - Get patient vitals

#### Clinical Data
- `GET/POST /api/fhir/observations` - Vital signs and lab results
- `GET/POST /api/fhir/conditions` - Diagnoses and conditions
- `GET/POST /api/fhir/medications` - Medication requests
- `GET/POST /api/fhir/allergies` - Allergy and intolerance records

#### Appointments
- `GET /api/fhir/encounters` - Search encounters/appointments

#### Billing
- `GET /api/fhir/coverage` - Insurance coverage information

#### System
- `GET/POST /api/fhir/test` - Test FHIR connection
- `GET/POST /api/fhir/config` - Configuration management

### Request Headers

All FHIR API requests support these headers for dynamic configuration:
```http
x-fhir-base-url: https://your-fhir-server.com/fhir/R4
x-fhir-client-id: your-client-id
x-fhir-client-secret: your-client-secret
x-fhir-access-token: your-access-token
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, FHIR R4
- **Authentication**: SMART-on-FHIR OAuth2
- **State Management**: React hooks and context
- **HTTP Client**: Fetch API with custom FHIR client

### Project Structure
```
hospital/
├── app/
│   ├── api/fhir/          # FHIR API routes
│   ├── dashboard/         # Dashboard pages
│   └── auth/             # Authentication
├── components/
│   ├── patients/         # Patient management
│   ├── appointments/     # Appointment scheduling
│   ├── clinical/         # Clinical operations
│   ├── billing/          # Billing operations
│   └── configuration/    # FHIR configuration
├── lib/
│   ├── fhir/            # FHIR client and services
│   └── services/        # Legacy Supabase services
└── database/            # Database schemas and setup
```

### FHIR Client Architecture

The FHIR integration consists of three layers:

1. **FHIR Client (`lib/fhir/client.ts`)**
   - Low-level FHIR API communication
   - OAuth2 authentication handling
   - Resource CRUD operations

2. **FHIR Service (`lib/fhir/service.ts`)**
   - Business logic and data transformation
   - UI-friendly data structures
   - Error handling and validation

3. **API Routes (`app/api/fhir/`)**
   - Next.js server-side endpoints
   - Request/response handling
   - Authentication middleware

## 🧪 Testing

### Manual Testing

1. **Configuration Test**
   - Use the Configuration dashboard to test FHIR server connectivity
   - Verify authentication with your credentials

2. **Patient Operations**
   ```bash
   # Search patients
   curl http://localhost:3000/api/fhir/patients?_count=5
   
   # Create patient
   curl -X POST http://localhost:3000/api/fhir/patients \
     -H "Content-Type: application/json" \
     -d '{"firstName":"John","lastName":"Doe","dateOfBirth":"1990-01-01","gender":"male"}'
   ```

3. **Clinical Operations**
   ```bash
   # Record vital signs
   curl -X POST http://localhost:3000/api/fhir/observations \
     -H "Content-Type: application/json" \
     -d '{"patientId":"123","category":"vital-signs","code":"8302-2","value":"180","unit":"cm"}'
   ```

### Postman Collection

A comprehensive Postman collection is available with pre-configured requests for all FHIR endpoints:

1. Import the collection from `/postman/Hospital-FHIR-API.json`
2. Configure environment variables
3. Test all endpoints with sample data

## 🔒 Security

### Authentication
- SMART-on-FHIR OAuth2 compliance
- Secure token storage and refresh
- Environment-based credential management

### Data Protection
- FHIR resource validation
- Secure HTTP-only requests
- No client-side credential storage

### HIPAA Compliance
- Encrypted data transmission
- Audit logging capabilities
- Patient data access controls

## 🚢 Deployment

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy automatically** on git push

### Docker Deployment

```bash
# Build the image
docker build -t hospital-ehr .

# Run the container
docker run -p 3000:3000 \
  -e FHIR_BASE_URL=your-fhir-url \
  -e FHIR_CLIENT_ID=your-client-id \
  -e FHIR_CLIENT_SECRET=your-client-secret \
  hospital-ehr
```

### Environment Variables for Production

```env
# FHIR Configuration (Required)
FHIR_BASE_URL=https://your-production-fhir-server.com/fhir/R4
FHIR_CLIENT_ID=prod-client-id
FHIR_CLIENT_SECRET=prod-client-secret

# Next.js Configuration
NEXTAUTH_SECRET=secure-random-string
NEXTAUTH_URL=https://your-domain.com

# Optional: Database (if using hybrid approach)
DATABASE_URL=postgresql://user:pass@host:5432/db
```

## 📝 FHIR Resources Documentation

### Patient Resource
```json
{
  "resourceType": "Patient",
  "id": "patient-123",
  "name": [
    {
      "use": "official",
      "family": "Doe",
      "given": ["John", "Michael"]
    }
  ],
  "gender": "male",
  "birthDate": "1990-01-01",
  "telecom": [
    {
      "system": "phone",
      "value": "555-1234"
    }
  ]
}
```

### Observation Resource (Vitals)
```json
{
  "resourceType": "Observation",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "8302-2",
        "display": "Body height"
      }
    ]
  },
  "subject": {
    "reference": "Patient/patient-123"
  },
  "valueQuantity": {
    "value": 180,
    "unit": "cm"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Create a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Maintain FHIR R4 compliance
- Add comprehensive error handling
- Update API documentation
- Test with multiple EHR systems

## 📞 Support

### FHIR Resources
- [HL7 FHIR R4 Documentation](https://www.hl7.org/fhir/R4/)
- [SMART-on-FHIR Documentation](https://docs.smarthealthit.org/)
- [PracticeFusion FHIR API](https://developer.practicefusion.com/)

### Issues and Support
- Create issues on GitHub for bugs and feature requests
- Check existing documentation before reporting issues
- Provide FHIR server details and error logs for troubleshooting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏥 EHR Integration Partners

This application is designed to work with:
- ✅ PracticeFusion FHIR API
- ✅ Oracle Health (Cerner)
- ✅ Epic (with proper credentials)
- ✅ Any FHIR R4 compliant system

---

**Built with ❤️ for healthcare interoperability**