# FHIR Server Configuration Guide

This document explains how to configure different FHIR servers with your hospital management system.

## 🔧 **Current Configuration**

Your `.env.local` file is currently set to use the HAPI FHIR public test server, which is perfect for development and testing.

```bash
FHIR_BASE_URL=https://hapi.fhir.org/baseR4
FHIR_CLIENT_ID=
FHIR_CLIENT_SECRET=
FHIR_ACCESS_TOKEN=
```

## 🌐 **FHIR Server Options**

### 1. **HAPI FHIR Test Server (Current Setup)**
- **URL**: `https://hapi.fhir.org/baseR4`
- **Best for**: Development, testing, demos
- **Authentication**: None required (public test server)
- **Limitations**: Data may be cleared periodically, not for production

**Configuration:**
```bash
FHIR_BASE_URL=https://hapi.fhir.org/baseR4
FHIR_CLIENT_ID=
FHIR_CLIENT_SECRET=
FHIR_ACCESS_TOKEN=
```

### 2. **Microsoft Azure FHIR Service**
- **Best for**: Enterprise production deployments
- **Authentication**: OAuth 2.0 with Azure AD
- **Setup**: Create Azure Health Data Services FHIR service

**Configuration:**
```bash
FHIR_BASE_URL=https://your-fhir-service.azurehealthcareapis.com
FHIR_CLIENT_ID=your-azure-client-id
FHIR_CLIENT_SECRET=your-azure-client-secret
FHIR_ACCESS_TOKEN=your-azure-access-token
```

**Setup Steps:**
1. Go to Azure Portal → Create Health Data Services
2. Create FHIR service instance
3. Register application in Azure AD
4. Configure authentication and get credentials

### 3. **AWS HealthLake**
- **Best for**: AWS-based deployments
- **Authentication**: AWS IAM credentials
- **Setup**: Create HealthLake Data Store

**Configuration:**
```bash
FHIR_BASE_URL=https://healthlake.us-east-1.amazonaws.com/datastore/your-datastore-id/r4
FHIR_CLIENT_ID=your-aws-access-key-id
FHIR_CLIENT_SECRET=your-aws-secret-access-key
FHIR_ACCESS_TOKEN=your-aws-session-token
```

### 4. **Google Cloud Healthcare API**
- **Best for**: Google Cloud deployments
- **Authentication**: Service Account or OAuth 2.0
- **Setup**: Create Healthcare Dataset and FHIR Store

**Configuration:**
```bash
FHIR_BASE_URL=https://healthcare.googleapis.com/v1/projects/your-project/locations/your-location/datasets/your-dataset/fhirStores/your-store/fhir
FHIR_CLIENT_ID=your-service-account-email
FHIR_CLIENT_SECRET=your-private-key
FHIR_ACCESS_TOKEN=your-oauth-token
```

### 5. **Self-Hosted FHIR Server**
- **Best for**: On-premises or custom deployments
- **Options**: HAPI FHIR, IBM FHIR, Microsoft OSS FHIR Server
- **Authentication**: Configurable

## 🔐 **Authentication Methods**

### Public Test Servers
- No authentication required
- Good for development only

### OAuth 2.0 (Most Common)
- Client credentials flow
- Bearer token authentication
- Refresh token support

### API Key Authentication
- Simple API key in headers
- Less secure but easier to implement

## 🚀 **Quick Start (Using Current Setup)**

Your system is already configured to work with the HAPI FHIR test server. Simply restart your development server:

```bash
npm run dev
```

The system should now connect successfully to the FHIR server!

## 🔧 **Troubleshooting**

### Common Issues:

1. **"FHIR base URL is required"**
   - Ensure `FHIR_BASE_URL` is set in `.env.local`
   - Restart the development server after adding variables

2. **CORS Errors**
   - Some FHIR servers have strict CORS policies
   - Use server-side API routes (already implemented)

3. **Authentication Failures**
   - Check client credentials are correct
   - Ensure tokens haven't expired
   - Verify API permissions

4. **404 Not Found for `/api/fhir/billing/invoices`**
   - Billing endpoints may not exist on test servers
   - This is normal - the system will gracefully handle missing data

## 📋 **Next Steps**

1. **Current Status**: Your system is configured for HAPI FHIR test server
2. **Test the Connection**: Restart your dev server and check if errors are resolved
3. **Add Test Data**: Use FHIR client tools to add sample patients/appointments
4. **Production Setup**: Choose a production FHIR server when ready to deploy

## 📞 **Need Help?**

- Check the browser console for specific error messages
- Review the terminal output for server-side errors
- Test FHIR endpoints directly with tools like Postman or curl