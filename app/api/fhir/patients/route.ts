import { NextRequest, NextResponse } from 'next/server';
import { createFHIRClient } from '@/lib/fhir/client';
import { FHIRService } from '@/lib/fhir/service';

// Helper function to get FHIR credentials from request headers or environment
function getFHIRCredentials(request: NextRequest) {
  // Check for credentials in headers (for runtime configuration)
  const baseUrl = request.headers.get('x-fhir-base-url') || process.env.FHIR_BASE_URL;
  const clientId = request.headers.get('x-fhir-client-id') || process.env.FHIR_CLIENT_ID;
  const clientSecret = request.headers.get('x-fhir-client-secret') || process.env.FHIR_CLIENT_SECRET;
  const accessToken = request.headers.get('x-fhir-access-token') || process.env.FHIR_ACCESS_TOKEN;

  if (!baseUrl) {
    throw new Error('FHIR base URL is required');
  }

  return {
    baseUrl,
    clientId,
    clientSecret,
    accessToken
  };
}

// Helper function to create FHIR service instance
function createFHIRService(request: NextRequest) {
  const credentials = getFHIRCredentials(request);
  const client = createFHIRClient(credentials);
  return new FHIRService(client);
}

// GET /api/fhir/patients - Search patients
export async function GET(request: NextRequest) {
  try {
    const fhirService = createFHIRService(request);
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const family = searchParams.get('family') || undefined;
    const given = searchParams.get('given') || undefined;
    const identifier = searchParams.get('identifier') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const response = await fhirService.getPatients({
      search,
      family,
      given,
      identifier,
      limit
    });

    if (!response.success) {
      return NextResponse.json(
        { error: response.error },
        { status: response.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      count: response.data?.length || 0
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/fhir/patients - Create new patient
export async function POST(request: NextRequest) {
  try {
    const fhirService = createFHIRService(request);
    const patientData = await request.json();

    const response = await fhirService.createPatient(patientData);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error },
        { status: response.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}