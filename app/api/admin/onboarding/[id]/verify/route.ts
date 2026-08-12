import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { VerificationSchema } from "@/lib/onboarding-validation";
import { OnboardingStatus } from "@prisma/client";

async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user.role === "admin";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const result = VerificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { status, rejectionReason } = result.data;
    
    // Map request statuses to OnboardingStatus database enums:
    let dbStatus: OnboardingStatus;
    let auditAction = "";
    let auditDetails = "";

    if (status === "approved") {
      dbStatus = OnboardingStatus.VERIFIED;
      auditAction = "VERIFY";
      auditDetails = "Practitioner onboarding profile verified and approved.";
    } else if (status === "rejected") {
      dbStatus = OnboardingStatus.REJECTED;
      auditAction = "REJECT";
      auditDetails = `Practitioner onboarding profile rejected. Reason: ${rejectionReason}`;
    } else if (status === "changes_requested") {
      dbStatus = OnboardingStatus.CHANGES_REQUESTED;
      auditAction = "REQUEST_CHANGES";
      auditDetails = `Practitioner onboarding changes requested. Details: ${rejectionReason}`;
    } else {
      dbStatus = OnboardingStatus.SUSPENDED;
      auditAction = "SUSPEND";
      auditDetails = "Practitioner onboarding profile suspended.";
    }

    const practitioner = await prisma.practitioner.findUnique({
      where: { id },
    });

    if (!practitioner) {
      return NextResponse.json({ error: "Practitioner not found" }, { status: 404 });
    }

    const updatedPractitioner = await prisma.$transaction(async (tx) => {
      // 1. Update practitioner profile status
      const p = await tx.practitioner.update({
        where: { id },
        data: {
          status: dbStatus,
          verifiedAt: dbStatus === OnboardingStatus.VERIFIED ? new Date() : null,
        },
      });

      // 2. Adjust credentials status and rejection fields
      if (dbStatus === OnboardingStatus.REJECTED || dbStatus === OnboardingStatus.CHANGES_REQUESTED) {
        await tx.verificationDocument.updateMany({
          where: { practitionerId: id },
          data: { 
            verificationStatus: "rejected",
            rejectionReason: rejectionReason || null 
          },
        });
      } else if (dbStatus === OnboardingStatus.VERIFIED) {
        await tx.verificationDocument.updateMany({
          where: { practitionerId: id },
          data: { 
            verificationStatus: "approved",
            verifiedBy: session.user.id,
            verifiedAt: new Date()
          },
        });
      }

      // 3. User Role mapping
      if (dbStatus === OnboardingStatus.VERIFIED) {
        await tx.user.update({
          where: { id: practitioner.userId },
          data: { role: "doctor" },
        });
      } else {
        // Revert role to user on reject, suspension, or change requests
        await tx.user.update({
          where: { id: practitioner.userId },
          data: { role: "user" },
        });
      }

      // 4. Role Assignments activation/deactivation
      if (dbStatus === OnboardingStatus.VERIFIED) {
        await tx.practitionerRole.updateMany({
          where: { practitionerId: id },
          data: { active: true }
        });
      } else if (dbStatus === OnboardingStatus.SUSPENDED) {
        await tx.practitionerRole.updateMany({
          where: { practitionerId: id },
          data: { active: false }
        });
      }

      // 5. Create secure audit log entry
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: auditAction,
          resource: "Practitioner",
          resourceId: id,
          details: auditDetails
        }
      });

      return p;
    });

    return NextResponse.json({ status: "success", data: updatedPractitioner });
  } catch (error: any) {
    console.error("Verification endpoint error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
