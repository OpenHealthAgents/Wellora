import assert from "node:assert/strict";
import { describe, it, before, after, mock } from "node:test";
import { OnboardingStatus } from "@prisma/client";
import { z } from "zod";
import prisma from "../lib/prisma";
import { auth } from "../lib/auth";
import { NextRequest } from "next/server";

// Import Zod schemas and validation utilities
import { 
  DoctorIdentitySchema, DoctorContactSchema, DoctorIdentifierSchema,
  DoctorRegistrationSchema, DoctorQualificationSchema, DoctorSpecialtySchema,
  DoctorOrganizationRoleSchema, DoctorLocationSchema, DoctorLanguageSchema,
  DoctorServiceSchema, DoctorAvailabilitySchema, DoctorPricingSchema,
  DoctorProfessionalProfileSchema, DoctorVerificationDocumentSchema,
  DoctorConsentSchema, DoctorOnboardingSchema, DoctorOnboardingSubmitSchema,
  VerificationSchema
} from "../lib/onboarding-validation";

// Import FHIR mapper utilities
import { 
  mapToFHIRPractitioner, mapToFHIRPractitionerRole, mapToFHIROrganization,
  mapToFHIRLocation, mapToFHIRHealthcareService, mapToFHIRDocumentReference,
  mapToFHIRBundle, validateFHIRResource
} from "../lib/fhir-mapper";

// Import regression checks
import { determineEligibility } from "../lib/eligibility";
import { getPlanPriceForRegion, getOrderTotal } from "../lib/pricing";

// Import Dynamic FHIR Route for security validation
import { GET as GET_FHIR } from "../app/api/fhir/[resourceType]/[id]/route";

describe("Doctor Onboarding — Zod Schemas Unit Tests", () => {
  it("validates DoctorIdentitySchema correctly", () => {
    const valid = { title: "Dr.", firstName: "Alexis", lastName: "Carter", displayName: "Dr. Alexis Carter", gender: "female", birthDate: "1990-01-01" };
    assert.equal(DoctorIdentitySchema.safeParse(valid).success, true);

    const invalid = { title: "", firstName: "  ", lastName: "Patel" }; // Empty/blank names
    assert.equal(DoctorIdentitySchema.safeParse(invalid).success, false);
  });

  it("validates DoctorContactSchema correctly", () => {
    const valid = { email: "alexis@drgodly.com", phone: "+919876543210", preferredContactMethod: "email" };
    assert.equal(DoctorContactSchema.safeParse(valid).success, true);

    const invalid = { email: "invalid-email", phone: "123456" }; // Malformed E.164 and email
    assert.equal(DoctorContactSchema.safeParse(invalid).success, false);
  });

  it("validates DoctorIdentifierSchema correctly", () => {
    const valid = { system: "http://hl7.org/fhir/sid/us-npi", value: "9988776655", type: "NPI" };
    assert.equal(DoctorIdentifierSchema.safeParse(valid).success, true);
  });

  it("validates DoctorRegistrationSchema correctly", () => {
    const valid = { registrationNumber: "IMR-12345", licensingCouncil: "National Medical Commission", country: "India" };
    assert.equal(DoctorRegistrationSchema.safeParse(valid).success, true);
  });

  it("validates DoctorQualificationSchema correctly", () => {
    const valid = { qualificationType: "PG", degreeName: "MD", specialization: "Internal Medicine", institution: "Harvard Medical School", issuingOrganization: "Harvard Board", country: "US", completionDate: "2015-05-15", certificateNumber: "MD-998877" };
    assert.equal(DoctorQualificationSchema.safeParse(valid).success, true);
  });

  it("validates DoctorSpecialtySchema correctly", () => {
    const valid = { specialtyCode: "408443003", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "General medical practice", isPrimary: true };
    assert.equal(DoctorSpecialtySchema.safeParse(valid).success, true);
  });

  it("validates DoctorOrganizationRoleSchema correctly", () => {
    const valid = {
      organizationId: "org-123",
      locations: ["loc-123"],
      designation: "Physician",
      services: [
        { serviceCode: "srv-video", serviceName: "Video Consult", consultationMode: "video", duration: 15, fee: 500, currency: "INR" }
      ],
      availabilities: [
        { dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00", timezone: "Asia/Kolkata", appointmentDurationMinutes: 15, bufferMinutes: 5 }
      ]
    };
    assert.equal(DoctorOrganizationRoleSchema.safeParse(valid).success, true);
  });

  it("validates DoctorLocationSchema correctly", () => {
    const valid = { id: "loc-1", name: "Metro Clinic", address: "100 MG Rd", city: "Bangalore", state: "KA", postalCode: "560001", country: "India" };
    assert.equal(DoctorLocationSchema.safeParse(valid).success, true);
  });

  it("validates DoctorLanguageSchema correctly", () => {
    const valid = { languageCode: "en", languageName: "English", proficiency: "fluent" };
    assert.equal(DoctorLanguageSchema.safeParse(valid).success, true);
  });

  it("validates DoctorServiceSchema correctly", () => {
    const valid = { serviceCode: "srv-chat", serviceName: "Chat Consultation", consultationMode: "chat", duration: 10, fee: 200, currency: "INR" };
    assert.equal(DoctorServiceSchema.safeParse(valid).success, true);
  });

  it("validates DoctorAvailabilitySchema correctly", () => {
    const valid = { dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00", timezone: "Asia/Kolkata", appointmentDurationMinutes: 15, bufferMinutes: 5 };
    assert.equal(DoctorAvailabilitySchema.safeParse(valid).success, true);

    const invalid = { dayOfWeek: "MON", availableFrom: "17:00", availableTo: "09:00", timezone: "Asia/Kolkata", appointmentDurationMinutes: 15, bufferMinutes: 5 }; // End time before start
    assert.equal(DoctorAvailabilitySchema.safeParse(invalid).success, false);
  });

  it("validates DoctorPricingSchema correctly", () => {
    const valid = { fee: 450.50, currency: "INR" };
    assert.equal(DoctorPricingSchema.safeParse(valid).success, true);
  });

  it("validates DoctorProfessionalProfileSchema correctly", () => {
    const valid = { professionalBio: "Senior consultant with 15+ years experience in metabolic health and diabetes.", yearsOfExperience: 15 };
    assert.equal(DoctorProfessionalProfileSchema.safeParse(valid).success, true);
  });

  it("validates DoctorVerificationDocumentSchema correctly", () => {
    const valid = { title: "Medical Council License Certificate", url: "https://drgodly.com/uploads/license.pdf", docType: "license" };
    assert.equal(DoctorVerificationDocumentSchema.safeParse(valid).success, true);
  });

  it("validates DoctorConsentSchema correctly", () => {
    const valid = { platformTermsAccepted: true, privacyPolicyAccepted: true, telemedicineTermsAccepted: true, aiAssistanceAcknowledgement: true, clinicalResponsibilityAcknowledgement: true };
    assert.equal(DoctorConsentSchema.safeParse(valid).success, true);

    const invalid = { platformTermsAccepted: true, privacyPolicyAccepted: false };
    assert.equal(DoctorConsentSchema.safeParse(invalid).success, false);
  });
});

describe("Doctor Onboarding — Component & Form Simulation Tests", () => {
  it("handles repeatable array modifications and parses step values correctly", () => {
    // 1. Simulating repeatable Langs array push/pop
    const initialLangs = [
      { languageCode: "en", languageName: "English", proficiency: "native" as const }
    ];
    assert.equal(z.array(DoctorLanguageSchema).safeParse(initialLangs).success, true);

    const updatedLangs = [
      ...initialLangs,
      { languageCode: "hi", languageName: "Hindi", proficiency: "fluent" as const }
    ];
    assert.equal(z.array(DoctorLanguageSchema).safeParse(updatedLangs).success, true);
    assert.equal(updatedLangs.length, 2);

    // 2. Simulating repeatable Quals array push/pop
    const qualifications = [
      { qualificationType: "UG" as const, degreeName: "MBBS", institution: "MAMC", issuingOrganization: "MAMC Board", country: "IN", completionDate: "2010-03-01", certificateNumber: "UG-11" },
      { qualificationType: "PG" as const, degreeName: "MD", institution: "Harvard", issuingOrganization: "Harvard Board", country: "US", completionDate: "2014-06-01", certificateNumber: "PG-22" }
    ];
    const parseResult = z.array(DoctorQualificationSchema).safeParse(qualifications);
    assert.equal(parseResult.success, true);
  });

  it("maps fields correctly to step indices for UI navigation", () => {
    // Mock getErrorNavigation resolver
    const getErrorNavigation = (path: string): number => {
      if (path.startsWith("consent")) return 13;
      if (path.startsWith("documents")) return 12;
      if (path.includes("professionalBio")) return 11;
      if (path.includes("availabilities")) return 10;
      if (path.includes("fee")) return 9;
      if (path.includes("services")) return 8;
      if (path.includes("languages")) return 7;
      if (path.includes("organization") || path.includes("locations") || path.startsWith("roles")) return 6;
      if (path.includes("specialties")) return 5;
      if (path.includes("qualifications")) return 4;
      if (path.includes("identifiers")) return 3;
      if (path.includes("email") || path.includes("phone")) return 2;
      return 1;
    };

    assert.equal(getErrorNavigation("identifiers.0.value"), 3);
    assert.equal(getErrorNavigation("roles.0.services.0.fee"), 9);
    assert.equal(getErrorNavigation("consent.telemedicineTermsAccepted"), 13);
  });
});

describe("Doctor Onboarding — Integration Pipeline & Data Integrity ('Important Test')", () => {
  let user: any;
  let testDoctor: any;
  let org1: any;
  let org2: any;
  let loc1: any;
  let loc2: any;

  // Track entity IDs for sequential cleanups
  let langIds: string[] = [];
  let specIds: string[] = [];
  let qualIds: string[] = [];
  let roleIds: string[] = [];
  let roleLocIds: string[] = [];
  let serviceIds: string[] = [];
  let availIds: string[] = [];
  let docIds: string[] = [];
  let consentIds: string[] = [];

  before(async () => {
    // Seed User Account
    user = await prisma.user.create({
      data: {
        email: "comp-pipeline@drgodly.com",
        name: "Alexis Carter",
        role: "user"
      }
    });

    // Seed Organizations & Locations
    org1 = await prisma.organization.create({ data: { name: "Endocrine Care Group", active: true } });
    org2 = await prisma.organization.create({ data: { name: "Fortis Telehealth", active: true } });

    loc1 = await prisma.location.create({ data: { name: "Clinic South", address: "10 MG Rd", city: "Mumbai", state: "MH", postalCode: "400001", country: "IN" } });
    loc2 = await prisma.location.create({ data: { name: "Clinic North", address: "50 SV Rd", city: "Mumbai", state: "MH", postalCode: "400002", country: "IN" } });
  });

  after(async () => {
    // Sequential cleanup in reverse relational order
    await prisma.practitionerLanguage.deleteMany({ where: { id: { in: langIds } } });
    await prisma.practitionerSpecialty.deleteMany({ where: { id: { in: specIds } } });
    await prisma.practitionerQualification.deleteMany({ where: { id: { in: qualIds } } });
    await prisma.practitionerAvailability.deleteMany({ where: { id: { in: availIds } } });
    await prisma.practitionerService.deleteMany({ where: { id: { in: serviceIds } } });
    await prisma.practitionerRoleLocation.deleteMany({ where: { id: { in: roleLocIds } } });
    await prisma.practitionerRole.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.verificationDocument.deleteMany({ where: { id: { in: docIds } } });
    await prisma.practitionerConsent.deleteMany({ where: { id: { in: consentIds } } });

    if (testDoctor?.id) {
      await prisma.practitioner.delete({ where: { id: testDoctor.id } });
    }
    if (user?.id) {
      await prisma.user.delete({ where: { id: user.id } });
    }
    await prisma.location.deleteMany({ where: { id: { in: [loc1.id, loc2.id] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [org1.id, org2.id] } } });
  });

  it("attaches 1 doctor, 2 orgs, 2 locs, 3 qualifications, 2 specialties, 3 languages, and 3 services without data loss", async () => {
    // 1. Create Practitioner Draft Profile
    testDoctor = await prisma.practitioner.create({
      data: {
        userId: user.id,
        status: OnboardingStatus.DRAFT,
        title: "Dr.",
        firstName: "Alexis",
        lastName: "Carter",
        displayName: "Dr. Alexis Carter",
        gender: "female",
        birthDate: new Date("1988-06-15"),
        phone: "+919999888822",
        email: "comp-pipeline@drgodly.com",
        professionalBio: "Experienced clinical endocrinologist specializing in GLP-1 therapy.",
        yearsOfExperience: 12
      }
    });

    // 2. Attach 3 languages
    const l1 = await prisma.practitionerLanguage.create({ data: { practitionerId: testDoctor.id, languageCode: "en", languageName: "English", proficiency: "native" } });
    const l2 = await prisma.practitionerLanguage.create({ data: { practitionerId: testDoctor.id, languageCode: "hi", languageName: "Hindi", proficiency: "fluent" } });
    const l3 = await prisma.practitionerLanguage.create({ data: { practitionerId: testDoctor.id, languageCode: "fr", languageName: "French", proficiency: "basic" } });
    langIds.push(l1.id, l2.id, l3.id);

    // 3. Attach 2 specialties
    const s1 = await prisma.practitionerSpecialty.create({ data: { practitionerId: testDoctor.id, specialtyCode: "408443003", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "Endocrinology", isPrimary: true } });
    const s2 = await prisma.practitionerSpecialty.create({ data: { practitionerId: testDoctor.id, specialtyCode: "394582007", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "Family Medicine", isPrimary: false } });
    specIds.push(s1.id, s2.id);

    // 4. Attach 3 qualifications
    const q1 = await prisma.practitionerQualification.create({ data: { practitionerId: testDoctor.id, qualificationType: "UG", degreeName: "MBBS", institution: "MAMC", issuingOrganization: "MAMC Board", country: "India", completionDate: new Date("2010-03-01"), certificateNumber: "UG-11" } });
    const q2 = await prisma.practitionerQualification.create({ data: { practitionerId: testDoctor.id, qualificationType: "PG", degreeName: "MD", specialization: "Internal Medicine", institution: "Harvard", issuingOrganization: "Harvard Board", country: "US", completionDate: new Date("2014-06-01"), certificateNumber: "PG-22" } });
    const q3 = await prisma.practitionerQualification.create({ data: { practitionerId: testDoctor.id, qualificationType: "Fellowship", degreeName: "FACP", specialization: "Endocrinology", institution: "American College of Physicians", issuingOrganization: "ACP Board", country: "US", completionDate: new Date("2016-10-15"), certificateNumber: "FW-33" } });
    qualIds.push(q1.id, q2.id, q3.id);

    // 5. Create 2 Practitioner Roles (associating 2 Organizations & 2 Locations)
    const role1 = await prisma.practitionerRole.create({ data: { practitionerId: testDoctor.id, organizationId: org1.id, designation: "Chief Endocrinologist", department: "Endocrine Division" } });
    const role2 = await prisma.practitionerRole.create({ data: { practitionerId: testDoctor.id, organizationId: org2.id, designation: "Consultant Physician", department: "Tele-endocrine Division" } });
    roleIds.push(role1.id, role2.id);

    const rLoc1 = await prisma.practitionerRoleLocation.create({ data: { roleId: role1.id, locationId: loc1.id } });
    const rLoc2 = await prisma.practitionerRoleLocation.create({ data: { roleId: role2.id, locationId: loc2.id } });
    roleLocIds.push(rLoc1.id, rLoc2.id);

    // 6. Create 3 Services (distributed across roles or profile)
    const srv1 = await prisma.practitionerService.create({ data: { practitionerId: testDoctor.id, roleId: role1.id, serviceCode: "srv-video", serviceName: "Video Endocrinology Consultation", consultationMode: "video", duration: 20, fee: 800, currency: "INR" } });
    const srv2 = await prisma.practitionerService.create({ data: { practitionerId: testDoctor.id, roleId: role1.id, serviceCode: "srv-audio", serviceName: "Audio Endocrinology Consultation", consultationMode: "audio", duration: 15, fee: 500, currency: "INR" } });
    const srv3 = await prisma.practitionerService.create({ data: { practitionerId: testDoctor.id, roleId: role2.id, serviceCode: "srv-chat", serviceName: "Chat Family Consult", consultationMode: "chat", duration: 10, fee: 300, currency: "INR" } });
    serviceIds.push(srv1.id, srv2.id, srv3.id);

    // 7. Attach Availabilities
    const av1 = await prisma.practitionerAvailability.create({ data: { roleId: role1.id, dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00", timezone: "Asia/Kolkata" } });
    const av2 = await prisma.practitionerAvailability.create({ data: { roleId: role2.id, dayOfWeek: "WED", availableFrom: "14:00", availableTo: "18:00", timezone: "Asia/Kolkata" } });
    availIds.push(av1.id, av2.id);

    // 8. Attach Document & Consents
    const doc1 = await prisma.verificationDocument.create({ data: { practitionerId: testDoctor.id, title: "MBBS Cert", url: "https://drgodly.com/uploads/mbbs.pdf", docType: "qualification", fileName: "mbbs.pdf", mimeType: "application/pdf", fileSize: 1048576 } });
    docIds.push(doc1.id);

    const c1 = await prisma.practitionerConsent.create({ data: { practitionerId: testDoctor.id, consentType: "platformTerms", version: "1.0", accepted: true, acceptedBy: user.id } });
    const c2 = await prisma.practitionerConsent.create({ data: { practitionerId: testDoctor.id, consentType: "privacyPolicy", version: "1.0", accepted: true, acceptedBy: user.id } });
    const c3 = await prisma.practitionerConsent.create({ data: { practitionerId: testDoctor.id, consentType: "telemedicine", version: "1.0", accepted: true, acceptedBy: user.id } });
    consentIds.push(c1.id, c2.id, c3.id);

    // Assert that database records are stored with correct sizes (Important Test Data-Loss Check)
    const fetched = await prisma.practitioner.findUnique({
      where: { id: testDoctor.id },
      include: {
        languages: true,
        specialties: true,
        qualifications: true,
        roles: {
          include: {
            locations: true,
            services: true
          }
        }
      }
    });

    assert.ok(fetched);
    assert.equal(fetched.languages.length, 3);
    assert.equal(fetched.specialties.length, 2);
    assert.equal(fetched.qualifications.length, 3);
    assert.equal(fetched.roles.length, 2);
    assert.equal(fetched.roles.flatMap(r => r.locations).length, 2);
    assert.equal(fetched.roles.flatMap(r => r.services).length, 3);

    // Map to HL7 FHIR Bundle and confirm references
    const bundle = mapToFHIRBundle({
      practitioner: fetched,
      organizations: [org1, org2],
      locations: [loc1, loc2],
      services: fetched.roles.flatMap(r => r.services),
      roles: fetched.roles,
      documents: [doc1]
    });

    assert.equal(bundle.resourceType, "Bundle");
    assert.equal(bundle.type, "transaction");

    // Check references inside mapped resources
    const fhirPractRoleEntries = bundle.entry.filter(e => e.resource.resourceType === "PractitionerRole");
    assert.equal(fhirPractRoleEntries.length, 2);

    // Reference validation checks: roles reference Practitioner and correct Organization
    fhirPractRoleEntries.forEach((entry, idx) => {
      const resource = entry.resource;
      assert.equal(resource.practitioner.reference, `Practitioner/${testDoctor.id}`);
      assert.equal(resource.organization.reference, `Organization/${idx === 0 ? org1.id : org2.id}`);
    });
    
    // Validate FHIR Resources structure directly
    bundle.entry.forEach(entry => {
      validateFHIRResource(entry.resource);
    });

    // Update status to UNDER_REVIEW
    const updated = await prisma.practitioner.update({
      where: { id: testDoctor.id },
      data: { status: OnboardingStatus.UNDER_REVIEW }
    });
    assert.equal(updated.status, OnboardingStatus.UNDER_REVIEW);
  });
});

describe("Doctor Onboarding — FHIR Route Security Checks", () => {
  let mockUser: any = null;
  let testDocId: string;
  let docUser: any;
  let otherUser: any;
  let practitioner: any;

  before(async () => {
    mock.method(auth.api, "getSession", async () => {
      if (!mockUser) return null;
      return {
        user: mockUser,
        session: { id: "session-sec", expiresAt: new Date(Date.now() + 3600005), token: "token-sec", userId: mockUser.id }
      };
    });

    docUser = await prisma.user.create({
      data: { email: "sec-owner@drgodly.com", name: "Owner Doctor", role: "doctor" }
    });

    otherUser = await prisma.user.create({
      data: { email: "sec-other@drgodly.com", name: "Other Doctor", role: "doctor" }
    });

    practitioner = await prisma.practitioner.create({
      data: {
        userId: docUser.id,
        firstName: "Sec",
        lastName: "Doctor",
        displayName: "Dr. Sec Doctor",
        phone: "+919999111122",
        email: "sec-owner@drgodly.com",
        gender: "male",
        birthDate: new Date("1980-01-01")
      }
    });

    const doc = await prisma.verificationDocument.create({
      data: {
        practitionerId: practitioner.id,
        title: "Sec Cert",
        url: "https://drgodly.com/sec.pdf",
        docType: "license"
      }
    });
    testDocId = doc.id;
  });

  after(async () => {
    mock.restoreAll();
    await prisma.verificationDocument.deleteMany({ where: { id: testDocId } });
    await prisma.practitioner.deleteMany({ where: { id: practitioner.id } });
    await prisma.user.deleteMany({ where: { email: { in: ["sec-owner@drgodly.com", "sec-other@drgodly.com"] } } });
  });

  it("blocks retrieval of DocumentReference if unauthenticated", async () => {
    mockUser = null;
    const req = new NextRequest(`http://localhost/api/fhir/DocumentReference/${testDocId}`);
    const res = await GET_FHIR(req, { params: Promise.resolve({ resourceType: "DocumentReference", id: testDocId }) });
    assert.equal(res.status, 401);
  });

  it("blocks retrieval of DocumentReference if authenticated as a different user", async () => {
    mockUser = otherUser;
    const req = new NextRequest(`http://localhost/api/fhir/DocumentReference/${testDocId}`);
    const res = await GET_FHIR(req, { params: Promise.resolve({ resourceType: "DocumentReference", id: testDocId }) });
    assert.equal(res.status, 403);
  });

  it("allows retrieval of DocumentReference if authenticated as the owner", async () => {
    mockUser = docUser;
    const req = new NextRequest(`http://localhost/api/fhir/DocumentReference/${testDocId}`);
    const res = await GET_FHIR(req, { params: Promise.resolve({ resourceType: "DocumentReference", id: testDocId }) });
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.resourceType, "DocumentReference");
  });
});

describe("Doctor Onboarding — Core App Regression Tests", () => {
  it("does not break patient intake eligibility logic and BMI calculations", () => {
    const patientIntake = {
      height: 170,
      weight: 90, // BMI = 31.1
      goalWeight: 75,
      gender: "female" as const,
      dateOfBirth: "1990-01-01",
      healthCritical: ["none"],
      healthExtended: ["none"],
      opiateUse: "no" as const,
      priorSurgery: "no" as const,
      currentMeds: "no" as const,
      bloodPressure: "120/80",
      heartRate: "72",
      medicationHistory: "none",
      programHistory: "no" as const,
      primaryInterest: "affordability" as const,
      formFactor: "injection" as const,
      hasAdditionalInfo: "no" as const,
      personalizationGoals: ["steady_progress"],
      firstName: "Alexis",
      lastName: "Patient",
      shippingState: "CA",
      email: "patient@example.com",
      phone: "+15551234567"
    };

    const eligibility = determineEligibility(patientIntake);
    assert.equal(eligibility.status, "eligible");
    assert.match(eligibility.reason || "", /qualification threshold/);
  });

  it("does not break shipping fees and checkout pricing computations", () => {
    assert.equal(getOrderTotal(24900, "INR"), 25049); // consultation 49 + shipping 100 + plan 24900
    assert.equal(getOrderTotal(299, "USD"), 299); // USD shipping and consultation are 0
  });
});
