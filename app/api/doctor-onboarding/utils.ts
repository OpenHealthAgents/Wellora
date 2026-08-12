import { NextResponse } from "next/server";

export function formatErrorResponse(code: string, message: string, status = 400, fields: Record<string, string> = {}) {
  return NextResponse.json({
    error: {
      code,
      message,
      fields
    }
  }, { status });
}

export function normalizePractitioner(p: any) {
  const birthDateStr = p.birthDate && p.birthDate.getTime() !== 0
    ? p.birthDate.toISOString().split("T")[0]
    : "";

  const doctorData = {
    title: p.title,
    firstName: p.firstName,
    middleName: p.middleName,
    lastName: p.lastName,
    displayName: p.displayName,
    email: p.email,
    phone: p.phone,
    gender: p.gender,
    birthDate: birthDateStr,
    preferredContactMethod: p.preferredContactMethod,
    professionalBio: p.professionalBio,
    yearsOfExperience: p.yearsOfExperience,
    submittedAt: p.submittedAt,
    verifiedAt: p.verifiedAt,
    languages: (p.languages || []).map((l: any) => ({
      languageCode: l.languageCode,
      languageName: l.languageName,
      proficiency: l.proficiency,
      preferredForConsultation: l.preferredForConsultation,
    })),
    identifiers: (p.identifiers || []).map((i: any) => ({
      system: i.system,
      value: i.value,
      type: i.type,
      use: i.use,
      issuer: i.issuer,
      periodStart: i.periodStart ? i.periodStart.toISOString().split("T")[0] : null,
      periodEnd: i.periodEnd ? i.periodEnd.toISOString().split("T")[0] : null,
    })),
    qualifications: (p.qualifications || []).map((q: any) => ({
      qualificationType: q.qualificationType,
      degreeName: q.degreeName,
      specialization: q.specialization,
      institution: q.institution,
      issuingOrganization: q.issuingOrganization,
      country: q.country,
      completionDate: q.completionDate.toISOString().split("T")[0],
      certificateNumber: q.certificateNumber,
    })),
    specialties: (p.specialties || []).map((s: any) => ({
      specialtyCode: s.specialtyCode,
      specialtySystem: s.specialtySystem,
      specialtyDisplay: s.specialtyDisplay,
      isPrimary: s.isPrimary,
    })),
    documents: (p.documents || []).map((d: any) => ({
      title: d.title,
      url: d.url,
      docType: d.docType,
      fileName: d.fileName,
      mimeType: d.mimeType,
      fileSize: d.fileSize,
    })),
    roles: (p.roles || []).map((r: any) => ({
      organizationId: r.organizationId,
      designation: r.designation,
      department: r.department,
      roleCode: r.roleCode,
      roleDisplay: r.roleDisplay,
      locations: (r.locations || []).map((l: any) => l.locationId || l),
      services: (r.services || []).map((s: any) => ({
        serviceCode: s.serviceCode,
        serviceName: s.serviceName,
        consultationMode: s.consultationMode,
        duration: s.duration,
        fee: s.fee,
        currency: s.currency,
        active: s.active,
      })),
      availabilities: (r.availabilities || []).map((a: any) => ({
        dayOfWeek: a.dayOfWeek,
        availableFrom: a.availableFrom,
        availableTo: a.availableTo,
        timezone: a.timezone,
        appointmentDurationMinutes: a.appointmentDurationMinutes,
        bufferMinutes: a.bufferMinutes,
      })),
    })),
    consent: {
      platformTermsAccepted: (p.consents || []).some((c: any) => c.consentType === "platformTerms" && c.accepted),
      privacyPolicyAccepted: (p.consents || []).some((c: any) => c.consentType === "privacyPolicy" && c.accepted),
      telemedicineTermsAccepted: (p.consents || []).some((c: any) => c.consentType === "telemedicine" && c.accepted),
      aiAssistanceAcknowledgement: (p.consents || []).some((c: any) => c.consentType === "aiAssistance" && c.accepted),
      clinicalResponsibilityAcknowledgement: (p.consents || []).some((c: any) => c.consentType === "clinicalResponsibility" && c.accepted),
    }
  };

  const fhirPractitionerId = `Practitioner/${p.id}`;
  const fhirPractitionerRoleIds = (p.roles || []).map((r: any) => `PractitionerRole/${r.id}`);
  const fhirOrganizationIds = (p.roles || []).map((r: any) => `Organization/${r.organizationId}`);

  const locationIdsSet = new Set<string>();
  (p.roles || []).forEach((r: any) => {
    (r.locations || []).forEach((l: any) => {
      locationIdsSet.add(`Location/${l.locationId || l}`);
    });
  });

  const serviceIdsSet = new Set<string>();
  (p.roles || []).forEach((r: any) => {
    (r.services || []).forEach((s: any) => {
      serviceIdsSet.add(`HealthcareService/${s.id || s.serviceCode}`);
    });
  });

  return {
    id: p.id,
    status: p.status,
    doctor: doctorData,
    fhir: {
      practitionerId: fhirPractitionerId,
      practitionerRoleIds: Array.from(fhirPractitionerRoleIds),
      organizationIds: Array.from(fhirOrganizationIds),
      locationIds: Array.from(locationIdsSet),
      healthcareServiceIds: Array.from(serviceIdsSet)
    },
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null
  };
}
