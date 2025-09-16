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

// POST /api/fhir/test - Test FHIR server connection and authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseUrl, clientId, clientSecret, accessToken } = body;

    if (!baseUrl) {
      return NextResponse.json(
        { error: 'FHIR base URL is required' },
        { status: 400 }
      );
    }

    const credentials = { baseUrl, clientId, clientSecret, accessToken };
    const client = createFHIRClient(credentials);
    const fhirService = new FHIRService(client);

    const response = await fhirService.testConnection();

    if (!response.success) {
      return NextResponse.json(
        { 
          success: false,
          error: response.error,
          statusCode: response.statusCode 
        },
        { status: response.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FHIR server connection successful',
      serverInfo: response.data
    });
  } catch (error) {
    console.error('Error testing FHIR connection:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// GET /api/fhir/test - Test current FHIR configuration
export async function GET(request: NextRequest) {
  try {
    const fhirService = createFHIRService(request);
    const response = await fhirService.testConnection();

    if (!response.success) {
      return NextResponse.json(
        { 
          success: false,
          error: response.error,
          statusCode: response.statusCode 
        },
        { status: response.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FHIR server connection successful',
      serverInfo: response.data
    });
  } catch (error) {
    console.error('Error testing FHIR connection:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}