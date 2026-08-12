import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { DoctorOnboardingSchema } from "../../../lib/onboarding-validation";
import { OnboardingStatus } from "@prisma/client";
import { logAudit } from "../../../lib/audit";
import { formatErrorResponse, normalizePractitioner } from "./utils";

export const dynamic = "force-dynamic";

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

  if (!session) {
    return formatErrorResponse("UNAUTHORIZED", "User session is not authenticated.", 401);
  }

  try {
    if (session.user.role === "admin") {
      const list = await prisma.practitioner.findMany({
        orderBy: { updatedAt: "desc" },
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
      return NextResponse.json(list.map(normalizePractitioner));
    }

    const practitioner = await prisma.practitioner.findUnique({
      where: { userId: session.user.id },
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
      return formatErrorResponse("NOT_FOUND", "No onboarding application found.", 404);
    }

    return NextResponse.json(normalizePractitioner(practitioner));
  } catch (error: any) {
    console.error("GET onboarding base error:", error);
    return formatErrorResponse("INTERNAL_SERVER_ERROR", "Internal Server Error occurred.", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await getRequestHeaders(),
  });

  if (!session) {
    return formatErrorResponse("UNAUTHORIZED", "User session is not authenticated.", 401);
  }

  try {
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

    const practitioner = await prisma.$transaction(async (tx: any) => {
      const existing = await tx.practitioner.findUnique({
        where: { userId: session.user.id },
      });

      const practitionerData = {
        title: data.title || "Dr.",
        firstName: data.firstName || "",
        middleName: data.middleName || null,
        lastName: data.lastName || "",
        displayName: data.displayName || "",
        email: data.email || session.user.email,
        phone: data.phone || "",
        gender: data.gender || "unknown",
        birthDate: data.birthDate ? new Date(data.birthDate) : new Date(0),
        preferredContactMethod: data.preferredContactMethod || "email",
        professionalBio: data.professionalBio || null,
        yearsOfExperience: data.yearsOfExperience || 0,
        status: existing ? (existing.status === OnboardingStatus.REJECTED ? OnboardingStatus.DRAFT : existing.status) : OnboardingStatus.DRAFT,
      };

      let pId: string;

      if (existing) {
        pId = existing.id;
        await tx.practitioner.update({
          where: { id: pId },
          data: practitionerData,
        });

        await tx.practitionerIdentifier.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerQualification.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerSpecialty.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerLanguage.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerConsent.deleteMany({ where: { practitionerId: pId } });
        await tx.verificationDocument.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerService.deleteMany({ where: { practitionerId: pId } });
        
        const roles = await tx.practitionerRole.findMany({ where: { practitionerId: pId } });
        const roleIds = roles.map((r: any) => r.id);
        await tx.practitionerAvailability.deleteMany({ where: { roleId: { in: roleIds } } });
        await tx.practitionerRoleLocation.deleteMany({ where: { roleId: { in: roleIds } } });
        await tx.practitionerRole.deleteMany({ where: { practitionerId: pId } });
      } else {
        const created = await tx.practitioner.create({
          data: {
            ...practitionerData,
            userId: session.user.id,
          },
        });
        pId = created.id;
      }

      if (data.languages && data.languages.length > 0) {
        await tx.practitionerLanguage.createMany({
          data: data.languages.map((l: any) => ({
            practitionerId: pId,
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
            practitionerId: pId,
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
            practitionerId: pId,
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
            practitionerId: pId,
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
            practitionerId: pId,
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
          consentData.push({ practitionerId: pId, consentType: "platformTerms", version: ver, accepted: data.consent.platformTermsAccepted, acceptedBy: signedBy });
        }
        if (data.consent.privacyPolicyAccepted !== undefined) {
          consentData.push({ practitionerId: pId, consentType: "privacyPolicy", version: ver, accepted: data.consent.privacyPolicyAccepted, acceptedBy: signedBy });
        }
        if (data.consent.telemedicineTermsAccepted !== undefined) {
          consentData.push({ practitionerId: pId, consentType: "telemedicine", version: ver, accepted: data.consent.telemedicineTermsAccepted, acceptedBy: signedBy });
        }
        if (data.consent.aiAssistanceAcknowledgement !== undefined) {
          consentData.push({ practitionerId: pId, consentType: "aiAssistance", version: ver, accepted: data.consent.aiAssistanceAcknowledgement, acceptedBy: signedBy });
        }
        if (data.consent.clinicalResponsibilityAcknowledgement !== undefined) {
          consentData.push({ practitionerId: pId, consentType: "clinicalResponsibility", version: ver, accepted: data.consent.clinicalResponsibilityAcknowledgement, acceptedBy: signedBy });
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
              practitionerId: pId,
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
                practitionerId: pId,
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
        where: { id: pId },
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

    if (practitioner) {
      await logAudit({
        userId: session.user.id,
        action: "ONBOARDING_CREATED",
        resource: "Practitioner",
        resourceId: practitioner.id,
        details: `Draft created or updated. Status: ${practitioner.status}`
      });
    }

    return NextResponse.json(normalizePractitioner(practitioner));
  } catch (error: any) {
    console.error("POST onboarding draft error:", error);
    return formatErrorResponse("INTERNAL_SERVER_ERROR", "Internal Server Error occurred.", 500);
  }
}
