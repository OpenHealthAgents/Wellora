import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { mapToFHIRBundle } from "@/lib/fhir-mapper";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure admin role
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const practitioner = await prisma.practitioner.findUnique({
      where: { userId: session.user.id },
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
      return NextResponse.json({ error: "Practitioner draft not found." }, { status: 404 });
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
    console.error("Error generating FHIR preview:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
