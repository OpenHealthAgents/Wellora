import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  mapToFHIRPractitioner,
  mapToFHIRPractitionerRole,
  mapToFHIROrganization,
  mapToFHIRLocation,
  mapToFHIRHealthcareService,
  mapToFHIRDocumentReference,
  mapToFHIRBundle
} from "../lib/fhir-mapper";

describe("FHIR R4 Canonical Fixtures Comparison Tests", () => {
  const fixturesDir = path.join(__dirname, "../../fixtures/fhir");

  // Sample data identical to generate-fhir-fixtures.js
  const mockPractitioner = {
    id: "practitioner-alexis-123",
    userId: "user-alexis-123",
    status: "VERIFIED",
    title: "Dr.",
    firstName: "Alexis",
    middleName: "Marie",
    lastName: "Carter",
    displayName: "Dr. Alexis Carter",
    gender: "female",
    birthDate: new Date("1985-06-15"),
    profilePhoto: "https://drgodly.com/photos/alexis.jpg",
    email: "alexis.carter@drgodly.com",
    phone: "+919876543210",
    languages: [
      { languageCode: "en", languageName: "English", proficiency: "native", preferredForConsultation: true }
    ],
    identifiers: [
      { system: "http://hl7.org/fhir/sid/us-npi", value: "9988776655", type: "NPI", use: "official", issuer: "NPPES" }
    ],
    qualifications: [
      { degreeName: "MD", institution: "Harvard Medical School", completionDate: new Date("2010-05-20") }
    ]
  };

  const mockOrg = {
    id: "org-wellora-123",
    name: "Wellora Health",
    active: true
  };

  const mockLoc = {
    id: "loc-virtual-123",
    name: "DrGodly Telehealth Clinic",
    active: true,
    description: "Virtual consulting rooms",
    address: "100 Web Way",
    city: "San Francisco",
    state: "CA",
    postalCode: "94107",
    country: "US",
    managingOrganizationId: "org-wellora-123"
  };

  const mockService = {
    id: "srv-video-123",
    serviceName: "Video Consultation",
    consultationMode: "video",
    active: true
  };

  const mockRole = {
    id: "role-physician-123",
    practitionerId: "practitioner-alexis-123",
    organizationId: "org-wellora-123",
    active: true,
    locations: ["loc-virtual-123"],
    services: [mockService],
    specialties: [
      { specialtyCode: "408443003", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "General practice", isPrimary: true }
    ],
    availabilities: [
      { dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00" }
    ]
  };

  const mockDoc = {
    id: "doc-license-123",
    practitionerId: "practitioner-alexis-123",
    status: "current",
    docType: "license",
    url: "https://drgodly.com/uploads/license.pdf",
    title: "State Medical License",
    mimeType: "application/pdf",
    fileSize: 1048576
  };

  const loadFixture = (filename: string) => {
    const filePath = path.join(fixturesDir, filename);
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  };

  it("compares generated Practitioner against canonical practitioner.json", () => {
    const generated = mapToFHIRPractitioner(mockPractitioner);
    const expected = loadFixture("practitioner.json");
    assert.deepEqual(generated, expected);
  });

  it("compares generated Organization against canonical organization.json", () => {
    const generated = mapToFHIROrganization(mockOrg);
    const expected = loadFixture("organization.json");
    assert.deepEqual(generated, expected);
  });

  it("compares generated Location against canonical location.json", () => {
    const generated = mapToFHIRLocation(mockLoc);
    const expected = loadFixture("location.json");
    assert.deepEqual(generated, expected);
  });

  it("compares generated HealthcareService against canonical healthcare-service.json", () => {
    const generated = mapToFHIRHealthcareService(mockService);
    const expected = loadFixture("healthcare-service.json");
    assert.deepEqual(generated, expected);
  });

  it("compares generated PractitionerRole against canonical practitioner-role.json", () => {
    const generated = mapToFHIRPractitionerRole(mockRole);
    const expected = loadFixture("practitioner-role.json");
    assert.deepEqual(generated, expected);
  });

  it("compares generated DocumentReference against canonical document-reference.json", () => {
    const generated = mapToFHIRDocumentReference(mockDoc);
    const expected = loadFixture("document-reference.json");
    assert.deepEqual(generated, expected);
  });

  it("compares generated transaction Bundle against canonical bundle.json", () => {
    const generated = mapToFHIRBundle({
      practitioner: mockPractitioner,
      organizations: [mockOrg],
      locations: [mockLoc],
      services: [mockService],
      roles: [mockRole],
      documents: [mockDoc]
    });
    const expected = loadFixture("bundle.json");
    assert.deepEqual(generated, expected);
  });
});
