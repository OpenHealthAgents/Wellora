import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DoctorOnboardingReview from "@/components/admin/DoctorOnboardingReview";

export const dynamic = "force-dynamic";

export default async function AdminOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-6 dark:bg-black">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
            Admin Verification Center
          </h1>
          <p className="text-sm text-zinc-500">
            Clinical Practitioner Onboarding Review Dashboard
          </p>
        </header>
        <DoctorOnboardingReview />
      </div>
    </div>
  );
}
