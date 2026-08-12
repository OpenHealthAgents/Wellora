import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { mapToFHIRPractitioner, mapToFHIRPractitionerRole } from "../../../lib/fhir-mapper";

export const dynamic = "force-dynamic";

function calculateNextAvailable(availabilities: any[]): string {
  if (!availabilities || availabilities.length === 0) {
    return "Call for Availability";
  }

  const daysMap: Record<string, number> = {
    SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
  };

  const now = new Date();
  const currentDayNum = now.getDay();

  let bestSlot: { date: Date; from: string } | null = null;

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const checkDayNum = checkDate.getDay();

    const matching = availabilities.filter((av: any) => {
      const dayNum = daysMap[av.dayOfWeek.toUpperCase()];
      return dayNum === checkDayNum;
    });

    for (const av of matching) {
      const [hours, minutes] = av.availableFrom.split(":").map(Number);
      const slotTime = new Date(checkDate);
      slotTime.setHours(hours, minutes, 0, 0);

      if (i === 0 && slotTime.getTime() <= now.getTime()) {
        continue;
      }

      if (!bestSlot || slotTime.getTime() < bestSlot.date.getTime()) {
        bestSlot = {
          date: slotTime,
          from: av.availableFrom
        };
      }
    }

    if (bestSlot) {
      break;
    }
  }

  if (bestSlot) {
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return `${bestSlot.date.toLocaleDateString("en-US", options)} at ${bestSlot.from}`;
  }

  return "No Slots Available";
}

async function getRequestHeaders() {
  try {
    return await headers();
  } catch (e) {
    return new Headers();
  }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await getRequestHeaders(),
  });
  const isAdmin = session?.user.role === "admin";

  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q")?.toLowerCase().trim() || "";
  const filterSpecialty = searchParams.get("specialty")?.toLowerCase().trim() || "";
  const filterOrganization = searchParams.get("organization")?.toLowerCase().trim() || "";
  const filterLocation = searchParams.get("location")?.toLowerCase().trim() || "";
  const filterCity = searchParams.get("city")?.toLowerCase().trim() || "";
  const filterState = searchParams.get("state")?.toLowerCase().trim() || "";
  const filterLanguage = searchParams.get("language")?.toLowerCase().trim() || "";
  const filterMode = searchParams.get("mode")?.toLowerCase().trim() || "";
  const filterService = searchParams.get("service")?.toLowerCase().trim() || "";
  const filterAvailability = searchParams.get("availability")?.toLowerCase().trim() || "";
  
  // Public directory defaults to verified; admins can check other statuses
  const filterStatus = searchParams.get("status")?.toUpperCase().trim() || "VERIFIED";
  const statusToQuery = isAdmin ? filterStatus : "VERIFIED";

  try {
    const practitioners = await prisma.practitioner.findMany({
      where: {
        status: statusToQuery as any,
      },
      include: {
        languages: true,
        specialties: true,
        qualifications: true,
        roles: {
          include: {
            organization: true,
            locations: {
              include: {
                location: true,
              },
            },
            services: true,
            availabilities: true,
          },
        },
      },
    });

    // In-memory filter to support complex multi-table parameters
    const filtered = practitioners.filter((p: any) => {
      // Name keyword match
      if (q) {
        const fullName = `${p.title || ""} ${p.firstName || ""} ${p.middleName || ""} ${p.lastName || ""} ${p.displayName || ""}`.toLowerCase();
        const matchesName = fullName.includes(q);
        const matchesSpec = p.specialties.some((s: any) => s.specialtyDisplay.toLowerCase().includes(q));
        const matchesSubSpec = p.qualifications.some((qf: any) => qf.specialization?.toLowerCase().includes(q));
        const matchesOrg = p.roles.some((r: any) => r.organization.name.toLowerCase().includes(q));
        const matchesLoc = p.roles.some((r: any) => r.locations.some((l: any) => l.location.name.toLowerCase().includes(q)));
        const matchesGeo = p.roles.some((r: any) => r.locations.some((l: any) => l.location.city.toLowerCase().includes(q) || l.location.state.toLowerCase().includes(q)));
        
        if (!matchesName && !matchesSpec && !matchesSubSpec && !matchesOrg && !matchesLoc && !matchesGeo) {
          return false;
        }
      }

      // Specific filter mappings
      if (filterSpecialty && !p.specialties.some((s: any) => s.specialtyDisplay.toLowerCase().includes(filterSpecialty))) {
        return false;
      }
      if (filterOrganization && !p.roles.some((r: any) => r.organization.name.toLowerCase().includes(filterOrganization))) {
        return false;
      }
      if (filterLocation && !p.roles.some((r: any) => r.locations.some((l: any) => l.location.name.toLowerCase().includes(filterLocation)))) {
        return false;
      }
      if (filterCity && !p.roles.some((r: any) => r.locations.some((l: any) => l.location.city.toLowerCase().includes(filterCity)))) {
        return false;
      }
      if (filterState && !p.roles.some((r: any) => r.locations.some((l: any) => l.location.state.toLowerCase().includes(filterState)))) {
        return false;
      }
      if (filterLanguage && !p.languages.some((l: any) => l.languageName.toLowerCase().includes(filterLanguage) || l.languageCode.toLowerCase() === filterLanguage)) {
        return false;
      }
      if (filterMode && !p.roles.some((r: any) => r.services.some((s: any) => s.consultationMode.toLowerCase() === filterMode))) {
        return false;
      }
      if (filterService && !p.roles.some((r: any) => r.services.some((s: any) => s.serviceName.toLowerCase().includes(filterService)))) {
        return false;
      }
      if (filterAvailability && !p.roles.some((r: any) => r.availabilities.some((a: any) => a.dayOfWeek.toLowerCase() === filterAvailability))) {
        return false;
      }

      return true;
    });

    // Map to secure patient-visible fields and bundle public FHIR representations
    const mapped = filtered.map((p: any) => {
      // Gather all availabilities across roles
      const allAvails = p.roles.flatMap((r: any) => r.availabilities);
      const nextSlot = calculateNextAvailable(allAvails);

      // Generate public-facing FHIR representations
      const fhirPractitioner = mapToFHIRPractitioner(p);
      const fhirRoles = p.roles.map((r: any) => {
        // Build mock PractitionerRole database input for mapper
        return mapToFHIRPractitionerRole({
          ...r,
          practitioner: {
            specialties: p.specialties
          }
        });
      });

      return {
        id: p.id,
        displayName: p.displayName || `Dr. ${p.firstName} ${p.lastName}`,
        photo: p.profilePhoto,
        professionalBio: p.professionalBio,
        yearsOfExperience: p.yearsOfExperience,
        gender: p.gender,
        status: p.status,
        languages: p.languages.map((l: any) => ({ languageName: l.languageName, proficiency: l.proficiency })),
        specialties: p.specialties.map((s: any) => ({ specialtyDisplay: s.specialtyDisplay, isPrimary: s.isPrimary })),
        qualifications: p.qualifications.map((qf: any) => ({
          degreeName: qf.degreeName,
          institution: qf.institution,
          completionDate: qf.completionDate.toISOString().split("T")[0]
        })),
        roles: p.roles.map((r: any) => ({
          id: r.id,
          designation: r.designation,
          organizationName: r.organization.name,
          locations: r.locations.map((l: any) => ({
            name: l.location.name,
            city: l.location.city,
            state: l.location.state
          })),
          services: r.services.map((s: any) => ({
            serviceName: s.serviceName,
            consultationMode: s.consultationMode,
            fee: s.fee,
            currency: s.currency,
            duration: s.duration
          }))
        })),
        nextAvailableAppointment: nextSlot,
        fhir: {
          practitioner: fhirPractitioner,
          practitionerRoles: fhirRoles
        }
      };
    });

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Provider directory API error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
