import React from "react";
import prisma from "@/lib/prisma";
import { TrustContentTable } from "@/components/admin/TrustContentTable";
import { TrustContent } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminTrustContent() {
  const trustItems = await prisma.trustContent.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <TrustContentTable initialItems={trustItems.map((item: TrustContent) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      isActive: item.isActive,
      metadata: item.metadata,
    }))} />
  );
}

