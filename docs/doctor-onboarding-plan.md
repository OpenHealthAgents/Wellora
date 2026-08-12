# Doctor Onboarding - Short Implementation Plan

This document outlines the design and implementation strategy for the Doctor Onboarding module in the DrGodly platform.

## 1. Affected Files
- [schema.prisma](file:///D:/Kalyan/DrGodly-WL/prisma/schema.prisma): Add database models for Practitioner, PractitionerIdentifier, PractitionerQualification, Organization, Location, HealthcareService, PractitionerRole, PractitionerAvailability, and VerificationDocument.
- [tsconfig.test.json](file:///D:/Kalyan/DrGodly-WL/tsconfig.test.json): Include new validation and mapper modules in the test runner.

## 2. New Files
- [onboarding-validation.ts](file:///D:/Kalyan/DrGodly-WL/lib/onboarding-validation.ts): Zod schemas for draft and strict submission validations.
- [fhir-mapper.ts](file:///D:/Kalyan/DrGodly-WL/lib/fhir-mapper.ts): Translation layer mapping domain/Prisma models to FHIR R4.0.1 resources.
- **API routes**:
  - `app/api/onboarding/route.ts` (draft CRUD)
  - `app/api/onboarding/submit/route.ts` (submission handler)
  - `app/api/onboarding/upload/route.ts` (simulated document uploader)
  - `app/api/admin/onboarding/route.ts` (admin retrieval)
  - `app/api/admin/onboarding/[id]/verify/route.ts` (admin verification/approval)
  - `app/api/fhir/[resourceType]/[id]/route.ts` (read-only FHIR endpoint)
- **UI Routes**:
  - `app/onboarding/page.tsx` (wizard form)
  - `app/onboarding/status/page.tsx` (onboarding status dashboard)
  - `app/admin/onboarding/page.tsx` (admin review portal)
- **UI Components**:
  - `components/DoctorOnboardingForm.tsx` (react-hook-form multi-step wizard)
  - `components/DoctorOnboardingStatus.tsx` (status visualizer)
  - `components/admin/DoctorOnboardingReview.tsx` (admin review page layout)
- **Tests**:
  - `tests/onboarding.test.ts` (validation and mapping tests)

## 3. Database Changes
Prisma schema additions:
- `Practitioner`: Main entity linked to `User`. Tracks firstName, lastName, email, phone, gender, birthDate, languages, status (draft, submitted, approved, rejected), and rejectionReason.
- `PractitionerIdentifier`: Child table storing identifiers (e.g. system, value, type like NPI, StateLicense).
- `PractitionerQualification`: Child table storing credentials (e.g. code like MD/MBBS, issuer, dates).
- `Organization`: Platform organizations.
- `Location`: Platform physical or virtual clinic addresses.
- `HealthcareService`: Telemedicine or consulting services.
- `PractitionerRole`: Links a practitioner to an organization, location, specialties, and healthcare services.
- `PractitionerAvailability`: Weekly time windows per role.
- `VerificationDocument`: Document metadata linked to a Practitioner (e.g., license, diploma).

## 4. API Endpoints
- `GET /api/onboarding`: Fetch current draft or status.
- `POST /api/onboarding`: Save progress (draft model).
- `POST /api/onboarding/submit`: strictly validate and submit application.
- `POST /api/onboarding/upload`: Upload file and return path.
- `GET /api/admin/onboarding`: Retrieve submitted applications.
- `POST /api/admin/onboarding/[id]/verify`: Verify (approve/reject) application.
- `GET /api/fhir/[resourceType]/[id]`: Serve mapped FHIR R4 JSON.

## 5. FHIR Resources
We will support serialization into FHIR R4:
- `Practitioner`: Core provider demographics and qualifications.
- `PractitionerRole`: Practitioner details mapped to organizations, locations, specialties, availability, and services.
- `Organization`: Healthcare organizations.
- `Location`: Clinical locations.
- `HealthcareService`: Medical consultation or check-up services.
- `DocumentReference`: Mapped verification documents.

## 6. Validation Schemas (Zod)
- `DraftOnboardingSchema`: Permissive validation that allows missing or incomplete data so doctors can save progress.
- `SubmitOnboardingSchema`: Strict validation validating all fields (specialties, NPI, qualifications, languages, role, availability, and documents) before final submission.
- `VerificationSchema`: Validates admin review (status: `"approved" | "rejected"`, with an optional `reason` if rejected).

## 7. UI Routes
- `/onboarding`: Step-by-step form built with React Hook Form and clean CSS animations.
- `/onboarding/status`: Progress tracking view. Allows resumes or edits.
- `/admin/onboarding`: Control center where admins view submittals, inspect uploaded documents, and approve or reject profiles.

## 8. Test Strategy
We will add assertions to `tests/onboarding.test.ts` to test:
- Zod validations for both draft saving and final submissions.
- Data structures in the FHIR mapper to guarantee output conforms strictly to FHIR R4 specifications.
Run with:
```bash
npm run test
```

## 9. Migration Strategy
1. **Schema Generation**: Add the models to the schema file and generate typescript definitions via:
   ```bash
   npx prisma generate
   ```
2. **Migrations**: Create and run the database migration:
   ```bash
   npx prisma migrate dev --name add_doctor_onboarding
   ```
3. **Database Seed**: Modify `prisma/seed.ts` to create default Organizations, Locations, and HealthcareServices (e.g., "DrGodly Clinic", "Video Consultations") to pre-populate selection controls for onboarding.
