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

// GET /api/fhir/patients/[id]/vitals - Get patient vital signs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const fhirService = createFHIRService(request);
    const { id } = await params;
    const response = await fhirService.getVitalSigns(id);

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
    console.error('Error getting patient vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}