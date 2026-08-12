import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const [organizations, locations, services] = await Promise.all([
      prisma.organization.findMany({ where: { active: true } }),
      prisma.location.findMany({ where: { active: true } }),
      prisma.healthcareService.findMany({ where: { active: true } }),
    ]);

    return NextResponse.json({
      organizations: organizations.map(o => ({ id: o.id, name: o.name })),
      locations: locations.map(l => ({ id: l.id, name: l.name, city: l.city, state: l.state })),
      services: services.map(s => ({ id: s.id, name: s.name, type: s.type })),
    });
  } catch (error: any) {
    console.error("Lookups fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
