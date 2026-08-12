import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapToFHIRPractitioner,
  mapToFHIRPractitionerRole,
  mapToFHIROrganization,
  mapToFHIRLocation,
  mapToFHIRHealthcareService,
  mapToFHIRDocumentReference,
  mapToFHIRBundle,
  validateFHIRResource
} from "../lib/fhir-mapper";

describe("FHIR R4 Mapper & Validator Suite", () => {
  const samplePractitioner = {
    id: "practitioner-alexis-123",
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

  const sampleOrg = {
    id: "org-wellora-123",
    name: "Wellora Health",
    active: true
  };

  const sampleLoc = {
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

  const sampleService = {
    id: "srv-video-123",
    serviceName: "Video Consultation",
    consultationMode: "video",
    active: true
  };

  const sampleRole = {
    id: "role-physician-123",
    practitionerId: "practitioner-alexis-123",
    organizationId: "org-wellora-123",
    active: true,
    locations: ["loc-virtual-123"],
    services: [sampleService],
    specialties: [
      { specialtyCode: "408443003", specialtySystem: "http://snomed.info/sct", specialtyDisplay: "General practice", isPrimary: true }
    ],
    availabilities: [
      { dayOfWeek: "MON", availableFrom: "09:00", availableTo: "17:00" }
    ]
  };

  const sampleDoc = {
    id: "doc-license-123",
    practitionerId: "practitioner-alexis-123",
    status: "current",
    docType: "license",
    url: "https://drgodly.com/uploads/license.pdf",
    title: "State Medical License",
    mimeType: "application/pdf",
    fileSize: 1048576
  };

  it("maps practitioner fields correctly to FHIR Practitioner", () => {
    const fhir = mapToFHIRPractitioner(samplePractitioner);
    assert.equal(fhir.resourceType, "Practitioner");
    assert.equal(fhir.id, "practitioner-alexis-123");
    assert.equal(fhir.active, true);
    assert.equal(fhir.gender, "female");
    assert.equal(fhir.birthDate, "1985-06-15");
    assert.ok(fhir.name && fhir.name.length > 0);
    assert.equal(fhir.name[0].family, "Carter");
    assert.deepEqual(fhir.name[0].given, ["Alexis", "Marie"]);
    assert.equal(fhir.name[0].prefix?.[0], "Dr.");
    assert.equal(fhir.name[0].text, "Dr. Alexis Carter");
  });

  it("maps organization correctly to FHIR Organization", () => {
    const fhir = mapToFHIROrganization(sampleOrg);
    assert.equal(fhir.resourceType, "Organization");
    assert.equal(fhir.id, "org-wellora-123");
    assert.equal(fhir.name, "Wellora Health");
    assert.equal(fhir.active, true);
  });

  it("maps location correctly to FHIR Location", () => {
    const fhir = mapToFHIRLocation(sampleLoc);
    assert.equal(fhir.resourceType, "Location");
    assert.equal(fhir.id, "loc-virtual-123");
    assert.equal(fhir.status, "active");
    assert.equal(fhir.name, "DrGodly Telehealth Clinic");
    assert.equal(fhir.mode, "instance");
    assert.equal(fhir.address?.city, "San Francisco");
    assert.equal(fhir.managingOrganization?.reference, "Organization/org-wellora-123");
  });

  it("maps service correctly to FHIR HealthcareService", () => {
    const fhir = mapToFHIRHealthcareService(sampleService);
    assert.equal(fhir.resourceType, "HealthcareService");
    assert.equal(fhir.id, "srv-video-123");
    assert.equal(fhir.name, "Video Consultation");
    assert.equal(fhir.type?.[0].text, "video");
  });

  it("maps role correctly to FHIR PractitionerRole", () => {
    const fhir = mapToFHIRPractitionerRole(sampleRole);
    assert.equal(fhir.resourceType, "PractitionerRole");
    assert.equal(fhir.id, "role-physician-123");
    assert.equal(fhir.practitioner?.reference, "Practitioner/practitioner-alexis-123");
    assert.equal(fhir.organization?.reference, "Organization/org-wellora-123");
    assert.equal(fhir.location?.[0].reference, "Location/loc-virtual-123");
    assert.equal(fhir.healthcareService?.[0].reference, "HealthcareService/srv-video-123");
    assert.equal(fhir.specialty?.[0].coding?.[0].code, "408443003");
    assert.equal(fhir.availableTime?.[0].availableStartTime, "09:00");
  });

  it("maps document correctly to FHIR DocumentReference", () => {
    const fhir = mapToFHIRDocumentReference(sampleDoc);
    assert.equal(fhir.resourceType, "DocumentReference");
    assert.equal(fhir.id, "doc-license-123");
    assert.equal(fhir.status, "current");
    assert.equal(fhir.type?.text, "license");
    assert.equal(fhir.subject?.reference, "Practitioner/practitioner-alexis-123");
    assert.equal(fhir.content[0].attachment.url, "https://drgodly.com/uploads/license.pdf");
    assert.equal(fhir.content[0].attachment.size, 1048576);
  });

  it("maps bundle correctly to FHIR transaction Bundle", () => {
    const fhir = mapToFHIRBundle({
      practitioner: samplePractitioner,
      organizations: [sampleOrg],
      locations: [sampleLoc],
      services: [sampleService],
      roles: [sampleRole],
      documents: [sampleDoc]
    });

    assert.equal(fhir.resourceType, "Bundle");
    assert.equal(fhir.type, "transaction");
    assert.ok(fhir.entry.length >= 6);
    assert.equal(fhir.entry[0].fullUrl, "https://www.drgodly.com/api/fhir/Practitioner/practitioner-alexis-123");
    assert.equal(fhir.entry[0].request.method, "PUT");
    assert.equal(fhir.entry[0].request.url, "Practitioner/practitioner-alexis-123");
  });

  it("enforces validation on invalid resourceType", () => {
    assert.throws(() => {
      validateFHIRResource({ resourceType: "InvalidType", id: "123" });
    }, /Unsupported resourceType/);
  });

  it("enforces validation on invalid references", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "PractitionerRole",
        id: "role-1",
        active: true,
        practitioner: { reference: "InvalidReferenceNoSlash" }
      });
    }, /Reference string 'InvalidReferenceNoSlash' in field 'practitioner' is invalid/);
  });

  it("enforces validation on invalid enum status", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "Location",
        id: "loc-1",
        status: "wrong-status",
        name: "Clinic Name"
      });
    }, /Invalid Location status/);
  });

  it("enforces validation on missing Practitioner reference in PractitionerRole", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "PractitionerRole",
        id: "role-1",
        active: true,
        organization: { reference: "Organization/org-1" }
      });
    }, /PractitionerRole must have a practitioner reference/);
  });

  it("enforces validation on missing Organization reference in PractitionerRole", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "PractitionerRole",
        id: "role-1",
        active: true,
        practitioner: { reference: "Practitioner/p-1" }
      });
    }, /PractitionerRole must have an organization reference/);
  });

  it("enforces validation on invalid gender code", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "Practitioner",
        id: "p-1",
        active: true,
        gender: "invalid-gender"
      });
    }, /Invalid Practitioner gender/);
  });

  it("enforces validation on malformed Identifier system", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "Practitioner",
        id: "p-1",
        active: true,
        identifier: [{ system: "invalid-system-no-scheme", value: "value-1" }]
      });
    }, /Identifier system must start with http, https, or urn/);
  });

  it("enforces validation on malformed telecom system code", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "Practitioner",
        id: "p-1",
        active: true,
        telecom: [{ system: "skype", value: "alexis-skype", use: "work" }]
      });
    }, /Telecom system must be one of: phone, fax, email, pager, url, sms, other/);
  });

  it("enforces validation on invalid date format", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "Practitioner",
        id: "p-1",
        active: true,
        birthDate: "15-06-1985"
      });
    }, /Invalid Practitioner birthDate/);
  });

  it("enforces validation on invalid Bundle type", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "Bundle",
        type: "batch",
        entry: []
      });
    }, /Bundle type must be 'transaction'/);
  });

  it("enforces validation on missing required Organization name data", () => {
    assert.throws(() => {
      validateFHIRResource({
        resourceType: "Organization",
        id: "org-1",
        active: true
      });
    }, /Organization must have a string 'name'/);
  });
});
