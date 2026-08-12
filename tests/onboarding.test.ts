import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { 
  DoctorOnboardingSchema,
  DoctorOnboardingSubmitSchema,
  DoctorIdentitySchema,
  DoctorContactSchema,
  DoctorIdentifierSchema,
  DoctorRegistrationSchema,
  DoctorQualificationSchema,
  DoctorSpecialtySchema,
  DoctorOrganizationRoleSchema,
  DoctorLocationSchema,
  DoctorLanguageSchema,
  DoctorServiceSchema,
  DoctorPricingSchema,
  DoctorAvailabilitySchema,
  DoctorProfessionalProfileSchema,
  DoctorVerificationDocumentSchema,
  DoctorConsentSchema,
  DraftOnboardingSchema, 
  SubmitOnboardingSchema, 
  VerificationSchema,
  PhoneSchema
} from "../lib/onboarding-validation";
import { 
  mapToFHIRPractitioner, 
  mapToFHIRPractitionerRole, 
  mapToFHIROrganization, 
  mapToFHIRLocation, 
  mapToFHIRHealthcareService, 
  mapToFHIRDocumentReference 
} from "../lib/fhir-mapper";
import prisma from "../lib/prisma";

const mockPractitionerData = {
  id: "practitioner-123",
  title: "Dr.",
  firstName: "Alexis",
  middleName: "Marie",
  lastName: "Carter",
  displayName: "Dr. Alexis Carter",
  email: "doctor@example.com",
  phone: "+15551234567",
  alternatePhone: "+15557654321",
  preferredContactMethod: "email",
  gender: "female",
  birthDate: "1985-06-15",
  professionalBio: "Experienced general practitioner focused on preventive lifestyle medicine.",
  yearsOfExperience: 10,
  languages: [
    { languageCode: "en", languageName: "English", proficiency: "native", preferredForConsultation: true },
    { languageCode: "es", languageName: "Spanish", proficiency: "fluent", preferredForConsultation: false }
  ],
  status: "VERIFIED",
  rejectionReason: null,
  identifiers: [
    { system: "http://hl7.org/fhir/sid/us-npi", value: "9988776655", type: "NPI", use: "official", issuer: "NPPES" }
  ],
  qualifications: [
    { qualificationType: "PG", degreeName: "MD", specialization: "General Medicine", institution: "Harvard Medical School", issuingOrganization: "American Board of Family Medicine", country: "US", completionDate: "2012-05-30", certificateNumber: "ABFM-9988" }
  ],
  specialties: [
    { specialtyCode: "408443003", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "General medical practice", isPrimary: true }
  ],
  roles: [
    {
      id: "role-456",
      organizationId: "org-1",
      designation: "Senior Consultant",
      department: "Family Medicine",
      roleCode: "doctor",
      roleDisplay: "Physician",
      locations: [
        { locationId: "loc-2" }
      ],
      services: [
        { serviceCode: "srv-video", serviceName: "Video Consultation", consultationMode: "video", duration: 15, fee: 500, currency: "INR", active: true }
      ],
      availabilities: [
        { dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00", timezone: "Asia/Kolkata", appointmentDurationMinutes: 15, bufferMinutes: 5 }
      ]
    }
  ],
  documents: [
    { id: "doc-789", title: "Medical License", url: "http://localhost/uploads/license.pdf", docType: "license", status: "current", mimeType: "application/pdf", fileSize: 1048576 }
  ],
  consents: [
    { consentType: "telemedicine", version: "1.0", accepted: true, acceptedAt: "2026-08-09T00:00:00Z", acceptedBy: "user-123" }
  ]
};

// Base payload that strictly matches DoctorOnboardingSubmitSchema
const validSubmitPayload = {
  title: "Dr.",
  firstName: "Alexis",
  lastName: "Carter",
  displayName: "Dr. Alexis Carter",
  email: "doctor@example.com",
  phone: "+15551234567",
  alternatePhone: "+15557654321",
  preferredContactMethod: "email",
  gender: "female",
  birthDate: "1985-06-15",
  professionalBio: "Experienced general practitioner focused on preventive lifestyle medicine.",
  yearsOfExperience: 10,
  languages: [
    { languageCode: "en", languageName: "English", proficiency: "native", preferredForConsultation: true }
  ],
  identifiers: [
    { system: "http://hl7.org/fhir/sid/us-npi", value: "9988776655", type: "NPI" }
  ],
  qualifications: [
    { qualificationType: "PG", degreeName: "MD", specialization: "General Medicine", institution: "Harvard Medical School", issuingOrganization: "American Board of Family Medicine", country: "US", completionDate: "2012-05-30", certificateNumber: "ABFM-9988" }
  ],
  specialties: [
    { specialtyCode: "408443003", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "General practice", isPrimary: true }
  ],
  roles: [
    {
      organizationId: "org-123",
      locations: ["loc-456"],
      designation: "Senior Consultant",
      department: "General Medicine",
      roleCode: "doctor",
      roleDisplay: "Physician",
      services: [
        { serviceCode: "srv-video", serviceName: "Video Consultation", consultationMode: "video", duration: 15, fee: 500, currency: "INR", active: true }
      ],
      availabilities: [
        { dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00", timezone: "Asia/Kolkata", appointmentDurationMinutes: 15, bufferMinutes: 5 }
      ]
    }
  ],
  documents: [
    { title: "Medical License", url: "https://localhost/uploads/license.pdf", docType: "license" }
  ],
  consent: {
    platformTermsAccepted: true,
    privacyPolicyAccepted: true,
    telemedicineTermsAccepted: true,
    aiAssistanceAcknowledgement: true,
    clinicalResponsibilityAcknowledgement: true
  }
};

describe("doctor onboarding validation", () => {
  it("allows saving a partial draft with missing fields (incomplete draft)", () => {
    const draftInput = {
      firstName: "Alexis",
      email: "alexis@example.com",
      languages: [
        { languageCode: "en", languageName: "English", proficiency: "native", preferredForConsultation: true }
      ]
    };
    const result = DoctorOnboardingSchema.safeParse(draftInput);
    assert.equal(result.success, true);
  });

  it("succeeds strict submission with complete data (valid doctor)", () => {
    const result = DoctorOnboardingSubmitSchema.safeParse(validSubmitPayload);
    assert.equal(result.success, true);
    // Verify email lowercase normalization
    if (result.success) {
      assert.equal(result.data.email, "doctor@example.com");
    }
  });

  it("fails strict submission if required fields are missing (invalid submission)", () => {
    const incompleteInput = { ...validSubmitPayload, firstName: "" };
    const result = DoctorOnboardingSubmitSchema.safeParse(incompleteInput);
    assert.equal(result.success, false);
  });

  it("rejects invalid email formats (invalid email)", () => {
    const badEmailInput = { ...validSubmitPayload, email: "not-an-email" };
    const result = DoctorOnboardingSubmitSchema.safeParse(badEmailInput);
    assert.equal(result.success, false);
  });

  it("rejects non-E.164 phone formats while accepting valid ones (invalid phone)", () => {
    // Valid international formats
    assert.equal(PhoneSchema.safeParse("+919876543210").success, true);
    assert.equal(PhoneSchema.safeParse("+15551234567").success, true);
    
    // Invalid formats
    assert.equal(PhoneSchema.safeParse("9876543210").success, false); // no '+'
    assert.equal(PhoneSchema.safeParse("+019876543210").success, false); // E.164 CC cannot start with 0
    assert.equal(PhoneSchema.safeParse("not-a-number").success, false);
  });

  it("rejects availability slots with invalid hours or duration (invalid availability)", () => {
    // Valid slot
    const validSlot = { dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00", timezone: "Asia/Kolkata", appointmentDurationMinutes: 15, bufferMinutes: 5 };
    assert.equal(DoctorAvailabilitySchema.safeParse(validSlot).success, true);

    // End time before start time
    const badTimeSlot = { ...validSlot, availableFrom: "17:00", availableTo: "09:00" };
    assert.equal(DoctorAvailabilitySchema.safeParse(badTimeSlot).success, false);

    // Invalid Timezone
    const badTzSlot = { ...validSlot, timezone: "Invalid/Zone" };
    assert.equal(DoctorAvailabilitySchema.safeParse(badTzSlot).success, false);

    // Negative duration/buffer
    const negDuration = { ...validSlot, appointmentDurationMinutes: -15 };
    const negBuffer = { ...validSlot, bufferMinutes: -5 };
    assert.equal(DoctorAvailabilitySchema.safeParse(negDuration).success, false);
    assert.equal(DoctorAvailabilitySchema.safeParse(negBuffer).success, false);
  });

  it("fails if multiple specialties are marked as primary (duplicate primary specialty)", () => {
    const doublePrimarySpecialties = {
      ...validSubmitPayload,
      specialties: [
        { specialtyCode: "408443003", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "General practice", isPrimary: true },
        { specialtyCode: "394814009", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "Cardiology", isPrimary: true }
      ]
    };
    const result = DoctorOnboardingSubmitSchema.safeParse(doublePrimarySpecialties);
    assert.equal(result.success, false);
  });

  it("fails if any mandatory consents are false (missing consent)", () => {
    const missingConsent = {
      ...validSubmitPayload,
      consent: {
        ...validSubmitPayload.consent,
        privacyPolicyAccepted: false
      }
    };
    const result = DoctorOnboardingSubmitSchema.safeParse(missingConsent);
    assert.equal(result.success, false);
  });

  it("fails if no medical qualification is supplied (invalid qualification)", () => {
    const missingQualifications = { ...validSubmitPayload, qualifications: [] };
    const result = DoctorOnboardingSubmitSchema.safeParse(missingQualifications);
    assert.equal(result.success, false);
  });

  it("succeeds with multiple practicing roles (multiple organizations)", () => {
    const multipleRoles = {
      ...validSubmitPayload,
      roles: [
        validSubmitPayload.roles[0],
        {
          organizationId: "org-789",
          locations: ["loc-999"],
          designation: "Associate Professor",
          roleCode: "doctor",
          roleDisplay: "Physician",
          services: validSubmitPayload.roles[0].services,
          availabilities: validSubmitPayload.roles[0].availabilities
        }
      ]
    };
    const result = DoctorOnboardingSubmitSchema.safeParse(multipleRoles);
    assert.equal(result.success, true);
  });

  it("succeeds with multiple consultation languages (multiple languages)", () => {
    const multipleLanguages = {
      ...validSubmitPayload,
      languages: [
        { languageCode: "en", languageName: "English", proficiency: "native", preferredForConsultation: true },
        { languageCode: "hi", languageName: "Hindi", proficiency: "fluent", preferredForConsultation: false }
      ]
    };
    const result = DoctorOnboardingSubmitSchema.safeParse(multipleLanguages);
    assert.equal(result.success, true);
  });

  it("fails if duplicate system + value identifiers are provided (multiple identifiers check)", () => {
    // Valid multiple different identifiers
    const validMultipleIdents = {
      ...validSubmitPayload,
      identifiers: [
        { system: "http://hl7.org/fhir/sid/us-npi", value: "9988776655", type: "NPI" },
        { system: "http://example.com/state-license", value: "LIC-12345", type: "StateLicense" }
      ]
    };
    assert.equal(DoctorOnboardingSubmitSchema.safeParse(validMultipleIdents).success, true);

    // Duplicate identifier keys (system + value)
    const duplicateIdents = {
      ...validSubmitPayload,
      identifiers: [
        { system: "http://hl7.org/fhir/sid/us-npi", value: "9988776655", type: "NPI" },
        { system: "http://hl7.org/fhir/sid/us-npi", value: "9988776655", type: "NPI" }
      ]
    };
    assert.equal(DoctorOnboardingSubmitSchema.safeParse(duplicateIdents).success, false);
  });

  it("validates admin decisions correctly", () => {
    const approveResult = VerificationSchema.safeParse({ status: "approved" });
    assert.equal(approveResult.success, true);

    const rejectNoReasonResult = VerificationSchema.safeParse({ status: "rejected" });
    assert.equal(rejectNoReasonResult.success, false);

    const rejectWithReasonResult = VerificationSchema.safeParse({ status: "rejected", rejectionReason: "Incorrect license number." });
    assert.equal(rejectWithReasonResult.success, true);
  });
});

describe("FHIR R4.0.1 mapping serialization", () => {
  it("maps practitioner profile details to FHIR R4 Practitioner resource", () => {
    const fhirPractitioner = mapToFHIRPractitioner(mockPractitionerData);
    assert.equal(fhirPractitioner.resourceType, "Practitioner");
    assert.equal(fhirPractitioner.id, mockPractitionerData.id);
    assert.equal(fhirPractitioner.active, true);
    assert.equal(fhirPractitioner.gender, "female");
    assert.equal(fhirPractitioner.name?.[0].family, "Carter");
    assert.equal(fhirPractitioner.name?.[0].given[0], "Alexis");
    assert.equal(fhirPractitioner.name?.[0].given[1], "Marie");
    assert.equal(fhirPractitioner.telecom?.[0].value, "doctor@example.com");
    assert.equal(fhirPractitioner.qualification?.[0].code.text, "MD");
    assert.equal(fhirPractitioner.qualification?.[0].issuer?.display, "Harvard Medical School");
  });

  it("maps practitioner role assignments to FHIR R4 PractitionerRole resource", () => {
    const dbRole = {
      id: "role-456",
      practitionerId: "practitioner-123",
      organizationId: "org-1",
      designation: "Senior Consultant",
      department: "Family Medicine",
      roleCode: "doctor",
      roleDisplay: "Physician",
      active: true,
      locations: [
        { locationId: "loc-2" }
      ],
      services: [
        { serviceCode: "srv-video", serviceName: "Video Consultation", consultationMode: "video", duration: 15, fee: 500, currency: "INR", active: true }
      ],
      availabilities: [
        { dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00", timezone: "Asia/Kolkata", appointmentDurationMinutes: 15, bufferMinutes: 5 }
      ],
      practitioner: {
        specialties: [
          { specialtyCode: "408443003", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "General medical practice", isPrimary: true }
        ]
      }
    };

    const fhirRole = mapToFHIRPractitionerRole(dbRole);
    assert.equal(fhirRole.resourceType, "PractitionerRole");
    assert.equal(fhirRole.id, dbRole.id);
    assert.equal(fhirRole.practitioner?.reference, "Practitioner/practitioner-123");
    assert.equal(fhirRole.organization?.reference, "Organization/org-1");
    assert.equal(fhirRole.location?.[0].reference, "Location/loc-2");
    assert.equal(fhirRole.specialty?.[0].coding?.[0].code, "408443003");
    assert.equal(fhirRole.healthcareService?.[0].reference, "HealthcareService/srv-video");
    assert.equal(fhirRole.availableTime?.[0].daysOfWeek?.[0], "mon");
    assert.equal(fhirRole.availableTime?.[0].availableStartTime, "09:00");
  });

  it("maps organizations to FHIR R4 Organization resource", () => {
    const dbOrg = { id: "org-1", name: "DrGodly Telehealth Group", active: true };
    const fhirOrg = mapToFHIROrganization(dbOrg);
    assert.equal(fhirOrg.resourceType, "Organization");
    assert.equal(fhirOrg.id, dbOrg.id);
    assert.equal(fhirOrg.name, dbOrg.name);
    assert.equal(fhirOrg.active, true);
  });

  it("maps locations to FHIR R4 Location resource", () => {
    const dbLoc = { id: "loc-2", name: "Downtown Health Center", address: "789 Broadway Ave", city: "New York", state: "NY", postalCode: "10003", country: "US", active: true };
    const fhirLoc = mapToFHIRLocation(dbLoc);
    assert.equal(fhirLoc.resourceType, "Location");
    assert.equal(fhirLoc.id, dbLoc.id);
    assert.equal(fhirLoc.name, dbLoc.name);
    assert.equal(fhirLoc.address?.city, dbLoc.city);
    assert.equal(fhirLoc.address?.text, dbLoc.address);
  });

  it("maps services to FHIR R4 HealthcareService resource", () => {
    const dbSrv = { id: "srv-video", name: "Video Consultation", type: "Telehealth", active: true };
    const fhirSrv = mapToFHIRHealthcareService(dbSrv);
    assert.equal(fhirSrv.resourceType, "HealthcareService");
    assert.equal(fhirSrv.id, dbSrv.id);
    assert.equal(fhirSrv.name, dbSrv.name);
    assert.equal(fhirSrv.type?.[0].text, dbSrv.type);
  });

  it("maps documents to FHIR R4 DocumentReference resource", () => {
    const dbDoc = { id: "doc-789", practitionerId: "practitioner-123", title: "Medical License", url: "http://localhost/uploads/license.pdf", docType: "license", status: "current" };
    const fhirDoc = mapToFHIRDocumentReference(dbDoc);
    assert.equal(fhirDoc.resourceType, "DocumentReference");
    assert.equal(fhirDoc.id, dbDoc.id);
    assert.equal(fhirDoc.status, "current");
    assert.equal(fhirDoc.type?.text, "license");
    assert.equal(fhirDoc.content[0].attachment.url, dbDoc.url);
  });
});

describe("Database constraints", () => {
  it("enforces at most one primary specialty per practitioner", async () => {
    const tempUser = await prisma.user.create({
      data: {
        email: "temp-doctor-test@drgodly.com",
        name: "Temp Doctor",
        role: "doctor"
      }
    });

    const tempPractitioner = await prisma.practitioner.create({
      data: {
        userId: tempUser.id,
        firstName: "Temp",
        lastName: "Doctor",
        email: "temp-doctor-test@drgodly.com",
        phone: "9998887776",
        gender: "unknown",
        birthDate: new Date("1990-01-01"),
        displayName: "Dr. Temp"
      }
    });

    try {
      // Create first primary specialty (should succeed)
      await prisma.practitionerSpecialty.create({
        data: {
          practitionerId: tempPractitioner.id,
          specialtyCode: "408443003",
          specialtySystem: "http://snomed.info/sct",
          specialtyDisplay: "General practice",
          isPrimary: true
        }
      });

      // Attempt to create second primary specialty (should fail database constraint)
      await assert.rejects(
        prisma.practitionerSpecialty.create({
          data: {
            practitionerId: tempPractitioner.id,
            specialtyCode: "394814009",
            specialtySystem: "http://snomed.info/sct",
            specialtyDisplay: "Cardiology",
            isPrimary: true
          }
        }),
        /Unique constraint failed|violates unique constraint/i
      );

      // Verify that creating a secondary specialty (isPrimary = false) succeeds
      const secondarySpec = await prisma.practitionerSpecialty.create({
        data: {
          practitionerId: tempPractitioner.id,
          specialtyCode: "394814009",
          specialtySystem: "http://snomed.info/sct",
          specialtyDisplay: "Cardiology",
          isPrimary: false
        }
      });
      assert.ok(secondarySpec.id);

    } finally {
      // Clean up database records
      await prisma.user.delete({ where: { id: tempUser.id } }).catch(() => {});
    }
  });
});
