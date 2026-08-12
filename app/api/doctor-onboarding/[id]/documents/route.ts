import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";
import { headers } from "next/headers";
import { DoctorVerificationDocumentSchema } from "../../../../../lib/onboarding-validation";
import { logAudit } from "../../../../../lib/audit";
import { formatErrorResponse } from "../../utils";

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

    const body = await req.json();
    const result = DoctorVerificationDocumentSchema.safeParse(body);

    if (!result.success) {
      const fields: Record<string, string> = {};
      result.error.issues.forEach((issue: any) => {
        fields[issue.path.join(".")] = issue.message;
      });
      return formatErrorResponse("VALIDATION_FAILED", "Request body validation failed.", 400, fields);
    }

    const data = result.data;

    const createdDoc = await prisma.verificationDocument.create({
      data: {
        practitionerId: id,
        title: data.title,
        url: data.url,
        docType: data.docType,
        status: "current",
        fileName: data.fileName || null,
        mimeType: data.mimeType || null,
        fileSize: data.fileSize || null,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "ONBOARDING_DOCUMENT_ADDED",
      resource: "VerificationDocument",
      resourceId: createdDoc.id,
      details: `Verification document attached: ${createdDoc.title} (${createdDoc.docType})`
    });

    return NextResponse.json(createdDoc);
  } catch (error: any) {
    console.error("Add document attachment error:", error);
    return formatErrorResponse("INTERNAL_SERVER_ERROR", "Internal Server Error occurred.", 500);
  }
}
