import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";
import { headers } from "next/headers";
import {
  mapToFHIRPractitioner,
  mapToFHIRPractitionerRole,
  mapToFHIROrganization,
  mapToFHIRLocation,
  mapToFHIRHealthcareService,
  mapToFHIRDocumentReference
} from "../../../../../lib/fhir-mapper";

async function getRequestHeaders() {
  try {
    return await headers();
  } catch (e) {
    return new Headers();
  }
}

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resourceType: string; id: string }> }
) {
  const { resourceType, id } = await params;

  try {
    let fhirResource: any = null;

    switch (resourceType) {
      case "Practitioner": {
        const practitioner = await prisma.practitioner.findUnique({
          where: { id },
          include: {
            identifiers: true,
            qualifications: true,
          },
        });
        if (practitioner) {
          fhirResource = mapToFHIRPractitioner(practitioner);
        }
        break;
      }

      case "PractitionerRole": {
        const role = await prisma.practitionerRole.findUnique({
          where: { id },
          include: {
            availabilities: true,
            services: true,
          },
        });
        if (role) {
          fhirResource = mapToFHIRPractitionerRole(role);
        }
        break;
      }

      case "Organization": {
        const org = await prisma.organization.findUnique({
          where: { id },
        });
        if (org) {
          fhirResource = mapToFHIROrganization(org);
        }
        break;
      }

      case "Location": {
        const loc = await prisma.location.findUnique({
          where: { id },
        });
        if (loc) {
          fhirResource = mapToFHIRLocation(loc);
        }
        break;
      }

      case "HealthcareService": {
        const service = await prisma.healthcareService.findUnique({
          where: { id },
        });
        if (service) {
          fhirResource = mapToFHIRHealthcareService(service);
        }
        break;
      }

      case "DocumentReference": {
        const session = await auth.api.getSession({
          headers: await getRequestHeaders(),
        });
        if (!session) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const doc = await prisma.verificationDocument.findUnique({
          where: { id },
          include: {
            practitioner: true,
          },
        });

        if (doc) {
          const isOwner = doc.practitioner.userId === session.user.id;
          const isAdmin = session.user.role === "admin";
          if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
          fhirResource = mapToFHIRDocumentReference(doc);
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `FHIR Resource Type '${resourceType}' not supported or not found.` },
          { status: 400 }
        );
    }

    if (!fhirResource) {
      return NextResponse.json(
        { error: `${resourceType} resource with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return new NextResponse(JSON.stringify(fhirResource), {
      status: 200,
      headers: {
        "Content-Type": "application/fhir+json",
      },
    });
  } catch (error: any) {
    console.error(`GET FHIR Resource ${resourceType}/${id} error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
