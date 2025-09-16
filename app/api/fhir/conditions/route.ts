import { NextRequest, NextResponse } from 'next/server';
import { createFHIRClient } from '@/lib/fhir/client';
import { FHIRService } from '@/lib/fhir/service';

function getFHIRCredentials(request: NextRequest) {
  const baseUrl = request.headers.get('x-fhir-base-url') || process.env.FHIR_BASE_URL;
  const clientId = request.headers.get('x-fhir-client-id') || process.env.FHIR_CLIENT_ID;
  const clientSecret = request.headers.get('x-fhir-client-secret') || process.env.FHIR_CLIENT_SECRET;
  const accessToken = request.headers.get('x-fhir-access-token') || process.env.FHIR_ACCESS_TOKEN;

  if (!baseUrl) {
    throw new Error('FHIR base URL is required');
  }

  return { baseUrl, clientId, clientSecret, accessToken };
}

function createFHIRService(request: NextRequest) {
  const credentials = getFHIRCredentials(request);
  const client = createFHIRClient(credentials);
  return new FHIRService(client);
}

// POST /api/fhir/conditions - Create a new condition/diagnosis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, code, display, clinicalStatus, verificationStatus, severity, onsetDate, notes } = body;

    if (!patientId || !code || !display) {
      return NextResponse.json(
        { error: 'Patient ID, code, and display are required' },
        { status: 400 }
      );
    }

    const fhirService = createFHIRService(request);
    const response = await fhirService.createCondition({
      patientId,
      code,
      display,
      clinicalStatus,
      verificationStatus,
      severity,
      onsetDate,
      notes
    });

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
    console.error('Error creating condition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/fhir/conditions - Search conditions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient');
    const limit = searchParams.get('_count') ? parseInt(searchParams.get('_count')!) : undefined;

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const fhirService = createFHIRService(request);
    const response = await fhirService.getConditions(patientId);

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
    console.error('Error searching conditions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}