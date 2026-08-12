import assert from "node:assert/strict";
import { describe, it, before, after, mock } from "node:test";
import { NextRequest } from "next/server";
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";
import { OnboardingStatus } from "@prisma/client";

// Import API Handlers
import { GET as GET_BASE, POST as POST_BASE } from "../app/api/doctor-onboarding/route";
import { GET as GET_BY_ID, PATCH as PATCH_BY_ID } from "../app/api/doctor-onboarding/[id]/route";
import { POST as SUBMIT } from "../app/api/doctor-onboarding/[id]/submit/route";
import { POST as ADD_DOCUMENT } from "../app/api/doctor-onboarding/[id]/documents/route";
import { GET as GET_STATUS } from "../app/api/doctor-onboarding/[id]/status/route";

describe("Doctor Onboarding API Integration", () => {
  let doctorUser1: any;
  let doctorUser2: any;
  let adminUser: any;
  let mockSessionUser: any = null;

  before(async () => {
    mock.method(auth.api, "getSession", async () => {
      if (!mockSessionUser) return null;
      return {
        user: mockSessionUser,
        session: { id: "session-123", expiresAt: new Date(Date.now() + 3600005), token: "token-123", createdAt: new Date(), updatedAt: new Date(), userId: mockSessionUser.id }
      };
    });

    doctorUser1 = await prisma.user.create({
      data: {
        email: "doc-api-1@drgodly.com",
        name: "Doctor One",
        role: "doctor"
      }
    });

    doctorUser2 = await prisma.user.create({
      data: {
        email: "doc-api-2@drgodly.com",
        name: "Doctor Two",
        role: "doctor"
      }
    });

    adminUser = await prisma.user.create({
      data: {
        email: "admin-api@drgodly.com",
        name: "Admin User",
        role: "admin"
      }
    });
  });

  after(async () => {
    mock.restoreAll();
    await prisma.user.deleteMany({
      where: {
        email: { in: ["doc-api-1@drgodly.com", "doc-api-2@drgodly.com", "admin-api@drgodly.com"] }
      }
    });
  });

  it("unauthorized request returns 401", async () => {
    mockSessionUser = null;

    const req = new NextRequest("http://localhost/api/doctor-onboarding");
    const res = await GET_BASE(req);
    assert.equal(res.status, 401);
    
    const body = await res.json() as any;
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  it("draft creation works successfully for authenticated doctor", async () => {
    mockSessionUser = doctorUser1;

    const draftPayload = {
      title: "Dr.",
      firstName: "Alexis",
      lastName: "Carter",
      displayName: "Dr. Alexis Carter",
      email: "doctor-one-test@example.com",
      phone: "+919876543210",
      preferredContactMethod: "email",
      gender: "female",
      birthDate: "1985-06-15",
      languages: [
        { languageCode: "en", languageName: "English", proficiency: "native", preferredForConsultation: true }
      ]
    };

    const req = new NextRequest("http://localhost/api/doctor-onboarding", {
      method: "POST",
      body: JSON.stringify(draftPayload)
    });

    const res = await POST_BASE(req);
    assert.equal(res.status, 200);

    const body = await res.json() as any;
    assert.ok(body.id);
    assert.equal(body.status, "DRAFT");
    assert.equal(body.doctor.firstName, "Alexis");
  });

  it("draft update handles PATCH updates correctly", async () => {
    mockSessionUser = doctorUser1;

    const p = await prisma.practitioner.findUnique({
      where: { userId: doctorUser1.id }
    });
    assert.ok(p);

    const updatePayload = {
      firstName: "Alexis-Modified",
      lastName: "Carter-Modified",
      languages: [
        { languageCode: "es", languageName: "Spanish", proficiency: "fluent", preferredForConsultation: false }
      ]
    };

    const req = new NextRequest(`http://localhost/api/doctor-onboarding/${p.id}`, {
      method: "PATCH",
      body: JSON.stringify(updatePayload)
    });

    const res = await PATCH_BY_ID(req, { params: Promise.resolve({ id: p.id }) });
    assert.equal(res.status, 200);

    const body = await res.json() as any;
    assert.equal(body.doctor.firstName, "Alexis-Modified");
    assert.equal(body.doctor.lastName, "Carter-Modified");
    assert.equal(body.doctor.languages[0].languageCode, "es");
  });

  it("unauthorized doctor accessing another doctor's onboarding profile returns 403", async () => {
    mockSessionUser = doctorUser2;

    const p = await prisma.practitioner.findUnique({
      where: { userId: doctorUser1.id }
    });
    assert.ok(p);

    const reqGet = new NextRequest(`http://localhost/api/doctor-onboarding/${p.id}`);
    const resGet = await GET_BY_ID(reqGet, { params: Promise.resolve({ id: p.id }) });
    assert.equal(resGet.status, 403);

    const reqPatch = new NextRequest(`http://localhost/api/doctor-onboarding/${p.id}`, {
      method: "PATCH",
      body: JSON.stringify({ firstName: "Stolen-Name" })
    });
    const resPatch = await PATCH_BY_ID(reqPatch, { params: Promise.resolve({ id: p.id }) });
    assert.equal(resPatch.status, 403);
  });

  it("incomplete submission fails validation", async () => {
    mockSessionUser = doctorUser1;

    const p = await prisma.practitioner.findUnique({
      where: { userId: doctorUser1.id }
    });
    assert.ok(p);

    const req = new NextRequest(`http://localhost/api/doctor-onboarding/${p.id}/submit`, {
      method: "POST"
    });

    const res = await SUBMIT(req, { params: Promise.resolve({ id: p.id }) });
    assert.equal(res.status, 400);

    const body = await res.json() as any;
    assert.equal(body.error.code, "VALIDATION_FAILED");
  });

  it("document attachment works successfully", async () => {
    mockSessionUser = doctorUser1;

    const p = await prisma.practitioner.findUnique({
      where: { userId: doctorUser1.id }
    });
    assert.ok(p);

    const docPayload = {
      title: "Board Certificate",
      url: "https://localhost/certificate.pdf",
      docType: "qualification",
      fileName: "certificate.pdf",
      fileSize: 2048576,
      mimeType: "application/pdf"
    };

    const req = new NextRequest(`http://localhost/api/doctor-onboarding/${p.id}/documents`, {
      method: "POST",
      body: JSON.stringify(docPayload)
    });

    const res = await ADD_DOCUMENT(req, { params: Promise.resolve({ id: p.id }) });
    assert.equal(res.status, 200);

    const body = await res.json() as any;
    assert.ok(body.id);
    assert.equal(body.title, "Board Certificate");
  });

  it("status endpoint returns correct state details", async () => {
    mockSessionUser = doctorUser1;

    const p = await prisma.practitioner.findUnique({
      where: { userId: doctorUser1.id }
    });
    assert.ok(p);

    const req = new NextRequest(`http://localhost/api/doctor-onboarding/${p.id}/status`);
    const res = await GET_STATUS(req, { params: Promise.resolve({ id: p.id }) });
    assert.equal(res.status, 200);

    const body = await res.json() as any;
    assert.equal(body.status, "DRAFT");
  });

  it("valid submission transitions status to SUBMITTED", async () => {
    mockSessionUser = doctorUser1;

    const p = await prisma.practitioner.findUnique({
      where: { userId: doctorUser1.id }
    });
    assert.ok(p);

    await prisma.practitionerIdentifier.create({
      data: { practitionerId: p.id, system: "http://hl7.org/fhir/sid/us-npi", value: "9988776655", type: "NPI" }
    });
    await prisma.practitionerQualification.create({
      data: { practitionerId: p.id, qualificationType: "PG", degreeName: "MD", specialization: "General Medicine", institution: "Harvard", issuingOrganization: "ABFM", country: "US", completionDate: new Date(), certificateNumber: "ABFM-9988" }
    });
    await prisma.practitionerSpecialty.create({
      data: { practitionerId: p.id, specialtyCode: "408443003", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "General practice", isPrimary: true }
    });
    await prisma.verificationDocument.create({
      data: { practitionerId: p.id, title: "License Copy", url: "https://localhost/license.pdf", docType: "license", status: "current" }
    });
    await prisma.verificationDocument.create({
      data: { practitionerId: p.id, title: "Identity Copy", url: "https://localhost/identity.pdf", docType: "identity", status: "current" }
    });
    await prisma.practitionerConsent.createMany({
      data: [
        { practitionerId: p.id, consentType: "platformTerms", version: "1.0", accepted: true, acceptedBy: doctorUser1.id },
        { practitionerId: p.id, consentType: "privacyPolicy", version: "1.0", accepted: true, acceptedBy: doctorUser1.id },
        { practitionerId: p.id, consentType: "telemedicine", version: "1.0", accepted: true, acceptedBy: doctorUser1.id },
        { practitionerId: p.id, consentType: "aiAssistance", version: "1.0", accepted: true, acceptedBy: doctorUser1.id },
        { practitionerId: p.id, consentType: "clinicalResponsibility", version: "1.0", accepted: true, acceptedBy: doctorUser1.id }
      ]
    });

    const mockOrg = await prisma.organization.create({ data: { name: "Test Org", active: true } });
    const mockLoc = await prisma.location.create({ data: { name: "Test Loc", address: "Loc St", city: "NYC", state: "NY", postalCode: "10001", country: "US", active: true } });

    const role = await prisma.practitionerRole.create({
      data: { practitionerId: p.id, organizationId: mockOrg.id, designation: "Senior Physician", roleCode: "doctor", roleDisplay: "Physician" }
    });
    await prisma.practitionerRoleLocation.create({
      data: { roleId: role.id, locationId: mockLoc.id }
    });
    await prisma.practitionerService.create({
      data: { practitionerId: p.id, roleId: role.id, serviceCode: "srv-video", serviceName: "Video Consultation", consultationMode: "video", duration: 15, fee: 500, currency: "INR" }
    });
    await prisma.practitionerAvailability.create({
      data: { roleId: role.id, dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00", timezone: "Asia/Kolkata", appointmentDurationMinutes: 15, bufferMinutes: 5 }
    });

    await prisma.practitioner.update({
      where: { id: p.id },
      data: { professionalBio: "Experienced doctor with family practice background.", yearsOfExperience: 5 }
    });

    const req = new NextRequest(`http://localhost/api/doctor-onboarding/${p.id}/submit`, {
      method: "POST"
    });

    const res = await SUBMIT(req, { params: Promise.resolve({ id: p.id }) });
    assert.equal(res.status, 200);

    const body = await res.json() as any;
    assert.equal(body.status, "success");
    assert.equal(body.data.status, "SUBMITTED");

    await prisma.practitionerRoleLocation.deleteMany({ where: { roleId: role.id } });
    await prisma.practitionerAvailability.deleteMany({ where: { roleId: role.id } });
    await prisma.practitionerService.deleteMany({ where: { roleId: role.id } });
    await prisma.practitionerRole.delete({ where: { id: role.id } });
    await prisma.organization.delete({ where: { id: mockOrg.id } });
    await prisma.location.delete({ where: { id: mockLoc.id } });
  });

  it("resubmitting is safe and returns successful status directly (idempotency)", async () => {
    mockSessionUser = doctorUser1;

    const p = await prisma.practitioner.findUnique({
      where: { userId: doctorUser1.id }
    });
    assert.ok(p);
    assert.equal(p.status, OnboardingStatus.SUBMITTED);

    const req = new NextRequest(`http://localhost/api/doctor-onboarding/${p.id}/submit`, {
      method: "POST"
    });

    const res = await SUBMIT(req, { params: Promise.resolve({ id: p.id }) });
    assert.equal(res.status, 200);

    const body = await res.json() as any;
    assert.equal(body.status, "success");
    assert.equal(body.message, "Application is already submitted or verified.");
  });

  it("admin can successfully access detailed onboarding profile", async () => {
    mockSessionUser = adminUser;

    const p = await prisma.practitioner.findUnique({
      where: { userId: doctorUser1.id }
    });
    assert.ok(p);

    const req = new NextRequest(`http://localhost/api/doctor-onboarding/${p.id}`);
    const res = await GET_BY_ID(req, { params: Promise.resolve({ id: p.id }) });
    assert.equal(res.status, 200);

    const body = await res.json() as any;
    assert.equal(body.id, p.id);
  });
});
