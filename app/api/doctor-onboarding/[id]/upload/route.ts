import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";
import { headers } from "next/headers";
import { formatErrorResponse } from "../../utils";
import { ALLOWED_DOC_TYPES, ALLOWED_EXTENSIONS, detectMimeType } from "../../../../../lib/upload-validator";
import { logAudit } from "../../../../../lib/audit";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

async function getRequestHeaders() {
  try {
    return await headers();
  } catch (e) {
    return new Headers();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await getRequestHeaders(),
  });

  if (!session) {
    return formatErrorResponse("UNAUTHORIZED", "User session is not authenticated.", 401);
  }

  try {
    const practitioner = await prisma.practitioner.findUnique({
      where: { id },
    });

    if (!practitioner) {
      return formatErrorResponse("NOT_FOUND", "Practitioner onboarding application not found.", 404);
    }

    if (practitioner.userId !== session.user.id) {
      return formatErrorResponse("FORBIDDEN", "You are not authorized to edit this application.", 403);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null;
    const title = formData.get("title") as string | null;

    if (!file || !docType || !title) {
      return formatErrorResponse("VALIDATION_FAILED", "Missing file, docType, or title.", 400);
    }

    if (!ALLOWED_DOC_TYPES.includes(docType)) {
      return formatErrorResponse("VALIDATION_FAILED", `Invalid document type. Allowed types: ${ALLOWED_DOC_TYPES.join(", ")}`, 400);
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate size (5 MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return formatErrorResponse("VALIDATION_FAILED", "File size exceeds the maximum limit of 5 MB.", 400);
    }

    // Validate extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return formatErrorResponse("VALIDATION_FAILED", "File extension not allowed. Supported: .pdf, .png, .jpg, .jpeg", 400);
    }

    // Detect MIME type using magic bytes check (do not trust client header)
    const detected = detectMimeType(buffer);
    if (!detected) {
      return formatErrorResponse("VALIDATION_FAILED", "Invalid file content format or corrupt file header.", 400);
    }

    // Compute checksum (SHA-256)
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

    // Safe unique ID for the document metadata record
    const docId = crypto.randomUUID();
    const secureFilename = `${docId}-${file.name.replace(/[^a-zA-Z0-9\.\-_]/g, "_")}`;
    
    const storageDir = path.join(process.cwd(), "storage", "documents", id);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const filePath = path.join(storageDir, secureFilename);
    fs.writeFileSync(filePath, buffer);

    // Document mapped url: secure path
    const downloadUrl = `/api/doctor-onboarding/${id}/documents/${docId}`;

    const createdDoc = await prisma.verificationDocument.create({
      data: {
        id: docId,
        practitionerId: id,
        title: title,
        url: downloadUrl,
        docType: docType,
        status: "current",
        fileName: secureFilename,
        mimeType: detected.mime,
        fileSize: buffer.length,
        uploadedAt: new Date(),
        verificationStatus: "PENDING"
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "ONBOARDING_DOCUMENT_UPLOADED",
      resource: "VerificationDocument",
      resourceId: createdDoc.id,
      details: `Verification document uploaded: ${createdDoc.title} (${createdDoc.docType}), checksum: ${checksum}`
    });

    return NextResponse.json(createdDoc);
  } catch (error: any) {
    console.error("Document upload error:", error);
    return formatErrorResponse("INTERNAL_SERVER_ERROR", "Internal Server Error occurred during document upload.", 500);
  }
}
