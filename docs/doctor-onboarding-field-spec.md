# Doctor Onboarding Canonical Field Specification

This document defines the canonical field-level specification, FHIR R4 mapping matrix, and validation rules for the Doctor Onboarding module in the DrGodly platform.

---

## 1. Field Specification Matrix

Below is the detailed specification for all fields across the 16 required onboarding sections.

### Section 1: Identity

#### `title`
*   **UI Label**: Title
*   **Section**: Identity
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: "Dr.", "Prof.", "Assoc. Prof.", "Asst. Prof."
*   **Placeholder**: Select Title...
*   **Help Text**: Select your official professional title.
*   **Validation Rules**: Must be one of the pre-selected allowed values.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `title`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.name.prefix`
*   **FHIR Datatype**: String
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `firstName`
*   **UI Label**: First Name
*   **Section**: Identity
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Any alphanumeric characters.
*   **Placeholder**: Enter first name
*   **Help Text**: Enter your first name as listed on your medical registry document.
*   **Validation Rules**: String length between 1 and 100 characters. No special characters except hyphens and apostrophes.
*   **Normalization Rules**: Trim whitespace. Titlecase capitalization.
*   **Database Field**: `firstName`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.name.given[0]`
*   **FHIR Datatype**: String
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `middleName`
*   **UI Label**: Middle Name
*   **Section**: Identity
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Any alphanumeric characters.
*   **Placeholder**: Enter middle name
*   **Help Text**: Enter your middle name if applicable.
*   **Validation Rules**: String length between 1 and 100 characters.
*   **Normalization Rules**: Trim whitespace. Titlecase capitalization.
*   **Database Field**: `middleName`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.name.given[1]`
*   **FHIR Datatype**: String
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `lastName`
*   **UI Label**: Last Name
*   **Section**: Identity
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Any alphanumeric characters.
*   **Placeholder**: Enter last name
*   **Help Text**: Enter your last name or family name as listed on your medical registry document.
*   **Validation Rules**: String length between 1 and 100 characters.
*   **Normalization Rules**: Trim whitespace. Titlecase capitalization.
*   **Database Field**: `lastName`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.name.family`
*   **FHIR Datatype**: String
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `displayName`
*   **UI Label**: Display Name
*   **Section**: Identity
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Custom string.
*   **Placeholder**: e.g., Dr. Alexis Carter
*   **Help Text**: This is the name patients will see on the platform (typically "Dr. [First Name] [Last Name]").
*   **Validation Rules**: String length between 2 and 150 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `displayName`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.name.text`
*   **FHIR Datatype**: String
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `gender`
*   **UI Label**: Gender
*   **Section**: Identity
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: "male", "female", "other", "unknown"
*   **Placeholder**: Select gender
*   **Help Text**: Select your gender.
*   **Validation Rules**: Must be one of: "male", "female", "other", "unknown".
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `gender`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.gender`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://hl7.org/fhir/valueset/administrative-gender
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: Yes

#### `dateOfBirth`
*   **UI Label**: Date of Birth
*   **Section**: Identity
*   **Data Type**: Date
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: ISO Date string (YYYY-MM-DD)
*   **Placeholder**: YYYY-MM-DD
*   **Help Text**: Enter your date of birth.
*   **Validation Rules**: Must be a valid date. Practitioner must be at least 18 years old. Cannot be in the future.
*   **Normalization Rules**: Date object conversion to ISO string.
*   **Database Field**: `birthDate`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.birthDate`
*   **FHIR Datatype**: date
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: Yes

#### `profilePhoto`
*   **UI Label**: Profile Photo
*   **Section**: Identity
*   **Data Type**: String (URL)
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Valid image URL (relative or absolute).
*   **Placeholder**: Upload photo
*   **Help Text**: Upload a professional headshot. JPEG or PNG, max 5MB.
*   **Validation Rules**: Must be a valid URL string matching PNG, JPG, or JPEG extension.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `profilePhoto`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.photo`
*   **FHIR Datatype**: Attachment
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 2: Contact

#### `mobile`
*   **UI Label**: Mobile Number
*   **Section**: Contact
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: E.164 formatted phone number.
*   **Placeholder**: +1-555-555-5555
*   **Help Text**: Enter your primary contact phone number.
*   **Validation Rules**: Must match phone number format (regex: `^\+?[1-9]\d{1,14}$`).
*   **Normalization Rules**: Strip spaces, hyphens, and ensure E.164 prefix formatting.
*   **Database Field**: `phone`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.telecom[system=phone, use=mobile].value`
*   **FHIR Datatype**: ContactPoint
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: Yes

#### `email`
*   **UI Label**: Email Address
*   **Section**: Contact
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Valid email address string.
*   **Placeholder**: doctor@drgodly.com
*   **Help Text**: Enter your professional email address.
*   **Validation Rules**: Must conform to email validation standards.
*   **Normalization Rules**: Trim whitespace, convert to lowercase.
*   **Database Field**: `email`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.telecom[system=email, use=work].value`
*   **FHIR Datatype**: ContactPoint
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: Yes

#### `alternatePhone`
*   **UI Label**: Alternate Phone
*   **Section**: Contact
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: E.164 phone string.
*   **Placeholder**: +1-555-555-5556
*   **Help Text**: Enter an alternate phone number for emergency or backup contact.
*   **Validation Rules**: Must match phone number format if provided.
*   **Normalization Rules**: E.164 normalisation.
*   **Database Field**: `alternatePhone`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.telecom[system=phone, use=work].value`
*   **FHIR Datatype**: ContactPoint
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: Yes

#### `preferredContactMethod`
*   **UI Label**: Preferred Contact Method
*   **Section**: Contact
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: "email", "phone", "sms"
*   **Placeholder**: Select preference
*   **Help Text**: How would you prefer to receive notifications?
*   **Validation Rules**: Must be one of: "email", "phone", "sms".
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `preferredContactMethod`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.telecom.extension[url="http://drgodly.com/fhir/StructureDefinition/preferred-contact"]`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/preferred-contact
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 3: Medical Registration

#### `medicalSystem`
*   **UI Label**: Medical System
*   **Section**: Medical Registration
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: "Allopathy", "Homeopathy", "Ayurveda", "Unani", "Siddha"
*   **Placeholder**: Select Medical System
*   **Help Text**: Choose the medicine system you practice.
*   **Validation Rules**: Must be one of the specified allowed values.
*   **Normalization Rules**: Capitalization.
*   **Database Field**: `medicalSystem`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.code.coding[system="http://drgodly.com/fhir/CodeSystem/medical-system"].code`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://drgodly.com/fhir/CodeSystem/medical-system
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `registrationAuthority`
*   **UI Label**: Registration Authority
*   **Section**: Medical Registration
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Any alpha characters.
*   **Placeholder**: e.g., Medical Council of India, State Medical Board
*   **Help Text**: The licensing authority that issued your registration.
*   **Validation Rules**: Minimum 2 characters, maximum 150 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `registrationAuthority`
*   **Database Table/Entity**: `PractitionerIdentifier` (linked)
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.identifier.assigner.display`
*   **FHIR Datatype**: Reference (Organization)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `stateMedicalCouncil`
*   **UI Label**: State Medical Council
*   **Section**: Medical Registration
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Custom string.
*   **Placeholder**: e.g., Karnataka Medical Council
*   **Help Text**: The state medical council where registered (if applicable, e.g. for India).
*   **Validation Rules**: String length under 150 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `stateMedicalCouncil`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.issuer.display`
*   **FHIR Datatype**: Reference (Organization)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `registrationNumber`
*   **UI Label**: Medical Registration Number
*   **Section**: Medical Registration
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Alphanumeric codes.
*   **Placeholder**: e.g., KMC-12345
*   **Help Text**: Your official medical license or registration registry number.
*   **Validation Rules**: String length between 2 and 50 characters. Must be unique.
*   **Normalization Rules**: Trim whitespace, uppercase letters.
*   **Database Field**: `value`
*   **Database Table/Entity**: `PractitionerIdentifier`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.identifier[type=license].value`
*   **FHIR Datatype**: Identifier
*   **Terminology/System URL**: http://terminology.hl7.org/CodeSystem/v2-0203 (code: MD)
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `registrationDate`
*   **UI Label**: Registration Date
*   **Section**: Medical Registration
*   **Data Type**: Date
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: ISO Date.
*   **Placeholder**: YYYY-MM-DD
*   **Help Text**: Date when your registration was first issued.
*   **Validation Rules**: Valid date. Cannot be in the future.
*   **Normalization Rules**: Date object serialization.
*   **Database Field**: `registrationDate`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.period.start`
*   **FHIR Datatype**: Period
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `registrationExpiryDate`
*   **UI Label**: Registration Expiry Date
*   **Section**: Medical Registration
*   **Data Type**: Date
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: ISO Date.
*   **Placeholder**: YYYY-MM-DD
*   **Help Text**: Expiry date of your current medical license.
*   **Validation Rules**: Must be after `registrationDate`. Must be in the future for submission.
*   **Normalization Rules**: Date object.
*   **Database Field**: `registrationExpiryDate`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.period.end`
*   **FHIR Datatype**: Period
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `registrationStatus`
*   **UI Label**: Registration Status
*   **Section**: Medical Registration
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: "active", "expired", "suspended"
*   **Placeholder**: Select status
*   **Help Text**: The current state of your license with the authority.
*   **Validation Rules**: Must be one of the allowed statuses.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `registrationStatus`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.extension[url="http://hl7.org/fhir/StructureDefinition/qualification-status"]`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://hl7.org/fhir/StructureDefinition/qualification-status
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `imrNumber`
*   **UI Label**: Indian Medical Register (IMR) Number
*   **Section**: Medical Registration
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Alphanumeric registry codes.
*   **Placeholder**: e.g., IMR-99887
*   **Help Text**: Your IMR ID (mandatory for practicing Allopathic medicine in India).
*   **Validation Rules**: Max 50 characters.
*   **Normalization Rules**: Uppercase alphanumeric.
*   **Database Field**: `value` (with type "IMR")
*   **Database Table/Entity**: `PractitionerIdentifier`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.identifier[system="http://ndhm.gov.in/fhir/sid/imr-number"].value`
*   **FHIR Datatype**: Identifier
*   **Terminology/System URL**: http://ndhm.gov.in/fhir/sid/imr-number
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `abdmHealthcareProfessionalId`
*   **UI Label**: ABDM Healthcare Professional ID (HPID)
*   **Section**: Medical Registration
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Format: username@hpr.abdm
*   **Placeholder**: doctor@hpr.abdm
*   **Help Text**: Ayushman Bharat Digital Mission (ABDM) HPR ID.
*   **Validation Rules**: Regex match `^[a-zA-Z0-9.\-_]{4,30}@hpr\.abdm$`.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `value` (with type "ABDM_HPID")
*   **Database Table/Entity**: `PractitionerIdentifier`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.identifier[system="https://hpr.abdm.gov.in/hpid"].value`
*   **FHIR Datatype**: Identifier
*   **Terminology/System URL**: https://hpr.abdm.gov.in/hpid
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 4: Qualifications (Repeatable)

#### `qualificationType`
*   **UI Label**: Degree Category
*   **Section**: Qualifications
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "UG" (Undergraduate), "PG" (Postgraduate), "SuperSpecialty", "Diploma", "Fellowship"
*   **Placeholder**: Select Category
*   **Help Text**: Select the classification of this degree.
*   **Validation Rules**: Must be one of the enum values.
*   **Normalization Rules**: Upper case.
*   **Database Field**: `qualificationType` (within metadata JSON or columns if schema allows)
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.extension[url="http://drgodly.com/fhir/StructureDefinition/qualification-category"]`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/qualification-category
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `degreeName`
*   **UI Label**: Degree / Certificate Title
*   **Section**: Qualifications
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Any alphanumeric string.
*   **Placeholder**: e.g., MBBS, MD, MS, DNB
*   **Help Text**: The formal title of the degree awarded.
*   **Validation Rules**: String length between 2 and 50 characters.
*   **Normalization Rules**: Capitalize and trim whitespace.
*   **Database Field**: `code`
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.code.text`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://terminology.hl7.org/CodeSystem/v2-0360
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `specialization`
*   **UI Label**: Specialty / Subject
*   **Section**: Qualifications
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Alphanumeric characters.
*   **Placeholder**: e.g., Cardiology, General Surgery
*   **Help Text**: The core major or specialization field of this qualification.
*   **Validation Rules**: Max 100 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `specialization`
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.code.coding[system="http://snomed.info/sct"].display`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://snomed.info/sct
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `institution`
*   **UI Label**: Institution / Medical School
*   **Section**: Qualifications
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Any text.
*   **Placeholder**: e.g., Grant Medical College, Mumbai
*   **Help Text**: Medical school or college attended to attain this degree.
*   **Validation Rules**: String length between 2 and 150 characters.
*   **Normalization Rules**: Trim whitespace. Titlecase.
*   **Database Field**: `issuer`
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.issuer.display`
*   **FHIR Datatype**: Reference (Organization)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `issuingOrganization`
*   **UI Label**: University / Board Name
*   **Section**: Qualifications
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Custom string.
*   **Placeholder**: e.g., Maharashtra University of Health Sciences
*   **Help Text**: The university or board that certified and issued the degree.
*   **Validation Rules**: Minimum 2 characters, max 150 characters.
*   **Normalization Rules**: Titlecase.
*   **Database Field**: `issuingOrganization`
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.issuer.display` // Consolidated under same Reference Organization
*   **FHIR Datatype**: Reference (Organization)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `country`
*   **UI Label**: Country of Issue
*   **Section**: Qualifications
*   **Data Type**: String (ISO 2-letter)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Valid ISO 3166-1 alpha-2 country codes.
*   **Placeholder**: Select Country
*   **Help Text**: Country where this degree was issued.
*   **Validation Rules**: Must be a valid 2-letter country code.
*   **Normalization Rules**: Uppercase.
*   **Database Field**: `country`
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.extension[url="http://hl7.org/fhir/StructureDefinition/qualification-country"]`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: urn:iso:std:iso:3166
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `completionDate`
*   **UI Label**: Year / Date of Completion
*   **Section**: Qualifications
*   **Data Type**: Date
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: ISO Date.
*   **Placeholder**: YYYY-MM-DD
*   **Help Text**: Date the degree was awarded.
*   **Validation Rules**: Valid date. Must be in the past.
*   **Normalization Rules**: Date object.
*   **Database Field**: `periodEnd`
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.period.end`
*   **FHIR Datatype**: Period
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `certificateNumber`
*   **UI Label**: Certificate Number
*   **Section**: Qualifications
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Alphanumeric codes.
*   **Placeholder**: e.g., CERT-77665
*   **Help Text**: Number printed on your degree certificate.
*   **Validation Rules**: Min 2 characters, max 50 characters.
*   **Normalization Rules**: Uppercase alphanumeric.
*   **Database Field**: `certificateNumber`
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.identifier.value`
*   **FHIR Datatype**: Identifier
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `verificationStatus`
*   **UI Label**: Verification Status
*   **Section**: Qualifications
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "pending", "verified", "rejected"
*   **Placeholder**: N/A
*   **Help Text**: Educational degree credential validation status (updated by admin reviewer).
*   **Validation Rules**: Must be one of the enum values.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `verificationStatus`
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.extension[url="http://drgodly.com/fhir/StructureDefinition/verification-status"]`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/verification-status
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: Yes
*   **Whether the field contains sensitive information**: No

#### `documentReferenceId`
*   **UI Label**: Qualification Document Link
*   **Section**: Qualifications
*   **Data Type**: String (UUID/CUID)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Valid ID referencing an uploaded verification document.
*   **Placeholder**: Select uploaded file
*   **Help Text**: Link to the PDF or image file containing the degree copy.
*   **Validation Rules**: Must match a valid ID from the `VerificationDocument` table.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `documentReferenceId`
*   **Database Table/Entity**: `PractitionerQualification`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.qualification.extension[url="http://hl7.org/fhir/StructureDefinition/qualification-document"].value`
*   **FHIR Datatype**: Reference (DocumentReference)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 5: Specialty

#### `primarySpecialty`
*   **UI Label**: Primary Specialty
*   **Section**: Specialty
*   **Data Type**: String (Coded)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Valid SNOMED CT codes representing medical specialties (e.g. "408443003" for General medical practice, "394814009" for General practice).
*   **Placeholder**: Select Specialty
*   **Help Text**: Your primary specialty (mandatory for patient booking assignment).
*   **Validation Rules**: Must match one of the predefined coded specialties list.
*   **Normalization Rules**: Coded ID storage.
*   **Database Field**: `specialties` (first element in database array, or mapped database column)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.specialty.coding[system="http://snomed.info/sct"]`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://snomed.info/sct
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `secondarySpecialties`
*   **UI Label**: Secondary Specialties
*   **Section**: Specialty
*   **Data Type**: Array of Strings (Coded)
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: SNOMED CT codes representing secondary fields.
*   **Placeholder**: Select secondary specialties
*   **Help Text**: List secondary specialties or fellowships.
*   **Validation Rules**: Array of valid SNOMED CT codes.
*   **Normalization Rules**: Array of codes.
*   **Database Field**: `specialties` (remaining elements)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.specialty.coding`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://snomed.info/sct
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `areasOfExpertise`
*   **UI Label**: Areas of Expertise
*   **Section**: Specialty
*   **Data Type**: Array of Strings
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Custom string tags.
*   **Placeholder**: e.g., Obesity management, PCOS, metabolic health
*   **Help Text**: Enter specific keywords or topics you specialize in (useful for AI patient matchmaking).
*   **Validation Rules**: String array. Maximum 10 items.
*   **Normalization Rules**: Trim, lowercase, strip special characters.
*   **Database Field**: `areasOfExpertise` (metadata JSON or separate column)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.extension[url="http://drgodly.com/fhir/StructureDefinition/practitioner-expertise"]`
*   **FHIR Datatype**: string
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/practitioner-expertise
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 6: Professional Practice

#### `totalYearsOfExperience`
*   **UI Label**: Years of Practice Experience
*   **Section**: Professional Practice
*   **Data Type**: Integer
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Positive integers from 0 to 60.
*   **Placeholder**: e.g., 10
*   **Help Text**: Total years since you finished your medical school residency.
*   **Validation Rules**: Integer >= 0.
*   **Normalization Rules**: Parse string representation to integer.
*   **Database Field**: `yearsOfExperience`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.extension[url="http://hl7.org/fhir/StructureDefinition/practitioner-experience-years"]`
*   **FHIR Datatype**: integer
*   **Terminology/System URL**: http://hl7.org/fhir/StructureDefinition/practitioner-experience-years
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `currentEmploymentStatus`
*   **UI Label**: Employment Status
*   **Section**: Professional Practice
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: "full-time", "part-time", "contractor"
*   **Placeholder**: Select employment status
*   **Help Text**: Select your commitment model for DrGodly consultations.
*   **Validation Rules**: Must match one of the allowed statuses.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `currentEmploymentStatus`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.extension[url="http://drgodly.com/fhir/StructureDefinition/employment-status"]`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/employment-status
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `medicalIndemnityInsuranceNumber`
*   **UI Label**: Medical Indemnity Insurance Number
*   **Section**: Professional Practice
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Alphanumeric policy codes.
*   **Placeholder**: e.g., POL-554433
*   **Help Text**: Your professional liability or indemnity policy identifier.
*   **Validation Rules**: Max 100 characters.
*   **Normalization Rules**: Uppercase alphanumeric.
*   **Database Field**: `value` (with type "INSURANCE")
*   **Database Table/Entity**: `PractitionerIdentifier`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.identifier[system="http://drgodly.com/fhir/sid/insurance"].value`
*   **FHIR Datatype**: Identifier
*   **Terminology/System URL**: http://drgodly.com/fhir/sid/insurance
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: Yes

#### `indemnityInsuranceExpiryDate`
*   **UI Label**: Insurance Expiry Date
*   **Section**: Professional Practice
*   **Data Type**: Date
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: ISO Date.
*   **Placeholder**: YYYY-MM-DD
*   **Help Text**: The expiry date of your active medical indemnity policy.
*   **Validation Rules**: Must be in the future.
*   **Normalization Rules**: Date object.
*   **Database Field**: `indemnityInsuranceExpiryDate` (metadata)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.identifier[system="http://drgodly.com/fhir/sid/insurance"].period.end`
*   **FHIR Datatype**: Period
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 7: Organizations (Repeatable)

#### `organizationName`
*   **UI Label**: Affiliated Organization Name
*   **Section**: Organizations
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Any text or selection from lookup.
*   **Placeholder**: Select or enter organization name
*   **Help Text**: Name of hospital, medical group, or clinic you work for.
*   **Validation Rules**: String length between 2 and 150 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `name`
*   **Database Table/Entity**: `Organization`
*   **FHIR Resource**: `Organization`
*   **FHIR Path**: `Organization.name`
*   **FHIR Datatype**: String
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `organizationType`
*   **UI Label**: Organization Type
*   **Section**: Organizations
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "prov" (Healthcare Provider), "dept" (Hospital Department), "team" (Clinical Team), "govt" (Government Organization), "ins" (Insurance Company)
*   **Placeholder**: Select type
*   **Help Text**: Classification of the organization entity.
*   **Validation Rules**: Must be one of the pre-selected allowed values.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `type`
*   **Database Table/Entity**: `Organization` (or default mapping)
*   **FHIR Resource**: `Organization`
*   **FHIR Path**: `Organization.type`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://hl7.org/fhir/valueset/organization-type
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `designation`
*   **UI Label**: Job Designation
*   **Section**: Organizations
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: e.g., Senior Consultant, Resident, Director
*   **Placeholder**: Senior Consultant Physician
*   **Help Text**: Your official employment title/designation inside the organization.
*   **Validation Rules**: String length between 2 and 100 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `designation` (linked metadata column)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.code.text`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://hl7.org/fhir/valueset/practitioner-role
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `department`
*   **UI Label**: Department / Division
*   **Section**: Organizations
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: e.g., Department of Cardiology, Outpatient Medicine
*   **Placeholder**: Outpatient Wellness Clinic
*   **Help Text**: Specific department you practice in at this organization.
*   **Validation Rules**: Max 100 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `department`
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.extension[url="http://drgodly.com/fhir/StructureDefinition/practitioner-role-department"]`
*   **FHIR Datatype**: string
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/practitioner-role-department
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `role`
*   **UI Label**: Practitioner Role Function
*   **Section**: Organizations
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "doctor" (Physician/MD), "nurse" (Nurse Practitioner), "pharmacist" (Pharmacist), "therapist" (Therapist/Dietician)
*   **Placeholder**: Select clinical role
*   **Help Text**: The clinical role you assume at this organization.
*   **Validation Rules**: Must match one of the allowed role types.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `role` (mapped or inferred from parent)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.code.coding[system="http://terminology.hl7.org/CodeSystem/practitioner-role"].code`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://terminology.hl7.org/CodeSystem/practitioner-role
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `startDate`
*   **UI Label**: Joining Date
*   **Section**: Organizations
*   **Data Type**: Date
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: ISO Date.
*   **Placeholder**: YYYY-MM-DD
*   **Help Text**: Date you joined this organization.
*   **Validation Rules**: Must be in the past.
*   **Normalization Rules**: Date object.
*   **Database Field**: `createdAt` (or role period start)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.period.start`
*   **FHIR Datatype**: Period
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `endDate`
*   **UI Label**: Leaving Date
*   **Section**: Organizations
*   **Data Type**: Date
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: ISO Date.
*   **Placeholder**: YYYY-MM-DD
*   **Help Text**: Date you left this organization (leave blank if current affiliation).
*   **Validation Rules**: Must be after `startDate` if provided.
*   **Normalization Rules**: Date object.
*   **Database Field**: `endDate` (role period end)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.period.end`
*   **FHIR Datatype**: Period
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `organizationIdentifier`
*   **UI Label**: Organization Tax ID / PAN
*   **Section**: Organizations
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Valid tax or corporate registry number.
*   **Placeholder**: Enter Tax ID
*   **Help Text**: Corporate identity number (e.g., EIN / PAN) of the organization.
*   **Validation Rules**: Min 5 characters, max 30 characters.
*   **Normalization Rules**: Uppercase alphanumeric.
*   **Database Field**: `id` (or linked field)
*   **Database Table/Entity**: `Organization`
*   **FHIR Resource**: `Organization`
*   **FHIR Path**: `Organization.identifier.value`
*   **FHIR Datatype**: Identifier
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: Yes

#### `organizationVerificationStatus`
*   **UI Label**: Organization Verification Status
*   **Section**: Organizations
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "pending", "verified", "failed"
*   **Placeholder**: N/A
*   **Help Text**: Trust status of this organization affiliation.
*   **Validation Rules**: Must be one of the enum values.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `active` (maps boolean: true = verified, false = failed/pending)
*   **Database Table/Entity**: `Organization`
*   **FHIR Resource**: `Organization`
*   **FHIR Path**: `Organization.active`
*   **FHIR Datatype**: boolean
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is admin-only**: Yes
*   **Whether the field contains sensitive information**: No

---

### Section 8: Locations (Repeatable)

#### `locationName`
*   **UI Label**: Location Name
*   **Section**: Locations
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Any alphanumeric string.
*   **Placeholder**: e.g., Apex Clinic Clinic Room 4
*   **Help Text**: Name of this specific physical clinic facility.
*   **Validation Rules**: Minimum 2 characters, max 100 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `name`
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.name`
*   **FHIR Datatype**: String
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `addressLine1`
*   **UI Label**: Address Line 1
*   **Section**: Locations
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Any text.
*   **Placeholder**: e.g., 123 Health Plaza Suite 200
*   **Help Text**: Primary street address (must not be home address).
*   **Validation Rules**: String length between 5 and 150 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `address` (first part or combined address string)
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.address.line[0]`
*   **FHIR Datatype**: Address
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `addressLine2`
*   **UI Label**: Address Line 2
*   **Section**: Locations
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Any text.
*   **Placeholder**: e.g., Building B, 2nd Floor
*   **Help Text**: Apartment, suite, or building details.
*   **Validation Rules**: Max 100 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `address` (second part)
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.address.line[1]`
*   **FHIR Datatype**: Address
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `city`
*   **UI Label**: City
*   **Section**: Locations
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Any alpha string.
*   **Placeholder**: e.g., Bangalore
*   **Help Text**: City where the clinic is located.
*   **Validation Rules**: Min 2 characters, max 100 characters.
*   **Normalization Rules**: Titlecase.
*   **Database Field**: `city`
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.address.city`
*   **FHIR Datatype**: Address
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `district`
*   **UI Label**: District
*   **Section**: Locations
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Custom string.
*   **Placeholder**: e.g., Bengaluru Urban
*   **Help Text**: District or county.
*   **Validation Rules**: Max 100 characters.
*   **Normalization Rules**: Titlecase.
*   **Database Field**: `district` (metadata)
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.address.district`
*   **FHIR Datatype**: Address
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `state`
*   **UI Label**: State
*   **Section**: Locations
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Full name or code of state.
*   **Placeholder**: e.g., Karnataka
*   **Help Text**: State or province.
*   **Validation Rules**: Minimum 2 characters, max 100 characters.
*   **Normalization Rules**: Capitalization.
*   **Database Field**: `state`
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.address.state`
*   **FHIR Datatype**: Address
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `postalCode`
*   **UI Label**: Postal Code / ZIP Code
*   **Section**: Locations
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Alphanumeric postal codes.
*   **Placeholder**: e.g., 560001
*   **Help Text**: ZIP or Postal Code.
*   **Validation Rules**: Must match standard postal code format for target country.
*   **Normalization Rules**: Uppercase, strip extra spaces.
*   **Database Field**: `postalCode`
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.address.postalCode`
*   **FHIR Datatype**: Address
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `country`
*   **UI Label**: Country
*   **Section**: Locations
*   **Data Type**: String (ISO 2-letter)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: ISO country codes.
*   **Placeholder**: Select Country
*   **Help Text**: Country of the clinic location.
*   **Validation Rules**: Must be a valid 2-letter country code.
*   **Normalization Rules**: Uppercase.
*   **Database Field**: `country`
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.address.country`
*   **FHIR Datatype**: Address
*   **Terminology/System URL**: urn:iso:std:iso:3166
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `latitude`
*   **UI Label**: Latitude
*   **Section**: Locations
*   **Data Type**: Float
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Range from -90.0 to 90.0.
*   **Placeholder**: e.g., 12.9716
*   **Help Text**: Geographic coordinate latitude.
*   **Validation Rules**: Valid float value between -90.0 and 90.0.
*   **Normalization Rules**: Convert string representation to float.
*   **Database Field**: `latitude` (metadata)
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.position.latitude`
*   **FHIR Datatype**: decimal
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `longitude`
*   **UI Label**: Longitude
*   **Section**: Locations
*   **Data Type**: Float
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Range from -180.0 to 180.0.
*   **Placeholder**: e.g., 77.5946
*   **Help Text**: Geographic coordinate longitude.
*   **Validation Rules**: Float between -180.0 and 180.0.
*   **Normalization Rules**: Float conversion.
*   **Database Field**: `longitude` (metadata)
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.position.longitude`
*   **FHIR Datatype**: decimal
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `locationType`
*   **UI Label**: Location Type
*   **Section**: Locations
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "clinic" (Outpatient Clinic), "hosp" (Hospital), "pharm" (Pharmacy), "home" (Home / Virtual Base)
*   **Placeholder**: Select location type
*   **Help Text**: Classification of the practice setting.
*   **Validation Rules**: Must be one of the enum values.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `locationType` (metadata)
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.physicalType`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://terminology.hl7.org/CodeSystem/location-physical-type
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `virtualLocation`
*   **UI Label**: Is Virtual Location?
*   **Section**: Locations
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Ticked if the location is simulated for digital telehealth consults.
*   **Validation Rules**: Must be a boolean value.
*   **Normalization Rules**: Inferred database representation.
*   **Database Field**: `virtual` (or maps to active state)
*   **Database Table/Entity**: `Location`
*   **FHIR Resource**: `Location`
*   **FHIR Path**: `Location.status` // Virtual locations are mapped under dedicated status modifiers
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://hl7.org/fhir/valueset/location-status
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 9: Languages (Repeatable)

#### `languageCode`
*   **UI Label**: Language ISO Code
*   **Section**: Languages
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: ISO 639-1 standard 2-letter codes (e.g., "en", "es", "hi").
*   **Placeholder**: e.g., en
*   **Help Text**: Standard code representation.
*   **Validation Rules**: Must be a valid 2-letter ISO code.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `languages` (stored elements)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.communication.language.coding.code`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: urn:ietf:bcp:47
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `languageName`
*   **UI Label**: Language Name
*   **Section**: Languages
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Any text representing a language.
*   **Placeholder**: e.g., English, Hindi
*   **Help Text**: The language name.
*   **Validation Rules**: Minimum 2 characters, max 50 characters.
*   **Normalization Rules**: Titlecase.
*   **Database Field**: `languages` (human names list)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.communication.language.text`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: urn:ietf:bcp:47
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `proficiency`
*   **UI Label**: Language Proficiency
*   **Section**: Languages
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "native", "fluent", "intermediate", "basic"
*   **Placeholder**: Select proficiency
*   **Help Text**: Your level of speaking and writing ability in this language.
*   **Validation Rules**: Must match one of the allowed proficiency values.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `proficiency` (metadata)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.communication.extension[url="http://drgodly.com/fhir/StructureDefinition/language-proficiency"]`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/language-proficiency
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `preferredForConsultation`
*   **UI Label**: Preferred for Patient Consultations
*   **Section**: Languages
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Check this if this language is your primary language for patient consultations.
*   **Validation Rules**: Must be boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `preferredLanguage` (metadata)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner`
*   **FHIR Path**: `Practitioner.communication.language.coding.extension[url="http://hl7.org/fhir/StructureDefinition/language-preference"]`
*   **FHIR Datatype**: boolean
*   **Terminology/System URL**: http://hl7.org/fhir/StructureDefinition/language-preference
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 10: Telemedicine Services

#### `videoConsultation`
*   **UI Label**: Video Consultation
*   **Section**: Telemedicine Services
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Checked if you conduct live video consultation slots.
*   **Validation Rules**: Boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `services` (linked to service ID "srv-video")
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.healthcareService` // Connected reference
*   **FHIR Datatype**: Reference (HealthcareService)
*   **Terminology/System URL**: http://hl7.org/fhir/valueset/service-type
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `audioConsultation`
*   **UI Label**: Audio Consultation
*   **Section**: Telemedicine Services
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Checked if you offer telephone/audio consultation slots.
*   **Validation Rules**: Boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `services` (linked to service ID "srv-audio")
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.healthcareService`
*   **FHIR Datatype**: Reference (HealthcareService)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `chatConsultation`
*   **UI Label**: Text Chat Consultation
*   **Section**: Telemedicine Services
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Checked if you consult via text chat messaging.
*   **Validation Rules**: Boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `services` (linked to service ID "srv-chat")
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.healthcareService`
*   **FHIR Datatype**: Reference (HealthcareService)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `followUpConsultation`
*   **UI Label**: Follow-up Reviews
*   **Section**: Telemedicine Services
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Checked if you conduct follow-up consultations.
*   **Validation Rules**: Boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `services` (linked to service ID "srv-rx-renewal")
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.healthcareService`
*   **FHIR Datatype**: Reference (HealthcareService)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `secondOpinion`
*   **UI Label**: Second Opinion Reviews
*   **Section**: Telemedicine Services
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Checked if you review diagnostics for complex second opinions.
*   **Validation Rules**: Boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `services` (linked to custom second-opinion service)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.healthcareService`
*   **FHIR Datatype**: Reference (HealthcareService)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `chronicDiseaseManagement`
*   **UI Label**: Chronic Disease Management
*   **Section**: Telemedicine Services
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Checked if you specialize in long-term metabolic health and chronic disease care.
*   **Validation Rules**: Boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `services` (linked to chronic care service)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.healthcareService`
*   **FHIR Datatype**: Reference (HealthcareService)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `preventiveCare`
*   **UI Label**: Preventive Care
*   **Section**: Telemedicine Services
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Checked if you provide preventive lifestyle counseling.
*   **Validation Rules**: Boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `services` (linked to preventive service)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.healthcareService`
*   **FHIR Datatype**: Reference (HealthcareService)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `medicationReview`
*   **UI Label**: Medication Review
*   **Section**: Telemedicine Services
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Checked if you review prescriptions for medication adjustments.
*   **Validation Rules**: Boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `services` (linked to medication review service)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.healthcareService`
*   **FHIR Datatype**: Reference (HealthcareService)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `otherServices`
*   **UI Label**: Other Clinical Services
*   **Section**: Telemedicine Services
*   **Data Type**: Array of Strings
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Custom text tags.
*   **Placeholder**: e.g., diet coaching, hormonal balancing
*   **Help Text**: Specify other specialized telehealth wellness services.
*   **Validation Rules**: String array.
*   **Normalization Rules**: Trim, lowercase.
*   **Database Field**: `services` (dynamic references)
*   **Database Table/Entity**: `PractitionerRole`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.healthcareService`
*   **FHIR Datatype**: Reference (HealthcareService)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 11: Pricing

#### `initialConsultationFee`
*   **UI Label**: Initial Consultation Fee
*   **Section**: Pricing
*   **Data Type**: Float
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Positive floating point numbers.
*   **Placeholder**: e.g., 500.00
*   **Help Text**: Fee for the first evaluation consultation session.
*   **Validation Rules**: Must be greater than or equal to 0.
*   **Normalization Rules**: Float conversion.
*   **Database Field**: `initialFee` (metadata or dedicated column)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None
*   **FHIR Path**: N/A (Business/billing model, excluded from Practitioner FHIR record)
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `followUpConsultationFee`
*   **UI Label**: Follow-up Consultation Fee
*   **Section**: Pricing
*   **Data Type**: Float
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Positive floats.
*   **Placeholder**: e.g., 300.00
*   **Help Text**: Fee charged for standard follow-up reviews.
*   **Validation Rules**: Must be >= 0.
*   **Normalization Rules**: Float conversion.
*   **Database Field**: `followUpFee`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `secondOpinionFee`
*   **UI Label**: Second Opinion Review Fee
*   **Section**: Pricing
*   **Data Type**: Float
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Positive floats.
*   **Placeholder**: e.g., 1000.00
*   **Help Text**: Fee for complex document reviews and second opinions.
*   **Validation Rules**: Must be >= 0.
*   **Normalization Rules**: Float conversion.
*   **Database Field**: `secondOpinionFee`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `currency`
*   **UI Label**: Currency
*   **Section**: Pricing
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: ISO currency codes: "INR", "USD", "GBP", "EUR"
*   **Placeholder**: Select Currency
*   **Help Text**: Currency used for pricing.
*   **Validation Rules**: Must match one of the allowed currencies.
*   **Normalization Rules**: Uppercase.
*   **Database Field**: `currency`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: urn:iso:std:iso:4217
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 12: Availability (Repeatable)

#### `dayOfWeek`
*   **UI Label**: Day of Week
*   **Section**: Availability
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"
*   **Placeholder**: Select Day
*   **Help Text**: The day of the week this slot applies to.
*   **Validation Rules**: Must be one of the seven days.
*   **Normalization Rules**: Uppercase.
*   **Database Field**: `dayOfWeek`
*   **Database Table/Entity**: `PractitionerAvailability`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.availableTime.daysOfWeek`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://hl7.org/fhir/valueset/days-of-week
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `startTime`
*   **UI Label**: Start Time
*   **Section**: Availability
*   **Data Type**: String (Time)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: 24-hour time format: HH:MM.
*   **Placeholder**: 09:00
*   **Help Text**: Time the availability period starts.
*   **Validation Rules**: Regex match `^([0-1]\d|2[0-3]):[0-5]\d$`.
*   **Normalization Rules**: Ensure 24h formatting.
*   **Database Field**: `availableFrom`
*   **Database Table/Entity**: `PractitionerAvailability`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.availableTime.availableStartTime`
*   **FHIR Datatype**: time
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `endTime`
*   **UI Label**: End Time
*   **Section**: Availability
*   **Data Type**: String (Time)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: 24-hour time format: HH:MM.
*   **Placeholder**: 17:00
*   **Help Text**: Time the availability period ends.
*   **Validation Rules**: Must be chronologically after `startTime`. Must match `^([0-1]\d|2[0-3]):[0-5]\d$`.
*   **Normalization Rules**: 24h format.
*   **Database Field**: `availableTo`
*   **Database Table/Entity**: `PractitionerAvailability`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.availableTime.availableEndTime`
*   **FHIR Datatype**: time
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `timezone`
*   **UI Label**: Timezone
*   **Section**: Availability
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: IANA Time Zone Database values (e.g. "Asia/Kolkata", "America/New_York").
*   **Placeholder**: e.g., Asia/Kolkata
*   **Help Text**: Select your active timezone.
*   **Validation Rules**: Must be a valid IANA timezone string.
*   **Normalization Rules**: Default to "Asia/Kolkata" if in India, but do not hardcode in Prisma column default.
*   **Database Field**: `timezone` (metadata or column)
*   **Database Table/Entity**: `PractitionerAvailability`
*   **FHIR Resource**: `PractitionerRole`
*   **FHIR Path**: `PractitionerRole.availableTime.extension[url="http://hl7.org/fhir/StructureDefinition/timezone"]`
*   **FHIR Datatype**: string
*   **Terminology/System URL**: http://hl7.org/fhir/StructureDefinition/timezone
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `appointmentDurationMinutes`
*   **UI Label**: Consultation Session Duration
*   **Section**: Availability
*   **Data Type**: Integer
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: 10, 15, 20, 30, 45, 60.
*   **Placeholder**: 15
*   **Help Text**: Duration of each appointment slot in minutes.
*   **Validation Rules**: Positive integer between 5 and 120.
*   **Normalization Rules**: Parse string to integer.
*   **Database Field**: `duration` (metadata)
*   **Database Table/Entity**: `PractitionerAvailability`
*   **FHIR Resource**: None (Stored in local scheduling configuration)
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `bufferMinutes`
*   **UI Label**: Buffer Time
*   **Section**: Availability
*   **Data Type**: Integer
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: 0, 5, 10, 15.
*   **Placeholder**: 5
*   **Help Text**: Resting buffer time in minutes between appointment slots.
*   **Validation Rules**: Integer >= 0.
*   **Normalization Rules**: Parse to integer.
*   **Database Field**: `buffer` (metadata)
*   **Database Table/Entity**: `PractitionerAvailability`
*   **FHIR Resource**: None
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `active`
*   **UI Label**: Active Slot
*   **Section**: Availability
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: true, false
*   **Placeholder**: N/A
*   **Help Text**: Disabling this hides the slot from booking templates without deleting it.
*   **Validation Rules**: Must be boolean.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `active`
*   **Database Table/Entity**: `PractitionerAvailability` // Inferred status
*   **FHIR Resource**: None
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 13: Professional Profile

#### `professionalBio`
*   **UI Label**: Professional Biography
*   **Section**: Professional Profile
*   **Data Type**: String (Markdown text)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Any text.
*   **Placeholder**: Write a brief overview of your clinical experience and medical philosophy...
*   **Help Text**: This biography is displayed on your public profile page for patients to read.
*   **Validation Rules**: String length between 50 and 2000 characters.
*   **Normalization Rules**: Clean HTML tags, trim whitespace.
*   **Database Field**: `bio` (metadata or separate column)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None (Marketing/public profile information is kept separate from core FHIR identity data)
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `yearsOfExperience`
*   **UI Label**: Years of Experience
*   **Section**: Professional Profile
*   **Data Type**: Integer
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Positive integers from 0 to 60.
*   **Placeholder**: 10
*   **Help Text**: Duplicate of core years of practice for verification synchronisation.
*   **Validation Rules**: Must equal Section 6 totalYearsOfExperience value.
*   **Normalization Rules**: Integer conversion.
*   **Database Field**: `yearsOfExperience`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None (Stored in PractitionerRole experience extension under Section 6)
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `professionalInterests`
*   **UI Label**: Clinical Interests
*   **Section**: Professional Profile
*   **Data Type**: Array of Strings
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Custom text tags.
*   **Placeholder**: e.g., peptide therapy, longevity, nutrition
*   **Help Text**: Enter areas of clinical interest.
*   **Validation Rules**: Max 10 items.
*   **Normalization Rules**: Trim, lowercase.
*   **Database Field**: `interests` (metadata JSON)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `awards`
*   **UI Label**: Awards & Recognitions
*   **Section**: Professional Profile
*   **Data Type**: Array of Strings
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Custom string descriptions.
*   **Placeholder**: e.g., Best Physician Award 2024
*   **Help Text**: Enter professional awards.
*   **Validation Rules**: String array.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `awards` (metadata)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `publications`
*   **UI Label**: Research Publications
*   **Section**: Professional Profile
*   **Data Type**: Array of Strings
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Citation strings.
*   **Placeholder**: e.g., 'Study of GLP-1 weight loss outcomes, NEJM 2025'
*   **Help Text**: Add links or citation strings of medical research papers you published.
*   **Validation Rules**: String array.
*   **Normalization Rules**: Trim.
*   **Database Field**: `publications` (metadata)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `memberships`
*   **UI Label**: Professional Memberships
*   **Section**: Professional Profile
*   **Data Type**: Array of Strings
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Custom organization names.
*   **Placeholder**: e.g., American Medical Association
*   **Help Text**: Professional groups or councils you belong to.
*   **Validation Rules**: String array.
*   **Normalization Rules**: Trim.
*   **Database Field**: `memberships` (metadata)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: None
*   **FHIR Path**: N/A
*   **FHIR Datatype**: N/A
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 14: Verification Documents (Repeatable)

#### `documentType`
*   **UI Label**: Document Type
*   **Section**: Verification Documents
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "license" (Medical License), "qualification" (Medical Degree Diploma), "identity" (Passport/Government Photo ID)
*   **Placeholder**: Select Document Type
*   **Help Text**: The category classification of the uploaded file.
*   **Validation Rules**: Must match one of the allowed document types.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `docType`
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.type.text`
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://loinc.org (mapped system codes: 57016-8)
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `fileId`
*   **UI Label**: File Storage Reference
*   **Section**: Verification Documents
*   **Data Type**: String (URL)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Valid file URL on the DrGodly server.
*   **Placeholder**: N/A
*   **Help Text**: Local file path reference (e.g. `/uploads/file_name.pdf`).
*   **Validation Rules**: Must be a valid URL/URI string.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `url`
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.content.attachment.url`
*   **FHIR Datatype**: url
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: Yes

#### `fileName`
*   **UI Label**: File Name
*   **Section**: Verification Documents
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Custom string.
*   **Placeholder**: e.g., medical_license.pdf
*   **Help Text**: The original name of the uploaded file.
*   **Validation Rules**: String length between 1 and 255. Must end with a valid extension (.pdf, .png, .jpg, .jpeg).
*   **Normalization Rules**: Sanitise filename characters, replacing spaces/special characters with underscores.
*   **Database Field**: `title`
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.content.attachment.title`
*   **FHIR Datatype**: string
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `mimeType`
*   **UI Label**: MIME Type
*   **Section**: Verification Documents
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "application/pdf", "image/png", "image/jpeg"
*   **Placeholder**: N/A
*   **Help Text**: File type mime encoding.
*   **Validation Rules**: Must match one of the allowed MIME types.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `mimeType` (metadata or derived)
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.content.attachment.contentType`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://hl7.org/fhir/valueset/mimetypes
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `fileSize`
*   **UI Label**: File Size
*   **Section**: Verification Documents
*   **Data Type**: Integer (Bytes)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Up to 5,242,880 (5MB).
*   **Placeholder**: N/A
*   **Help Text**: The size of the file in bytes.
*   **Validation Rules**: Integer between 1 and 5242880.
*   **Normalization Rules**: Integer conversion.
*   **Database Field**: `fileSize` (metadata)
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.content.attachment.size`
*   **FHIR Datatype**: unsignedInt
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `uploadedAt`
*   **UI Label**: Uploaded Time
*   **Section**: Verification Documents
*   **Data Type**: DateTime
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: DateTime ISO.
*   **Placeholder**: N/A
*   **Help Text**: The timestamp when the file was uploaded.
*   **Validation Rules**: Valid date-time. Cannot be in the future.
*   **Normalization Rules**: ISO string.
*   **Database Field**: `createdAt`
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.date`
*   **FHIR Datatype**: instant
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `verificationStatus`
*   **UI Label**: Verification Status
*   **Section**: Verification Documents
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: "pending", "approved", "rejected"
*   **Placeholder**: N/A
*   **Help Text**: Trust status of this specific document file (updated by admin).
*   **Validation Rules**: Must be one of the enum values.
*   **Normalization Rules**: Lowercase.
*   **Database Field**: `status` (or maps status column)
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.status` // approved maps to 'current', rejected to 'entered-in-error', pending to 'current' (draft state)
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://hl7.org/fhir/valueset/document-reference-status
*   **Whether the field is searchable**: No
*   **Whether the field is admin-only**: Yes
*   **Whether the field contains sensitive information**: No

#### `verifiedAt`
*   **UI Label**: Verified Time
*   **Section**: Verification Documents
*   **Data Type**: DateTime
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: ISO DateTime.
*   **Placeholder**: N/A
*   **Help Text**: Timestamp when this document was verified by an administrator.
*   **Validation Rules**: Valid date-time. Cannot be in the future. Must be after `uploadedAt`.
*   **Normalization Rules**: Date object.
*   **Database Field**: `verifiedAt` (metadata)
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.extension[url="http://drgodly.com/fhir/StructureDefinition/document-verified-at"]`
*   **FHIR Datatype**: dateTime
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/document-verified-at
*   **Whether the field is searchable**: No
*   **Whether the field is admin-only**: Yes
*   **Whether the field contains sensitive information**: No

#### `verifiedBy`
*   **UI Label**: Verified By
*   **Section**: Verification Documents
*   **Data Type**: String (User ID)
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Valid Administrator User ID.
*   **Placeholder**: N/A
*   **Help Text**: User ID of the administrator who verified this document.
*   **Validation Rules**: Must reference a valid User ID with the `"admin"` role in the database.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `verifiedBy` (metadata)
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.author`
*   **FHIR Datatype**: Reference (Practitioner / PractitionerRole / Organization)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is admin-only**: Yes
*   **Whether the field contains sensitive information**: No

#### `rejectionReason`
*   **UI Label**: Rejection Reason
*   **Section**: Verification Documents
*   **Data Type**: String
*   **Required/Optional**: Optional
*   **Repeatable/Not Repeatable**: Repeatable
*   **Allowed Values**: Any text.
*   **Placeholder**: Specify why the document was rejected...
*   **Help Text**: Explanation provided to the practitioner if the document was rejected.
*   **Validation Rules**: Required if `verificationStatus` is `"rejected"`. Minimum 5 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `rejectionReason` (metadata)
*   **Database Table/Entity**: `VerificationDocument`
*   **FHIR Resource**: `DocumentReference`
*   **FHIR Path**: `DocumentReference.extension[url="http://drgodly.com/fhir/StructureDefinition/document-rejection-reason"]`
*   **FHIR Datatype**: string
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/document-rejection-reason
*   **Whether the field is searchable**: No
*   **Whether the field is admin-only**: Yes
*   **Whether the field contains sensitive information**: No

---

### Section 15: Consent and Agreements

#### `platformTermsAccepted`
*   **UI Label**: Accept Platform Terms of Service
*   **Section**: Consent and Agreements
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true (must be checked for submission)
*   **Placeholder**: N/A
*   **Help Text**: Explicit acceptance of the general platform Terms of Service.
*   **Validation Rules**: Must be `true`.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `platformTermsAccepted` (metadata or consent log)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Consent` (linked resource if generated, otherwise extension)
*   **FHIR Path**: `Consent.provision.type` // 'permit' if true
*   **FHIR Datatype**: code
*   **Terminology/System URL**: http://hl7.org/fhir/valueset/consent-provision-type
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `privacyPolicyAccepted`
*   **UI Label**: Accept Privacy Policy
*   **Section**: Consent and Agreements
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true (must be checked for submission)
*   **Placeholder**: N/A
*   **Help Text**: Explicit acceptance of the platform Privacy Policy and GDPR/HIPAA disclosures.
*   **Validation Rules**: Must be `true`.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `privacyPolicyAccepted`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Consent`
*   **FHIR Path**: `Consent.provision.type`
*   **FHIR Datatype**: code
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `telemedicineTermsAccepted`
*   **UI Label**: Accept Telemedicine Practices Consent
*   **Section**: Consent and Agreements
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true (must be checked for submission)
*   **Placeholder**: N/A
*   **Help Text**: Consent to consult and prescribe medications via asynchronous and video telemedicine.
*   **Validation Rules**: Must be `true`.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `telemedicineTermsAccepted`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Consent`
*   **FHIR Path**: `Consent.category` // mapped to a specific telemedicine category code
*   **FHIR Datatype**: CodeableConcept
*   **Terminology/System URL**: http://loinc.org (code: 57016-8)
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `aiAssistanceAcknowledgement`
*   **UI Label**: Acknowledge AI EMR Co-Pilot Assistance
*   **Section**: Consent and Agreements
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true (must be checked for submission)
*   **Placeholder**: N/A
*   **Help Text**: Acknowledge that AI assists in parsing patient intake forms and summarizing clinical logs.
*   **Validation Rules**: Must be `true`.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `aiAssistanceAcknowledgement`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Consent`
*   **FHIR Path**: `Consent.extension[url="http://drgodly.com/fhir/StructureDefinition/ai-acknowledgement"].value`
*   **FHIR Datatype**: boolean
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/ai-acknowledgement
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `clinicalResponsibilityAcknowledgement`
*   **UI Label**: Acknowledge Final Clinical Responsibility
*   **Section**: Consent and Agreements
*   **Data Type**: Boolean
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: true (must be checked for submission)
*   **Placeholder**: N/A
*   **Help Text**: Acknowledge that the consulting practitioner holds final responsibility for all diagnoses, prescriptions, and reviews.
*   **Validation Rules**: Must be `true`.
*   **Normalization Rules**: Inferred.
*   **Database Field**: `clinicalResponsibilityAcknowledgement`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Consent`
*   **FHIR Path**: `Consent.extension[url="http://drgodly.com/fhir/StructureDefinition/clinical-responsibility"].value`
*   **FHIR Datatype**: boolean
*   **Terminology/System URL**: http://drgodly.com/fhir/StructureDefinition/clinical-responsibility
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `acceptedAt`
*   **UI Label**: Consent Accepted Time
*   **Section**: Consent and Agreements
*   **Data Type**: DateTime
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: ISO DateTime.
*   **Placeholder**: N/A
*   **Help Text**: Timestamp when consent fields were checked.
*   **Validation Rules**: Valid date-time. Cannot be in the future.
*   **Normalization Rules**: ISO string.
*   **Database Field**: `consentAcceptedAt` (metadata or separate consent log)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Consent`
*   **FHIR Path**: `Consent.dateTime`
*   **FHIR Datatype**: dateTime
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `acceptedBy`
*   **UI Label**: Consent Accepted By User ID
*   **Section**: Consent and Agreements
*   **Data Type**: String (User ID)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: Valid User ID.
*   **Placeholder**: N/A
*   **Help Text**: The User ID who checked and signed the consent forms.
*   **Validation Rules**: Must reference the active logged-in User ID.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `userId`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Consent`
*   **FHIR Path**: `Consent.patient` // Mapped as patient/subject in consent resources
*   **FHIR Datatype**: Reference (Practitioner)
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

#### `consentVersion`
*   **UI Label**: Consent Document Version
*   **Section**: Consent and Agreements
*   **Data Type**: String
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: e.g., "v1.0", "v2.1"
*   **Placeholder**: v1.0
*   **Help Text**: The active version of the legal terms document accepted.
*   **Validation Rules**: Cannot be empty. Maximum 10 characters.
*   **Normalization Rules**: Trim whitespace.
*   **Database Field**: `consentVersion` (metadata)
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Consent`
*   **FHIR Path**: `Consent.sourceAttachment.title`
*   **FHIR Datatype**: Attachment
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: No
*   **Whether the field is patient-visible**: No
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

### Section 16: Onboarding Status

#### `status`
*   **UI Label**: Application Status
*   **Section**: Onboarding Status
*   **Data Type**: String (Enum)
*   **Required/Optional**: Required
*   **Repeatable/Not Repeatable**: Not Repeatable
*   **Allowed Values**: "DRAFT", "SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED", "VERIFIED", "REJECTED", "SUSPENDED"
*   **Placeholder**: N/A
*   **Help Text**: The current state of this onboarding application.
*   **Validation Rules**: Must match one of the predefined status enum values.
*   **Normalization Rules**: Uppercase.
*   **Database Field**: `status`
*   **Database Table/Entity**: `Practitioner`
*   **FHIR Resource**: `Practitioner` / `PractitionerRole`
*   **FHIR Path**: `Practitioner.active` // maps status "VERIFIED" to true, other statuses to false
*   **FHIR Datatype**: boolean
*   **Terminology/System URL**: N/A
*   **Whether the field is searchable**: Yes
*   **Whether the field is patient-visible**: Yes
*   **Whether the field is admin-only**: No
*   **Whether the field contains sensitive information**: No

---

## 2. FHIR Mapping Matrix

The table below lists the mapping path: **DrGodly Domain Field → Database Schema → Zod Validation Schema → FHIR Resource → FHIR R4 Path**.

| DrGodly Domain Field | Database Table & Field | Zod Validation Schema | FHIR Resource | FHIR R4 Path |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `Practitioner.title` | `z.string()` | `Practitioner` | `Practitioner.name.prefix` |
| `firstName` | `Practitioner.firstName` | `z.string().min(1)` | `Practitioner` | `Practitioner.name.given[0]` |
| `middleName` | `Practitioner.middleName` | `z.string().optional()` | `Practitioner` | `Practitioner.name.given[1]` |
| `lastName` | `Practitioner.lastName` | `z.string().min(1)` | `Practitioner` | `Practitioner.name.family` |
| `displayName` | `Practitioner.displayName` | `z.string().min(2)` | `Practitioner` | `Practitioner.name.text` |
| `gender` | `Practitioner.gender` | `z.enum(["male", "female", "other", "unknown"])` | `Practitioner` | `Practitioner.gender` |
| `dateOfBirth` | `Practitioner.birthDate` | `z.string().refine(...)` | `Practitioner` | `Practitioner.birthDate` |
| `profilePhoto` | `Practitioner.profilePhoto` | `z.string().url().optional()` | `Practitioner` | `Practitioner.photo` |
| `mobile` | `Practitioner.phone` | `z.string().min(5)` | `Practitioner` | `Practitioner.telecom[system=phone, use=mobile].value` |
| `email` | `Practitioner.email` | `z.string().email()` | `Practitioner` | `Practitioner.telecom[system=email, use=work].value` |
| `medicalSystem` | `Practitioner.medicalSystem` | `z.string()` | `Practitioner` | `Practitioner.qualification.code.coding[system="http://drgodly.com/fhir/CodeSystem/medical-system"].code` |
| `registrationAuthority` | `PractitionerIdentifier.assigner` | `z.string()` | `Practitioner` | `Practitioner.identifier.assigner.display` |
| `registrationNumber` | `PractitionerIdentifier.value` | `z.string()` | `Practitioner` | `Practitioner.identifier[type=license].value` |
| `registrationDate` | `Practitioner.registrationDate` | `z.string()` | `Practitioner` | `Practitioner.qualification.period.start` |
| `registrationExpiryDate` | `Practitioner.registrationExpiryDate` | `z.string()` | `Practitioner` | `Practitioner.qualification.period.end` |
| `degreeName` | `PractitionerQualification.code` | `z.string()` | `Practitioner` | `Practitioner.qualification.code.text` |
| `institution` | `PractitionerQualification.issuer` | `z.string()` | `Practitioner` | `Practitioner.qualification.issuer.display` |
| `documentReferenceId` | `PractitionerQualification.documentReferenceId` | `z.string().uuid()` | `Practitioner` | `Practitioner.qualification.extension[url="http://hl7.org/fhir/StructureDefinition/qualification-document"].value` |
| `primarySpecialty` | `PractitionerRole.specialties[0]` | `z.string()` | `PractitionerRole` | `PractitionerRole.specialty.coding[system="http://snomed.info/sct"]` |
| `secondarySpecialties` | `PractitionerRole.specialties[1..]` | `z.array(z.string())` | `PractitionerRole` | `PractitionerRole.specialty.coding` |
| `organizationName` | `Organization.name` | `z.string()` | `Organization` | `Organization.name` |
| `organizationIdentifier` | `Organization.id` | `z.string()` | `Organization` | `Organization.identifier.value` |
| `locationName` | `Location.name` | `z.string()` | `Location` | `Location.name` |
| `addressLine1` | `Location.address` | `z.string()` | `Location` | `Location.address.line[0]` |
| `city` | `Location.city` | `z.string()` | `Location` | `Location.address.city` |
| `state` | `Location.state` | `z.string()` | `Location` | `Location.address.state` |
| `postalCode` | `Location.postalCode` | `z.string()` | `Location` | `Location.address.postalCode` |
| `country` | `Location.country` | `z.string()` | `Location` | `Location.address.country` |
| `locationType` | `Location.locationType` | `z.string()` | `Location` | `Location.physicalType` |
| `languageCode` | `Practitioner.languages` | `z.array(z.string())` | `Practitioner` | `Practitioner.communication.language.coding.code` |
| `videoConsultation` | `PractitionerRole.services` | `z.boolean()` | `PractitionerRole` | `PractitionerRole.healthcareService` |
| `dayOfWeek` | `PractitionerAvailability.dayOfWeek` | `z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])` | `PractitionerRole` | `PractitionerRole.availableTime.daysOfWeek` |
| `startTime` | `PractitionerAvailability.availableFrom` | `z.string().regex(...)` | `PractitionerRole` | `PractitionerRole.availableTime.availableStartTime` |
| `endTime` | `PractitionerAvailability.availableTo` | `z.string().regex(...)` | `PractitionerRole` | `PractitionerRole.availableTime.availableEndTime` |
| `documentType` | `VerificationDocument.docType` | `z.string()` | `DocumentReference` | `DocumentReference.type.text` |
| `fileId` | `VerificationDocument.url` | `z.string().url()` | `DocumentReference` | `DocumentReference.content.attachment.url` |
| `fileName` | `VerificationDocument.title` | `z.string()` | `DocumentReference` | `DocumentReference.content.attachment.title` |
| `status` | `Practitioner.status` | `z.enum(["DRAFT", "SUBMITTED", ...])` | `Practitioner` | `Practitioner.active` |

---

## 3. Validation and Normalization Rules Document

This section details the platform-wide validation and normalization checks.

### Demographics and Identity
*   **Age Restriction**: The practitioner must be at least 18 years old. Calculated as `CurrentDate - birthDate >= 18 years`.
*   **Display Name Assembly**: Normalization compiles `displayName` as `title` + `firstName` + `lastName` if the user leaves it empty.
*   **Case Normalization**: `firstName`, `middleName`, and `lastName` are automatically converted to Titlecase and stripped of trailing/leading whitespaces.

### Medical Registration and Identifiers
*   **NPI Number Validation**: The US National Provider Identifier (NPI) value must be exactly 10 digits and satisfy the Luhn algorithm checksum.
*   **License Expiry**: `registrationExpiryDate` must be at least 90 days in the future at the time of submission.
*   **Format Normalization**: Registration numbers and IMR numbers have all special characters stripped and are stored in uppercase (e.g., `kmc-12345/a` becomes `KMC12345A`).

### Clinic Assignation and Roles
*   **Specialty Codes**: Specialty strings are mapped to standard SNOMED CT clinical codes (e.g. `408443003` for General Practice). This permits changing the display language or terminology mappings later without altering the underlying database.
*   **Availability Time Check**: Availability start and end times must be valid 24h formats (`HH:MM`). `availableTo` must be chronologically after `availableFrom` by at least `appointmentDurationMinutes`.

### Document Upload Verification
*   **File Size and Type Limits**: Verification documents are limited to PDF, PNG, or JPEG formats. The file size cannot exceed 5MB (5,242,880 bytes).
*   **Document Association**: Every qualification or state registry item must link to at least one document ID containing a file metadata upload reference.
