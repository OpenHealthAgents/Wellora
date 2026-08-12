import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DraftOnboardingSchema } from "@/lib/onboarding-validation";
import { OnboardingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
            locations: {
              include: {
                location: true,
              }
            },
            organization: true,
          },
        },
      },
    });

    if (!practitioner) {
      return NextResponse.json({ status: "not_started" });
    }

    const birthDateStr = practitioner.birthDate && practitioner.birthDate.getTime() !== 0
      ? practitioner.birthDate.toISOString().split("T")[0]
      : "";

    // Assembly consent object from consents list
    const consentObj = {
      platformTermsAccepted: practitioner.consents.some(c => c.consentType === "platformTerms" && c.accepted),
      privacyPolicyAccepted: practitioner.consents.some(c => c.consentType === "privacyPolicy" && c.accepted),
      telemedicineTermsAccepted: practitioner.consents.some(c => c.consentType === "telemedicine" && c.accepted),
      aiAssistanceAcknowledgement: practitioner.consents.some(c => c.consentType === "aiAssistance" && c.accepted),
      clinicalResponsibilityAcknowledgement: practitioner.consents.some(c => c.consentType === "clinicalResponsibility" && c.accepted),
    };

    return NextResponse.json({
      status: practitioner.status,
      id: practitioner.id,
      rejectionReason: practitioner.documents.find(d => d.rejectionReason)?.rejectionReason || null, // fallback
      data: {
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
        professionalBio: practitioner.professionalBio,
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
          qualificationType: q.qualificationType,
          degreeName: q.degreeName,
          specialization: q.specialization,
          institution: q.institution,
          issuingOrganization: q.issuingOrganization,
          country: q.country,
          completionDate: q.completionDate.toISOString().split("T")[0],
          certificateNumber: q.certificateNumber,
          documentReferenceId: q.id, // mapped reference
        })),
        specialties: practitioner.specialties.map(s => ({
          specialtyCode: s.specialtyCode,
          specialtySystem: s.specialtySystem,
          specialtyDisplay: s.specialtyDisplay,
          isPrimary: s.isPrimary,
        })),
        roles: practitioner.roles.map(r => ({
          organizationId: r.organizationId,
          designation: r.designation,
          department: r.department,
          roleCode: r.roleCode,
          roleDisplay: r.roleDisplay,
          locations: r.locations.map(l => l.locationId),
          services: r.services.map(s => ({
            serviceCode: s.serviceCode,
            serviceName: s.serviceName,
            consultationMode: s.consultationMode,
            duration: s.duration,
            fee: s.fee,
            currency: s.currency,
            active: s.active,
          })),
          availabilities: r.availabilities.map(a => ({
            dayOfWeek: a.dayOfWeek,
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
          docType: d.docType,
          fileName: d.fileName,
          mimeType: d.mimeType,
          fileSize: d.fileSize,
        })),
        consent: consentObj,
      },
    });
  } catch (error: any) {
    console.error("GET onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = DraftOnboardingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    const practitioner = await prisma.$transaction(async (tx) => {
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

        // Clean up relation tables
        await tx.practitionerIdentifier.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerQualification.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerSpecialty.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerLanguage.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerConsent.deleteMany({ where: { practitionerId: pId } });
        await tx.verificationDocument.deleteMany({ where: { practitionerId: pId } });
        await tx.practitionerService.deleteMany({ where: { practitionerId: pId } });
        
        const roles = await tx.practitionerRole.findMany({ where: { practitionerId: pId } });
        const roleIds = roles.map(r => r.id);
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

      // Languages
      if (data.languages && data.languages.length > 0) {
        await tx.practitionerLanguage.createMany({
          data: data.languages.map(l => ({
            practitionerId: pId,
            languageCode: l.languageCode,
            languageName: l.languageName,
            proficiency: l.proficiency,
            preferredForConsultation: l.preferredForConsultation,
          })),
        });
      }

      // Identifiers
      if (data.identifiers && data.identifiers.length > 0) {
        await tx.practitionerIdentifier.createMany({
          data: data.identifiers.map(i => ({
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

      // Qualifications
      if (data.qualifications && data.qualifications.length > 0) {
        await tx.practitionerQualification.createMany({
          data: data.qualifications.map(q => ({
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

      // Specialties
      if (data.specialties && data.specialties.length > 0) {
        await tx.practitionerSpecialty.createMany({
          data: data.specialties.map(s => ({
            practitionerId: pId,
            specialtyCode: s.specialtyCode,
            specialtySystem: s.specialtySystem,
            specialtyDisplay: s.specialtyDisplay,
            isPrimary: s.isPrimary,
          })),
        });
      }

      // Documents
      if (data.documents && data.documents.length > 0) {
        await tx.verificationDocument.createMany({
          data: data.documents.map(d => ({
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

      // Consents
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

      // Roles & Availabilities & Services
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

          // Link locations
          if (role.locations && role.locations.length > 0) {
            await tx.practitionerRoleLocation.createMany({
              data: role.locations.map(locId => ({
                roleId: createdRole.id,
                locationId: locId,
              })),
            });
          }

          // Link services
          if (role.services && role.services.length > 0) {
            await tx.practitionerService.createMany({
              data: role.services.map(srv => ({
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

          // Link availabilities
          if (role.availabilities && role.availabilities.length > 0) {
            await tx.practitionerAvailability.createMany({
              data: role.availabilities.map(a => ({
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
            },
          },
        },
      });
    });

    return NextResponse.json({ status: "success", data: practitioner });
  } catch (error: any) {
    console.error("POST onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
