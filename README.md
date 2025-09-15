# Hospital EHR System# EHR Dashboard System - Healthcare Management Application



A comprehensive Electronic Health Records (EHR) system built with Next.js 15 and Supabase, providing a complete healthcare management dashboard.A comprehensive Electronic Health Records (EHR) system built with Next.js 15, integrating with Oracle Health FHIR APIs to provide a complete healthcare management dashboard.



## Features## 🏥 Features Implemented



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

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key### Security Features

```- **Supabase Authentication** with Google OAuth

- **PKCE Flow** for secure authorization

4. **Database Setup**- **Environment Variables** for sensitive configuration

Run the SQL schema in your Supabase SQL editor (see `database/schema.sql`)- **Input Validation** and sanitization

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

│   ├── services/         # Supabase service layer│   ├── api/             # EHR API integration

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
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

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
3. **OAuth Flow**: Secure PKCE authentication via Supabase
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
