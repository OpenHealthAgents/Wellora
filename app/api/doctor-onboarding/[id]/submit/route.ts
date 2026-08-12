import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";
import { headers } from "next/headers";
import { DoctorOnboardingSubmitSchema } from "../../../../../lib/onboarding-validation";
import { OnboardingStatus } from "@prisma/client";
import { logAudit } from "../../../../../lib/audit";
import { formatErrorResponse, normalizePractitioner } from "../../utils";
import { mapToFHIRBundle, validateFHIRResource } from "../../../../../lib/fhir-mapper";

export const dynamic = "force-dynamic";

async function getRequestHeaders() {
  try {
    return await headers();
  } catch (e) {
    return new Headers();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await getRequestHeaders(),
  });

  if (!session) {
    return formatErrorResponse("UNAUTHORIZED", "User session is not authenticated.", 401);
  }

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
        roles: {
          include: {
            availabilities: true,
            services: true,
            organization: true,
            locations: {
              include: {
                location: true
              }
            },
          }
        }
      }
    });

    if (!practitioner) {
      return formatErrorResponse("NOT_FOUND", "Practitioner onboarding application not found.", 404);
    }

    if (practitioner.userId !== session.user.id) {
      return formatErrorResponse("FORBIDDEN", "You are not authorized to submit this application.", 403);
    }

    if (practitioner.status === OnboardingStatus.SUBMITTED || practitioner.status === OnboardingStatus.VERIFIED) {
      return NextResponse.json({
        status: "success",
        message: "Application is already submitted or verified.",
        data: normalizePractitioner(practitioner)
      });
    }

    const consentObj = {
      platformTermsAccepted: practitioner.consents.some((c: any) => c.consentType === "platformTerms" && c.accepted),
      privacyPolicyAccepted: practitioner.consents.some((c: any) => c.consentType === "privacyPolicy" && c.accepted),
      telemedicineTermsAccepted: practitioner.consents.some((c: any) => c.consentType === "telemedicine" && c.accepted),
      aiAssistanceAcknowledgement: practitioner.consents.some((c: any) => c.consentType === "aiAssistance" && c.accepted),
      clinicalResponsibilityAcknowledgement: practitioner.consents.some((c: any) => c.consentType === "clinicalResponsibility" && c.accepted),
    };

    const birthDateStr = practitioner.birthDate && practitioner.birthDate.getTime() !== 0
      ? practitioner.birthDate.toISOString().split("T")[0]
      : "";

    const payload = {
      title: practitioner.title,
      firstName: practitioner.firstName,
      middleName: practitioner.middleName,
      lastName: practitioner.lastName,
      displayName: practitioner.displayName,
      email: practitioner.email,
      phone: practitioner.phone,
      gender: practitioner.gender,
      birthDate: birthDateStr,
      preferredContactMethod: practitioner.preferredContactMethod,
      professionalBio: practitioner.professionalBio || "",
      yearsOfExperience: practitioner.yearsOfExperience,
      languages: practitioner.languages.map((l: any) => ({
        languageCode: l.languageCode,
        languageName: l.languageName,
        proficiency: l.proficiency,
        preferredForConsultation: l.preferredForConsultation,
      })),
      identifiers: practitioner.identifiers.map((i: any) => ({
        system: i.system,
        value: i.value,
        type: i.type,
        use: i.use,
        issuer: i.issuer,
        periodStart: i.periodStart ? i.periodStart.toISOString().split("T")[0] : null,
        periodEnd: i.periodEnd ? i.periodEnd.toISOString().split("T")[0] : null,
      })),
      qualifications: practitioner.qualifications.map((q: any) => ({
        qualificationType: q.qualificationType,
        degreeName: q.degreeName,
        specialization: q.specialization,
        institution: q.institution,
        issuingOrganization: q.issuingOrganization,
        country: q.country,
        completionDate: q.completionDate.toISOString().split("T")[0],
        certificateNumber: q.certificateNumber,
      })),
      specialties: practitioner.specialties.map((s: any) => ({
        specialtyCode: s.specialtyCode,
        specialtySystem: s.specialtySystem,
        specialtyDisplay: s.specialtyDisplay,
        isPrimary: s.isPrimary,
      })),
      roles: practitioner.roles.map((r: any) => ({
        organizationId: r.organizationId,
        locations: r.locations.map((l: any) => l.locationId),
        designation: r.designation,
        department: r.department,
        roleCode: r.roleCode,
        roleDisplay: r.roleDisplay,
        services: r.services.map((s: any) => ({
          serviceCode: s.serviceCode,
          serviceName: s.serviceName,
          consultationMode: s.consultationMode,
          duration: s.duration,
          fee: s.fee,
          currency: s.currency,
          active: s.active,
        })),
        availabilities: r.availabilities.map((a: any) => ({
          dayOfWeek: a.dayOfWeek,
          availableFrom: a.availableFrom,
          availableTo: a.availableTo,
          timezone: a.timezone,
          appointmentDurationMinutes: a.appointmentDurationMinutes,
          bufferMinutes: a.bufferMinutes,
        })),
      })),
      documents: practitioner.documents.map((d: any) => ({
        title: d.title,
        url: d.url,
        docType: d.docType,
        fileName: d.fileName,
        mimeType: d.mimeType,
        fileSize: d.fileSize,
      })),
      consent: consentObj,
    };

    const result = DoctorOnboardingSubmitSchema.safeParse(payload);
    if (!result.success) {
      const fields: Record<string, string> = {};
      result.error.issues.forEach((issue: any) => {
        fields[issue.path.join(".")] = issue.message;
      });
      return formatErrorResponse("VALIDATION_FAILED", "Strict submission checks failed.", 400, fields);
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
      console.error("[FHIR R4 Validation Error] Onboarding submit failed:", fhirError);
      return formatErrorResponse(
        "FHIR_VALIDATION_FAILED",
        "The application data generated invalid FHIR R4 interoperability resources. Details have been logged for administrator review.",
        400,
        { fhir: fhirError.message }
      );
    }

    const updated = await prisma.practitioner.update({
      where: { id },
      data: {
        status: OnboardingStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "ONBOARDING_SUBMITTED",
      resource: "Practitioner",
      resourceId: id,
      details: "Profile submitted for verification review."
    });

    return NextResponse.json({
      status: "success",
      message: "Application submitted successfully.",
      data: normalizePractitioner(updated)
    });
  } catch (error: any) {
    console.error("Submit application error:", error);
    return formatErrorResponse("INTERNAL_SERVER_ERROR", "Internal Server Error occurred.", 500);
  }
}
