import assert from "node:assert/strict";
import { describe, it, before, after, mock } from "node:test";
import { NextRequest } from "next/server";
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";
import fs from "fs";
import path from "path";

// Import Route Handlers
import { POST as UPLOAD_DOC } from "../app/api/doctor-onboarding/[id]/upload/route";
import { GET as DOWNLOAD_DOC } from "../app/api/doctor-onboarding/[id]/documents/[docId]/route";
import { POST as VERIFY_DOC } from "../app/api/admin/onboarding/[id]/documents/[docId]/verify/route";

describe("Doctor Credential Verification Workflow", () => {
  let doctorUser: any;
  let adminUser: any;
  let unauthorizedUser: any;
  let mockSessionUser: any = null;
  let practitioner: any;
  let createdDocId: string;

  before(async () => {
    // Mock getSession
    mock.method(auth.api, "getSession", async () => {
      if (!mockSessionUser) return null;
      return {
        user: mockSessionUser,
        session: { id: "session-555", expiresAt: new Date(Date.now() + 3600005), token: "token-555", createdAt: new Date(), updatedAt: new Date(), userId: mockSessionUser.id }
      };
    });

    doctorUser = await prisma.user.create({
      data: {
        email: "verified-doc@drgodly.com",
        name: "Doctor Credential",
        role: "doctor"
      }
    });

    adminUser = await prisma.user.create({
      data: {
        email: "admin-reviewer@drgodly.com",
        name: "Admin Reviewer",
        role: "admin"
      }
    });

    unauthorizedUser = await prisma.user.create({
      data: {
        email: "unauth-user@drgodly.com",
        name: "Unauth User",
        role: "user"
      }
    });

    practitioner = await prisma.practitioner.create({
      data: {
        userId: doctorUser.id,
        firstName: "Alexis",
        lastName: "Carter",
        displayName: "Dr. Alexis Carter",
        phone: "+919876543299",
        email: "verified-doc@drgodly.com",
        gender: "female",
        birthDate: new Date("1985-06-15")
      }
    });
  });

  after(async () => {
    mock.restoreAll();
    
    // Cleanup files in storage
    const storageDir = path.join(process.cwd(), "storage", "documents", practitioner.id);
    if (fs.existsSync(storageDir)) {
      fs.rmSync(storageDir, { recursive: true, force: true });
    }

    await prisma.practitioner.delete({ where: { id: practitioner.id } });
    await prisma.user.deleteMany({
      where: {
        email: { in: ["verified-doc@drgodly.com", "admin-reviewer@drgodly.com", "unauth-user@drgodly.com"] }
      }
    });
  });

  it("blocks file upload for unauthenticated users", async () => {
    mockSessionUser = null;
    const req = new NextRequest("http://localhost/api/doctor-onboarding/id/upload", { method: "POST" });
    const res = await UPLOAD_DOC(req, { params: Promise.resolve({ id: practitioner.id }) });
    assert.equal(res.status, 401);
  });

  it("uploads valid PDF document successfully and maps to database metadata", async () => {
    mockSessionUser = doctorUser;

    const formData = new FormData();
    const mockFile = new File(["%PDF-1.4 mock content bytes for verification checking"], "license.pdf", { type: "application/pdf" });
    formData.append("file", mockFile);
    formData.append("docType", "Medical Registration Certificate");
    formData.append("title", "State Medical License");

    const req = new NextRequest("http://localhost/api/doctor-onboarding/upload", {
      method: "POST",
      body: formData
    });

    const res = await UPLOAD_DOC(req, { params: Promise.resolve({ id: practitioner.id }) });
    assert.equal(res.status, 200);

    const body = (await res.json()) as any;
    assert.ok(body.id);
    assert.equal(body.title, "State Medical License");
    assert.equal(body.mimeType, "application/pdf");
    assert.equal(body.verificationStatus, "PENDING");
    createdDocId = body.id;

    // Verify storage directory has file
    const storageFilePath = path.join(process.cwd(), "storage", "documents", practitioner.id, body.fileName);
    assert.ok(fs.existsSync(storageFilePath));
  });

  it("rejects document upload with unauthorized file contents (invalid magic bytes)", async () => {
    mockSessionUser = doctorUser;

    const formData = new FormData();
    // A file ending in .pdf but containing plain text text (invalid header magic bytes)
    const mockFile = new File(["plain text content instead of PDF magic bytes"], "hack.pdf", { type: "application/pdf" });
    formData.append("file", mockFile);
    formData.append("docType", "MBBS Certificate");
    formData.append("title", "Hack attempt");

    const req = new NextRequest("http://localhost/api/doctor-onboarding/upload", {
      method: "POST",
      body: formData
    });

    const res = await UPLOAD_DOC(req, { params: Promise.resolve({ id: practitioner.id }) });
    assert.equal(res.status, 400);

    const body = (await res.json()) as any;
    assert.equal(body.error.code, "VALIDATION_FAILED");
  });

  it("allows owner doctor to securely retrieve/preview their document", async () => {
    mockSessionUser = doctorUser;

    const req = new NextRequest(`http://localhost/api/doctor-onboarding/${practitioner.id}/documents/${createdDocId}`);
    const res = await DOWNLOAD_DOC(req, { params: Promise.resolve({ id: practitioner.id, docId: createdDocId }) });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Content-Type"), "application/pdf");
  });

  it("blocks unauthorized user from retrieving document", async () => {
    mockSessionUser = unauthorizedUser;

    const req = new NextRequest(`http://localhost/api/doctor-onboarding/${practitioner.id}/documents/${createdDocId}`);
    const res = await DOWNLOAD_DOC(req, { params: Promise.resolve({ id: practitioner.id, docId: createdDocId }) });
    assert.equal(res.status, 403);
  });

  it("allows admin to approve document and record reviewer metadata", async () => {
    mockSessionUser = adminUser;

    const req = new NextRequest("http://localhost/api/admin/onboarding/id/documents/docId/verify", {
      method: "POST",
      body: JSON.stringify({ status: "VERIFIED" })
    });

    const res = await VERIFY_DOC(req, { params: Promise.resolve({ id: practitioner.id, docId: createdDocId }) });
    assert.equal(res.status, 200);

    const body = (await res.json()) as any;
    assert.equal(body.status, "success");
    assert.equal(body.data.verificationStatus, "VERIFIED");
    assert.ok(body.data.verifiedAt);
    assert.equal(body.data.verifiedBy, adminUser.id);
  });

  it("allows admin to reject document and store reason details", async () => {
    mockSessionUser = adminUser;

    const req = new NextRequest("http://localhost/api/admin/onboarding/id/documents/docId/verify", {
      method: "POST",
      body: JSON.stringify({ status: "REJECTED", rejectionReason: "MBBS signature is illegible" })
    });

    const res = await VERIFY_DOC(req, { params: Promise.resolve({ id: practitioner.id, docId: createdDocId }) });
    assert.equal(res.status, 200);

    const body = (await res.json()) as any;
    assert.equal(body.status, "success");
    assert.equal(body.data.verificationStatus, "REJECTED");
    assert.equal(body.data.rejectionReason, "MBBS signature is illegible");
  });
});
