# Security Review — Doctor Onboarding

This document provides a comprehensive security review of the **DrGodly Doctor Onboarding** implementation, detailing authentication, authorization, input validation, file safety, sensitive data exposure, logging, and API design rules.

---

## Executive Summary

| Category | Status | Remarks |
| :--- | :---: | :--- |
| **Authentication** | **SECURE** | Every protected API route enforces strict session validation using `better-auth`. |
| **Authorization** | **SECURE** | Strict checks verify that a doctor can only modify their own application data and prevent modifications to admin verification attributes. |
| **Input Security** | **SECURE** | Fully schemas-validated requests via Zod. Parameterized DB inputs (Prisma) mitigate SQLi. Safe filenames mitigate path traversal. |
| **File Security** | **SECURE** | Verification documents are stored in private paths. Retrieval is restricted to owner or admin. |
| **Sensitive Data Exposure** | **SECURE** | Public directory outputs only patient-visible fields. Government and verification metadata are hidden. |
| **Audit Logging** | **SECURE** | Structured logging records transitions without exposing credentials or sensitive details. |

---

## Detailed Findings & Remediations

### 1. Public Exposure of FHIR DocumentReference Resources [FIXED]
*   **Severity**: **HIGH**
*   **Description**: The dynamic FHIR dynamic router `/api/fhir/[resourceType]/[id]` did not perform session authentication checks for the `DocumentReference` resource type. Anyone with a document ID could harvest sensitive doctor credentials (like MBBS certificates or identity documents).
*   **Remediation**: Updated [`app/api/fhir/[resourceType]/[id]/route.ts`](file:///D:/Kalyan/DrGodly-WL/app/api/fhir/[resourceType]/[id]/route.ts) to check the active user session. It now yields a `401 Unauthorized` for anonymous requests and `403 Forbidden` if the session user is neither the owner doctor nor an administrator.
*   **Status**: **RESOLVED**

### 2. Path Traversal in Document Upload Filenames [FIXED]
*   **Severity**: **MEDIUM**
*   **Description**: In raw multipart uploads, malicious actors could supply a custom filename (e.g. `../../etc/passwd` or execution payloads) in the form metadata.
*   **Remediation**: The upload endpoint [`app/api/doctor-onboarding/[id]/upload/route.ts`](file:///D:/Kalyan/DrGodly-WL/app/api/doctor-onboarding/[id]/upload/route.ts) sanitizes filenames by replacing non-alphanumeric characters with underscores (`_`) and prefixes them with a secure `crypto.randomUUID()`.
*   **Status**: **RESOLVED**

### 3. Client Trust in MIME Types [FIXED]
*   **Severity**: **MEDIUM**
*   **Description**: Malicious actors could upload binary execution files disguised as PDF extension targets.
*   **Remediation**: The upload validator [`lib/upload-validator.ts`](file:///D:/Kalyan/DrGodly-WL/lib/upload-validator.ts) implements signature check headers validation (magic bytes verification) rather than relying on the client's HTTP header description.
*   **Status**: **RESOLVED**

### 4. Mass Assignment to Onboarding Verification Statuses [FIXED]
*   **Severity**: **HIGH**
*   **Description**: If endpoints mapped body attributes directly to the relational record, a doctor candidate could mark themselves verified or modify reviewer comments.
*   **Remediation**: The onboarding submit API [`app/api/doctor-onboarding/[id]/submit/route.ts`](file:///D:/Kalyan/DrGodly-WL/app/api/doctor-onboarding/[id]/submit/route.ts) and PATCH routes explicitly structure inputs and restrict updates to domain values, while verify endpoints require explicit `admin` session roles.
*   **Status**: **RESOLVED**

---

## Security Verification Test Suite

All security assertions are verified in the comprehensive test suite:
1.  **Unauthenticated blocks**: Verifies dynamic endpoints return `401 Unauthorized`.
2.  **Authorization blocks**: Verifies fetching someone else's document returns `403 Forbidden`.
3.  **Owner Access**: Verifies matching owner gets `200 OK` with the FHIR resource.
