import assert from "node:assert/strict";
import { describe, it, before, after, mock } from "node:test";
import { NextRequest } from "next/server";
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";
import { GET as GET_DIRECTORY } from "../app/api/directory/route";
import { OnboardingStatus } from "@prisma/client";

describe("Provider Directory API & Security Suite", () => {
  let publicUser: any;
  let testDoctor: any;
  let testOrg: any;
  let testLoc: any;
  let draftDoctor: any;

  // Track entities for sequential cleanups
  let langId: string;
  let specId: string;
  let qualId: string;
  let roleId: string;
  let roleLocId: string;
  let serviceId: string;
  let availId: string;
  let docId: string;

  before(async () => {
    // Mock general sessions: public directory queries are unauthenticated, so GET_DIRECTORY returns public listings
    mock.method(auth.api, "getSession", async () => {
      return null;
    });

    // Create test organization and location
    testOrg = await prisma.organization.create({
      data: {
        name: "DrGodly Directory Group",
        active: true
      }
    });

    testLoc = await prisma.location.create({
      data: {
        name: "Directory Virtual Center",
        address: "100 Web St",
        city: "Mumbai",
        state: "MH",
        postalCode: "400001",
        country: "IN"
      }
    });

    // Create a VERIFIED doctor user & practitioner profile
    const docUser = await prisma.user.create({
      data: {
        email: "directory-doc@drgodly.com",
        name: "Directory Practitioner",
        role: "doctor"
      }
    });

    testDoctor = await prisma.practitioner.create({
      data: {
        userId: docUser.id,
        status: OnboardingStatus.VERIFIED,
        title: "Dr.",
        firstName: "Alexis",
        lastName: "Carter",
        displayName: "Dr. Alexis Carter",
        gender: "female",
        birthDate: new Date("1988-06-15"),
        phone: "+919999888877",
        email: "directory-doc@drgodly.com",
        professionalBio: "Experienced clinical endocrinologist specializing in GLP-1 therapy.",
        yearsOfExperience: 12
      }
    });

    // Create languages, specialties, qualifications sequentially to bypass nested missing relational parameters
    const lang = await prisma.practitionerLanguage.create({
      data: {
        practitionerId: testDoctor.id,
        languageCode: "en",
        languageName: "English",
        proficiency: "native",
        preferredForConsultation: true
      }
    });
    langId = lang.id;

    const spec = await prisma.practitionerSpecialty.create({
      data: {
        practitionerId: testDoctor.id,
        specialtyCode: "408443003",
        specialtySystem: "http://snomed.info/sct",
        specialtyDisplay: "Endocrinology",
        isPrimary: true
      }
    });
    specId = spec.id;

    const qual = await prisma.practitionerQualification.create({
      data: {
        practitionerId: testDoctor.id,
        qualificationType: "PG",
        degreeName: "MD",
        specialization: "Endocrinology",
        institution: "Harvard Medical School",
        issuingOrganization: "Harvard Medical School",
        country: "US",
        completionDate: new Date("2014-05-10"),
        certificateNumber: "MD-778899"
      }
    });
    qualId = qual.id;

    const role = await prisma.practitionerRole.create({
      data: {
        practitionerId: testDoctor.id,
        organizationId: testOrg.id,
        designation: "Chief Endocrinologist",
        department: "Endocrine Division"
      }
    });
    roleId = role.id;

    const roleLoc = await prisma.practitionerRoleLocation.create({
      data: {
        roleId: role.id,
        locationId: testLoc.id
      }
    });
    roleLocId = roleLoc.id;

    const service = await prisma.practitionerService.create({
      data: {
        practitionerId: testDoctor.id,
        roleId: role.id,
        serviceCode: "srv-video",
        serviceName: "Video Endocrinology Consultation",
        consultationMode: "video",
        duration: 20,
        fee: 800,
        currency: "INR",
        active: true
      }
    });
    serviceId = service.id;

    const avail = await prisma.practitionerAvailability.create({
      data: {
        roleId: role.id,
        dayOfWeek: "MON",
        availableFrom: "09:00",
        availableTo: "17:00",
        timezone: "Asia/Kolkata"
      }
    });
    availId = avail.id;

    const doc = await prisma.verificationDocument.create({
      data: {
        practitionerId: testDoctor.id,
        title: "Medical Degree Cert",
        url: "https://drgodly.com/uploads/md-cert.pdf",
        docType: "qualification",
        fileName: "md-cert.pdf",
        mimeType: "application/pdf",
        fileSize: 1048576,
        verificationStatus: "approved",
        verifiedBy: "admin-reviewer-123",
        verifiedAt: new Date()
      }
    });
    docId = doc.id;

    // Create a DRAFT doctor user & practitioner profile (should NOT show in public directory)
    const draftUser = await prisma.user.create({
      data: {
        email: "directory-draft@drgodly.com",
        name: "Draft Practitioner",
        role: "user"
      }
    });

    draftDoctor = await prisma.practitioner.create({
      data: {
        userId: draftUser.id,
        status: OnboardingStatus.DRAFT,
        title: "Dr.",
        firstName: "Draft",
        lastName: "Doctor",
        displayName: "Dr. Draft Doctor",
        gender: "male",
        birthDate: new Date("1992-04-12"),
        phone: "+919999777766",
        email: "directory-draft@drgodly.com",
        professionalBio: "Bio in draft mode.",
        yearsOfExperience: 3
      }
    });
  });

  after(async () => {
    mock.restoreAll();

    // Clean up created entities in reverse relational order
    await prisma.practitionerLanguage.deleteMany({ where: { id: langId } });
    await prisma.practitionerSpecialty.deleteMany({ where: { id: specId } });
    await prisma.practitionerQualification.deleteMany({ where: { id: qualId } });
    await prisma.practitionerAvailability.deleteMany({ where: { id: availId } });
    await prisma.practitionerService.deleteMany({ where: { id: serviceId } });
    await prisma.practitionerRoleLocation.deleteMany({ where: { id: roleLocId } });
    await prisma.practitionerRole.deleteMany({ where: { id: roleId } });
    await prisma.verificationDocument.deleteMany({ where: { id: docId } });

    await prisma.practitioner.deleteMany({
      where: {
        id: { in: [testDoctor.id, draftDoctor.id] }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: ["directory-doc@drgodly.com", "directory-draft@drgodly.com"] }
      }
    });

    await prisma.location.delete({ where: { id: testLoc.id } });
    await prisma.organization.delete({ where: { id: testOrg.id } });
  });

  it("only returns verified practitioners in search listings", async () => {
    const req = new NextRequest("http://localhost/api/directory");
    const res = await GET_DIRECTORY(req);
    assert.equal(res.status, 200);

    const body = await res.json() as any;
    assert.ok(Array.isArray(body));
    
    // Test practitioner should be present
    const hasVerified = body.some((p: any) => p.id === testDoctor.id);
    assert.equal(hasVerified, true);

    // Draft practitioner should NOT be present
    const hasDraft = body.some((p: any) => p.id === draftDoctor.id);
    assert.equal(hasDraft, false);
  });

  it("filters search correctly by doctor name, city, and state keywords", async () => {
    // 1. Match name "Alexis"
    const req1 = new NextRequest("http://localhost/api/directory?q=Alexis");
    const body1 = await (await GET_DIRECTORY(req1)).json() as any;
    assert.ok(body1.length >= 1);
    assert.equal(body1[0].displayName, "Dr. Alexis Carter");

    // 2. Match city "Mumbai"
    const req2 = new NextRequest("http://localhost/api/directory?city=Mumbai");
    const body2 = await (await GET_DIRECTORY(req2)).json() as any;
    assert.ok(body2.length >= 1);
    assert.equal(body2[0].roles[0].locations[0].city, "Mumbai");

    // 3. Match non-matching keyword
    const req3 = new NextRequest("http://localhost/api/directory?q=Cardiology");
    const body3 = await (await GET_DIRECTORY(req3)).json() as any;
    assert.equal(body3.length, 0);
  });

  it("implements nextAvailableAppointment calculation slots correctly", async () => {
    const req = new NextRequest("http://localhost/api/directory?q=Alexis");
    const body = await (await GET_DIRECTORY(req)).json() as any;
    assert.equal(body.length, 1);
    
    const nextSlot = body[0].nextAvailableAppointment;
    assert.ok(typeof nextSlot === "string");
    assert.ok(nextSlot !== "Call for Availability");
    assert.match(nextSlot, /at 09:00/);
  });

  it("enforces directory data privacy constraints and omits internal/sensitive details", async () => {
    const req = new NextRequest("http://localhost/api/directory?q=Alexis");
    const body = await (await GET_DIRECTORY(req)).json() as any;
    assert.equal(body.length, 1);
    
    const doctor = body[0];
    
    // Check that sensitive fields are completely omitted from public directory payloads
    assert.equal(doctor.userId, undefined);
    assert.equal(doctor.documents, undefined); // Document references array hidden
    assert.equal(doctor.rejectionReason, undefined);
    assert.equal(doctor.verifiedBy, undefined);

    // Practitioner and PractitionerRole FHIR interoperability resources exist
    assert.ok(doctor.fhir);
    assert.equal(doctor.fhir.practitioner.resourceType, "Practitioner");
    assert.equal(doctor.fhir.practitionerRoles[0].resourceType, "PractitionerRole");
  });
});
