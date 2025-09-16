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

// POST /api/fhir/observations - Create a new observation (vitals, lab results, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, category, code, value, unit, notes, status = 'final' } = body;

    if (!patientId || !category || !code || value === undefined) {
      return NextResponse.json(
        { error: 'Patient ID, category, code, and value are required' },
        { status: 400 }
      );
    }

    const fhirService = createFHIRService(request);
    const response = await fhirService.createObservation({
      patientId,
      category,
      code,
      value,
      unit,
      notes,
      status
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
    console.error('Error creating observation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/fhir/observations - Search observations with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient');
    const category = searchParams.get('category');
    const code = searchParams.get('code');
    const date = searchParams.get('date');
    const limit = searchParams.get('_count') ? parseInt(searchParams.get('_count')!) : undefined;

    const fhirService = createFHIRService(request);
    const response = await fhirService.searchObservations({
      patient: patientId,
      category,
      code,
      date,
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
    console.error('Error searching observations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}