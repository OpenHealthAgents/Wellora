# Doctor Onboarding Walkthrough

This document summarizes the changes, APIs, validation schemas, and UI components implemented for the Doctor Onboarding module.

## Summary of Changes

#### 1. Database Schema
We extended the PostgreSQL database schema in [schema.prisma](file:///D:/Kalyan/DrGodly-WL/prisma/schema.prisma) to model practitioner identities, qualifications, organizations, locations, and roles relational-style, separating them cleanly from the FHIR serialization format.

Models added/updated:
*   `Practitioner`: Links to `User` and represents the doctor profile. Includes first name, last name, email, phone, gender, birthDate, title, middleName, preferredContactMethod, professionalBio, yearsOfExperience, submittedAt, and verifiedAt. Uses the `OnboardingStatus` PostgreSQL enum.
*   `PractitionerIdentifier`: Stores state medical licenses, NPI numbers, tax IDs, etc., with fields for use, issuer, periodStart, and periodEnd.
*   `PractitionerQualification`: Academic credentials and degrees (e.g. MD, DO, MBBS) and their issuers, including qualificationType, completionDate, and certificateNumber.
*   `PractitionerSpecialty`: Models specialties with Snomed Codes.
*   `Organization`: Predefined medical organizations.
*   `Location`: Predefined physical or virtual clinic locations.
*   `PractitionerRole`: Maps a practitioner to an organization, designation, department, and role code/display.
*   `PractitionerRoleLocation`: Join table representing a many-to-many relationship mapping PractitionerRole to Locations.
*   `PractitionerService`: Stores practitioner-specific consultation mode pricing (initial, follow-up, second opinion) and slot duration.
*   `PractitionerLanguage`: Structured languages representing proficiency and consultation preferences.
*   `PractitionerAvailability`: Weekly day/time slots associated with a PractitionerRole, supporting timezone, duration, and buffer periods.
*   `VerificationDocument`: Links document files (diploma, license, govt ID) to a Practitioner, supporting file metadata.
*   `PractitionerConsent`: Logs accepted platform terms, privacy policy, and telemedicine clinical responsibilities.

### 2. Database Constraints
We configured the database engine with:
*   **Unique Email Check**: Handled by `@unique` index on `Practitioner.email`.
*   **Unique Registry Identifiers**: Handled by `@@unique([system, value])` index on `PractitionerIdentifier`.
*   **Single Primary Specialty Constraint**: Created a raw PostgreSQL partial unique index `practitioner_primary_specialty_idx` on `PractitionerSpecialty("practitionerId") WHERE "isPrimary" = true` ensuring that a doctor can have at most one primary specialty.
*   **Unique Role Location Assignation**: Handled by `@@unique([roleId, locationId])` join-table constraint.

### 3. Validation Layer
We implemented Zod schemas in [onboarding-validation.ts](file:///D:/Kalyan/DrGodly-WL/lib/onboarding-validation.ts) to support two levels of validation:
*   `DraftOnboardingSchema`: Very permissive, allowing saving partially-completed forms.
*   `SubmitOnboardingSchema`: Strict, validating all required values, credentials, locations, services, and documents before submission.
*   `VerificationSchema`: Validates admin choices (approval or rejection with mandatory feedback).

### 4. FHIR R4 Mapping Layer
We created a serialization module [fhir-mapper.ts](file:///D:/Kalyan/DrGodly-WL/lib/fhir-mapper.ts) to construct standard-compliant FHIR R4.0.1 resources from the database models:
*   `Practitioner`
*   `PractitionerRole`
*   `Organization`
*   `Location`
*   `HealthcareService`
*   `DocumentReference`

### 5. API Endpoints
We created REST and FHIR endpoint routes:
*   `GET /api/onboarding`: Retrieve the doctor's current draft or status.
*   `POST /api/onboarding`: Save draft progress in a transaction.
*   `POST /api/onboarding/submit`: Strictly validate and submit the onboarding application.
*   `POST /api/onboarding/upload`: Handle file uploads to `public/uploads` and return file metadata.
*   `GET /api/onboarding/lookups`: Retrieve available organizations, locations, and services.
*   `GET /api/admin/onboarding`: List submitted practitioner applications for review.
*   `POST /api/admin/onboarding/[id]/verify`: Verify (approve/reject) a practitioner and upgrade user roles.
*   `GET /api/fhir/[resourceType]/[id]`: Expose conformant FHIR R4 JSON.

### 6. Frontend Pages & Components
We implemented high-fidelity, responsive screens:
*   `DoctorOnboardingForm`: A multi-step animated wizard form with draft saving, credentials lists, time slot pickers, and document uploader.
*   `DoctorOnboardingStatus`: A tracker displaying status (Draft, Under Review, Approved, or Rejected) with feedback.
*   `DoctorOnboardingReview`: An interactive review dashboard for administrators to examine profiles and files.
*   Pages created:
    *   `/onboarding` -> Form wizard.
    *   `/onboarding/status` -> Status tracking.
    *   `/admin/onboarding` -> Review panel.

## Verification Results

### Automated Tests
We added a comprehensive test suite in [onboarding.test.ts](file:///D:/Kalyan/DrGodly-WL/tests/onboarding.test.ts) covering Zod schemas, FHIR R4 serialization, and PostgreSQL constraint testing.
Type-checked and compiled without errors, and all tests passed successfully:
```bash
node -r dotenv/config .test-build/tests/onboarding.test.js
```
```text
▶ doctor onboarding validation
  ✔ allows saving a partial draft with missing fields (3.6969ms)
  ✔ fails strict submission if required fields are missing (2.5114ms)
  ✔ succeeds strict submission with complete data (3.636ms)
  ✔ validates admin decisions correctly (0.4865ms)
✔ doctor onboarding validation (11.4934ms)
▶ FHIR R4.0.1 mapping serialization
  ✔ maps practitioner profile details to FHIR R4 Practitioner resource (1.6255ms)
  ✔ maps practitioner role assignments to FHIR R4 PractitionerRole resource (0.7827ms)
  ✔ maps organizations to FHIR R4 Organization resource (0.3659ms)
  ✔ maps locations to FHIR R4 Location resource (0.269ms)
  ✔ maps services to FHIR R4 HealthcareService resource (0.6935ms)
  ✔ maps documents to FHIR R4 DocumentReference resource (0.5764ms)
✔ FHIR R4.0.1 mapping serialization (5.0389ms)
▶ Database constraints
  ✔ enforces at most one primary specialty per practitioner (267.0073ms)
✔ Database constraints (267.3035ms)
ℹ tests 11
ℹ suites 3
ℹ pass 11
ℹ fail 0
```

## Blog Post Update (GLP-1 Medication)

### 1. Document Extraction & Asset Conversion
We successfully processed the Google Document and extracted all rich copy, images, and external links:
*   **Media Assets**: Extracted base64-encoded images from the Google Doc HTML structure and saved them directly to the `public/` assets folder:
    *   [blog_image_1.png](file:///D:/Kalyan/DrGodly-WL/public/blog_image_1.png) (DEXA Scan graphic)
    *   [blog_image_2.png](file:///D:/Kalyan/DrGodly-WL/public/blog_image_2.png) (Hydrostatic weighing graphic)
    *   [blog_image_3.png](file:///D:/Kalyan/DrGodly-WL/public/blog_image_3.png) (GLP-1 hormone receptor pathways graphic)
*   **Dynamic Data Integration**: Updated [blogs.ts](file:///D:/Kalyan/DrGodly-WL/lib/blogs.ts) with the complete, detailed articles from the Google Document.
    *   Fully rewrote the `what-is-glp1-medication` post.
    *   Added the new `is-glp-1-safe` article matching the specific tab `t.fknpfx6ztudp` (titled *Is GLP-1 Safe? Understanding the Side Effects, Risks and Benefits*).
    *   Preserved the previous definitive medical safety guide under the slug `is-glp-1-safe-definitive-guide`.
    *   Added `understanding-body-types` and `how-to-measure-body-fat-percentage` with their respective images.

### 2. Rich Template Features & Mobile Optimization
Refactored the dynamic blog renderer [page.tsx](file:///D:/Kalyan/DrGodly-WL/app/blogs/[slug]/page.tsx) to:
*   **HTML Support**: Render inline custom HTML tags (`<a>` and `<strong>`) using `dangerouslySetInnerHTML` for the paragraphs and bullet points, enabling interactive external research resource links and internal redirects.
*   **Image Sections**: Render inline section images dynamically using Next.js `Image` with a clean card container, rounded borders, shadow effects, and italicized captions.
*   **Mobile-First Design**: Optimized layout paddings (e.g. responsive `p-5 sm:p-10` and `px-4 sm:px-6`), styled the data table with horizontal scroll constraints to prevent clipping, styled lists with custom SVG checkmark markers, and converted action CTAs to full-width block buttons on mobile screens.

## Events Page Redesign

### 1. Main Events Catalog Redesign ([page.tsx](file:///D:/Kalyan/DrGodly-WL/app/events/page.tsx))
*   **Hero Styling**: Added a radial backdrop glow with subtle gradient accents, descriptive metadata pills, and high-contrast action CTAs leading to intake or blogs.
*   **Interactive Cards**: Created structured cards grouping events into distinct tags (*Interactive Workshop* or *Community Clinic*).
*   **Interactive CTAs**: Equipped each card with a hover-transitioning action link (`Reserve Free Spot`).
*   **Mobile Optimizations**: Switched the cards to stack dynamically on small viewports and expanded action buttons to block-level elements for better tap target sizes.

### 2. Interactive Single Event Routing & Registration ([page.tsx](file:///D:/Kalyan/DrGodly-WL/app/events/[slug]/page.tsx))
*   **Interactive Registration Form ([EventRegisterForm.tsx](file:///D:/Kalyan/DrGodly-WL/app/events/[slug]/EventRegisterForm.tsx))**: Built a client-side registration form with state validation, input focus transitions, submitting loading indicators, and an animated verification success box.
*   **Host Biography Integration**: Integrated biography details (featuring Dr. Kalyan Kalwa) with rounded profile photos and clinical roles to establish confidence.
*   **Agenda Timelines**: Designed a timeline layout mapping out session segments with progress markers and clear descriptions.

## AI for Doctors Event Integration

### 1. Cover Image Generation & Sourcing
*   **Cover Graphic**: Generated a futuristic, highly detailed medical AI design [`public/ai_for_doctors.jpg`](file:///D:/Kalyan/DrGodly-WL/public/ai_for_doctors.jpg) utilizing prompt engineering with green/dark aesthetic tones.
*   **Media Support**: Added an optional `image` field to the `EventItem` interface in [`lib/events.ts`](file:///D:/Kalyan/DrGodly-WL/lib/events.ts) and populated the image URL asset path.

### 2. Event Population & Layout Mapping
*   **Weekly Scheduling**: Configured the event inside the `eventItems` list, titled *"Artificial Intelligence for Doctors"*, scheduled for **Every Thursday** at **7:00 PM IST**.
*   **Detail Page Custom Content Mapping**: Enabled custom description copywriting, learning outcomes (LLM diagnostics limits, secure EHR note charting, HIPAA data safety rules), and specialized agenda blocks for the clinical AI masterclass.
*   **Aesthetic Image Display**: Added full-width responsive cover images to both the event list cards (with hover scale zoom effects) and the dynamic details registration container.

## React/shadcn UI Onboarding Form Wizard

### 1. 13-Step Onboarding Architecture
We rebuilt [DoctorOnboardingForm.tsx](file:///D:/Kalyan/DrGodly-WL/components/DoctorOnboardingForm.tsx) into a premium, responsive multi-step wizard containing exactly 13 logical steps:
1.  **Personal Info**: Core demographics (title, first/middle/last name, display name, gender, birth date).
2.  **Contact Info**: Primary contact details, email, phone channels, and preferred methods.
3.  **Medical Registration**: Repeatable identifiers (State License, NMC, NPI, USMLE) with dynamic system/value inputs.
4.  **Qualifications**: Repeatable degree items (UG, PG, SuperSpecialty, Diploma, Fellowship) with institution, issuer, and certificate number fields.
5.  **Specialty & Expertise**: Select Snomed specialties and set exactly one primary specialty.
6.  **Practice & Organizations**: Choose affiliated clinics, locations, designation, and department details.
7.  **Languages**: Repeatable list mapping consultation language codes, proficiency, and preference.
8.  **Telemedicine Services**: Configure telehealth consultation modes (video, audio, text, offline) and duration per affiliated role.
9.  **Pricing**: Establish clinical fees and ISO currency codes (INR, USD, GBP, EUR) with precision validation.
10. **Availability**: Assign weekly working days, start/end hours, and IANA timezone parameters.
11. **Professional Profile**: Record bio text (min 10 characters) and years of clinical experience.
12. **Verification Documents**: File upload handlers for license, qualification certificate, and government identity proof.
13. **Consent & Review**: Display a summary of all entered profile details for final review and require check confirmations for all mandatory platform consents.

### 2. Form State & Step Validation
*   **React Hook Form & Zod Resolver**: Managed the complex multi-nested object structure with React Hook Form, registering fields dynamically and checking step validations on transitions using the `trigger` API.
*   **Step-by-Step Validation**: When clicking "Next", the form runs Zod validation only on fields belonging to the current step. When errors occur, focus is automatically moved to the first invalid field.
*   **Draft Auto-Saving**: Automatically saves drafts to the database on step transitions and on clicking "Save Draft". Includes a header status pill displaying the draft state: "Saving...", "Saved", "Draft Mode", or "Save Error" along with a timestamp of the last save.
*   **Payload Sanitization**: Cleaned all repeatable fields before saving drafts to filter out empty array elements, satisfying both database columns and Zod schemas.

### 3. Accessibility & Mobile Optimization
*   **Keyboard & Screen Reader Support**: Form inputs include associated labels, semantic elements, focus states, and aria-invalid attributes.
*   **Mobile-First Layout**: Converted steppers and lists to stack beautifully on mobile viewports. Custom layouts scale without clipping, and CTA buttons stretch to block-level taps on handheld screens.
*   **Unsaved Changes Warning**: Added a window event listener checking form dirtiness, warning doctors before they close or reload the onboarding tab.

## Doctor Onboarding API Layer

### 1. Endpoints & Route Handlers
We implemented the onboarding endpoints under `/api/doctor-onboarding` using relative import paths to ensure strict environment compatibility:
*   `GET /api/doctor-onboarding`: Returns the logged-in doctor's active onboarding application (or all applications if requested by an admin).
*   `POST /api/doctor-onboarding`: Validates the payload using the draft Zod schema and creates/updates practitioner data transactionally.
*   `GET /api/doctor-onboarding/[id]`: Returns detailed profile and sub-entity records by practitioner ID (restricted to the profile owner or administrators).
*   `PATCH /api/doctor-onboarding/[id]`: Safely updates draft records and sweeps/recreates associated relations within a database transaction.
*   `POST /api/doctor-onboarding/[id]/submit`: Validates the complete practitioner dataset against the strict submission schema. Transitions application status from `DRAFT` to `SUBMITTED`, sets `submittedAt`, and logs an audit log entry.
*   `POST /api/doctor-onboarding/[id]/documents`: Appends uploaded file metadata (certificates, IDs) to the practitioner's document collection.
*   `GET /api/doctor-onboarding/[id]/status`: Returns the current verification status of the profile application.

### 2. Guarding Security & Integrity
*   **Request Scope Safety**: Implemented a try/catch wrapper on all `headers()` calls to prevent application crash in non-request test contexts.
*   **Session-derived Identity**: Identity check resolves using the authenticated token session (`auth.api.getSession`), preventing client-side `userId` spoofing.
*   **Idempotency / Re-submission Protection**: The submit route checks if status is already `SUBMITTED` or `VERIFIED` and returns success directly, preventing redundant transaction calculations or double logging.
*   **Transaction and Relational Cleanses**: Relational updates sweep existing child records and recreate them in a database transaction block, protecting the database from dangling nodes on failed operations.
*   **Auditing**: Creates audit logs within the `AuditLog` table using the project's standard `logAudit` utility.

### 3. API Integration Testing Results
We added 10 automated test specs inside [`tests/doctor-onboarding-api.test.ts`](file:///D:/Kalyan/DrGodly-WL/tests/doctor-onboarding-api.test.ts). All test assertions passed successfully:
```text
▶ Doctor Onboarding API Integration
  ✔ unauthorized request returns 401 (8.482ms)
  ✔ draft creation works successfully for authenticated doctor (78.4848ms)
  ✔ draft update handles PATCH updates correctly (40.7427ms)
  ✔ unauthorized doctor accessing another doctor's onboarding profile returns 403 (140.9077ms)
  ✔ incomplete submission fails validation (55.2462ms)
  ✔ document attachment works successfully (13.3864ms)
  ✔ status endpoint returns correct state details (3.346ms)
  ✔ valid submission transitions status to SUBMITTED (104.2938ms)
  ✔ resubmitting is safe and returns successful status directly (idempotency) (10.7121ms)
  ✔ admin can successfully access detailed onboarding profile (11.045ms)
✔ Doctor Onboarding API Integration (671.8748ms)
ℹ tests 10
ℹ suites 1
ℹ pass 10
ℹ fail 0
```

## FHIR R4 Serialization & Mapping Layer

### 1. Model Mappings
We implemented clean FHIR mapping functions inside [`lib/fhir-mapper.ts`](file:///D:/Kalyan/DrGodly-WL/lib/fhir-mapper.ts) adhering strictly to FHIR R4 / 4.0.1 specifications:
*   **DoctorProfile → Practitioner**: Mapped title (`prefix`), family name, given names, official display name (`text`), telecoms (mobile phone, work email), Snownamed identifiers, communications (BCP 47 languages), qualifications, and photo attachment URLs.
*   **DoctorOrganizationRole → PractitionerRole**: Maps role status, practitioner reference, organization reference, location references, and healthcareService references.
*   **Organization → Organization**: Maps organization name, status, and stable references.
*   **Location → Location**: Maps clinic location name, instance mode, physical address lines, and managing organization references.
*   **DoctorService → HealthcareService**: Maps consultation mode to service type and name parameters.
*   **DoctorVerificationDocument → DocumentReference**: Maps status, qualification attachment URLs, size, mimeType, and practitioner subject.

### 2. Transaction Bundle Semantics
Implemented the **`mapToFHIRBundle`** function:
*   Pulls together all related entities (Practitioner, Organization, Location, HealthcareService, PractitionerRole, DocumentReference).
*   Returns a transaction-type FHIR Bundle with stable `fullUrl` values resolved via absolute path: `https://www.drgodly.com/api/fhir/ResourceType/id`.
*   Includes `request` elements mapping to `PUT` method calls for idempotency.

### 3. Cleaning & Strict Resource Validation
*   **Null/Undefined Cleanse**: Prior to returning any mapped object, `cleanFHIR()` recursively traverses the resource tree and strips out any null or undefined properties.
*   **Strict Resource Validator**: `validateFHIRResource()` ensures that:
    1.  `resourceType` matches a valid FHIR R4 registry name.
    2.  References match the strict regex shape `/^[A-Za-z]+\/[A-Za-z0-9\-\.\_]+$/`.
    3.  Enums, status structures, and arrays (such as name use, locations, and content arrays) are correctly typed.
    4.  Dates conform to standard primitive structures (such as `YYYY-MM-DD`).

### 4. Verification Results & JSON Fixtures
*   **JSON Fixtures**: programmatically generated valid R4 outputs and saved them under [`fixtures/fhir/`](file:///D:/Kalyan/DrGodly-WL/fixtures/fhir):
    *   [`practitioner.json`](file:///D:/Kalyan/DrGodly-WL/fixtures/fhir/practitioner.json)
    *   [`practitioner-role.json`](file:///D:/Kalyan/DrGodly-WL/fixtures/fhir/practitioner-role.json)
    *   [`organization.json`](file:///D:/Kalyan/DrGodly-WL/fixtures/fhir/organization.json)
    *   [`location.json`](file:///D:/Kalyan/DrGodly-WL/fixtures/fhir/location.json)
    *   [`healthcare-service.json`](file:///D:/Kalyan/DrGodly-WL/fixtures/fhir/healthcare-service.json)
    *   [`document-reference.json`](file:///D:/Kalyan/DrGodly-WL/fixtures/fhir/document-reference.json)
    *   [`bundle.json`](file:///D:/Kalyan/DrGodly-WL/fixtures/fhir/bundle.json)
*   **Unit Tests**: Created a unit test suite under [`tests/fhir-mapper.test.ts`](file:///D:/Kalyan/DrGodly-WL/tests/fhir-mapper.test.ts) verifying all resource serialization configurations and constraint triggers:
```text
▶ FHIR R4 Mapper & Validator Suite
  ✔ maps practitioner fields correctly to FHIR Practitioner (3.3821ms)
  ✔ maps organization correctly to FHIR Organization (0.2361ms)
  ✔ maps location correctly to FHIR Location (0.3077ms)
  ✔ maps service correctly to FHIR HealthcareService (0.1987ms)
  ✔ maps role correctly to FHIR PractitionerRole (0.5139ms)
  ✔ maps document correctly to FHIR DocumentReference (0.2726ms)
  ✔ maps bundle correctly to FHIR transaction Bundle (0.8255ms)
  ✔ enforces validation on invalid resourceType (0.5131ms)
  ✔ enforces validation on invalid references (0.288ms)
  ✔ enforces validation on invalid enum status (0.2759ms)
✔ FHIR R4 Mapper & Validator Suite (9.0398ms)
ℹ tests 10
ℹ suites 1
ℹ pass 10
ℹ fail 0
```

## Canonical API Response Payload & Comparison Checks

### 1. Canonical Response Contract
We modified the onboarding response mapper `normalizePractitioner` to return a domain-specific shape isolating internal database details and explicitly declaring logical FHIR reference links:
```json
{
  "id": "practitioner-alexis-123",
  "status": "VERIFIED",
  "doctor": {
    "title": "Dr.",
    "firstName": "Alexis",
    "middleName": "Marie",
    "lastName": "Carter",
    "displayName": "Dr. Alexis Carter",
    "email": "alexis.carter@drgodly.com",
    "phone": "+919876543210",
    "gender": "female",
    "birthDate": "1985-06-15",
    "preferredContactMethod": "email",
    "languages": [
      {
        "languageCode": "en",
        "languageName": "English",
        "proficiency": "native",
        "preferredForConsultation": true
      }
    ],
    "identifiers": [
      {
        "system": "http://hl7.org/fhir/sid/us-npi",
        "value": "9988776655",
        "type": "NPI",
        "use": "official",
        "issuer": "NPPES"
      }
    ],
    "qualifications": [
      {
        "qualificationType": "PG",
        "degreeName": "MD",
        "institution": "Harvard Medical School",
        "completionDate": "2010-05-20"
      }
    ],
    "specialties": [
      {
        "specialtyCode": "408443003",
        "specialtySystem": "http://snomed.info/sct",
        "specialtyDisplay": "General practice",
        "isPrimary": true
      }
    ],
    "roles": [
      {
        "organizationId": "org-wellora-123",
        "locations": [
          "loc-virtual-123"
        ],
        "designation": "Physician",
        "services": [
          {
            "serviceCode": "srv-video-123",
            "serviceName": "Video Consultation",
            "consultationMode": "video",
            "active": true
          }
        ],
        "availabilities": [
          {
            "dayOfWeek": "MON",
            "availableFrom": "09:00",
            "availableTo": "17:00"
          }
        ]
      }
    ],
    "documents": [
      {
        "title": "State Medical License",
        "url": "https://drgodly.com/uploads/license.pdf",
        "docType": "license",
        "fileName": "license.pdf",
        "mimeType": "application/pdf",
        "fileSize": 1048576
      }
    ],
    "consent": {
      "platformTermsAccepted": true,
      "privacyPolicyAccepted": true,
      "telemedicineTermsAccepted": true,
      "aiAssistanceAcknowledgement": true,
      "clinicalResponsibilityAcknowledgement": true
    }
  },
  "fhir": {
    "practitionerId": "Practitioner/practitioner-alexis-123",
    "practitionerRoleIds": [
      "PractitionerRole/role-physician-123"
    ],
    "organizationIds": [
      "Organization/org-wellora-123"
    ],
    "locationIds": [
      "Location/loc-virtual-123"
    ],
    "healthcareServiceIds": [
      "HealthcareService/srv-video-123"
    ]
  },
  "createdAt": "2026-08-11T14:47:35.000Z",
  "updatedAt": "2026-08-11T14:47:35.000Z"
}
```

### 2. Automated Fixture Comparison Tests
We implemented [`tests/fhir-canonical-comparison.test.ts`](file:///D:/Kalyan/DrGodly-WL/tests/fhir-canonical-comparison.test.ts) to read the generated canonical JSON fixtures and verify that our mapper functions output identical serializations key-by-key:
```text
▶ FHIR R4 Canonical Fixtures Comparison Tests
  ✔ compares generated Practitioner against canonical practitioner.json (3.793ms)
  ✔ compares generated Organization against canonical organization.json (1.2667ms)
  ✔ compares generated Location against canonical location.json (1.2609ms)
  ✔ compares generated HealthcareService against canonical healthcare-service.json (1.5884ms)
  ✔ compares generated PractitionerRole against canonical practitioner-role.json (1.9174ms)
  ✔ compares generated DocumentReference against canonical document-reference.json (15.5704ms)
  ✔ compares generated transaction Bundle against canonical bundle.json (24.3085ms)
✔ FHIR R4 Canonical Fixtures Comparison Tests (51.4004ms)
ℹ tests 7
ℹ suites 1
ℹ pass 7
ℹ fail 0
```
All tests compiled and completed successfully.

## Automated FHIR R4 Validation Pipeline Stage

### 1. Submit Route Pipeline Integration
We integrated the FHIR R4 validation check into [`app/api/doctor-onboarding/[id]/submit/route.ts`](file:///D:/Kalyan/DrGodly-WL/app/api/doctor-onboarding/[id]/submit/route.ts) directly after structural Zod schema checks.
*   **Validation Stage**: When a doctor submits, the database relations are fetched, mapped to a FHIR transaction Bundle, and validated using `validateFHIRResource`.
*   **Safe Error Translation**: Any caught validation error is logged details-level for admins and converted into a user-safe application error:
```json
{
  "error": {
    "code": "FHIR_VALIDATION_FAILED",
    "message": "The application data generated invalid FHIR R4 interoperability resources. Details have been logged for administrator review.",
    "fields": {
      "fhir": "FHIR validation error: PractitionerRole must have an organization reference."
    }
  }
}
```

### 2. Negative Test Cases
We added 8 strict negative unit test cases in [`tests/fhir-mapper.test.ts`](file:///D:/Kalyan/DrGodly-WL/tests/fhir-mapper.test.ts) covering:
*   Invalid resourceType
*   Invalid references (regex format mismatch)
*   Missing Practitioner reference in PractitionerRole
*   Missing PractitionerRole.organization reference
*   Invalid gender codes
*   Malformed Identifier systems (missing http/https/urn scheme)
*   Malformed telecom system codes (skype, etc.)
*   Invalid dates (birthDate format mismatch)
*   Invalid Bundle type
*   Missing required organization name

All unit tests compile and run green:
```text
▶ FHIR R4 Mapper & Validator Suite
  ✔ maps practitioner fields correctly to FHIR Practitioner (27.3081ms)
  ✔ maps organization correctly to FHIR Organization (0.2773ms)
  ✔ maps location correctly to FHIR Location (0.3279ms)
  ✔ maps service correctly to FHIR HealthcareService (0.2049ms)
  ✔ maps role correctly to FHIR PractitionerRole (0.5355ms)
  ✔ maps document correctly to FHIR DocumentReference (0.2847ms)
  ✔ maps bundle correctly to FHIR transaction Bundle (4.5382ms)
  ✔ enforces validation on invalid resourceType (0.8562ms)
  ✔ enforces validation on invalid references (0.3986ms)
  ✔ enforces validation on invalid enum status (0.3259ms)
  ✔ enforces validation on missing Practitioner reference in PractitionerRole (0.1874ms)
  ✔ enforces validation on missing Organization reference in PractitionerRole (0.1465ms)
  ✔ enforces validation on invalid gender code (0.189ms)
  ✔ enforces validation on malformed Identifier system (0.2126ms)
  ✔ enforces validation on malformed telecom system code (0.1904ms)
  ✔ enforces validation on invalid date format (0.1712ms)
  ✔ enforces validation on invalid Bundle type (0.1714ms)
  ✔ enforces validation on missing required Organization name data (0.2716ms)
✔ FHIR R4 Mapper & Validator Suite (38.407ms)
ℹ tests 18
ℹ suites 1
ℹ pass 18
ℹ fail 0
```
All API integration and unit comparison test suites compile and pass successfully.

## Doctor Credential Verification & Secure Storage

### 1. Document Upload & Inspection APIs
We implemented file upload and secure retrieval routes:
*   **POST [`app/api/doctor-onboarding/[id]/upload/route.ts`](file:///D:/Kalyan/DrGodly-WL/app/api/doctor-onboarding/[id]/upload/route.ts)**: Handles multi-part file uploads (PDF, PNG, JPEG) up to 5 MB.
    *   *Security / No Trust Client Headers*: Computes SHA-256 hash checksums of file contents and detects file MIME type directly via **magic bytes inspection** (verifying `%PDF`, `ffd8`, and `89504e47` headers) rather than trusting the client-provided header value.
    *   *Storage isolation*: Saves raw binaries securely in a workspace-relative directory `storage/documents/[id]/[uuid]-[filename]` which is not served publicly.
    *   *Metadata*: Adds a metadata record in the `VerificationDocument` table referencing the file, and sets `verificationStatus` to `PENDING`.
*   **GET [`app/api/doctor-onboarding/[id]/documents/[docId]/route.ts`](file:///D:/Kalyan/DrGodly-WL/app/api/doctor-onboarding/[id]/documents/[docId]/route.ts)**: Serves files with correct MIME headers only to authenticated owner practitioners and administrators. All unauthorized retrievals are blocked with 403 Forbidden.

### 2. Admin Document Verification Endpoints
*   **POST [`app/api/admin/onboarding/[id]/documents/[docId]/verify/route.ts`](file:///D:/Kalyan/DrGodly-WL/app/api/admin/onboarding/[id]/documents/[docId]/verify/route.ts)**: Admin-only route to update validation state to `VERIFIED`, `REJECTED`, `UNDER_REVIEW`, or `EXPIRED`. Updates reviewer ID (`verifiedBy`), timestamp (`verifiedAt`), and attaches optional `rejectionReason` values. All modifications append security audit logs.

### 3. Verification Test Suite Results
We added [`tests/doctor-credential-verification.test.ts`](file:///D:/Kalyan/DrGodly-WL/tests/doctor-credential-verification.test.ts) covering the upload pipeline, magic byte checks, download protections, and admin validations. The tests pass cleanly:
```text
▶ Doctor Credential Verification Workflow
  ✔ blocks file upload for unauthenticated users (7.6897ms)
  ✔ uploads valid PDF document successfully and maps to database metadata (33.3958ms)
  ✔ rejects document upload with unauthorized file contents (invalid magic bytes) (3.9707ms)
  ✔ allows owner doctor to securely retrieve/preview their document (7.0662ms)
  ✔ blocks unauthorized user from retrieving document (2.3138ms)
  ✔ allows admin to approve document and record reviewer metadata (10.6236ms)
  ✔ allows admin to reject document and store reason details (6.0568ms)
✔ Doctor Credential Verification Workflow (344.6626ms)
ℹ tests 7
ℹ suites 1
ℹ pass 7
ℹ fail 0
```
All onboarding API, FHIR validation, and credential verification suites compile and run green.

## Doctor Onboarding Review & Submit Screen

### 1. Grouped Information Cards
The final step (Consent & Review) of the form wizard is updated to dynamically layout all practitioner records into 14 distinct cards matching each form section. Every card displays structured information summary points and embeds an **Edit** button that directs the wizard step back to that specific section for prompt corrections.

### 2. Live Validation Summaries & Redirections
We integrated real-time `SubmitOnboardingSchema` validations inside the client step view. Any validation failures compile an issue list (e.g. "3 items need your attention") with clickable navigation links. Clicking an issue sets the current wizard step and scrolls to/focuses the targeted input field automatically.

### 3. Developer/Admin Diagnostics
For developers and administrators (`userRole === "admin"`), we created a diagnostics panel querying a secure GET `/api/onboarding/fhir-preview` endpoint. The diagnostics panel displays HL7 FHIR R4 serialized formats of:
*   Practitioner
*   PractitionerRole
*   Organization
*   Location
*   HealthcareService

This diagnostic area remains completely hidden from standard practitioner roles.

### 4. Timed Submission Progress
Submission flows render a clean confirmation overlay. Upon clicking "Confirm Submission":
1.  Initiates Timed Progress Animation detailing stages (`Submitting...`, `Validating credentials...`, `Creating provider profile...`, `Preparing interoperability resources...`, `Complete`).
2.  Triggers POST `/api/onboarding/submit` internally.
3.  Transitions the practitioner onboarding status to `UNDER_REVIEW`.
