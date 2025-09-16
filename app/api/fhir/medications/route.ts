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

// POST /api/fhir/medications - Create a new medication request/prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, medication, dosage, quantity, refills, instructions } = body;

    if (!patientId || !medication || !dosage) {
      return NextResponse.json(
        { error: 'Patient ID, medication, and dosage are required' },
        { status: 400 }
      );
    }

    const fhirService = createFHIRService(request);
    const response = await fhirService.createMedicationRequest({
      patientId,
      medication,
      dosage,
      quantity,
      refills,
      instructions
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
    console.error('Error creating medication request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/fhir/medications - Search medication requests
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
    const response = await fhirService.getMedications(patientId);

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
    console.error('Error searching medications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}