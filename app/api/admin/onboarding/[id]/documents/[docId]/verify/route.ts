import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../../../lib/prisma";
import { auth } from "../../../../../../../../lib/auth";
import { headers } from "next/headers";
import { logAudit } from "../../../../../../../../lib/audit";

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
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await auth.api.getSession({
    headers: await getRequestHeaders(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, docId } = await params;

  try {
    const body = (await req.json()) as any;
    const { status, rejectionReason } = body;

    const allowedStatuses = ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED", "EXPIRED"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status code. Must be one of: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const doc = await prisma.verificationDocument.findUnique({
      where: { id: docId },
    });

    if (!doc || doc.practitionerId !== id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const updatedDoc = await prisma.verificationDocument.update({
      where: { id: docId },
      data: {
        verificationStatus: status,
        rejectionReason: status === "REJECTED" ? rejectionReason || null : null,
        verifiedAt: ["VERIFIED", "REJECTED"].includes(status) ? new Date() : null,
        verifiedBy: ["VERIFIED", "REJECTED"].includes(status) ? session.user.id : null,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "ADMIN_DOCUMENT_VERIFIED",
      resource: "VerificationDocument",
      resourceId: docId,
      details: `Document verification updated to ${status} (by: ${session.user.name || session.user.email})`
    });

    return NextResponse.json({ status: "success", data: updatedDoc });
  } catch (error: any) {
    console.error("Document verify endpoint error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
