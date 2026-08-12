import { NextResponse } from "next/server";
import { getIntakeSessionId } from "@/lib/session-utils";
import { getPendingIntake } from "@/lib/intake-persistence";
import { calculatePersonalization } from "@/lib/personalization";
import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getDetectedRegion } from "@/lib/region-server";
import prisma from "@/lib/prisma";
import { intakeDataFromStoredIntake } from "@/lib/intake-results";

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
    ? (pending.data as Record<string, unknown>)
    : storedIntake
      ? intakeDataFromStoredIntake(storedIntake)
      : {};
  const { height, weight, goalWeight } = data;

  const region = await getDetectedRegion();

  if (pending) {
    await logAudit({
      userId: session?.user.id,
      action: "READ_PERSONALIZATION",
      resource: "PendingIntake",
      resourceId: pending.id,
      details: "Accessed personalization data based on intake",
    });
  }

  if (
    typeof height !== "number" ||
    typeof weight !== "number" ||
    typeof goalWeight !== "number"
  ) {
    return NextResponse.json(
      { error: "Insufficient intake data for personalization" },
      { status: 400 }
    );
  }

  const result = calculatePersonalization(weight, goalWeight, height, data);

  return NextResponse.json({
    ...result,
    region,
  });
}
