import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DoctorOnboardingForm from "@/components/DoctorOnboardingForm";
import { OnboardingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // Check if they already have a practitioner profile and if it is approved/submitted
  const practitioner = await prisma.practitioner.findUnique({
    where: { userId: session.user.id },
  });

  if (practitioner && (practitioner.status === OnboardingStatus.SUBMITTED || practitioner.status === OnboardingStatus.VERIFIED)) {
    redirect("/onboarding/status");
  }

  return <DoctorOnboardingForm userRole={session.user.role || undefined} />;
}
