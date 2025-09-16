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

// GET /api/fhir/encounters - Search encounters/appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const limit = searchParams.get('_count') ? parseInt(searchParams.get('_count')!) : undefined;

    const fhirService = createFHIRService(request);
    
    if (patientId) {
      // Search encounters for specific patient
      const response = await fhirService.getEncounters({ patientId });
      
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
    } else {
      // Search all encounters with filters
      const response = await fhirService.searchEncounters({
        patientId: patientId || undefined,
        status: status || undefined,
        date: date || undefined,
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
    }
  } catch (error) {
    console.error('Error searching encounters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}