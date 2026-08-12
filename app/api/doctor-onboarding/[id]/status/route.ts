import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";
import { headers } from "next/headers";
import { formatErrorResponse } from "../../utils";

export const dynamic = "force-dynamic";

async function getRequestHeaders() {
  try {
    return await headers();
  } catch (e) {
    return new Headers();
  }
}

export async function GET(
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

    const isOwner = practitioner.userId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return formatErrorResponse("FORBIDDEN", "You are not authorized to view this application status.", 403);
    }

    return NextResponse.json({
      id: practitioner.id,
      status: practitioner.status,
      submittedAt: practitioner.submittedAt,
      verifiedAt: practitioner.verifiedAt,
    });
  } catch (error: any) {
    console.error("GET onboarding status error:", error);
    return formatErrorResponse("INTERNAL_SERVER_ERROR", "Internal Server Error occurred.", 500);
  }
}
