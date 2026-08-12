import { NextResponse } from "next/server";
import { getIntakeSessionId } from "@/lib/session-utils";
import { getPendingIntake } from "@/lib/intake-persistence";
import { getRecommendations } from "@/lib/recommendations";
import { IntakeData } from "@/lib/intake-state";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getDetectedRegion } from "@/lib/region-server";
import prisma from "@/lib/prisma";
import { intakeDataFromStoredIntake } from "@/lib/intake-results";
import { determineEligibility } from "@/lib/eligibility";

export const dynamic = "force-dynamic";


export async function GET() {
  const sessionId = await getIntakeSessionId();
  const pending = await getPendingIntake(sessionId);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const storedIntake = !pending && session?.user.id
    ? await prisma.intake.findUnique({ where: { userId: session.user.id } })
    : null;
  const data = pending
    ? (pending.data as unknown as Partial<IntakeData>)
    : storedIntake
      ? intakeDataFromStoredIntake(storedIntake)
      : {};

  const region = await getDetectedRegion();

  if (pending) {
    await logAudit({
      userId: session?.user.id,
      action: "READ_RECOMMENDATIONS",
      resource: "PendingIntake",
      resourceId: pending.id,
      details: "Accessed recommendations based on intake",
    });
  }

  // The recommendation engine uses primaryInterest and formFactor from the data
  const eligibility = determineEligibility(data as IntakeData, region.country);
  const result = getRecommendations(data, eligibility);

  return NextResponse.json({
    ...result,
    eligibility,
    preferences: {
      formFactor: data.formFactor,
      primaryInterest: data.primaryInterest,
    },
    region,
  });
}
