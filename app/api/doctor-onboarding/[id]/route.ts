import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { DoctorOnboardingSchema } from "../../../../lib/onboarding-validation";
import { OnboardingStatus } from "@prisma/client";
import { logAudit } from "../../../../lib/audit";
import { formatErrorResponse, normalizePractitioner } from "../utils";

export const dynamic = "force-dynamic";

async function getRequestHeaders() {
  try {
    return await headers();
  } catch (e) {
    return new Headers();
  }
}

export async function GET(
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
            locations: true,
          }
        }
      }
    });

    if (!practitioner) {
      return formatErrorResponse("NOT_FOUND", "Practitioner onboarding application not found.", 404);
    }

    const isOwner = practitioner.userId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return formatErrorResponse("FORBIDDEN", "You are not authorized to view this application.", 403);
    }

    return NextResponse.json(normalizePractitioner(practitioner));
  } catch (error: any) {
    console.error("GET detailed onboarding error:", error);
    return formatErrorResponse("INTERNAL_SERVER_ERROR", "Internal Server Error occurred.", 500);
  }
}

export async function PATCH(
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
    });

    if (!practitioner) {
      return formatErrorResponse("NOT_FOUND", "Practitioner onboarding application not found.", 404);
    }

    if (practitioner.userId !== session.user.id) {
      return formatErrorResponse("FORBIDDEN", "You are not authorized to update this application.", 403);
    }

    const body = await req.json();
    const result = DoctorOnboardingSchema.safeParse(body);

    if (!result.success) {
      const fields: Record<string, string> = {};
      result.error.issues.forEach((issue: any) => {
        fields[issue.path.join(".")] = issue.message;
      });
      return formatErrorResponse("VALIDATION_FAILED", "Request body validation failed.", 400, fields);
    }

    const data = result.data;

    const updatedPractitioner = await prisma.$transaction(async (tx: any) => {
      const practitionerData = {
        title: data.title || practitioner.title,
        firstName: data.firstName || practitioner.firstName,
        middleName: data.middleName !== undefined ? data.middleName : practitioner.middleName,
        lastName: data.lastName || practitioner.lastName,
        displayName: data.displayName || practitioner.displayName,
        email: data.email || practitioner.email,
        phone: data.phone || practitioner.phone,
        gender: data.gender || practitioner.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : practitioner.birthDate,
        preferredContactMethod: data.preferredContactMethod || practitioner.preferredContactMethod,
        professionalBio: data.professionalBio !== undefined ? data.professionalBio : practitioner.professionalBio,
        yearsOfExperience: (data.yearsOfExperience !== undefined && data.yearsOfExperience !== null) ? data.yearsOfExperience : (practitioner.yearsOfExperience || 0),
        status: practitioner.status === OnboardingStatus.REJECTED ? OnboardingStatus.DRAFT : practitioner.status,
      };

      await tx.practitioner.update({
        where: { id },
        data: practitionerData,
      });

      await tx.practitionerIdentifier.deleteMany({ where: { practitionerId: id } });
      await tx.practitionerQualification.deleteMany({ where: { practitionerId: id } });
      await tx.practitionerSpecialty.deleteMany({ where: { practitionerId: id } });
      await tx.practitionerLanguage.deleteMany({ where: { practitionerId: id } });
      await tx.practitionerConsent.deleteMany({ where: { practitionerId: id } });
      await tx.verificationDocument.deleteMany({ where: { practitionerId: id } });
      await tx.practitionerService.deleteMany({ where: { practitionerId: id } });
      
      const roles = await tx.practitionerRole.findMany({ where: { practitionerId: id } });
      const roleIds = roles.map((r: any) => r.id);
      await tx.practitionerAvailability.deleteMany({ where: { roleId: { in: roleIds } } });
      await tx.practitionerRoleLocation.deleteMany({ where: { roleId: { in: roleIds } } });
      await tx.practitionerRole.deleteMany({ where: { practitionerId: id } });

      if (data.languages && data.languages.length > 0) {
        await tx.practitionerLanguage.createMany({
          data: data.languages.map((l: any) => ({
            practitionerId: id,
            languageCode: l.languageCode,
            languageName: l.languageName,
            proficiency: l.proficiency,
            preferredForConsultation: l.preferredForConsultation,
          })),
        });
      }

      if (data.identifiers && data.identifiers.length > 0) {
        await tx.practitionerIdentifier.createMany({
          data: data.identifiers.map((i: any) => ({
            practitionerId: id,
            system: i.system,
            value: i.value,
            type: i.type,
            use: i.use || null,
            issuer: i.issuer || null,
            periodStart: i.periodStart ? new Date(i.periodStart) : null,
            periodEnd: i.periodEnd ? new Date(i.periodEnd) : null,
          })),
        });
      }

      if (data.qualifications && data.qualifications.length > 0) {
        await tx.practitionerQualification.createMany({
          data: data.qualifications.map((q: any) => ({
            practitionerId: id,
            qualificationType: q.qualificationType,
            degreeName: q.degreeName,
            specialization: q.specialization || null,
            institution: q.institution,
            issuingOrganization: q.issuingOrganization,
            country: q.country,
            completionDate: new Date(q.completionDate),
            certificateNumber: q.certificateNumber,
          })),
        });
      }

      if (data.specialties && data.specialties.length > 0) {
        await tx.practitionerSpecialty.createMany({
          data: data.specialties.map((s: any) => ({
            practitionerId: id,
            specialtyCode: s.specialtyCode,
            specialtySystem: s.specialtySystem,
            specialtyDisplay: s.specialtyDisplay,
            isPrimary: s.isPrimary,
          })),
        });
      }

      if (data.documents && data.documents.length > 0) {
        await tx.verificationDocument.createMany({
          data: data.documents.map((d: any) => ({
            practitionerId: id,
            title: d.title,
            url: d.url,
            status: "current",
            docType: d.docType,
            fileName: d.fileName || null,
            mimeType: d.mimeType || null,
            fileSize: d.fileSize || null,
          })),
        });
      }

      if (data.consent) {
        const consentData = [];
        const signedBy = session.user.id;
        const ver = "1.0";
        if (data.consent.platformTermsAccepted !== undefined) {
          consentData.push({ practitionerId: id, consentType: "platformTerms", version: ver, accepted: data.consent.platformTermsAccepted, acceptedBy: signedBy });
        }
        if (data.consent.privacyPolicyAccepted !== undefined) {
          consentData.push({ practitionerId: id, consentType: "privacyPolicy", version: ver, accepted: data.consent.privacyPolicyAccepted, acceptedBy: signedBy });
        }
        if (data.consent.telemedicineTermsAccepted !== undefined) {
          consentData.push({ practitionerId: id, consentType: "telemedicine", version: ver, accepted: data.consent.telemedicineTermsAccepted, acceptedBy: signedBy });
        }
        if (data.consent.aiAssistanceAcknowledgement !== undefined) {
          consentData.push({ practitionerId: id, consentType: "aiAssistance", version: ver, accepted: data.consent.aiAssistanceAcknowledgement, acceptedBy: signedBy });
        }
        if (data.consent.clinicalResponsibilityAcknowledgement !== undefined) {
          consentData.push({ practitionerId: id, consentType: "clinicalResponsibility", version: ver, accepted: data.consent.clinicalResponsibilityAcknowledgement, acceptedBy: signedBy });
        }
        if (consentData.length > 0) {
          await tx.practitionerConsent.createMany({ data: consentData });
        }
      }

      if (data.roles && data.roles.length > 0) {
        for (const role of data.roles) {
          if (!role.organizationId) continue;

          const createdRole = await tx.practitionerRole.create({
            data: {
              practitionerId: id,
              organizationId: role.organizationId,
              designation: role.designation || "Physician",
              department: role.department || null,
              roleCode: "doctor",
              roleDisplay: "Physician",
            },
          });

          if (role.locations && role.locations.length > 0) {
            await tx.practitionerRoleLocation.createMany({
              data: role.locations.map((locId: string) => ({
                roleId: createdRole.id,
                locationId: locId,
              })),
            });
          }

          if (role.services && role.services.length > 0) {
            await tx.practitionerService.createMany({
              data: role.services.map((srv: any) => ({
                practitionerId: id,
                roleId: createdRole.id,
                serviceCode: srv.serviceCode,
                serviceName: srv.serviceName,
                consultationMode: srv.consultationMode,
                duration: srv.duration,
                fee: srv.fee,
                currency: srv.currency,
                active: srv.active,
              })),
            });
          }

          if (role.availabilities && role.availabilities.length > 0) {
            await tx.practitionerAvailability.createMany({
              data: role.availabilities.map((a: any) => ({
                roleId: createdRole.id,
                dayOfWeek: a.dayOfWeek,
                availableFrom: a.availableFrom,
                availableTo: a.availableTo,
                timezone: a.timezone,
                appointmentDurationMinutes: a.appointmentDurationMinutes,
                bufferMinutes: a.bufferMinutes,
                active: true,
              })),
            });
          }
        }
      }

      return tx.practitioner.findUnique({
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
              locations: true,
            }
          }
        }
      });
    });

    if (updatedPractitioner) {
      await logAudit({
        userId: session.user.id,
        action: "ONBOARDING_UPDATED",
        resource: "Practitioner",
        resourceId: id,
        details: `Draft updated. Status: ${updatedPractitioner.status}`
      });
    }

    return NextResponse.json(normalizePractitioner(updatedPractitioner));
  } catch (error: any) {
    console.error("PATCH onboarding error:", error);
    return formatErrorResponse("INTERNAL_SERVER_ERROR", "Internal Server Error occurred.", 500);
  }
}
