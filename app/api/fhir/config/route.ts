import { NextRequest, NextResponse } from 'next/server';

// GET /api/fhir/config - Get current FHIR configuration (without sensitive data)
export async function GET(request: NextRequest) {
  try {
    const config = {
      baseUrl: process.env.FHIR_BASE_URL || null,
      clientId: process.env.FHIR_CLIENT_ID || null,
      hasClientSecret: !!process.env.FHIR_CLIENT_SECRET,
      hasAccessToken: !!process.env.FHIR_ACCESS_TOKEN,
    };

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting FHIR config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/fhir/config - Validate FHIR configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseUrl, clientId, clientSecret, accessToken } = body;

    // Basic validation
    const errors: string[] = [];

    if (!baseUrl) {
      errors.push('Base URL is required');
    } else if (!baseUrl.startsWith('http')) {
      errors.push('Base URL must start with http or https');
    }

    if (!clientId && !accessToken) {
      errors.push('Either Client ID or Access Token is required');
    }

    if (clientId && !clientSecret && !accessToken) {
      errors.push('Client Secret is required when using Client ID without Access Token');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration is valid',
      data: {
        baseUrl,
        clientId: clientId || null,
        authType: accessToken ? 'bearer_token' : 'client_credentials'
      }
    });
  } catch (error) {
    console.error('Error validating FHIR config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}