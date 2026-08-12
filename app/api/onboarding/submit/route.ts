import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SubmitOnboardingSchema } from "@/lib/onboarding-validation";
import { OnboardingStatus } from "@prisma/client";
import { mapToFHIRBundle, validateFHIRResource } from "@/lib/fhir-mapper";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Retrieve the latest practitioner data
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
                location: true,
              }
            },
          },
        },
      },
    });

    if (!practitioner) {
      return NextResponse.json(
        { error: "No onboarding application found. Please save a draft first." },
        { status: 400 }
      );
    }

    // Assembly consent object from consents list
    const consentObj = {
      platformTermsAccepted: practitioner.consents.some(c => c.consentType === "platformTerms" && c.accepted),
      privacyPolicyAccepted: practitioner.consents.some(c => c.consentType === "privacyPolicy" && c.accepted),
      telemedicineTermsAccepted: practitioner.consents.some(c => c.consentType === "telemedicine" && c.accepted),
      aiAssistanceAcknowledgement: practitioner.consents.some(c => c.consentType === "aiAssistance" && c.accepted),
      clinicalResponsibilityAcknowledgement: practitioner.consents.some(c => c.consentType === "clinicalResponsibility" && c.accepted),
    };

    // 2. Format to match schema
    const formattedData = {
      title: practitioner.title,
      firstName: practitioner.firstName,
      middleName: practitioner.middleName,
      lastName: practitioner.lastName,
      displayName: practitioner.displayName,
      email: practitioner.email,
      phone: practitioner.phone,
      gender: practitioner.gender,
      birthDate: practitioner.birthDate.getTime() === 0 ? "" : practitioner.birthDate.toISOString().split("T")[0],
      preferredContactMethod: practitioner.preferredContactMethod,
      professionalBio: practitioner.professionalBio || "",
      yearsOfExperience: practitioner.yearsOfExperience,
      languages: practitioner.languages.map(l => ({
        languageCode: l.languageCode,
        languageName: l.languageName,
        proficiency: l.proficiency,
        preferredForConsultation: l.preferredForConsultation,
      })),
      identifiers: practitioner.identifiers.map(i => ({
        system: i.system,
        value: i.value,
        type: i.type,
        use: i.use,
        issuer: i.issuer,
        periodStart: i.periodStart ? i.periodStart.toISOString().split("T")[0] : null,
        periodEnd: i.periodEnd ? i.periodEnd.toISOString().split("T")[0] : null,
      })),
      qualifications: practitioner.qualifications.map(q => ({
        qualificationType: q.qualificationType as any,
        degreeName: q.degreeName,
        specialization: q.specialization,
        institution: q.institution,
        issuingOrganization: q.issuingOrganization,
        country: q.country,
        completionDate: q.completionDate.toISOString().split("T")[0],
        certificateNumber: q.certificateNumber,
        documentReferenceId: q.id,
      })),
      specialties: practitioner.specialties.map(s => ({
        specialtyCode: s.specialtyCode,
        specialtySystem: s.specialtySystem,
        specialtyDisplay: s.specialtyDisplay,
        isPrimary: s.isPrimary,
      })),
      roles: practitioner.roles.map(r => ({
        organizationId: r.organizationId,
        locations: r.locations.map(l => l.locationId),
        designation: r.designation,
        department: r.department,
        roleCode: r.roleCode,
        roleDisplay: r.roleDisplay,
        services: r.services.map(s => ({
          serviceCode: s.serviceCode,
          serviceName: s.serviceName,
          consultationMode: s.consultationMode as any,
          duration: s.duration,
          fee: s.fee,
          currency: s.currency,
          active: s.active,
        })),
        availabilities: r.availabilities.map(a => ({
          dayOfWeek: a.dayOfWeek as any,
          availableFrom: a.availableFrom,
          availableTo: a.availableTo,
          timezone: a.timezone,
          appointmentDurationMinutes: a.appointmentDurationMinutes,
          bufferMinutes: a.bufferMinutes,
        })),
      })),
      documents: practitioner.documents.map(d => ({
        title: d.title,
        url: d.url,
        docType: d.docType as any,
        fileName: d.fileName,
        mimeType: d.mimeType,
        fileSize: d.fileSize,
      })),
      consent: consentObj,
    };

    // 3. Strict Validation
    const result = SubmitOnboardingSchema.safeParse(formattedData);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    // FHIR R4 Validation Stage
    try {
      const fhirBundle = mapToFHIRBundle({
        practitioner: practitioner,
        organizations: practitioner.roles.map((r: any) => r.organization).filter(Boolean),
        locations: practitioner.roles.flatMap((r: any) => (r.locations || []).map((l: any) => l.location)).filter(Boolean),
        services: practitioner.roles.flatMap((r: any) => r.services || []),
        roles: practitioner.roles,
        documents: practitioner.documents
      });
      validateFHIRResource(fhirBundle);
    } catch (fhirError: any) {
      console.error("FHIR R4 Validation failed during submission:", fhirError);
      return NextResponse.json(
        { error: `FHIR Validation Failed: ${fhirError.message}` },
        { status: 400 }
      );
    }

    // 4. Update status to "SUBMITTED"
    const updated = await prisma.practitioner.update({
      where: { id: practitioner.id },
      data: {
        status: OnboardingStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ status: "success", data: updated });
  } catch (error: any) {
    console.error("Submit onboarding error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
