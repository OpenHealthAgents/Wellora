"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DoctorOnboardingStatus from "@/components/DoctorOnboardingStatus";

export default function OnboardingStatusPage() {
  const router = useRouter();
  const [data, setData] = useState<{ status: string; rejectionReason?: string | null; practitionerId?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/onboarding");
        if (res.ok) {
          const resData = await res.json();
          if (resData.status === "not_started") {
            router.push("/onboarding");
            return;
          }
          setData({
            status: resData.status,
            rejectionReason: resData.rejectionReason,
            practitionerId: resData.data?.id,
          });
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error checking status:", err);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-900 border-t-transparent dark:border-white"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <DoctorOnboardingStatus
      status={data.status}
      rejectionReason={data.rejectionReason}
      practitionerId={data.practitionerId}
      onEdit={() => router.push("/onboarding")}
    />
  );
}
