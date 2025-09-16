import { NextRequest, NextResponse } from 'next/server';

const FHIR_BASE_URL = process.env.FHIR_BASE_URL;

// GET /api/fhir/encounters/[id] - Get specific encounter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!FHIR_BASE_URL) {
    return NextResponse.json({ error: 'FHIR base URL is required' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const response = await fetch(`${FHIR_BASE_URL}/Encounter/${id}`, {
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Encounter not found' }, { status: 404 });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching encounter:', error);
    return NextResponse.json({ error: 'Failed to fetch encounter' }, { status: 500 });
  }
}

// PUT /api/fhir/encounters/[id] - Update specific encounter
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!FHIR_BASE_URL) {
    return NextResponse.json({ error: 'FHIR base URL is required' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const encounterData = await request.json();

    // First try to get the existing encounter
    const existingResponse = await fetch(`${FHIR_BASE_URL}/Encounter/${id}`, {
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      },
    });

    let existingEncounter = null;
    if (existingResponse.ok) {
      existingEncounter = await existingResponse.json();
    }

    // Create or update the encounter with proper FHIR format
    const fhirEncounter = {
      resourceType: 'Encounter',
      id: id,
      status: encounterData.status || existingEncounter?.status || 'planned',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'ambulatory'
      },
      type: [{
        coding: [{
          system: 'http://snomed.info/sct',
          code: '185349003',
          display: encounterData.type || 'Consultation'
        }]
      }],
      subject: {
        reference: `Patient/${encounterData.patientId || existingEncounter?.subject?.reference?.replace('Patient/', '') || 'unknown'}`
      },
      period: {
        start: encounterData.date || new Date().toISOString()
      },
      reasonCode: encounterData.reason ? [{
        text: encounterData.reason
      }] : [],
      // Merge any additional existing data
      ...(existingEncounter && {
        meta: existingEncounter.meta,
        text: existingEncounter.text,
        identifier: existingEncounter.identifier
      })
    };

    const response = await fetch(`${FHIR_BASE_URL}/Encounter/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(fhirEncounter)
    });

    if (!response.ok) {
      // If the encounter doesn't exist, try creating it instead
      if (response.status === 404) {
        const createResponse = await fetch(`${FHIR_BASE_URL}/Encounter`, {
          method: 'POST',
          headers: {
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json',
          },
          body: JSON.stringify({...fhirEncounter, id: undefined})
        });

        if (createResponse.ok) {
          const createdData = await createResponse.json();
          return NextResponse.json({
            success: true,
            data: createdData,
            message: 'Appointment created as new encounter'
          });
        }
      }
      
      console.error(`FHIR API Error: ${response.status} - ${response.statusText}`);
      return NextResponse.json({
        success: false,
        error: `Failed to update appointment: ${response.statusText}`,
        statusCode: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Appointment updated successfully'
    });

  } catch (error) {
    console.error('Error updating encounter:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/fhir/encounters/[id] - Delete specific encounter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!FHIR_BASE_URL) {
    return NextResponse.json({ error: 'FHIR base URL is required' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const response = await fetch(`${FHIR_BASE_URL}/Encounter/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      },
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ success: true, message: 'Encounter deleted successfully' });

  } catch (error) {
    console.error('Error deleting encounter:', error);
    return NextResponse.json({ error: 'Failed to delete encounter' }, { status: 500 });
  }
}