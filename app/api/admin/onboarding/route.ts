import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user.role === "admin";
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await prisma.practitioner.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        identifiers: true,
        qualifications: true,
        documents: true,
        specialties: true,
        consents: true,
        roles: {
          include: {
            availabilities: true,
            services: true,
            organization: true,
            locations: {
              include: {
                location: true,
              }
            },
          },
        },
      },
    });

    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Admin list onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
