import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mapToFHIRBundle } from "@/lib/fhir-mapper";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const practitioner = await prisma.practitioner.findUnique({
      where: { id },
      include: {
        identifiers: true,
        qualifications: true,
        specialties: true,
        languages: true,
        documents: true,
        consents: true,
        services: true,
        roles: {
          include: {
            availabilities: true,
            services: true,
            organization: true,
            locations: {
              include: {
                location: true
              }
            }
          }
        }
      }
    });

    if (!practitioner) {
      return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
    }

    const bundle = mapToFHIRBundle({
      practitioner: practitioner,
      organizations: practitioner.roles.map((r: any) => r.organization).filter(Boolean),
      locations: practitioner.roles.flatMap((r: any) => (r.locations || []).map((l: any) => l.location)).filter(Boolean),
      services: practitioner.roles.flatMap((r: any) => r.services || []),
      roles: practitioner.roles,
      documents: practitioner.documents
    });

    return NextResponse.json(bundle);
  } catch (error: any) {
    console.error("Error generating admin FHIR preview:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
